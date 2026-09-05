#!/bin/bash
# ==============================================================================
# Script tự động cập nhật MoonLight V2 trên VPS (Zero-Downtime Reload)
# ==============================================================================
set -e

echo "🚀 Bắt đầu cập nhật mã nguồn MoonLight V2 trên VPS..."
cd /var/www/moonlight

# 1. Kéo mã nguồn mới nhất từ GitHub
git pull origin main || echo "⚠️ Không kéo được git, bỏ qua nếu bạn chép file thủ công."

# 2. Cài đặt các package mới (nếu có)
npm install --omit=dev

# 3. Biên dịch lại TypeScript
npm run build

# 4. Tải lại ứng dụng mượt mà không làm gián đoạn người dùng
pm2 reload moonlight

echo "🎉 CHÚC MỪNG: Hệ thống đã cập nhật xong phiên bản mới nhất!"
pm2 status
