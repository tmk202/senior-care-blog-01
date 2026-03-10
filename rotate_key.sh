#!/bin/bash
# Script xoay API Key cho OpenClaw
# Cách dùng: ./rotate_key.sh

API_FILE="apis.txt"
CONFIG_FILE="~/.openclaw/openclaw.json"

# Lấy key hiện tại từ OpenClaw config (giả định đang dùng model gemini)
# Hoặc đơn giản là lấy dòng đầu tiên của file apis.txt, rồi chuyển nó xuống cuối
echo "[Thầy] Đang xoay key..."

# Đọc key đầu tiên
KEY=$(head -n 1 $API_FILE)

# Cập nhật vào OpenClaw (cần tìm đúng đường dẫn config cho Gemini)
# Mày phải check lại đường dẫn config của mày trong openclaw.json
# Dưới đây là ví dụ lệnh set key (thay bằng lệnh chính xác nếu mày biết path)
openclaw config set model.providers.google-gemini-cli.auth.api_key "$KEY"

# Chuyển key cũ xuống cuối file để xoay vòng
sed -i '1d' $API_FILE
echo "$KEY" >> $API_FILE

echo "[Thầy] Đã xoay xong key: ${KEY:0:10}..."
openclaw gateway restart
