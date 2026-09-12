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
        attempt: int = 1
    ) -> ClothMaskResult:
        """
        Tạo mặt nạ Cloth Mask bóc tách trang phục cũ với viền khử lem màu
        """
        with Image.open(person_image_path) as img:
            w, h = img.size

        # Tạo ảnh mặt nạ đen trắng (L mode: 0=đen bảo tồn, 255=trắng cần thay)
        mask = Image.new("L", (w, h), 0)
        draw = ImageDraw.Draw(mask)

        # Lấy vùng torso_garment từ parsing
        tb = parsing_result.torso_garment.bounds
        min_x = int(tb["min_x"] * w)
        max_x = int(tb["max_x"] * w)
        min_y = int(tb["min_y"] * h)
        max_y = int(tb["max_y"] * h)

        if garment_analysis.category == "evening_dress":
            max_y = int(h * 0.90)  # Kéo dài váy xuống dưới

        # Thêm padding tinh chỉnh theo lần thử retry
        padding = (attempt - 1) * 8
        min_x = max(0, min_x - padding)
        max_x = min(w, max_x + padding)
        min_y = max(0, min_y - padding)
        max_y = min(h, max_y + padding)

        # Vẽ hình oval / polygon mô phỏng thân trên trang phục
        points = [
            (int((min_x + max_x) / 2), min_y),
            (max_x, int(min_y + (max_y - min_y) * 0.2)),
            (int(max_x + (w * 0.05)), int(min_y + (max_y - min_y) * 0.6)),
            (max_x, max_y),
            (min_x, max_y),
            (int(min_x - (w * 0.05)), int(min_y + (max_y - min_y) * 0.6)),
            (min_x, int(min_y + (max_y - min_y) * 0.2)),
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
