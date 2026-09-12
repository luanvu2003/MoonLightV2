from typing import Dict, Any, Optional
from pydantic import BaseModel
from PIL import Image
import os

class PersonAnalysis(BaseModel):
    gender: str
    body_type: str
    pose_orientation: str
    shoulder_width_ratio: float
    torso_height_ratio: float
    has_clear_face: bool
    background_complexity: str
    image_width: int
    image_height: int
    keypoints: Dict[str, Dict[str, float]]

class GarmentAnalysis(BaseModel):
    category: str
    fabric_type: str
    collar_style: str
    sleeve_length: str
    silhouette: str
    dominant_colors: list[str]
    description: str

class Analyzer:
    @staticmethod
    def analyze_person(image_path: str, gender_hint: Optional[str] = None) -> PersonAnalysis:
        width, height = 1024, 1024
        if os.path.exists(image_path):
            try:
                with Image.open(image_path) as img:
                    width, height = img.size
            except Exception:
                pass

        detected_gender = (gender_hint or "unisex").lower()
        if "female" in image_path.lower() or detected_gender == "female":
            detected_gender = "female"
            body_type = "slim_standard"
            default_shoulder_ratio = 0.38
        elif "male" in image_path.lower() or detected_gender == "male":
            detected_gender = "male"
            body_type = "broad_shoulders"
            default_shoulder_ratio = 0.46
        else:
            detected_gender = "unisex"
            body_type = "standard"
            default_shoulder_ratio = 0.42

        # ── Tự động nhận diện giải phẫu cơ thể người thực tế từ ảnh ──
        neck_x, neck_y = 0.50, 0.22
        chest_y, hip_y = 0.36, 0.58
        knee_y, ankle_y, feet_y = 0.76, 0.90, 0.94
        body_bottom_y = 0.96
        shoulder_ratio = default_shoulder_ratio
        torso_height_ratio = 0.52

        if os.path.exists(image_path):
            try:
                import cv2
                import numpy as np
                from backend.ai.segmenter import GarmentSegmenter
                _, alpha = GarmentSegmenter.remove_background(image_path)
                pts = cv2.findNonZero((alpha > 80).astype(np.uint8))
                if pts is not None:
                    bx, by, bw, bh = cv2.boundingRect(pts)
                    # Xác thực kích thước người hợp lý (chiếm ít nhất 6% chiều rộng và 12% chiều cao)
                    if bw >= int(width * 0.06) and bh >= int(height * 0.12):
                        neck_x = round((bx + bw * 0.5) / float(width), 3)
                        neck_y = round((by + bh * 0.17) / float(height), 3)
                        shoulder_ratio = round(min(0.85, (bw * 0.95) / float(width)), 3)
                        torso_height_ratio = round(min(0.70, (bh * 0.40) / float(height)), 3)
                        chest_y = round((by + bh * 0.32) / float(height), 3)
                        hip_y = round((by + bh * 0.56) / float(height), 3)
                        knee_y = round((by + bh * 0.78) / float(height), 3)
                        ankle_y = round((by + bh * 0.93) / float(height), 3)
                        feet_y = round((by + bh * 0.96) / float(height), 3)
                        body_bottom_y = round(min(1.0, (by + bh) / float(height)), 3)
            except Exception:
                pass

        return PersonAnalysis(
            gender=detected_gender,
            body_type=body_type,
            pose_orientation="front_facing",
            shoulder_width_ratio=shoulder_ratio,
            torso_height_ratio=torso_height_ratio,
            has_clear_face=True,
            background_complexity="studio",
            image_width=width,
            image_height=height,
            keypoints={
                "neck": {"x": neck_x, "y": neck_y},
                "left_shoulder": {"x": round(max(0.02, neck_x - shoulder_ratio * 0.5), 3), "y": round(neck_y + 0.04, 3)},
                "right_shoulder": {"x": round(min(0.98, neck_x + shoulder_ratio * 0.5), 3), "y": round(neck_y + 0.04, 3)},
                "chest_center": {"x": neck_x, "y": chest_y},
                "hip_center": {"x": neck_x, "y": hip_y},
                "knee_center": {"x": neck_x, "y": knee_y},
                "ankle_center": {"x": neck_x, "y": ankle_y},
                "feet_center": {"x": neck_x, "y": feet_y},
                "body_bottom": {"x": neck_x, "y": body_bottom_y}
            }
        )

    @staticmethod
    def analyze_garment(image_path: str, product_meta: Optional[Dict[str, Any]] = None) -> GarmentAnalysis:
        meta = product_meta or {}
        name = str(meta.get("name", "")).lower()
        cat = str(meta.get("category", "")).lower()
        
        category = "vest_suit"
        fabric = "italian_wool"
        collar = "notch_lapel"
        sleeve = "long_sleeve"
        silhouette = "tailored_fit"
        
        if any(k in name or k in cat for k in ["vest", "suit", "blazer"]):
            category = "vest_suit"
            fabric = "italian_wool"
            collar = "peak_lapel" if "hoàng gia" in name else "notch_lapel"
            silhouette = "structured"
        elif any(k in name or k in cat for k in ["sơ mi", "so-mi", "shirt", "lụa", "silk"]):
            category = "silk_shirt"
            fabric = "mulberry_silk" if ("lụa" in name or "silk" in name) else "cotton_linen"
            collar = "spread_collar"
            silhouette = "slim_fit"
        elif any(k in name or k in cat for k in ["đầm", "váy", "dress", "gown"]):
            category = "evening_dress"
            fabric = "royal_velvet" if "nhung" in name else "mulberry_silk"
            collar = "v_neck"
            silhouette = "flowing_gown"
        elif any(k in name or k in cat for k in ["giày", "loafer", "shoes", "oxford", "sneaker", "boot", "dép"]):
            category = "shoes"
            fabric = "genuine_leather"
            collar = "none"
            sleeve = "none"
            silhouette = "classic_loafer"
        elif any(k in name or k in cat for k in ["quần", "pants", "trousers", "jean", "jeans", "chino"]):
            category = "trousers"
            fabric = "denim" if ("jean" in name or "denim" in name) else "italian_wool"
            collar = "none"
            sleeve = "none"
            silhouette = "straight_cut"
        else:
            category = "haute_couture"
            fabric = "premium_blend"
            collar = "designer"
            silhouette = "bespoke"

        desc = meta.get("description") or f"MoonLight Luxury {category.replace('_', ' ').title()} - {fabric.replace('_', ' ')}"

        return GarmentAnalysis(
            category=category,
            fabric_type=fabric,
            collar_style=collar,
            sleeve_length=sleeve,
            silhouette=silhouette,
            dominant_colors=["#0f172a", "#dfba73"],
            description=desc
        )
