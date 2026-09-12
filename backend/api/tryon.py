from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from backend.agent.agent import TryOnAgent
from backend.workers.tryon_worker import run_in_worker

router = APIRouter(prefix="/api/tryon", tags=["TryOn"])

class TryOnRequest(BaseModel):
    personImage: Optional[str] = None
    garmentImage: Optional[str] = None
    person_image: Optional[str] = None
    garment_image: Optional[str] = None
    productId: Optional[str] = None
    product_id: Optional[str] = None
    modelGender: Optional[str] = None
    model_gender: Optional[str] = None
    isCustomUpload: Optional[bool] = False
    product: Optional[Dict[str, Any]] = None
    product_meta: Optional[Dict[str, Any]] = None
    pose: Optional[Dict[str, Any]] = None
    pose_hint: Optional[Dict[str, Any]] = None

@router.post("")
@router.post("/")
async def execute_tryon(payload: TryOnRequest):
    """
    Endpoint chính xử lý AI Virtual Try-On
    """
    try:
        p_img = payload.personImage or payload.person_image
        g_img = payload.garmentImage or payload.garment_image
        p_meta = payload.product or payload.product_meta
        gender = payload.modelGender or payload.model_gender
        pose_hint = payload.pose or payload.pose_hint

        if not p_img or not g_img:
            raise HTTPException(status_code=400, detail="Thiếu ảnh người mẫu hoặc ảnh trang phục")

        # Chạy qua worker pool để không block server
        result = await run_in_worker(
            TryOnAgent.execute_workflow,
            person_image_src=p_img,
            garment_image_src=g_img,
            product_meta=p_meta,
            model_gender=gender,
            pose_hint=pose_hint
        )

        return {
            "success": True,
            "message": "AI Virtual Try-On hoàn tất qua Python AI Backend",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi thử đồ Python AI: {str(e)}")
