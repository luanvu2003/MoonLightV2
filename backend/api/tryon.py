from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from backend.agent.agent import TryOnAgent
from backend.workers.tryon_worker import run_in_worker

router = APIRouter(prefix="/api/tryon", tags=["TryOn"])

class TryOnRequest(BaseModel):
    personImage: str
    garmentImage: str
    productId: Optional[str] = None
    modelGender: Optional[str] = None
    isCustomUpload: Optional[bool] = False
    product: Optional[Dict[str, Any]] = None

@router.post("")
@router.post("/")
async def execute_tryon(payload: TryOnRequest):
    """
    Endpoint chính xử lý AI Virtual Try-On
    """
    try:
        if not payload.personImage or not payload.garmentImage:
            raise HTTPException(status_code=400, detail="Thiếu ảnh người mẫu hoặc ảnh trang phục")

        # Chạy qua worker pool để không block server
        result = await run_in_worker(
            TryOnAgent.execute_workflow,
            person_image_src=payload.personImage,
            garment_image_src=payload.garmentImage,
            product_meta=payload.product,
            model_gender=payload.modelGender
        )

        return {
            "success": True,
            "message": "AI Virtual Try-On hoàn tất qua Python AI Backend",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi thử đồ Python AI: {str(e)}")
