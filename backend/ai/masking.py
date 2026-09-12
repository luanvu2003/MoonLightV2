from __future__ import annotations
import os
from pathlib import Path
from typing import TYPE_CHECKING
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import cv2

if TYPE_CHECKING:
    from backend.agent.analyzer import PersonAnalysis, GarmentAnalysis
    from backend.agent.workflow import WorkflowDecision
from backend.ai.parsing import HumanParsingResult
from backend.config.settings import settings

class ClothMaskResult(BaseModel):
    mask_path: str
    mask_type: str
    feather_radius_px: int
    dimensions: list[int]
    coverage_percentage: float

class ClothMaskGenerator:
    @staticmethod
    def generate_mask(
        person_image_path: str,
        parsing_result: HumanParsingResult,
        garment_analysis: GarmentAnalysis,
        workflow: WorkflowDecision,
        attempt: int = 1,
        person_analysis: Optional[PersonAnalysis] = None
    ) -> ClothMaskResult:
        """
        Tạo mặt nạ Cloth Mask bóc tách trang phục cũ với viền khử lem màu
        """
        with Image.open(person_image_path) as img:
            w, h = img.size

        # Tạo ảnh mặt nạ đen trắng (L mode: 0=đen bảo tồn, 255=trắng cần thay)
        mask = Image.new("L", (w, h), 0)
        draw = ImageDraw.Draw(mask)

        category = garment_analysis.category

        # Trích xuất thông số giải phẫu học chính xác
        kp = person_analysis.keypoints if person_analysis else {}
        hip_pt = kp.get("hip_center", {"x": 0.50, "y": 0.58})
        neck_pt = kp.get("neck", {"x": 0.50, "y": 0.24})
        hip_x = float(hip_pt.get("x", 0.50))
        hip_y = float(hip_pt.get("y", 0.58))
        neck_x = float(neck_pt.get("x", 0.50))
        neck_y = float(neck_pt.get("y", 0.24))
        ankle_y = float(kp.get("ankle_center", {}).get("y", 0.92))
        feet_y = float(kp.get("feet_center", {}).get("y", 0.96))
        sw = person_analysis.shoulder_width_ratio if person_analysis else 0.38
        hw = (person_analysis.hip_width_ratio if person_analysis and person_analysis.hip_width_ratio else sw * 0.78)

        if category == "shoes":
            # Mặt nạ giày & loafer: vùng bàn chân và cổ chân chuẩn xác
            shoe_w = min(int(w * 0.30), int(sw * 0.70 * w))
            shoe_center_x = int(hip_x * w)
            min_x = max(0, shoe_center_x - shoe_w // 2)
            max_x = min(w, shoe_center_x + shoe_w // 2)
            min_y = int(min(h * 0.88, ankle_y * h - h * 0.03))
            max_y = min(h, int(max(feet_y * h + h * 0.04, h * 0.98)))
            draw.rounded_rectangle([min_x, min_y, max_x, max_y], radius=15, fill=255)
        elif category == "trousers":
            # Mặt nạ quần: từ eo/hông xuống mắt cá chân
            # Độ rộng chuẩn may đo ôm hông (tối đa 38% chiều rộng ảnh)
            pants_w = min(int(w * 0.38), max(int(hw * 1.15 * w), int(sw * 0.82 * w), int(w * 0.20)))
            pants_center_x = int(hip_x * w)
            min_x = max(0, pants_center_x - pants_w // 2)
            max_x = min(w, pants_center_x + pants_w // 2)
            min_y = int(hip_y * h)
            max_y = min(h, int(max(ankle_y * h, h * 0.94)))
            # Thêm padding tinh chỉnh theo lần thử retry
            padding = (attempt - 1) * 4
            min_x = max(0, min_x - padding)
            max_x = min(w, max_x + padding)
            draw.rounded_rectangle([min_x, min_y, max_x, max_y], radius=10, fill=255)
        else:
            # Lấy vùng torso_garment từ parsing cho áo, vest & đầm
            tb = parsing_result.torso_garment.bounds
            min_x = int(tb["min_x"] * w)
            max_x = int(tb["max_x"] * w)
            min_y = int(tb["min_y"] * h)
            max_y = int(tb["max_y"] * h)

            if category == "evening_dress":
                max_y = int(h * 0.90)  # Kéo dài váy xuống dưới

            # Thêm padding tinh chỉnh theo lần thử retry
            padding = (attempt - 1) * 6
            min_x = max(0, min_x - padding)
            max_x = min(w, max_x + padding)
            min_y = max(0, min_y - padding)
            max_y = min(h, max_y + padding)

            # Vẽ hình polygon thân trên chuẩn dáng vóc, không phì ngang
            mid_x = int((min_x + max_x) * 0.5)
            points = [
                (mid_x, min_y),
                (max_x, int(min_y + (max_y - min_y) * 0.15)),
                (max_x, max_y),
                (min_x, max_y),
                (min_x, int(min_y + (max_y - min_y) * 0.15)),
            ]
            draw.polygon(points, fill=255)

            # Đục lỗ bảo vệ khớp cổ và cằm
            nb = parsing_result.neck_skin.bounds
            draw.ellipse([
                int(nb["min_x"] * w), int(nb["min_y"] * h * 0.9),
                int(nb["max_x"] * w), int(nb["max_y"] * h)
            ], fill=0)

        # Gaussian Blur làm mềm viền (feathering)
        feather = workflow.recommended_mask_feathering + (attempt - 1) * 2
        blurred_mask = mask.filter(ImageFilter.GaussianBlur(radius=feather))

        # Lưu mặt nạ vào storage
        mask_filename = f"mask_{Path(person_image_path).stem}_{attempt}.png"
        mask_path = str(settings.STORAGE_RESULTS_DIR / mask_filename)
        blurred_mask.save(mask_path)

        # Tính tỷ lệ phủ của mặt nạ
        mask_arr = np.array(blurred_mask)
        coverage = float(np.count_nonzero(mask_arr > 128) / (w * h) * 100)

        return ClothMaskResult(
            mask_path=mask_path,
            mask_type="neural_soft_edge_mask",
            feather_radius_px=feather,
            dimensions=[w, h],
            coverage_percentage=round(coverage, 2)
        )
