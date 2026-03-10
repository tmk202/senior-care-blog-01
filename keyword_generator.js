const fs = require('fs');
const axios = require('axios');

const API_KEYS = fs.readFileSync('apis.txt', 'utf8').split(/\r?\n/).filter(k => k.trim());
let currentKeyIndex = 0;

async function callGemini(prompt) {
    // Thử lần lượt các key cho đến khi thành công hoặc hết key
    for (let i = 0; i < API_KEYS.length; i++) {
        const key = API_KEYS[currentKeyIndex];
        // Cập nhật index cho lần sau
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;

    // Sử dụng model 2.0 Flash để đảm bảo ổn định
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
        
        try {
            const response = await axios.post(url, {
                contents: [{ parts: [{ text: prompt }] }]
            }, { timeout: 15000 });
            
            if (response.data && response.data.candidates) {
                return response.data.candidates[0].content.parts[0].text;
            }
        } catch (error) {
            console.warn(`[Fail] Key ${key.substring(0,10)}... lỗi: ${error.message}. Đang thử key tiếp theo...`);
            // Tiếp tục vòng lặp để thử key kế tiếp
        }
    }
    return null;
}

async function start() {
    const prompt = `Bạn là chuyên gia SEO Việt Nam. Hãy liệt kê 20 từ khóa ngách về sức khỏe (ví dụ: tên bệnh, triệu chứng, hoặc thuốc) đang có volume cao tại VN. Chỉ trả về danh sách từ khóa, mỗi từ một dòng, không đánh số.`;
    console.log("Đang gọi Gemini lấy keywords (đang tự động xoay key)...");
    const result = await callGemini(prompt);
    if (result) {
        fs.writeFileSync('health_keywords.txt', result);
        console.log("✅ Đã lưu vào health_keywords.txt");
    } else {
        console.error("❌ Tất cả API keys đều thất bại hoặc hết hạn!");
    }
}

start();
