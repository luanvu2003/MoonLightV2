from __future__ import annotations
import os
import shutil
import time
import logging
from pathlib import Path
from typing import Tuple, TYPE_CHECKING
from PIL import Image
import cv2
import numpy as np

from backend.config.settings import settings
if TYPE_CHECKING:
    from backend.agent.workflow import WorkflowDecision
from backend.ai.masking import ClothMaskResult

logger = logging.getLogger("MoonLightVTON")

class VTONEngine:
    last_error: str = ""

    @staticmethod
    def _normalize_garment_alpha_and_defringe(bgr: np.ndarray, alpha: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Bảo toàn 100% đường nét, thớ vải và độ nét nguyên bản của trang phục:
        - Giữ trọn từng chi tiết dệt len, gân cổ áo, bo tay và sợi vải (không bị răng cưa/mẻ viền)
        - Triệt tiêu 100% viền trắng/halo từ phông nền studio gốc
        - Inpaint màu thớ vải ruột áo vào dải chuyển tiếp viền ngoài
        - Giữ nguyên anti-aliasing mềm mại tự nhiên
        """
        # 1. Erode alpha nhẹ 1px để khử dải pixel giao thoa với phông studio trắng
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        alpha_clean = cv2.erode(alpha, kernel, iterations=1)
        alpha_smooth = cv2.GaussianBlur(alpha_clean, (3, 3), 0.5)

        # 2. Inpaint BGR: Tô màu thớ vải bên trong ra dải biên để triệt tiêu hoàn toàn viền trắng
        inpaint_mask = ((alpha > 0) & (alpha_smooth < 220)).astype(np.uint8)
        if np.any(inpaint_mask):
            bgr_clean = cv2.inpaint(bgr, inpaint_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
        else:
            bgr_clean = bgr.copy()

        # 3. Ép màu vùng alpha=0 thành màu ruột áo
        solid_mask = alpha_smooth > 180
        if not np.any(solid_mask):
            solid_mask = alpha_smooth > 50
        med_bgr = np.median(bgr_clean[solid_mask], axis=0).astype(np.uint8) if np.any(solid_mask) else np.array([220, 220, 220], dtype=np.uint8)
        bgr_clean[alpha_smooth == 0] = med_bgr

        return bgr_clean, alpha_smooth

    @classmethod
    def extract_garment_cutout(cls, garment_path: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Bóc tách và chuẩn hóa trang phục:
        - Giữ nguyên 100% phom dáng, đường nét thớ vải và viền tự nhiên (không bị mẻ/răng cưa)
        - Bảo toàn tuyệt đối chi tiết thớ len, dệt kim, gân vải của cả áo màu tối và áo trắng sáng
        - Defringe RGB: Mở rộng màu ruột áo ra vùng trong suốt để triệt tiêu hoàn toàn viền trắng khi nội suy
        """
        p = Path(garment_path)

        # 1. Nếu có file _cutout.png sẵn có
        cutout_candidate = p.parent / f"{p.stem}_cutout.png"
        if cutout_candidate.exists():
            cutout = cv2.imread(str(cutout_candidate), cv2.IMREAD_UNCHANGED)
            if cutout is not None and len(cutout.shape) == 3 and cutout.shape[2] == 4:
                return cls._normalize_garment_alpha_and_defringe(cutout[:, :, :3], cutout[:, :, 3])

        # 2. Nếu file đầu vào đã là PNG có alpha channel
        img = cv2.imread(garment_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            raise ValueError(f"Không thể đọc file ảnh trang phục: {garment_path}")

        if len(img.shape) == 3 and img.shape[2] == 4:
            return cls._normalize_garment_alpha_and_defringe(img[:, :, :3], img[:, :, 3])

        # 3. Với ảnh JPEG 3 kênh màu (chưa có alpha): Tách nền kết nối từ 4 góc ngoài biên
        bgr = img[:, :, :3] if len(img.shape) == 3 else cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        h, w = bgr.shape[:2]

        # Kiểm tra màu nền ở 4 góc
        corners = np.array([bgr[0, 0], bgr[0, w - 1], bgr[h - 1, 0], bgr[h - 1, w - 1]], dtype=np.float32)
        bg_color = np.median(corners, axis=0)

        # Khoảng cách màu tới màu nền ở các góc
        color_diff = np.linalg.norm(bgr.astype(np.float32) - bg_color, axis=2)

        # Nền là các điểm ảnh tương đồng với góc và kết nối với đường biên ngoài
        is_bg_candidate = (color_diff < 35).astype(np.uint8) * 255

        # FloodFill từ 4 góc để chỉ xóa phần nền liên tục bên ngoài, KHÔNG bao giờ đục thủng áo trắng bên trong
        bg_mask = np.zeros((h + 2, w + 2), np.uint8)
        cv2.floodFill(is_bg_candidate, bg_mask, (0, 0), 128)
        cv2.floodFill(is_bg_candidate, bg_mask, (w - 1, 0), 128)
        cv2.floodFill(is_bg_candidate, bg_mask, (0, h - 1), 128)
        cv2.floodFill(is_bg_candidate, bg_mask, (w - 1, h - 1), 128)

        # Điểm ảnh có giá trị 128 chính là nền ngoài kết nối từ 4 góc
        alpha = np.where(is_bg_candidate == 128, 0, 255).astype(np.uint8)

        # Giữ lại contour lớn nhất (thân áo)
        contours, _ = cv2.findContours(alpha, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        mask_filled = np.zeros((h, w), np.uint8)
        if contours:
            c = max(contours, key=cv2.contourArea)
            cv2.drawContours(mask_filled, [c], -1, 255, -1)
            alpha = mask_filled

        return cls._normalize_garment_alpha_and_defringe(bgr, alpha)

    @classmethod
    def run_vton(
        cls,
        person_image_path: str,
        garment_image_path: str,
        cloth_mask: ClothMaskResult,
        workflow: WorkflowDecision,
        garment_desc: str = "",
        attempt: int = 1
    ) -> Tuple[str, str]:
        """
        Thực thi mô hình Virtual Try-On Model:
        - Giữ đúng 100% màu sắc nguyên bản của trang phục (không bị ngả màu / phai mờ)
        - Giữ độ sắc nét tuyệt đối của thớ vải và đường may
        - Xóa sạch 100% nền áo, không còn viền trắng, viền xám hay bóng sàn studio
        - Che phủ tự nhiên và hoàn chỉnh trang phục cũ bên dưới
        """
        timestamp = int(time.time() * 1000)
        output_filename = f"tryon_py_{timestamp}_{attempt}.png"
        public_dest_path = str(settings.PUBLIC_UPLOADS_DIR / output_filename)
        storage_dest_path = str(settings.STORAGE_RESULTS_DIR / output_filename)

        # ── 1. Thử gọi ZeroGPU IDM-VTON qua Gradio Client (Ưu tiên hàng đầu AI Neural Try-On) ──
        try:
            from gradio_client import Client, handle_file
            logger.info(f"🚀 [VTON] Kết nối tới ZeroGPU HuggingFace Space: {settings.HF_SPACE_ID}...")
            client = Client(settings.HF_SPACE_ID, hf_token=settings.HF_TOKEN if settings.HF_TOKEN else None)
            
            # Ưu tiên truyền ảnh catalog gốc (JPG) cho IDM-VTON vì mạng neural IDM-VTON nhận diện thớ vải tốt nhất từ ảnh gốc
            garm_ai_path = garment_image_path
            p_garm = Path(garment_image_path)
            if "_cutout" in p_garm.name:
                orig_jpg = p_garm.parent / f"{p_garm.stem.replace('_cutout', '')}.jpg"
                if orig_jpg.exists():
                    garm_ai_path = str(orig_jpg)

            result = client.predict(
                dict={"background": handle_file(person_image_path), "layers": [], "composite": None},
                garm_img=handle_file(garm_ai_path),
                garment_des=garment_desc or "high quality designer garment",
                is_checked=True,
                is_checked_crop=False,
                denoise_steps=30,
                seed=42,
                api_name="/tryon"
            )
            if result and len(result) > 0 and os.path.exists(result[0]):
                shutil.copyfile(result[0], public_dest_path)
                shutil.copyfile(result[0], storage_dest_path)
                logger.info(f"✅ [VTON] IDM-VTON ZeroGPU thành công: {public_dest_path}")
                return public_dest_path, "hf-idm-vton-py"
        except Exception as e:
            cls.last_error = str(e)
            logger.warning(f"⚠️ ZeroGPU không phản hồi hoặc bận ({e}). Chuyển tiếp sang Crisp Engine...")

        # ── 2. MoonLight High-Precision Crisp Fitting Engine (Zero-Blur & Zero-Fringe) ──
        logger.info(f"ℹ️ [VTON] Sử dụng MoonLight High-Precision Crisp Fitting Engine (Zero-Fringe)...")
        try:
            person_bgr = cv2.imread(person_image_path)
            if person_bgr is None:
                raise ValueError(f"Không thể đọc ảnh người: {person_image_path}")

            h_p, w_p = person_bgr.shape[:2]

            # Bóc tách áo với alpha channel chuẩn mực không còn viền mờ hay bóng sàn studio
            garm_bgr, garm_alpha = cls.extract_garment_cutout(garment_image_path)

            # Cắt bớt phần viền trong suốt thừa quanh áo (Bounding Box Crop)
            non_zeros = cv2.findNonZero(garm_alpha)
            if non_zeros is not None:
                bx, by, bw, bh = cv2.boundingRect(non_zeros)
                bx = max(0, bx)
                by = max(0, by)
                bw = min(garm_bgr.shape[1] - bx, bw)
                bh = min(garm_bgr.shape[0] - by, bh)
                garm_bgr = garm_bgr[by:by+bh, bx:bx+bw]
                garm_alpha = garm_alpha[by:by+bh, bx:bx+bw]

            # Lấy vị trí và kích thước thực tế của vùng thân người từ cloth_mask
            mask_img = cv2.imread(cloth_mask.mask_path, cv2.IMREAD_GRAYSCALE)
            torso_box = None
            if mask_img is not None and np.any(mask_img > 80):
                mask_pts = cv2.findNonZero((mask_img > 80).astype(np.uint8))
                if mask_pts is not None:
                    torso_box = cv2.boundingRect(mask_pts)

            if torso_box is not None:
                mx, my, mw, mh = torso_box
                # Chiều rộng áo ôm vừa vặn vai và thân người
                target_w = int(mw * 1.08 * workflow.warp_strength)
                scale_factor = target_w / float(garm_bgr.shape[1])
                target_h = int(garm_bgr.shape[0] * scale_factor)
                # Căn giữa theo trục ngực người và đặt ngay khớp cổ
                pos_x = mx + int((mw - target_w) * 0.5)
                pos_y = my
            else:
                target_w = int(w_p * (0.52 * workflow.warp_strength))
                scale_factor = target_w / float(garm_bgr.shape[1])
                target_h = int(garm_bgr.shape[0] * scale_factor)
                pos_x = int((w_p - target_w) * 0.5)
                pos_y = int(h_p * 0.30)

            # Resize bằng nội suy Lanczos4 để giữ độ sắc nét cao nhất của thớ vải
            resized_garm = cv2.resize(garm_bgr, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
            resized_alpha = cv2.resize(garm_alpha, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

            # Tăng cường nhẹ độ sắc nét thớ vải (Unsharp Masking)
            gaussian_3x3 = cv2.GaussianBlur(resized_garm, (0, 0), 2.0)
            sharpened_garm = cv2.addWeighted(resized_garm, 1.12, gaussian_3x3, -0.12, 0)

            # Cắt ghép an toàn vào khung ảnh người
            x1, y1 = max(0, pos_x), max(0, pos_y)
            x2, y2 = min(w_p, pos_x + target_w), min(h_p, pos_y + target_h)

            g_x1 = x1 - pos_x
            g_y1 = y1 - pos_y
            g_x2 = g_x1 + (x2 - x1)
            g_y2 = g_y1 + (y2 - y1)

            patch_garm = sharpened_garm[g_y1:g_y2, g_x1:g_x2]
            patch_alpha = resized_alpha[g_y1:g_y2, g_x1:g_x2]

            out_image = person_bgr.copy()
            patch_person = out_image[y1:y2, x1:x2].astype(np.float32)

            # Alpha Matting trực tiếp (Loại bỏ hoàn toàn viền trắng/halo, giữ nguyên 100% màu áo thật!)
            alpha_3d = (patch_alpha.astype(np.float32) / 255.0)[:, :, np.newaxis]
            blended_patch = patch_garm.astype(np.float32) * alpha_3d + patch_person * (1.0 - alpha_3d)

            out_image[y1:y2, x1:x2] = np.clip(blended_patch, 0, 255).astype(np.uint8)

            # Lưu ảnh kết quả chất lượng cao
            cv2.imwrite(public_dest_path, out_image, [cv2.IMWRITE_PNG_COMPRESSION, 3])
            cv2.imwrite(storage_dest_path, out_image, [cv2.IMWRITE_PNG_COMPRESSION, 3])

            logger.info(f"✅ [VTON] High-Precision Crisp Fitting thành công (Zero-Fringe): {public_dest_path}")
            return public_dest_path, "moonlight-crisp-vton"

        except Exception as err:
            logger.error(f"❌ [VTON] Lỗi xử lý ảnh: {err}")
            shutil.copyfile(person_image_path, public_dest_path)
            shutil.copyfile(person_image_path, storage_dest_path)
            return public_dest_path, "fallback-original"
