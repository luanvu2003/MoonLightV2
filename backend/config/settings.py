import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_ROOT = BASE_DIR.parent

class Settings:
    PROJECT_NAME: str = "MoonLight AI Virtual Try-On Backend"
    VERSION: str = "2.0.0"
    HOST: str = os.getenv("AI_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("AI_PORT", "8001"))
    BASE_DIR: Path = BASE_DIR
    WORKSPACE_ROOT: Path = WORKSPACE_ROOT
    
    # Storage paths
    STORAGE_DIR: Path = BASE_DIR / "storage"
    STORAGE_PRODUCTS_DIR: Path = STORAGE_DIR / "products"
    STORAGE_UPLOADS_DIR: Path = STORAGE_DIR / "uploads"
    STORAGE_RESULTS_DIR: Path = STORAGE_DIR / "results"
    
    # Direct public upload sync for MoonLight Web Server
    PUBLIC_UPLOADS_DIR: Path = WORKSPACE_ROOT / "public" / "uploads" / "tryon"
    
    # HF / VTON Model Settings
    HF_SPACE_ID: str = os.getenv("HF_SPACE_ID", "yisol/IDM-VTON")
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    VTON_TIMEOUT: int = int(os.getenv("VTON_TIMEOUT", "120"))
    
    # Quality threshold
    QUALITY_PASS_THRESHOLD: float = 90.0

    def init_directories(self):
        self.STORAGE_PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)
        self.STORAGE_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        self.STORAGE_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        self.PUBLIC_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

settings = Settings()
settings.init_directories()
