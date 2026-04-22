/**
 * Global Shortcuts Manager
 * Handles keyboard navigation based on user-defined mappings.
 */

(function() {
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
        "theme-toggle": "Alt + t"
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
        // Don't trigger if user is typing in an input, textarea or contenteditable
        const activeEl = document.activeElement;
        const isInput = activeEl.tagName === 'INPUT' || 
                        activeEl.tagName === 'TEXTAREA' || 
                        activeEl.isContentEditable;
        
        if (isInput) return;

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

        for (const [action, shortcut] of Object.entries(shortcuts)) {
            if (shortcut.toLowerCase() === pressedString.toLowerCase()) {
                e.preventDefault();
                
                if (action === "theme-toggle") {
                    const current = localStorage.getItem("appTheme") || "light";
                    const next = current === "light" ? "dark" : "light";
                    localStorage.setItem("appTheme", next);
                    document.body.classList.toggle("dark-mode", next === "dark");
                    if (window.showToast) window.showToast(`Switched to ${next} mode!`, "success");
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
