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

        gender = (gender_hint or "unisex").lower()
        if "female" in image_path.lower() or gender == "female":
            detected_gender = "female"
            body_type = "slim_standard"
            shoulder_ratio = 0.38
        elif "male" in image_path.lower() or gender == "male":
            detected_gender = "male"
            body_type = "broad_shoulders"
            shoulder_ratio = 0.46
        else:
            detected_gender = "unisex"
            body_type = "standard"
            shoulder_ratio = 0.42

        return PersonAnalysis(
            gender=detected_gender,
            body_type=body_type,
            pose_orientation="front_facing",
            shoulder_width_ratio=shoulder_ratio,
            torso_height_ratio=0.52,
            has_clear_face=True,
            background_complexity="studio",
            image_width=width,
            image_height=height,
            keypoints={
                "neck": {"x": 0.50, "y": 0.22},
                "left_shoulder": {"x": 0.35, "y": 0.26},
                "right_shoulder": {"x": 0.65, "y": 0.26},
                "chest_center": {"x": 0.50, "y": 0.36},
                "hip_center": {"x": 0.50, "y": 0.58}
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
        elif any(k in name or k in cat for k in ["quần", "pants", "trousers"]):
            category = "trousers"
            fabric = "italian_wool"
            collar = "none"
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
