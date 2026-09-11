#!/bin/bash
# Script tự động cài đặt và chạy MoonLight V2 + Python AI Backend 24/24 trên VPS

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "========================================================"
echo "🌙 MoonLight V2 - Triển Khai 24/24 Trên Máy Chủ VPS"
echo "========================================================"

# 1. Cập nhật mã nguồn mới nhất từ GitHub
echo "-> 1. Kéo mã nguồn mới nhất từ GitHub..."
git pull origin main

# 2. Cài đặt thư viện Python AI
echo "-> 2. Đang cài đặt thư viện Python AI Backend..."
pip3 install --upgrade pip
pip3 install -r backend/requirements.txt

# 3. Build mã nguồn Node.js / TypeScript
echo "-> 3. Biên dịch hệ thống Node.js..."
npm install --production=false
npm run build

# 4. Khởi động / Khởi động lại toàn bộ hệ thống bằng PM2
echo "-> 4. Khởi động Node.js & Python AI 24/24 qua PM2..."
if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.cjs
    pm2 save
    echo "✅ Cả hai tiến trình 'moonlight' và 'moonlight-ai' đã sẵn sàng chạy 24/24!"
    pm2 status
else
    echo "⚠️ Chưa tìm thấy PM2. Đang cài đặt PM2 toàn cục..."
    npm install -g pm2
    pm2 start ecosystem.config.cjs
    pm2 save
    pm2 startup
    pm2 status
fi

echo "========================================================"
echo "🎉 Hoàn tất! Hệ thống đã chạy 24/24 trên VPS."
echo "========================================================"
