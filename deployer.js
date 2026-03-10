const simpleGit = require('simple-git');
const path = require('path');

const repoPath = path.resolve('./health-site-template');
const git = simpleGit(repoPath);

async function deploy() {
    try {
        console.log("🚀 Đang chuẩn bị deploy...");
        await git.init();
        await git.add('.');
        await git.commit('Update bài viết mới - Auto Deploy');
        
        // Cần cấu hình remote trước khi chạy script này: 
        // git remote add origin <URL_REPO_CỦA_MÀY>
        // git branch -M main
        
        await git.push('origin', 'main');
        console.log("✅ Đã push code lên GitHub. Cloudflare Pages đang build...");
    } catch (e) {
        console.error("❌ Lỗi deploy:", e.message);
    }
}

deploy();
