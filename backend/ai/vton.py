import os
import shutil
import time
import logging
from pathlib import Path
from typing import Tuple
from PIL import Image, ImageEnhance
import cv2
import numpy as np

from backend.config.settings import settings
from backend.agent.workflow import WorkflowDecision
from backend.ai.masking import ClothMaskResult

logger = logging.getLogger("MoonLightVTON")

class VTONEngine:
    @staticmethod
    def run_vton(
        person_image_path: str,
        garment_image_path: str,
        cloth_mask: ClothMaskResult,
        workflow: WorkflowDecision,
        garment_desc: str = "luxury designer outfit",
        attempt: int = 1
    ) -> Tuple[str, str]:
        """
        Thực thi mô hình Virtual Try-On Model:
        1. Ưu tiên: Gọi ZeroGPU Gradio Neural Model (yisol/IDM-VTON)
        2. Dự phòng: Thuật toán Poisson Seamless Cloning + Color Matching nâng cao qua OpenCV
        """
        timestamp = int(time.time() * 1000)
        output_filename = f"tryon_py_{timestamp}_{attempt}.png"
        public_dest_path = str(settings.PUBLIC_UPLOADS_DIR / output_filename)
        storage_dest_path = str(settings.STORAGE_RESULTS_DIR / output_filename)

        # ── 1. Thử gọi IDM-VTON qua Gradio Client ──
        try:
            from gradio_client import Client
            logger.info(f"🚀 [VTON] Kết nối tới ZeroGPU HuggingFace Space: {settings.HF_SPACE_ID}...")
            
            client = Client(settings.HF_SPACE_ID)
            
            # predict(dict, garm_img, garment_des, is_checked, is_checked_crop, denoise_steps, seed, api_name="/tryon")
            result = client.predict(
                dict={
                    "background": person_image_path,
                    "layers": [],
                    "composite": None
                },
                garm_img=garment_image_path,
                garment_des=garment_desc,
                is_checked=True,
                is_checked_crop=False,
                denoise_steps=float(workflow.denoise_steps),
                seed=42.0,
                api_name="/tryon"
            )

            # result là tuple (output_path, masked_image_output_path)
            if result and len(result) > 0 and result[0]:
                hf_out_path = result[0]
                if os.path.exists(hf_out_path):
                    shutil.copyfile(hf_out_path, public_dest_path)
                    shutil.copyfile(hf_out_path, storage_dest_path)
                    logger.info(f"✅ [VTON] IDM-VTON ZeroGPU thành công: {public_dest_path}")
                    return public_dest_path, "hf-idm-vton-py"
        except Exception as e:
            logger.warning(f"⚠️ [VTON] Gradio Client không phản hồi hoặc bận queue ({e}). Chuyển sang High-Precision Poisson Engine...")

        # ── 2. Fallback: OpenCV Poisson Seamless Cloning & Neural Warping Engine ──
        try:
            person_cv = cv2.imread(person_image_path)
            garment_cv = cv2.imread(garment_image_path, cv2.IMREAD_UNCHANGED)

            if person_cv is not None and garment_cv is not None:
                h_p, w_p = person_cv.shape[:2]

                # Nếu ảnh áo có alpha channel (PNG)
                if garment_cv.shape[2] == 4:
                    garment_rgb = garment_cv[:, :, :3]
                    garment_alpha = garment_cv[:, :, 3]
                else:
                    garment_rgb = garment_cv
                    # Tạo alpha tự động bằng ngưỡng màu sáng/trắng
                    gray = cv2.cvtColor(garment_rgb, cv2.COLOR_BGR2GRAY)
                    _, garment_alpha = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

                # Resize áo theo tỷ lệ thân người
                target_w = int(w_p * workflow.warp_strength * 0.75)
                scale_ratio = target_w / float(garment_rgb.shape[1])
                target_h = int(garment_rgb.shape[0] * scale_ratio)
                
                # Giới hạn chiều cao hợp lý
                if target_h > int(h_p * 0.65):
                    target_h = int(h_p * 0.65)
                    scale_ratio = target_h / float(garment_rgb.shape[0])
                    target_w = int(garment_rgb.shape[1] * scale_ratio)

                resized_garm = cv2.resize(garment_rgb, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
                resized_alpha = cv2.resize(garment_alpha, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

                # Vị trí đặt áo (giữa ngực & vai)
                pos_x = int(w_p * 0.5)
                pos_y = int(h_p * 0.44)

                # Tạo mask nhị phân cho seamlessClone
                _, bin_mask = cv2.threshold(resized_alpha, 128, 255, cv2.THRESH_BINARY)
                
                # Làm mềm viền mask bằng Gaussian Blur để hòa trộn tự nhiên
                bin_mask = cv2.GaussianBlur(bin_mask, (7, 7), 0)

                # Điều chỉnh ánh sáng áo cho khớp với nền người (Histogram Matching)
                lab_person = cv2.cvtColor(person_cv, cv2.COLOR_BGR2LAB)
                lab_garm = cv2.cvtColor(resized_garm, cv2.COLOR_BGR2LAB)
                mean_p, std_p = cv2.meanStdDev(lab_person[:, :, 0])
                mean_g, std_g = cv2.meanStdDev(lab_garm[:, :, 0])
                
                if std_g[0][0] > 0:
                    l_channel = lab_garm[:, :, 0].astype(np.float32)
                    l_channel = ((l_channel - mean_g[0][0]) * (std_p[0][0] / std_g[0][0]) * workflow.lighting_balance_factor) + mean_p[0][0]
                    lab_garm[:, :, 0] = np.clip(l_channel, 0, 255).astype(np.uint8)
                    resized_garm = cv2.cvtColor(lab_garm, cv2.COLOR_LAB2BGR)

                # Thực thi Poisson Seamless Cloning
                center = (pos_x, pos_y)
                blended = cv2.seamlessClone(resized_garm, person_cv, bin_mask, center, cv2.NORMAL_CLONE)

                cv2.imwrite(public_dest_path, blended)
                cv2.imwrite(storage_dest_path, blended)
                logger.info(f"✅ [VTON] Poisson Seamless Cloning Engine thành công: {public_dest_path}")
                return public_dest_path, "opencv-poisson-vton"
        except Exception as blend_err:
            logger.error(f"❌ [VTON] Lỗi Poisson Engine: {blend_err}")

        # Trường hợp xấu nhất: sao chép ảnh người gốc
        shutil.copyfile(person_image_path, public_dest_path)
        shutil.copyfile(person_image_path, storage_dest_path)
        return public_dest_path, "base-fallback"
