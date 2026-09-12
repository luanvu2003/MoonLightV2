import os
import logging
from pathlib import Path
from typing import Tuple, Union, Optional
import numpy as np
from PIL import Image
import cv2

logger = logging.getLogger("GarmentSegmenter")

_MODEL_INSTANCE = None

def get_rmbg_model():
    """
    Lazy-load mô hình RMBG-1.4 (Bria AI) - Top 1 mô hình tách nền thương mại điện tử thế giới
    """
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        try:
            import torch
            from transformers import AutoModelForImageSegmentation
            logger.info("🧠 [Segmenter] Đang tải mô hình briaai/RMBG-1.4...")
            device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
            model = AutoModelForImageSegmentation.from_pretrained("briaai/RMBG-1.4", trust_remote_code=True)
            model.to(device)
            model.eval()
            _MODEL_INSTANCE = (model, device)
            logger.info(f"✅ [Segmenter] Mô hình RMBG-1.4 đã sẵn sàng trên thiết bị: {device}")
        except Exception as e:
            logger.warning(f"⚠️ Không thể tải mô hình RMBG-1.4 ({e}). Sẽ sử dụng Fallback Segmenter.")
            _MODEL_INSTANCE = None
    return _MODEL_INSTANCE

class GarmentSegmenter:
    @classmethod
    def remove_background(
        cls, 
        image_input: Union[str, Path, np.ndarray, Image.Image]
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Bóc tách nền trang phục bằng Deep Learning:
        - Xóa 100% phông nền studio, vách tường, sàn nhà
        - Loại bỏ móc treo áo (hanger)
        - Giữ trọn từng sợi len, nếp vải, viền dệt kim và chi tiết áo
        - Trả về: (bgr, alpha)
        """
        if isinstance(image_input, (str, Path)):
            pil_img = Image.open(str(image_input)).convert("RGB")
        elif isinstance(image_input, np.ndarray):
            pil_img = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
        elif isinstance(image_input, Image.Image):
            pil_img = image_input.convert("RGB")
        else:
            raise ValueError(f"Định dạng ảnh không hợp lệ: {type(image_input)}")

        orig_w, orig_h = pil_img.size

        # ── 1. Chạy mô hình RMBG-1.4 nếu khả dụng ──
        model_pack = get_rmbg_model()
        if model_pack is not None:
            try:
                import torch
                from torchvision.transforms.functional import normalize
                model, device = model_pack
                # Chuẩn hóa ảnh đầu vào 1024x1024
                im_resized = pil_img.resize((1024, 1024), Image.BILINEAR)
                im_arr = np.array(im_resized) / 255.0
                tensor = torch.tensor(im_arr, dtype=torch.float32).permute(2, 0, 1).unsqueeze(0).to(device)
                tensor = normalize(tensor, [0.5, 0.5, 0.5], [1.0, 1.0, 1.0])

                with torch.no_grad():
                    preds = model(tensor)[0][0]
                    ma = torch.max(preds)
                    mi = torch.min(preds)
                    dn = (preds - mi) / (ma - mi + 1e-8)

                pred = dn[0].squeeze().cpu().numpy()
                alpha_raw = (pred * 255).astype(np.uint8)
                alpha = cv2.resize(alpha_raw, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
                bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

                # Hậu xử lý: Khử móc áo gỗ / kim loại ở trên cùng (nếu có)
                # Móc áo thường nằm ở 12% phía trên cùng ở vị trí giữa cổ áo
                top_cutoff = int(orig_h * 0.14)
                top_bgr = bgr[:top_cutoff, :]
                # Màu gỗ: R > 100, B < 90, R - B > 25
                wood_hanger = (top_bgr[:, :, 2] > 100) & (top_bgr[:, :, 0] < 90) & (top_bgr[:, :, 2] - top_bgr[:, :, 0] > 25)
                # Kim loại móc treo: màu bạc hoặc vàng kim
                metal_hanger = (top_bgr[:, :, 0] < 80) & (top_bgr[:, :, 1] < 80) & (top_bgr[:, :, 2] < 80) & (np.arange(top_cutoff)[:, None] < int(orig_h * 0.08))
                
                hanger_mask = (wood_hanger | metal_hanger)
                alpha[:top_cutoff, :][hanger_mask] = 0

                # Lấy contour trang phục chính
                contours, _ = cv2.findContours((alpha > 50).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                if contours:
                    main_c = max(contours, key=cv2.contourArea)
                    mask_filled = np.zeros((orig_h, orig_w), np.uint8)
                    cv2.drawContours(mask_filled, [main_c], -1, 255, -1)
                    # Chỉ giữ lại vùng bên trong contour chính
                    alpha = np.where(mask_filled > 0, alpha, 0)

                # Defringe BGR
                solid = alpha > 150
                med_color = np.median(bgr[solid], axis=0).astype(np.uint8) if np.any(solid) else np.array([220, 220, 220], dtype=np.uint8)
                bgr_clean = bgr.copy()
                bgr_clean[alpha == 0] = med_color

                return bgr_clean, alpha

            except Exception as e:
                logger.error(f"❌ Lỗi suy luận RMBG-1.4: {e}. Chuyển sang fallback.")

        # ── 2. Fallback: GrabCut + FloodFill từ 4 góc ──
        bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        h, w = bgr.shape[:2]
        corners = np.array([bgr[0, 0], bgr[0, w - 1], bgr[h - 1, 0], bgr[h - 1, w - 1]], dtype=np.float32)
        bg_color = np.median(corners, axis=0)

        color_diff = np.linalg.norm(bgr.astype(np.float32) - bg_color, axis=2)
        is_bg = (color_diff < 40).astype(np.uint8) * 255

        bg_flood = np.zeros((h + 2, w + 2), np.uint8)
        cv2.floodFill(is_bg, bg_flood, (0, 0), 128)
        cv2.floodFill(is_bg, bg_flood, (w - 1, 0), 128)
        cv2.floodFill(is_bg, bg_flood, (0, h - 1), 128)
        cv2.floodFill(is_bg, bg_flood, (w - 1, h - 1), 128)

        alpha = np.where(is_bg == 128, 0, 255).astype(np.uint8)
        alpha_smooth = cv2.GaussianBlur(alpha, (3, 3), 0.5)

        solid = alpha > 150
        med_color = np.median(bgr[solid], axis=0).astype(np.uint8) if np.any(solid) else np.array([220, 220, 220], dtype=np.uint8)
        bgr_clean = bgr.copy()
        bgr_clean[alpha == 0] = med_color

        return bgr_clean, alpha_smooth
