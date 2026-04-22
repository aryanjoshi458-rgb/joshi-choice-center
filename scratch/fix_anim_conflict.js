const fs = require('fs');
const path = 'public/assets/sidebar-pages/settings/settings.js';

let content = fs.readFileSync(path, 'utf8');

// Step 1: Update the global animCards selector to be more specific
content = content.replace(
    'const animCards = document.querySelectorAll(".aura-anim-card, .animation-card");',
    '// SCOPED SELECTOR: Only target cards in the Background Animation section to avoid Sidebar FX conflicts\n    const animCards = document.querySelectorAll("#animation .aura-anim-card, #animation .animation-card");'
);

// Step 2: Add the guard clause to the BG animation click listener
const oldListener = `    animCards.forEach(card => {
        card.addEventListener("click", () => {
            const anim = card.getAttribute("data-anim");
            localStorage.setItem("bgAnimation", anim);
            syncAnimCards();
            if (window.refreshAnimation) window.refreshAnimation();
            showToast(\`\${anim.charAt(0).toUpperCase() + anim.slice(1)} animations updated! ✨\`, "success");
        });
    });`;

const newListener = `    animCards.forEach(card => {
        card.addEventListener("click", () => {
            const anim = card.getAttribute("data-anim");
            // SAFETY GUARD: Only proceed if this card is actually for background animations
            if (!anim) return; 
            
            localStorage.setItem("bgAnimation", anim);
            syncAnimCards();
            if (window.refreshAnimation) window.refreshAnimation();
            showToast(\`\${anim.charAt(0).toUpperCase() + anim.slice(1)} animations updated! ✨\`, "success");
        });
    });`;

content = content.replace(oldListener, newListener);

fs.writeFileSync(path, content, 'utf8');
console.log('Animation conflict fix applied successfully to settings.js');
