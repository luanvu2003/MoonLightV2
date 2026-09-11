from fastapi import APIRouter
from backend.agent.workflow import WorkflowSelector

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("/workflows")
async def get_workflows():
    workflows = WorkflowSelector.list_all()
    return {
        "success": True,
        "message": "Lấy danh sách AI Workflows thành công",
        "data": [w.dict() for w in workflows]
    }
