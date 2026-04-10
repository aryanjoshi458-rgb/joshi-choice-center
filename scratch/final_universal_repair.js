const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const targetDirs = [
    path.join(rootDir, '..', 'views'),
    path.join(rootDir, '..', 'public', 'assets'),
    path.join(rootDir, '..', 'public', 'js')
];

const patterns = [
    // Logos & Headers
    { from: /ðŸ”‹/g, to: 'JC' },
    { from: /ðŸ“‹/g, to: 'JC' },
    
    // Charts & Stats
    { from: /ðŸ”\^/g, to: '📈' },
    { from: /ðŸ”%%/g, to: '📉' },
    { from: /ðŸ”‰/g, to: '📉' },
    { from: /ðŸ”ˆ/g, to: '📈' },
    { from: /ðŸ“ˆ/g, to: '📈' },
    { from: /ðŸ“‰/g, to: '📉' },
    
    // Business & Tools
    { from: /ðŸ’¼/g, to: '💼' },
    { from: /ðŸ“ ./g, to: '📊' },
    { from: /ðŸ” /g, to: '🔍' },
    { from: /ðŸ“‚/g, to: '📁' },
    { from: /ðŸ–¨/g, to: '🖨️' },
    { from: /âœ•/g, to: '✕' },
    { from: /âŒ¨ï¸/g, to: '⌨️' },
    
    // UI Helpers
    { from: /â˜°/g, to: '☰' },
    { from: /â–²/g, to: '▲' },
    
    // Hindi & Special
    { from: /à¤¹à¤¿à¤‚à¤¦à¥€/g, to: 'हिंदी' },
    { from: /Â₹/g, to: '₹' },
    { from: /Â/g, to: '' }
];

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') walk(fullPath);
        } else if (file.endsWith('.html') || file.endsWith('.js')) {
            repairFile(fullPath);
        }
    });
}

function repairFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    patterns.forEach(p => {
        content = content.replace(p.from, p.to);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[FIXED] ${path.relative(rootDir, filePath)}`);
    }
}

console.log("Starting universal UI restoration...");
targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) walk(dir);
});
console.log("UI Restoration Complete!");
