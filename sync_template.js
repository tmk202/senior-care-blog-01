const fs = require('fs');
const path = require('path');

const templatePath = 'blog-01/index.html';
const template = fs.readFileSync(templatePath, 'utf8');

// Extract head, header, footer from index.html
const head = template.match(/<head>([\s\S]*?)<\/head>/)[0];
const header = template.match(/<header[\s\S]*?<\/header>/)[0];
const footer = template.match(/<footer[\s\S]*?<\/footer>/)[0];

const filesToSync = [
    'blog-01/nutrition.html',
    'blog-01/psychology.html',
    'blog-01/exercise.html',
    'blog-01/about.html',
    'blog-01/blog.html'
];

filesToSync.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract main content from current file
    const mainContent = content.match(/<main[\s\S]*?<\/main>/)[0];
    
    // Reconstruct
    const newFileContent = `<!DOCTYPE html>\n<html lang="vi">${head}\n<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">\n<div class="relative flex min-h-screen flex-col">\n${header}\n${mainContent}\n${footer}\n</div>\n</body>\n</html>`;
    
    fs.writeFileSync(filePath, newFileContent);
    console.log(`✅ Synced: ${filePath}`);
});
