const fs = require('fs');
const axios = require('axios');
const path = require('path');

const API_KEYS = fs.readFileSync('apis.txt', 'utf8').split(/\r?\n/).filter(k => k.trim());
let currentKeyIndex = 0;

async function callGemini(prompt) {
    for (let i = 0; i < API_KEYS.length; i++) {
        const key = API_KEYS[currentKeyIndex];
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
        
        try {
            const response = await axios.post(url, {
                contents: [{ parts: [{ text: prompt }] }]
            }, { timeout: 15000 });
            
            if (response.data && response.data.candidates) {
                return response.data.candidates[0].content.parts[0].text;
            }
        } catch (error) {
            console.warn(`[Fail] Key ${key.substring(0,5)}... lỗi. Đang thử key khác...`);
        }
    }
    return null;
}

async function createPost(keyword) {
    const prompt = `Viết một bài chuẩn SEO cho từ khóa: "${keyword}". Bài viết gồm: 
    1. Tiêu đề hấp dẫn (Title)
    2. Meta Description
    3. Nội dung chuyên sâu về y tế, bệnh lý, triệu chứng (ít nhất 800 chữ), giọng văn chuyên gia. 
    Format trả về dưới dạng JSON: {"title": "...", "description": "...", "content": "..."}`;
    
    console.log(`Đang cày content cho: ${keyword}...`);
    const result = await callGemini(prompt);
    
    if (result) {
        try {
            const data = JSON.parse(result.replace(/```json/g, '').replace(/```/g, ''));
            const filename = keyword.toLowerCase().replace(/ /g, '-') + '.md';
            const template = fs.readFileSync('health-site-template/post-template.md', 'utf8')
                .replace('{TITLE}', data.title)
                .replace('{DESCRIPTION}', data.description)
                .replace('{CONTENT}', data.content)
                .replace('{DATE}', new Date().toISOString().split('T')[0])
                .replace('{TAG}', 'Sức khỏe');
            
            fs.writeFileSync(`health-site-template/content/posts/${filename}`, template);
            console.log(`✅ Đã xong: ${filename}`);
        } catch (e) {
            console.error(`Lỗi parse bài viết ${keyword}: ${e.message}`);
        }
    }
}

async function start() {
    const keywords = ["cách trị đau dạ dày", "triệu chứng tiểu đường", "thực phẩm giàu sắt"];
    for (const kw of keywords) {
        await createPost(kw);
    }
}

start();
