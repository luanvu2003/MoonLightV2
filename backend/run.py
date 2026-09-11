import os
import uvicorn
from backend.config.settings import settings

if __name__ == "__main__":
    port = int(os.getenv("AI_PORT", settings.PORT))
    host = os.getenv("AI_HOST", settings.HOST)
    print(f"🌙 MoonLight AI Virtual Try-On Backend đang khởi động tại http://{host}:{port}")
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
