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
        "pending-payments": "Alt + b"
    };

    const actionToPage = {
        "dashboard": "dashboard.html",
        "new-customer": "new-customer.html",
        "customer-directory": "customer-directory.html",
        "reports": "reports.html",
        "expenses": "expenses.html",
        "settings": "settings.html",
        "print-receipt": "print-receipt.html",
        "pending-payments": "pending-payments.html"
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
            combination.push(pressedKey);
        }

        const pressedString = combination.join(" + ");

        for (const [action, shortcut] of Object.entries(shortcuts)) {
            if (shortcut.toLowerCase() === pressedString.toLowerCase()) {
                e.preventDefault();
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
})();
