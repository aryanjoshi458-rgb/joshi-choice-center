const fs = require('fs');
const path = 'public/assets/sidebar-pages/settings/settings.js';

let content = fs.readFileSync(path, 'utf8');

// Fix 1: Ensure scoped selector
if (!content.includes('querySelectorAll("#animation .aura-anim-card')) {
    content = content.replace(
        /const animCards = document.querySelectorAll\(".aura-anim-card, .animation-card"\);/,
        '// SCOPED SELECTOR: Only target cards in the Background Animation section to avoid Sidebar FX conflicts\n    const animCards = document.querySelectorAll("#animation .aura-anim-card, #animation .animation-card");'
    );
}

// Fix 2: Add Guard Clause to the specific click listener
const oldBlock = `    animCards.forEach(card => {
        card.addEventListener("click", () => {
            const anim = card.getAttribute("data-anim");
            localStorage.setItem("bgAnimation", anim);
            syncAnimCards();
            if (window.refreshAnimation) window.refreshAnimation();
            showToast(\`\${anim.charAt(0).toUpperCase() + anim.slice(1)} animations updated! ✨\`, "success");
        });
    });`;

const newBlock = `    animCards.forEach(card => {
        card.addEventListener("click", () => {
            const anim = card.getAttribute("data-anim");
            // SAFETY GUARD: Only proceed if this card is intended for background animations
            if (!anim) return; 

            localStorage.setItem("bgAnimation", anim);
            syncAnimCards();
            if (window.refreshAnimation) window.refreshAnimation();
            showToast(\`\${anim.charAt(0).toUpperCase() + anim.slice(1)} animations updated! ✨\`, "success");
        });
    });`;

if (content.indexOf(oldBlock) !== -1) {
    content = content.replace(oldBlock, newBlock);
    console.log('Successfully added guard clause.');
} else {
    // Try a more flexible replacement if original block changed slightly
    console.log('Standard block not found, trying surgical regex replacement...');
    content = content.replace(
        /const anim = card\.getAttribute\("data-anim"\);\s*localStorage\.setItem\("bgAnimation", anim\);/,
        'const anim = card.getAttribute("data-anim");\n            if (!anim) return;\n            localStorage.setItem("bgAnimation", anim);'
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Settings.js isolation fix applied.');
