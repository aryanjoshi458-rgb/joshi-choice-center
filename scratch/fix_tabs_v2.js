const fs = require('fs');
const path = 'public/assets/sidebar-pages/settings/settings.js';

let content = fs.readFileSync(path, 'utf8');

// Fix 1: Ensure Tab Click Persistence is actually there (it was in line 65)
if (!content.includes('sessionStorage.setItem("activeSettingsTab", targetId)')) {
    content = content.replace(
        /\/\/\s*Tab persistence removed by user request[^\n]*/,
        '// Save active tab to sessionStorage for refresh persistence\n            sessionStorage.setItem("activeSettingsTab", targetId);'
    );
}

// Fix 2: Use regex to find the INIT ALL block and replace it
// We target the block that sets lastTab = "shop"
const initRegex = /\/\/\s*INIT ALL\s*\n\s*setTimeout\(\(\)\s*=>\s*\{[\s\S]*?lastTab\s*=\s*"shop"[\s\S]*?\}, 100\);/;

const newInit = `// 11. INITIAL TAB RESTORATION
    setTimeout(() => {
        const savedTab = sessionStorage.getItem("activeSettingsTab") || "shop";
        const lastBtn = document.querySelector(\`.aura-nav-btn[data-tab="\${savedTab}"], .tab-btn[data-tab="\${savedTab}"]\`);
        if (lastBtn) {
            lastBtn.click();
            // Force indicator sync after GSAP potential conflicts
            setTimeout(() => {
                if (window.moveIndicator) window.moveIndicator(lastBtn);
            }, 300);
        }
    }, 150);`;

if (initRegex.test(content)) {
    content = content.replace(initRegex, newInit);
    console.log('Found and replaced INIT ALL block.');
} else {
    console.log('Could not find INIT ALL block with regex.');
    // Check if it was already replaced but failed to work
    if (content.includes('sessionStorage.getItem("activeSettingsTab")')) {
         console.log('Persistence logic seems present but check timing/logic.');
    }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Settings.js update attempted.');
