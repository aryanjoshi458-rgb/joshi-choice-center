const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix Sidebar Toggle by ID selector
    content = content.replace(/(id="sidebarToggle">)[\s\S]*?(<\/button>)/, '$1☰$2');
    
    // Fix Scroll Arrow by ID selector
    content = content.replace(/(id="scrollArrow">)[\s\S]*?(<\/div>)/, '$1▲$2');

    // Fix Hindi Text in settings.html
    if (file === 'settings.html') {
        content = content.replace(/(data-i18n="hindi">Hindi \()[\s\S]*?(\)<\/span>)/, '$1हिंदी$2');
        
        // Fix Shortcuts Header
        content = content.replace(/(<h3 style="color: #2563eb; display: flex; align-items: center; gap: 8px;">)[\s\S]*?(Custom Keyboard Shortcuts)/, '$1\n                ⌨️ $2');
    }

    // Generic fixes for common corrupted emojis found in dashboard
    content = content.replace(/ðŸ”\^/g, '📈');
    content = content.replace(/ðŸ’%%/g, '📉');
    content = content.replace(/ðŸ’°/g, '💰');
    content = content.replace(/â‚¹/g, '₹');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully repaired: ${file}`);
    } else {
        console.log(`No repair needed for: ${file}`);
    }
});
