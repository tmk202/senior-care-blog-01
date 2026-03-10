const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');

// Cấu hình bot Telegram để gửi thông báo
const TELEGRAM_BOT_TOKEN = '8764348964:AAHqHhfMslbEZcP0Nsmy5E4vyxstWlR8KfQ';
const TELEGRAM_CHAT_ID = '2054150693'; // ID của Mộc Nguyễn

/**
 * Service kiểm tra hạn mức API (Token)
 */
class TokenMonitor {
    constructor() {}

    async sendAlert(message) {
        console.log(`[Alert] Sending to Telegram: ${message}`);
        try {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_CHAT_ID,
                text: `⚠️ CẢNH BÁO TOKEN:\n${message}`,
                parse_mode: 'Markdown'
            });
        } catch (err) {
            console.error('Lỗi gửi Telegram alert:', err.message);
        }
    }

    async triggerRotate() {
        console.log("[Thầy] Tự động xoay Key ngay lập tức...");
        try {
            execSync('./rotate.sh');
            await this.sendAlert("✅ *Đã tự động xoay key thành công! Tiếp tục chiến đấu thôi.*");
        } catch (err) {
            console.error('Lỗi tự động xoay key:', err.message);
            await this.sendAlert("❌ *LỖI KHI TỰ ĐỘNG XOAY KEY!*");
        }
    }

    async checkGeminiStatus(apiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: "hi" }] }] };

        try {
            const response = await axios.post(url, payload, { timeout: 10000 });
            if (response.status === 200) {
                console.log(`[Success] Key ${apiKey.substring(0, 5)}... vẫn đang chạy tốt.`);
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 429) {
                    await this.sendAlert(`🚨 *GEMINI HẾT QUOTA (429)!*`);
                    await this.triggerRotate();
                } else if (error.response.status === 400 || error.response.status === 401) {
                    await this.sendAlert(`❌ *KEY GEMINI CHẾT (INVALID)!*`);
                    await this.triggerRotate();
                }
            } else {
                console.error(`Lỗi kết nối Gemini: ${error.message}`);
            }
        }
    }

    async runAllChecks() {
        console.log(`[Monitor] Bắt đầu quét danh sách API Gemini...`);
        const apis = fs.readFileSync('./apis.txt', 'utf8').split(/\r?\n/).filter(line => line.trim() !== '' && !line.startsWith('#'));
        
        for (let key of apis) {
            await this.checkGeminiStatus(key);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// Chạy canh gác 24/7
const monitor = new TokenMonitor();

async function monitorLoop() {
    console.log("[Thầy] Đã bật chế độ WATCHER 24/7. Đang canh gác API...");
    while (true) {
        await monitor.runAllChecks();
        console.log("[Thầy] Đợi 60 giây rồi quét tiếp...");
        await new Promise(resolve => setTimeout(resolve, 60000));
    }
}

monitorLoop();
