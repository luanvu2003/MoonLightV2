from pydantic import BaseModel
from .analyzer import PersonAnalysis, GarmentAnalysis

class WorkflowDecision(BaseModel):
    workflow_id: str
    name: str
    description: str
    target_resolution: str
    recommended_mask_feathering: int
    warp_strength: float
    lighting_balance_factor: float
    denoise_steps: int

class WorkflowSelector:
    WORKFLOWS = {
        "tailored_suit_workflow": WorkflowDecision(
            workflow_id="tailored_suit_workflow",
            name="Quy trình May đo Vest Hoàng Gia (Haute Couture Suit Pipeline)",
            description="Tối ưu cho vai đệm, nếp gấp ve áo vest, mô phỏng vải wool thượng hạng và đổ bóng 3D ngực áo.",
            target_resolution="1024x1024_HD",
            recommended_mask_feathering=6,
            warp_strength=0.95,
            lighting_balance_factor=1.15,
            denoise_steps=30
        ),
        "silk_shirt_workflow": WorkflowDecision(
            workflow_id="silk_shirt_workflow",
            name="Quy trình Tơ Lụa Cao Cấp (Mulberry Silk Fluidity Pipeline)",
            description="Tối ưu độ ôm sát ngực, độ rủ tự nhiên của vải lụa Mulberry và bảo toàn đường viền cổ tay.",
            target_resolution="1024x1024_HD",
            recommended_mask_feathering=4,
            warp_strength=0.85,
            lighting_balance_factor=1.05,
            denoise_steps=25
        ),
        "evening_dress_workflow": WorkflowDecision(
            workflow_id="evening_dress_workflow",
            name="Quy trình Đầm Dạ Hội Quý Phái (Royal Evening Gown Pipeline)",
            description="Tối ưu phom dáng chữ A, eo thon, độ rủ tà váy dài và đường cắt cúp tôn dáng nữ tính.",
            target_resolution="1024x1536_Portrait",
            recommended_mask_feathering=8,
            warp_strength=1.0,
            lighting_balance_factor=1.20,
            denoise_steps=35
        ),
        "tailored_pants_workflow": WorkflowDecision(
            workflow_id="tailored_pants_workflow",
            name="Quy trình Quần Âu May Đo (Tailored Trousers Pipeline)",
            description="Tối ưu đường ly thẳng, tỷ lệ hông - đùi - ống đứng và độ rơi của gấu quần.",
            target_resolution="1024x1024_HD",
            recommended_mask_feathering=5,
            warp_strength=0.80,
            lighting_balance_factor=1.0,
            denoise_steps=28
        ),
        "royal_footwear_workflow": WorkflowDecision(
            workflow_id="royal_footwear_workflow",
            name="Quy trình May đo Giày & Loafer Hoàng Gia (Royal Footwear Pipeline)",
            description="Tối ưu tỷ lệ cổ chân, form dáng mũi giày, chất liệu da bóng bẩy và định vị bàn chân hoàn hảo.",
            target_resolution="1024x1024_HD",
            recommended_mask_feathering=4,
            warp_strength=0.75,
            lighting_balance_factor=1.10,
            denoise_steps=25
        ),
        "haute_couture_general_workflow": WorkflowDecision(
            workflow_id="haute_couture_general_workflow",
            name="Quy trình Thử Đồ Tiêu Chuẩn MoonLight Luxury",
            description="Cân bằng tự động cho mọi dòng trang phục cao cấp MoonLight.",
            target_resolution="1024x1024_HD",
            recommended_mask_feathering=5,
            warp_strength=0.90,
            lighting_balance_factor=1.10,
            denoise_steps=30
        )
    }

    @classmethod
    def select_workflow(cls, person: PersonAnalysis, garment: GarmentAnalysis) -> WorkflowDecision:
        cat = garment.category
        if cat == "vest_suit":
            return cls.WORKFLOWS["tailored_suit_workflow"]
        elif cat == "silk_shirt":
            return cls.WORKFLOWS["silk_shirt_workflow"]
        elif cat == "evening_dress":
            return cls.WORKFLOWS["evening_dress_workflow"]
        elif cat == "trousers":
            return cls.WORKFLOWS["tailored_pants_workflow"]
        elif cat == "shoes":
            return cls.WORKFLOWS["royal_footwear_workflow"]
        return cls.WORKFLOWS["haute_couture_general_workflow"]

    @classmethod
    def list_all(cls):
        return list(cls.WORKFLOWS.values())
