const axios = require('axios');
const fs = require('fs');

/**
 * API Rotator Service
 * Dùng để xoay vòng danh sách 100 API keys/endpoints để tránh rate limit hoặc cân bằng tải.
 */
class ApiRotator {
    constructor(filePath) {
        this.filePath = filePath;
        this.apis = this.loadApis();
        this.currentIndex = 0;
    }

    loadApis() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            // Giả định mỗi API một dòng hoặc phân tách bằng dấu phẩy
            return data.split(/\r?\n/).filter(line => line.trim() !== '');
        } catch (err) {
            console.error('Lỗi đọc file API:', err.message);
            return [];
        }
    }

    getNextApi() {
        if (this.apis.length === 0) return null;
        const api = this.apis[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.apis.length;
        return api;
    }

    /**
     * Tự động thử lại với API tiếp theo nếu API hiện tại thất bại.
     * @param {Object} payload - Dữ liệu gửi đi
     * @param {number} maxRetries - Số lần thử lại tối đa (mặc định 3 lần)
     */
    async callWithRetry(payload, maxRetries = 3) {
        let attempts = 0;
        while (attempts < maxRetries) {
            const apiUrl = this.getNextApi();
            if (!apiUrl) throw new Error('Không có API nào trong danh sách!');

            console.log(`[Attempt ${attempts + 1}] Đang thử API: ${apiUrl}`);
            try {
                const response = await axios.post(apiUrl, payload, {
                    timeout: 5000,
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log(`[Success] API phản hồi thành công!`);
                return response.data;
            } catch (error) {
                attempts++;
                console.warn(`[Fail] API ${apiUrl} lỗi: ${error.message}. Đang đổi API tiếp theo...`);
                if (attempts >= maxRetries) {
                    throw new Error(`Đã thử ${maxRetries} lần nhưng tất cả API đều oẹo.`);
                }
            }
        }
    }
}

// Cách dùng cải tiến:
/*
const rotator = new ApiRotator('./apis.txt');
rotator.callWithRetry({ msg: 'Hello' }, 5) // Thử tối đa 5 API khác nhau nếu lỗi
    .then(data => console.log('Data:', data))
    .catch(err => console.error('Toạch hết:', err.message));
*/

module.exports = ApiRotator;
