import sys
import os
from pathlib import Path

# Đảm bảo đường dẫn thư mục gốc luôn nằm trong sys.path khi chạy từ bất kỳ đâu
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import uvicorn
from backend.config.settings import settings

if __name__ == "__main__":
    port = int(os.getenv("AI_PORT", settings.PORT))
    host = os.getenv("AI_HOST", settings.HOST)
    print(f"🌙 MoonLight AI Virtual Try-On Backend đang khởi động tại http://{host}:{port}")
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
