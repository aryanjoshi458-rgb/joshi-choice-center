const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

const replacements = [
    { from: /id="sidebarToggle">[^<]+<\/button>/g, to: 'id="sidebarToggle">☰</button>' },
    { from: /id="scrollArrow">[^<]+<\/div>/g, to: 'id="scrollArrow">▲</div>' },
    { from: /<span data-i18n="hindi">Hindi \([^)]+\)<\/span>/g, to: '<span data-i18n="hindi">Hindi (हिंदी)</span>' },
    { from: /âŒ¨ï¸ \s*Custom Keyboard Shortcuts/g, to: '⌨️ Custom Keyboard Shortcuts' },
    { from: /ðŸ”\^/g, to: '📈' },
    { from: /ðŸ’%%/g, to: '📉' },
    { from: /ðŸ’°/g, to: '💰' },
    { from: /â‚¹/g, to: '₹' }
];

files.forEach(file => {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    replacements.forEach(rep => {
        content = content.replace(rep.from, rep.to);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${file}`);
    } else {
        console.log(`No changes needed: ${file}`);
    }
});
