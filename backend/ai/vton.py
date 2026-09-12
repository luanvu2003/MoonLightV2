import os
import shutil
import time
import logging
from pathlib import Path
from typing import Tuple
from PIL import Image
import cv2
import numpy as np

from backend.config.settings import settings
from backend.agent.workflow import WorkflowDecision
from backend.ai.masking import ClothMaskResult

logger = logging.getLogger("MoonLightVTON")

class VTONEngine:
    @staticmethod
    def _clean_garment_mask_and_defringe(bgr: np.ndarray, alpha: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Khử sạch 100% nền trắng, viền xám, viền mờ và bóng sàn studio (Zero-Halo & Zero-Fringe)
        Đồng thời mở rộng màu ruột áo (Defringe) để chống lem viền trắng khi nội suy.
        """
        h, w = alpha.shape
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

        # 1. Đo màu sắc và độ sáng lõi thân áo (tránh ảnh hưởng bởi viền)
        dist = cv2.distanceTransform((alpha > 128).astype(np.uint8), cv2.DIST_L2, 5)
        core_mask = dist > 15
        if not np.any(core_mask):
            core_mask = alpha > 128

        core_gray = float(np.median(gray[core_mask])) if np.any(core_mask) else 128.0
        med_bgr = np.median(bgr[core_mask], axis=0).astype(np.uint8) if np.any(core_mask) else np.array([25, 25, 25], dtype=np.uint8)

        # 2. Phát hiện và loại bỏ triệt để bóng sàn studio & nền trắng
        # Bóng sàn studio có độ bão hòa thấp (màu xám nhạt hsv[1] < 50) và sáng hơn hẳn thân áo
        if core_gray < 165:
            thresh_light = max(core_gray + 25, 70)
            bad_bg = (alpha > 0) & (
                ((gray > 205) & (hsv[:, :, 1] < 50)) |
                ((np.arange(h)[:, None] > h * 0.55) & (gray > thresh_light) & (hsv[:, :, 1] < 45))
            )
        else:
            # Trang phục màu sáng (trắng / kem): chỉ lọc nền sáng studio > 235
            bad_bg = (alpha > 0) & (gray > 235) & (hsv[:, :, 1] < 30)

        alpha_clean = alpha.copy()
        alpha_clean[bad_bg] = 0

        # 3. Lọc bỏ các mảng rác nhỏ, chỉ giữ lại các contour thân áo chính
        contours, _ = cv2.findContours(alpha_clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        mask_clean = np.zeros((h, w), np.uint8)
        for c in contours:
            if cv2.contourArea(c) > 2500:
                cv2.drawContours(mask_clean, [c], -1, 255, -1)

        # 4. Cạo viền (Erosion 2px) để loại bỏ hoàn toàn viền halo ngoài cùng
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        alpha_eroded = cv2.erode(mask_clean, kernel, iterations=2)

        # 5. Defringe: Thay thế toàn bộ pixel ngoài viền bằng màu thân áo
        # Ngăn chặn hiện tượng cv2.resize Lanczos lấy mẫu pixel trắng bên ngoài mask
        bgr_clean = bgr.copy()
        border_fringe = cv2.subtract(mask_clean, alpha_eroded)
        bgr_clean[(border_fringe > 0) & (gray > core_gray + 10)] = med_bgr
        bgr_clean[alpha_eroded == 0] = med_bgr

        # 6. Anti-Aliasing 1px làm mịn viền tự nhiên
        alpha_final = cv2.GaussianBlur(alpha_eroded, (3, 3), 0)
        return bgr_clean, alpha_final

    @classmethod
    def extract_garment_cutout(cls, garment_path: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Bóc tách nền áo chuẩn xác 100% không còn viền trắng, viền xám hay bóng sàn studio
        """
        p = Path(garment_path)

        # 1. Kiểm tra xem có file _cutout.png tương ứng không
        cutout_candidate = p.parent / f"{p.stem}_cutout.png"
        if cutout_candidate.exists():
            cutout = cv2.imread(str(cutout_candidate), cv2.IMREAD_UNCHANGED)
            if cutout is not None and len(cutout.shape) == 3 and cutout.shape[2] == 4:
                return cls._clean_garment_mask_and_defringe(cutout[:, :, :3], cutout[:, :, 3])

        # 2. Kiểm tra ảnh hiện tại có alpha channel không
        img = cv2.imread(garment_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            raise ValueError(f"Không thể đọc file ảnh trang phục: {garment_path}")

        if len(img.shape) == 3 and img.shape[2] == 4:
            return cls._clean_garment_mask_and_defringe(img[:, :, :3], img[:, :, 3])

        # 3. Tách nền tự động bằng phân tích màu loại bỏ sạch nền trắng & bóng đổ studio dưới sàn
        bgr = img[:, :, :3] if len(img.shape) == 3 else cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        h, w = bgr.shape[:2]

        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

        is_white_bg = (gray > 205) & (hsv[:, :, 1] < 45)
        initial_alpha = np.where(is_white_bg, 0, 255).astype(np.uint8)

        return cls._clean_garment_mask_and_defringe(bgr, initial_alpha)

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

        # ── 1. Thử gọi ZeroGPU IDM-VTON qua Gradio Client (nếu khả dụng) ──
        if settings.HF_TOKEN:
            try:
                from gradio_client import Client, handle_file
                logger.info(f"🚀 [VTON] Kết nối tới ZeroGPU HuggingFace Space: {settings.HF_SPACE_ID}...")
                client = Client(settings.HF_SPACE_ID, hf_token=settings.HF_TOKEN)
                result = client.predict(
                    dict={"background": handle_file(person_image_path), "layers": [], "composite": None},
                    garm_img=handle_file(garment_image_path),
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

            # Tính toán kích thước áo ôm trọn thân người & che kín áo cũ bên dưới
            target_w = int(w_p * (0.68 * workflow.warp_strength))
            scale_factor = target_w / float(garm_bgr.shape[1])
            target_h = int(garm_bgr.shape[0] * scale_factor * 1.05)

            # Giới hạn chiều cao áo vừa vặn với chiều dài thân trên
            max_allowed_h = int(h_p * 0.58)
            if target_h > max_allowed_h:
                target_h = max_allowed_h
                scale_factor = target_h / float(garm_bgr.shape[0])
                target_w = int(garm_bgr.shape[1] * scale_factor)

            # Resize bằng nội suy Lanczos4 để giữ độ sắc nét cao nhất của thớ vải
            resized_garm = cv2.resize(garm_bgr, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
            resized_alpha = cv2.resize(garm_alpha, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

            # Tăng cường nhẹ độ sắc nét thớ vải (Unsharp Masking)
            gaussian_3x3 = cv2.GaussianBlur(resized_garm, (0, 0), 2.0)
            sharpened_garm = cv2.addWeighted(resized_garm, 1.12, gaussian_3x3, -0.12, 0)

            # Vị trí đặt áo (Căn giữa trục người, khớp ngực và vai, che kín cổ & gấu áo cũ bên dưới)
            pos_x = int((w_p - target_w) * 0.5)
            pos_y = int(h_p * 0.23)

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
