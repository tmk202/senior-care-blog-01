#!/bin/bash
# Script xoay key tự động từ apis.txt
FILE="apis.txt"

# 1. Kiểm tra file có tồn tại không
if [ ! -f "$FILE" ]; then
    echo "Thầy chịu! Không thấy file apis.txt đâu cả. Tạo file đi con!"
    exit 1
fi

# 2. Đọc key đầu tiên
KEY=$(head -n 1 "$FILE" | tr -d '\r')

# 3. Bơm vào OpenClaw (sử dụng pipe + --provider google)
echo "$KEY" | openclaw models auth paste-token --provider google

# 4. Cài đặt model mặc định là gemini-3.1-flash-lite-preview (lite cho đỡ tốn quota)
openclaw models set google/gemini-3.1-flash-lite-preview

# 5. Kiểm tra xem lệnh có thành công không
if [ $? -eq 0 ]; then
    echo "[Thầy] Đã nạp key: ${KEY:0:10}..."
    # 5. Đẩy key cũ xuống cuối file để xoay vòng
    sed -i '1d' "$FILE"
    echo "$KEY" >> "$FILE"
    # 6. Restart gateway
    # openclaw gateway restart
else
    echo "[Thầy] Lỗi nạp key! Thử đổi --provider google thành cái khác xem sao!"
fi
