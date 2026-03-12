const fs = require('fs');
const axios = require('axios');
const path = require('path');
const simpleGit = require('simple-git');

const SECRETS_FILE = '/home/welcome/.openclaw/secret/gemini_keys.txt';
const API_KEYS = fs.readFileSync(SECRETS_FILE, 'utf8').split(/\r?\n/).filter(k => k.trim());
let currentKeyIndex = 0;

const BLOGS = [
    { dir: 'blog-01', topic: 'dinh dưỡng cho người cao tuổi' },
    { dir: 'blog-02', topic: 'giấc ngủ ngon cho người cao tuổi' },
    { dir: 'blog-03', topic: 'bài tập nhẹ nhàng cho người cao tuổi' }
];

async function callGemini(prompt) {
    for (let i = 0; i < API_KEYS.length; i++) {
        const key = API_KEYS[currentKeyIndex];
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
        try {
            const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] }, { timeout: 30000 });
            if (response.data && response.data.candidates) return response.data.candidates[0].content.parts[0].text;
        } catch (error) { 
            console.warn(`[Fail] Key ${key.substring(0,5)}... lỗi: ${error.message}`);
            if (error.response && error.response.data) {
                console.warn(`Chi tiết: ${JSON.stringify(error.response.data)}`);
            }
        }
    }
    return null;
}

async function run() {
    for (const blog of BLOGS) {
        console.log(`🚀 Đang viết bài cho: ${blog.dir} - Chủ đề: ${blog.topic}`);
        const prompt = `Viết một bài viết cực kỳ chi tiết, dễ đọc, font to rõ, dành cho người cao tuổi với chủ đề "${blog.topic}".
        Bài viết cần: Tiêu đề, Nội dung (ít nhất 500 chữ), giọng văn ấm áp, hướng dẫn cụ thể.
        Format trả về JSON: {"title": "...", "content": "..."}`;
        
        const res = await callGemini(prompt);
        if (res) {
            try {
                const data = JSON.parse(res.replace(/```json/g, '').replace(/```/g, ''));
                const filename = `index.html`; // Simplest for now
                const html = `<html><body style="font-size: 24px; padding: 40px; background: #fff; color: #333; line-height: 1.6;">
                    <h1>${data.title}</h1>
                    <p>${data.content.replace(/\n/g, '<br>')}</p>
                </body></html>`;
                
                fs.writeFileSync(path.join(blog.dir, filename), html);
                
                // Deploy
                const git = simpleGit(blog.dir);
                await git.add('.');
                await git.commit('Update bài viết mới - Auto');
                await git.push('origin', 'main');
                console.log(`✅ ${blog.dir} đã cập nhật.`);
            } catch (e) { console.error(`Lỗi ${blog.dir}:`, e.message); }
        }
    }
}

run();
