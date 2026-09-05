#!/bin/bash
# ==============================================================================
# MoonLight V2 - Kịch bản tự động tối ưu & thiết lập VPS Ubuntu (Gói P1 1GB RAM)
# ==============================================================================
set -e

echo "=========================================================="
echo "🚀 BẮT ĐẦU CẤU HÌNH VPS CHO MOONLIGHT V2"
echo "=========================================================="

# 1. Kích hoạt 2GB Swap Memory (RAM ảo trên ổ SSD NVMe)
echo "⚙️ [1/5] Đang tạo 2GB Swap RAM để bảo vệ máy khỏi tràn RAM..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo "✅ Đã kích hoạt 2GB Swap thành công!"
else
    echo "ℹ️ Swap file đã có sẵn."
fi

# 2. Cài đặt các công cụ cần thiết & Nginx
echo "⚙️ [2/5] Đang cài đặt công cụ hệ thống & Nginx..."
apt-get update -y
apt-get install -y curl wget gnupg git build-essential nginx

# 3. Cài đặt Node.js 20 LTS & PM2
echo "⚙️ [3/5] Đang cài đặt Node.js 20 LTS & PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# 4. Cài đặt MongoDB Community Server 7.0 & Giới hạn RAM 256MB
echo "⚙️ [4/5] Đang cài đặt MongoDB Database nội bộ..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update -y
apt-get install -y mongodb-org

# Cấu hình giới hạn RAM 256MB cho WiredTiger để máy 1GB RAM chạy êm
cat << 'EOF' > /etc/mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 0.25

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1
EOF

systemctl daemon-reload
systemctl enable mongod
systemctl restart mongod
echo "✅ MongoDB đã chạy nội bộ và giới hạn RAM 256MB an toàn!"

# 5. Cấu hình Nginx Reverse Proxy (Cổng 80 -> 10000)
echo "⚙️ [5/5] Cấu hình Nginx Web Server..."
cat << 'EOF' > /etc/nginx/sites-available/moonlight
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/moonlight /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo "=========================================================="
echo "🎉 THIẾT LẬP MÁY CHỦ HOÀN TẤT!"
echo "Tổng RAM hiện tại (Physical + Swap): $(free -h | grep Mem | awk '{print $2}') RAM + $(free -h | grep Swap | awk '{print $2}') Swap"
echo "=========================================================="
