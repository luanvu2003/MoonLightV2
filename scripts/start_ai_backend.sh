#!/bin/bash
# Khởi động Python AI Virtual Try-On Backend Service (Port 8001)

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "🌙 Đang khởi động Python AI Backend Service tại port 8001..."
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload
