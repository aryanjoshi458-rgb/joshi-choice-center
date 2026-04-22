/****************************************
 * AURA SMART AI ASSISTANT CORE ENGINE
 * Featuring: Voice-Text Sync, Knowledge Brain, & Aura UI
 ****************************************/

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const voiceBtn = document.getElementById("assistantSpeaker");
    const chatPanel = document.getElementById("auraChatPanel");
    const chatHistory = document.getElementById("auraChatHistory");
    const chatInput = document.getElementById("auraChatInput");
    const chatSend = document.getElementById("auraChatSend");

    // ===== THE BRAIN (KNOWLEDGE BASE) =====
    const AuraBrain = {
        keywords: {
            "hello": "Hello! I am Aura, your smart companion for Joshi Choice Center. How can I help you today?",
            "hi": "Hi there! I'm here to help you navigate Joshi Choice Center. What's on your mind?",
            "bye": "Goodbye! I'll be here if you need more help with your transactions. Have a great day!",
            "thanks": "You're very welcome! It's my pleasure to assist you with Joshi Choice Center.",
            "thank you": "You're welcome! I'm always happy to help you manage your shop more efficiently.",
            "ok": "Perfect! Let me know if you have any other questions about the software.",
            "who are you": "I am Aura, the built-in Intelligent Assistant for Joshi Choice Center. I can help you with settings, transactions, and navigating the app.",
            "your name": "My name is Aura. I'm designed to be your smart companion while you work.",
            
            "reset": "To reset the software, go to Settings -> Reset. You will need to enter a random 4-digit verification code to confirm the 'System Purge'. Warning: This will delete everything!",
            "wipe": "The System Purge module in the Reset tab allows you to clear all data. It features a terminal-style animation for security monitoring.",
            "delete": "Deleting data is a permanent action. Use the Reset tab in Settings for a full purge, or manually delete transactions in the History section.",
            "code": "For sensitive actions like a full reset, I'll provide a random 4-digit security code that you must type to confirm.",

            "shortcut": "Fast navigation! Alt+D (Dash), Alt+S (Settings), Alt+N (New), Alt+C (Direct), Alt+R (Reports), Alt+T (Theme), Alt+I (Notifications). You can change these in Settings -> Keys.",
            "hotkey": "You can customize all your hotkeys! Go to Settings -> Keys to map any action to your favorite global shortcut.",
            "alt": "Most shortcuts use the Alt key. For example, Alt+T toggles the theme, and Alt+S opens Settings instantly.",
            
            "software": "Joshi Choice Center is a total solution for shop transactions, digital services, and financial tracking. It's built with premium Aura design.",
            "dashboard": "The Dashboard shows your today's stats, including total transactions, business volume, and your commissions. Check the graphs for weekly trends!",
            "new customer": "On the New Customer page, you can enter details for services. It automatically calculates charges and cash-to-customer amounts for you.",
            "calculate": "The system features an 'Auto-Math' engine. For example, for Cash Withdrawals, it automatically subtracts the charge from the total to show exactly how much to hand to the customer.",
            "cash": "Handling cash transactions is easy! The software calculates the 'Cash to Customer' amount instantly so you never make a mistake at the counter.",
            
            "print": "You can print professional high-fidelity thermal receipts. Customize your shop logo and branding labels in the 'Print' tab of settings.",
            "receipt": "Receipts are generated instantly. You can search old receipts in the 'Print Receipt' section and even send them via WhatsApp.",
            
            "settings": "Settings is where the magic happens! You can change languages, business profile, sidebar animations, and global UI scaling.",
            "zoom": "You can now scale the entire software UI! Go to Settings -> Display and use the Viewport Zoom slider to find your perfect fit.",
            "theme": "I have multiple skins! Try 'Midnight Slate', 'Royal Amethyst', 'Emerald Haven', or 'Cyberpunk Neon' in the Themes tab.",
            "dark": "Dark mode is great for eyes! Use Alt+T or the toggle at the top to switch to a sleek dark look.",
            "light": "Light mode is crisp and clean for bright environments. You can switch back anytime!",
            "sakura": "Sakura is a premium pink theme available in the Themes section of Settings.",

            "update": "To check for updates, go to Settings -> About. We support GitHub-based professional updates with real-time download tracking.",
            "version": "Current version info is available in Settings -> About. You are running Joshi Choice Center Version 2.0.0.",
            
            "privacy shield": "The Privacy Shield is a premium security feature in Settings -> Security. It automatically blurs the screen when the window loses focus and masks sensitive data to keep your records safe.",
            "security": "Your privacy is our priority. With features like the Privacy Shield and Local Storage, your data never leaves your machine.",
            "mouse": "Custom cursors are here! Choose from MacBook Pro, Neon Gaming, Phantom Stealth, or Minimal Luxe in Settings -> Themes.",
            "cursor": "Personalize your experience! Change your mouse cursor style in the Themes tab of Settings.",
            "title bar": "We use a native title bar for a professional look. You can toggle the Menu Bar (File, Edit) in the main configuration.",
            "pending delete": "In Pending Payments, we use a modern GSAP-animated confirmation popup to ensure you never delete important records by mistake.",
            "delete": "Deleting data is a permanent action. We've added modern confirmation popups in key areas like Pending Payments to keep your data safe.",
            "author": "Joshi Choice Center is developed by Aryan Joshi, designed for maximum efficiency and premium aesthetics.",
            
            "profile": "In the Shop Profile tab, you can update your Shop Name, Owner Name, and Address. It automatically capitalizes each word for a professional look!",
            "logo": "Add your own branding! Upload your shop logo in Settings -> Shop Profile to see it on all thermal receipts.",
            "phone": "The Shop profile supports smart phone formatting with automatic +91 prefixing.",

            "sidebar": "Sidebar FX lets you choose premium entrance animations for your menu. Try 'Elastic Swing' or '3D Perspective' for a wow factor!",
            "bg": "Background effects like 'Animated Mesh', 'Aurora Glow', and 'Glass Ripples' can be enabled in Settings -> Sidebar FX.",
            "report": "Stay on top of your business! The Reports tab provides detailed weekly analytics, commission tracking, and total business logs.",
            "expense": "Keep track of shop costs in the Expenses tab. Every rupee spent can be logged and categorized to see your actual net profit.",
            "rate": "The Service Rates page lets you pre-set charges for every service, so you don't have to enter them manually each time.",
            "security": "Your privacy is our priority. All data is stored locally on your machine for maximum speed and security. No cloud account is required for main operations.",
            "privacy": "We take privacy seriously. Your transaction data and customer profiles never leave your local machine.",
            "about": "Joshi Choice Center is designed by Joshi for maximum efficiency. It's optimized for high-speed counter operations with a premium 'Aura Gloss' UI."
        },
        fallback: "That's an interesting question! While I'm still expanding my knowledge, you can usually find what you need in the Sidebar menus or the Settings page. Would you like me to explain a specific feature like 'Reports' or 'Printing'?"
    };

    // ===== VOICE PORTAL =====
    function speak(text, onComplete) {
        if (!window.speechSynthesis) return;
        
        // Stop current speaking
        window.speechSynthesis.cancel();

        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = "en-IN"; // Indian English
        msg.rate = 1.05; // Slightly faster for responsiveness
        
        if (onComplete) msg.onend = onComplete;
        
        window.speechSynthesis.speak(msg);
    }

    // ===== UI TYPEWRITER EFFECT =====
    async function typeText(container, text) {
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble assistant";
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;

        let i = 0;
        return new Promise(resolve => {
            function type() {
                if (i < text.length) {
                    bubble.innerHTML += text.charAt(i);
                    i++;
                    container.scrollTop = container.scrollHeight;
                    setTimeout(type, 15); // Fast typing speed
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    // ===== MESSAGE HANDLER =====
    async function addMessage(text, isUser = false) {
        if (isUser) {
            const bubble = document.createElement("div");
            bubble.className = "chat-bubble user";
            bubble.textContent = text;
            chatHistory.appendChild(bubble);
            
            // Thinking state
            const thinking = document.createElement("div");
            thinking.className = "chat-bubble assistant thinking-indicator";
            thinking.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;
            chatHistory.appendChild(thinking);
            chatHistory.scrollTop = chatHistory.scrollHeight;

            setTimeout(async () => {
                thinking.remove();
                
                // Find Answer
                let query = text.toLowerCase();
                let answer = AuraBrain.fallback;
                
                for (let key in AuraBrain.keywords) {
                    if (query.includes(key)) {
                        answer = AuraBrain.keywords[key];
                        break;
                    }
                }

                // Voice + Type Sync
                speak(answer);
                await typeText(chatHistory, answer);
            }, 600);
        } else {
            // Initial/System Message
            speak(text);
            await typeText(chatHistory, text);
        }
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // ===== CONTROLLER =====
    const closeBtn = document.getElementById("closeAuraChat");

    function togglePanel(forceClose = false) {
        if (forceClose) {
            chatPanel.classList.remove("active");
            voiceBtn.classList.remove("active");
            window.speechSynthesis.cancel();
            return;
        }

        chatPanel.classList.toggle("active");
        voiceBtn.classList.toggle("active");
        
        if (chatPanel.classList.contains("active")) {
            if (chatHistory.children.length === 0) {
                addMessage("Hello! I am Aura. I know everything about this software. What would you like to know?");
            }
            chatInput.focus();
        } else {
            window.speechSynthesis.cancel();
        }
    }

    if (voiceBtn) voiceBtn.addEventListener("click", () => togglePanel());
    if (closeBtn) closeBtn.addEventListener("click", () => togglePanel(true));

    chatSend?.addEventListener("click", () => {
        const val = chatInput.value.trim();
        if (val) {
            addMessage(val, true);
            chatInput.value = "";
        }
    });

    chatInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") chatSend.click();
    });

    // Theme Toggle Hook (Restored for original slider)
    const slider = document.querySelector(".slider");
    slider?.addEventListener("click", () => {
        setTimeout(() => {
            const isDark = document.body.classList.contains("dark-mode");
            if (isDark) {
                if (chatPanel.classList.contains("active")) addMessage("Activating Dark Mode for your comfort.");
                else speak("Dark mode enabled");
            } else {
                if (chatPanel.classList.contains("active")) addMessage("Switching back to Light Mode.");
                else speak("Light mode enabled");
            }
        }, 100); // Wait for theme-toggle.js to apply classes
    });
});
