import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging

from backend.config.settings import settings
from backend.api.tryon import router as tryon_router
from backend.api.products import router as products_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("MoonLightBackend")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Python AI Virtual Try-On Backend Service (MoonLight Luxury)"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(tryon_router)
app.include_router(products_router)

# Mount static files for uploads & results
if settings.STORAGE_DIR.exists():
    app.mount("/storage", StaticFiles(directory=str(settings.STORAGE_DIR)), name="storage")

if settings.PUBLIC_UPLOADS_DIR.exists():
    app.mount("/uploads/tryon", StaticFiles(directory=str(settings.PUBLIC_UPLOADS_DIR)), name="public_tryon")

@app.get("/")
@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "hf_space": settings.HF_SPACE_ID,
        "quality_pass_threshold": settings.QUALITY_PASS_THRESHOLD
    }

@app.get("/diagnostic")
async def diagnostic():
    info = {
        "python_version": sys.version,
        "gradio_client": None,
        "hf_connection": None,
        "hf_error": None
    }
    try:
        import gradio_client
        info["gradio_client"] = getattr(gradio_client, "__version__", "installed")
        try:
            from gradio_client import Client
            c = Client(settings.HF_SPACE_ID)
            info["hf_connection"] = "CONNECTED"
        except Exception as e:
            info["hf_connection"] = "FAILED"
            info["hf_error"] = str(e)
    except Exception as e:
        info["gradio_client"] = f"NOT_INSTALLED: {e}"
    return info

if __name__ == "__main__":
    logger.info(f"🌙 Khởi động {settings.PROJECT_NAME} tại http://{settings.HOST}:{settings.PORT}")
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
