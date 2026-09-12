from typing import Dict, Any, Optional
from pydantic import BaseModel
from PIL import Image
import os
from pathlib import Path

class PersonAnalysis(BaseModel):
    gender: str
    body_type: str
    pose_orientation: str
    shoulder_width_ratio: float
    hip_width_ratio: Optional[float] = None
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
    def analyze_person(
        image_path: str,
        gender_hint: Optional[str] = None,
        pose_hint: Optional[Dict[str, Any]] = None
    ) -> PersonAnalysis:
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
            default_shoulder_ratio = 0.35
        elif "male" in image_path.lower() or detected_gender == "male":
            detected_gender = "male"
            body_type = "broad_shoulders"
            default_shoulder_ratio = 0.40
        else:
            detected_gender = "unisex"
            body_type = "standard"
            default_shoulder_ratio = 0.38

        # ── Tự động nhận diện giải phẫu cơ thể người thực tế từ ảnh hoặc Pose Hint ──
        neck_x, neck_y = 0.50, 0.24
        hip_x = 0.50
        chest_y, hip_y = 0.38, 0.58
        knee_y, ankle_y, feet_y = 0.78, 0.92, 0.96
        body_bottom_y = 0.98
        shoulder_ratio = default_shoulder_ratio
        hip_ratio = default_shoulder_ratio * 0.78
        torso_height_ratio = 0.48
        bg_complexity = "studio"

        # Ưu tiên 1: Tọa độ giải phẫu học chính xác tuyệt đối từ MediaPipe Pose của client
        if pose_hint and isinstance(pose_hint, dict):
            try:
                neck_pt = pose_hint.get("neck", {})
                hip_pt = pose_hint.get("hip", {})
                neck_x = float(neck_pt.get("x", 0.50))
                neck_y = float(neck_pt.get("y", 0.24))
                hip_x = float(hip_pt.get("x", neck_x))
                hip_y = float(hip_pt.get("y", 0.58))
                
                raw_shoulder = float(pose_hint.get("shoulder_span", default_shoulder_ratio))
                shoulder_ratio = round(min(0.55, max(0.20, raw_shoulder)), 3)
                
                raw_hip = float(pose_hint.get("hip_span", shoulder_ratio * 0.78))
                hip_ratio = round(min(0.45, max(0.16, raw_hip)), 3)
                
                knee_y = round(float(pose_hint.get("knee_y", hip_y + 0.20)), 3)
                ankle_y = round(float(pose_hint.get("ankle_y", hip_y + 0.38)), 3)
                feet_y = round(float(pose_hint.get("feet_y", hip_y + 0.42)), 3)
                chest_y = round((neck_y + hip_y) / 2.0, 3)
                body_bottom_y = round(min(1.0, feet_y + 0.04), 3)
                torso_height_ratio = round(max(0.20, hip_y - neck_y), 3)
            except Exception:
                pass
        elif os.path.exists(image_path):
            # Ưu tiên 2: Phân tích dựa trên OpenCV Bounding Box nếu không có MediaPipe Pose
            try:
                import cv2
                import numpy as np
                from backend.ai.segmenter import GarmentSegmenter
                _, alpha = GarmentSegmenter.remove_background(image_path)
                pts = cv2.findNonZero((alpha > 80).astype(np.uint8))
                if pts is not None:
                    bx, by, bw, bh = cv2.boundingRect(pts)
                    # Nếu bw >= 75% chiều rộng ảnh -> Ảnh chụp ngoại cảnh phức tạp (cây cối, xe máy, đất)
                    # Nền không được bóc tách nên KHÔNG lấy cả khung ảnh làm người
                    is_outdoor_scene = (bw >= int(width * 0.75) and bh >= int(height * 0.80))
                    if not is_outdoor_scene and bw >= int(width * 0.08) and bh >= int(height * 0.15):
                        neck_x = round((bx + bw * 0.5) / float(width), 3)
                        neck_y = round((by + bh * 0.17) / float(height), 3)
                        hip_x = neck_x
                        shoulder_ratio = round(min(0.52, max(0.22, (bw * 0.85) / float(width))), 3)
                        hip_ratio = round(shoulder_ratio * 0.78, 3)
                        torso_height_ratio = round(min(0.60, (bh * 0.40) / float(height)), 3)
                        chest_y = round((by + bh * 0.32) / float(height), 3)
                        hip_y = round((by + bh * 0.56) / float(height), 3)
                        knee_y = round((by + bh * 0.78) / float(height), 3)
                        ankle_y = round((by + bh * 0.93) / float(height), 3)
                        feet_y = round((by + bh * 0.96) / float(height), 3)
                        body_bottom_y = round(min(1.0, (by + bh) / float(height)), 3)
                    elif is_outdoor_scene:
                        bg_complexity = "outdoor"
                        neck_x, neck_y = 0.54, 0.48
                        hip_x = 0.54
                        shoulder_ratio = 0.35
                        hip_ratio = 0.28
                        torso_height_ratio = 0.36
                        chest_y, hip_y = 0.52, 0.63
                        knee_y, ankle_y, feet_y = 0.77, 0.89, 0.94
                        body_bottom_y = 0.96
            except Exception:
                pass

        return PersonAnalysis(
            gender=detected_gender,
            body_type=body_type,
            pose_orientation="front_facing",
            shoulder_width_ratio=shoulder_ratio,
            hip_width_ratio=hip_ratio,
            torso_height_ratio=torso_height_ratio,
            has_clear_face=True,
            background_complexity=bg_complexity,
            image_width=width,
            image_height=height,
            keypoints={
                "neck": {"x": neck_x, "y": neck_y},
                "left_shoulder": {"x": round(max(0.02, neck_x - shoulder_ratio * 0.5), 3), "y": round(neck_y + 0.04, 3)},
                "right_shoulder": {"x": round(min(0.98, neck_x + shoulder_ratio * 0.5), 3), "y": round(neck_y + 0.04, 3)},
                "chest_center": {"x": neck_x, "y": chest_y},
                "hip_center": {"x": hip_x, "y": hip_y},
                "knee_center": {"x": hip_x, "y": knee_y},
                "ankle_center": {"x": hip_x, "y": ankle_y},
                "feet_center": {"x": hip_x, "y": feet_y},
                "body_bottom": {"x": hip_x, "y": body_bottom_y}
            }
        )

    @staticmethod
    def analyze_garment(image_path: str, product_meta: Optional[Dict[str, Any]] = None) -> GarmentAnalysis:
        meta = product_meta or {}
        name = str(meta.get("name", "")).lower()
        cat = str(meta.get("category", "")).lower()
        img_stem = Path(image_path).stem.lower().replace("_cutout", "") if image_path else ""
        combined = f"{name} {cat} {img_stem}"
        
        category = "vest_suit"
        fabric = "italian_wool"
        collar = "notch_lapel"
        sleeve = "long_sleeve"
        silhouette = "tailored_fit"
        
        # 1. Giày & Loafer (Footwear)
        if any(k in combined for k in ["giay", "giày", "loafer", "shoe", "shoes", "boot", "sneaker", "oxford"]):
            category = "shoes"
            fabric = "genuine_leather"
            collar = "none"
            sleeve = "none"
            silhouette = "classic_loafer"
        # 2. Quần (Trousers / Pants / Jeans / Chino)
        elif any(k in combined for k in ["quan", "quần", "pant", "pants", "trouser", "trousers", "jean", "jeans", "chino", "kaki", "khaki"]):
            category = "trousers"
            fabric = "denim" if ("jean" in combined or "denim" in combined) else "italian_wool"
            collar = "none"
            sleeve = "none"
            silhouette = "straight_cut"
        # 3. Đầm & Váy (Dresses & Skirts)
        elif any(k in combined for k in ["dam", "đầm", "dress", "gown", "vay", "váy", "skirt"]):
            category = "evening_dress"
            fabric = "royal_velvet" if "nhung" in combined else "mulberry_silk"
            collar = "v_neck"
            silhouette = "flowing_gown"
        # 4. Vest, Blazer & Áo khoác (Suits & Outerwear)
        elif any(k in combined for k in ["vest", "suit", "blazer", "tweed", "khoac", "khoác", "coat", "trench"]):
            category = "vest_suit"
            fabric = "italian_wool" if "wool" in combined or "tweed" in combined else "structured_cotton"
            collar = "peak_lapel" if "hoàng gia" in combined else "notch_lapel"
            silhouette = "structured"
        # 5. Sơ mi & Áo lụa (Shirts & Blouses)
        elif any(k in combined for k in ["so mi", "sơ mi", "shirt", "blouse", "lua", "lụa", "silk"]):
            category = "silk_shirt"
            fabric = "mulberry_silk" if ("lụa" in combined or "silk" in combined) else "cotton_linen"
            collar = "spread_collar"
            silhouette = "slim_fit"
        # 6. Áo len, hoodie, thun, polo (Tops & Sweaters)
        elif any(k in combined for k in ["sweater", "len", "hoodie", "tee", "thun", "polo", "pima"]):
            category = "vest_suit"  # Định tuyến phom dáng thân trên
            fabric = "cashmere" if "cashmere" in combined else "pima_cotton"
            collar = "turtleneck" if "cổ lọ" in combined else "crew_neck"
            silhouette = "comfort_fit"
        else:
            # Fallback dựa trên tỷ lệ kích thước ảnh (nếu có file ảnh thực tế)
            if image_path and os.path.exists(image_path):
                try:
                    import cv2
                    g_img = cv2.imread(image_path)
                    if g_img is not None:
                        gh, gw = g_img.shape[:2]
                        if gh / float(gw) >= 1.35:
                            category = "trousers"
                            fabric = "italian_wool"
                        elif gw / float(gh) >= 1.25:
                            category = "shoes"
                            fabric = "genuine_leather"
                except Exception:
                    pass

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
