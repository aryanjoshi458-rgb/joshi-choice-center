/**
 * Global Shortcuts Manager
 * Handles keyboard navigation based on user-defined mappings.
 */

(function () {
    // --- GLOBAL ADVANCED SYSTEMS (Moved to Shortcuts for Global Availability) ---
    const initAdvanced = () => {
        // Privacy
        if (localStorage.getItem("jc_privacy_mode") === "true") {
            document.body.classList.add("privacy-mode-active");
        }
        // Performance
        if (localStorage.getItem("jc_performance_mode") === "true") {
            document.body.classList.add("performance-mode");
        }
        // Persistence: Check if screen was locked before refresh
        if (localStorage.getItem("jc_isLocked") === "true") {
            setTimeout(() => {
                if (window.AuraQuickLock) window.AuraQuickLock.lock();
            }, 100);
        }
    };

    window.AuraQuickLock = {
        lock() {
            if (document.getElementById("quickLockOverlay")) return;

            const overlay = document.createElement("div");
            overlay.id = "quickLockOverlay";
            overlay.className = "quick-lock-overlay active";
            overlay.innerHTML = `
                <div class="floating-lock-content" id="lockContent">
                    <svg class="svg-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path class="shield-path" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        <path class="shackle" d="M9 12V9a3 3 0 0 1 6 0v3"></path>
                        <rect class="lock-body" x="7" i="12" width="10" height="7" rx="1" ry="1" fill="currentColor" fill-opacity="0.1"></rect>
                    </svg>
                    <h2 class="admin-title">Administrator</h2>
                    <p class="admin-subtitle">Enter administrator passcode to resume operation.</p>
                    <div class="minimal-input-box" id="lockInputBox">
                        <input type="password" id="lockPassword" placeholder="••••••••" autofocus>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            localStorage.setItem("jc_isLocked", "true");

            const input = document.getElementById("lockPassword");
            const content = document.getElementById("lockContent");
            const box = document.getElementById("lockInputBox");

            const attemptUnlock = () => {
                const pass = input.value;
                const storedPass = localStorage.getItem("jc_password") || "123";
                if (pass === storedPass) {
                    overlay.remove();
                    localStorage.removeItem("jc_isLocked");
                    if (window.showToast) window.showToast("Welcome back! 🔓", "success");
                } else {
                    input.value = "";
                    content.classList.add("quake");
                    box.classList.add("error");

                    setTimeout(() => {
                        content.classList.remove("quake");
                        box.classList.remove("error");
                        input.focus();
                    }, 500);
                }
            };

            input.addEventListener("keypress", (e) => { if (e.key === "Enter") attemptUnlock(); });
            setTimeout(() => input.focus(), 100);
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAdvanced);
    } else {
        initAdvanced();
    }

    const defaultShortcuts = {
        "dashboard": "Alt + d",
        "new-customer": "Alt + n",
        "customer-directory": "Alt + c",
        "reports": "Alt + r",
        "expenses": "Alt + e",
        "settings": "Alt + s",
        "print-receipt": "Alt + p",
        "pending-payments": "Alt + b",
        "notifications": "Alt + i",
        "customer-profile": "Alt + u",
        "theme-toggle": "Alt + t",
        "quick-lock": "Alt + l",
        "privacy-toggle": "Alt + q"
    };

    const actionToPage = {
        "dashboard": "dashboard.html",
        "new-customer": "new-customer.html",
        "customer-directory": "customer-directory.html",
        "reports": "reports.html",
        "expenses": "expenses.html",
        "settings": "settings.html",
        "print-receipt": "print-receipt.html",
        "pending-payments": "pending-payments.html",
        "notifications": "notifications.html",
        "customer-profile": "customer-profile.html"
    };

    function getShortcuts() {
        const saved = localStorage.getItem("customShortcuts");
        return saved ? JSON.parse(saved) : defaultShortcuts;
    }

    function handleShortcut(e) {
        // --- CORE IDENTIFICATION ---
        const activeEl = document.activeElement;
        const isInput = activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable;

        const shortcuts = getShortcuts();
        const pressedKey = e.key.toLowerCase();
        const combination = [];

        if (e.ctrlKey) combination.push("Ctrl");
        if (e.altKey) combination.push("Alt");
        if (e.shiftKey) combination.push("Shift");
        if (pressedKey !== "control" && pressedKey !== "alt" && pressedKey !== "shift") {
            combination.push(pressedKey.charAt(0).toUpperCase() + pressedKey.slice(1));
        }

        const pressedString = combination.join(" + ");

        // --- MODIFIED INPUT CHECK ---
        // Allow shortcuts like Alt + L or Alt + Q even if an input is focused
        const isModifierPressed = e.ctrlKey || e.altKey || (e.metaKey && !e.ctrlKey); // Meta is CMD on Mac
        if (isInput && !isModifierPressed) return;

        for (const [action, shortcut] of Object.entries(shortcuts)) {
            if (shortcut.toLowerCase() === pressedString.toLowerCase()) {
                e.preventDefault();
                e.stopPropagation();

                if (action === "theme-toggle") {
                    const current = localStorage.getItem("appTheme") || "light";
                    const next = current === "light" ? "dark" : "light";
                    localStorage.setItem("appTheme", next);
                    document.body.classList.toggle("dark-mode", next === "dark");
                    if (window.showToast) window.showToast(`Switched to ${next} mode!`, "success");
                    return;
                }

                if (action === "quick-lock") {
                    if (window.AuraQuickLock) window.AuraQuickLock.lock();
                    return;
                }

                if (action === "privacy-toggle") {
                    e.stopImmediatePropagation();
                    const isNowActive = document.body.classList.toggle("privacy-mode-active");
                    localStorage.setItem("jc_privacy_mode", isNowActive);
                    console.log("Privacy Mode Toggled:", isNowActive);
                    if (window.showToast) window.showToast(isNowActive ? "Privacy Blur Enabled 👁️" : "Privacy Blur Disabled 🔓", "info");
                    return;
                }

                const targetPage = actionToPage[action];
                if (targetPage) {
                    window.location.href = targetPage;
                }
                break;
            }
        }
    }

    // Initialize global listener
    window.addEventListener("keydown", handleShortcut);

    // Zoom Shortcut: Ctrl + Mouse Wheel
    window.addEventListener("wheel", (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const currentZoom = parseFloat(localStorage.getItem("appZoom") || "1.0");
            let nextZoom = currentZoom;

            if (e.deltaY < 0) {
                // Scroll Up -> Zoom In
                nextZoom = Math.min(1.5, currentZoom + 0.05);
            } else {
                // Scroll Down -> Zoom Out
                nextZoom = Math.max(0.7, currentZoom - 0.05);
            }

            if (nextZoom !== currentZoom && typeof window.applyAuraZoom === "function") {
                window.applyAuraZoom(nextZoom);
            }
        }
    }, { passive: false });
})();
