/**
 * AURA MODAL SYSTEM - PROFESSIONAL POPUP ENGINE
 * Replaces native browser alert/confirm with premium glassmorphic UI.
 */

window.AuraDialog = (() => {
    let overlay = null;
    let card = null;

    function init() {
        if (overlay) return;

        overlay = document.createElement("div");
        overlay.className = "aura-modal-overlay";
        overlay.innerHTML = `
            <div class="aura-modal-card">
                <div class="aura-modal-icon" id="auraModalIcon"></div>
                <h3 id="auraModalTitle"></h3>
                <p id="auraModalMsg"></p>
                <div id="auraModalExtra" class="aura-modal-input-box" style="display:none"></div>
                <div class="aura-modal-actions" id="auraModalActions"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        card = overlay.querySelector(".aura-modal-card");
    }

    /**
     * Shows a premium modal.
     * @param {Object} options - config options
     * @returns {Promise}
     */
    function show(options = {}) {
        init();
        const {
            title = "Notification",
            msg = "",
            icon = "🔔",
            type = "info", // info, warning, error, success
            confirmText = "Continue",
            cancelText = "Cancel",
            showCancel = false,
            input = false, // { placeholder, verifyText }
            isDanger = false
        } = options;

        return new Promise((resolve) => {
            const titleEl = document.getElementById("auraModalTitle");
            const msgEl = document.getElementById("auraModalMsg");
            const iconEl = document.getElementById("auraModalIcon");
            const extraEl = document.getElementById("auraModalExtra");
            const actionsEl = document.getElementById("auraModalActions");

            titleEl.textContent = title;
            msgEl.innerHTML = msg;
            iconEl.textContent = icon;
            iconEl.className = `aura-modal-icon ${type}`;

            // Handle Input/Extra
            extraEl.style.display = "none";
            extraEl.innerHTML = "";
            let inputRef = null;

            if (input) {
                extraEl.style.display = "block";
                extraEl.innerHTML = `
                    <label>${input.label || "Verification"}</label>
                    <input type="text" id="auraModalInput" placeholder="${input.placeholder || "Type here..."}" autocomplete="off">
                `;
                inputRef = document.getElementById("auraModalInput");
            }

            // Buttons
            actionsEl.innerHTML = "";
            if (showCancel) {
                const btnCancel = document.createElement("button");
                btnCancel.className = "aura-modal-btn cancel";
                btnCancel.textContent = cancelText;
                btnCancel.onclick = () => close(false, resolve);
                actionsEl.appendChild(btnCancel);
            }

            const btnConfirm = document.createElement("button");
            btnConfirm.className = `aura-modal-btn confirm ${isDanger ? 'danger' : ''}`;
            btnConfirm.textContent = confirmText;
            btnConfirm.onclick = () => {
                if (input && input.verifyText) {
                    if (inputRef.value.trim().toUpperCase() !== input.verifyText.toUpperCase()) {
                        gsap.to(inputRef, { x: 10, duration: 0.1, yoyo: true, repeat: 5 });
                        return;
                    }
                }
                close(true, resolve);
            };
            actionsEl.appendChild(btnConfirm);

            // Animate In
            overlay.classList.add("active");
            gsap.fromTo(card, { scale: 0.8, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "elastic.out(1, 0.7)" });

            if (inputRef) {
                setTimeout(() => inputRef.focus(), 300);
                if (input.verifyText) {
                    btnConfirm.disabled = true;
                    btnConfirm.style.opacity = "0.5";
                    inputRef.addEventListener("input", () => {
                        const match = inputRef.value.trim().toUpperCase() === input.verifyText.toUpperCase();
                        btnConfirm.disabled = !match;
                        btnConfirm.style.opacity = match ? "1" : "0.5";
                    });
                }
            }
        });
    }

    function close(result, resolve) {
        gsap.to(card, {
            scale: 0.9, opacity: 0, y: 10, duration: 0.3, ease: "power2.in", onComplete: () => {
                overlay.classList.remove("active");
                resolve(result);
            }
        });
    }

    return {
        alert: (msg, title = "Alert") => show({ msg, title, showCancel: false, confirmText: "Dismiss" }),
        confirm: (msg, title = "Confirm", isDanger = false) => show({
            msg, title, showCancel: true, confirmText: "Yes, Proceed", cancelText: "Cancel",
            type: isDanger ? "warning" : "info", icon: isDanger ? "⚠️" : "❓", isDanger
        }),
        success: (msg, title = "Success") => show({ msg, title, type: "success", icon: "✅", confirmText: "Great" }),
        error: (msg, title = "Error") => show({ msg, title, type: "error", icon: "❌", confirmText: "Got it" }),
        warning: (msg, title = "Warning") => show({ msg, title, type: "warning", icon: "⚠️", confirmText: "Okay" }),
        prompt: (msg, title = "Verification", verifyText = "CONFIRM") => show({
            msg, title, type: "error", icon: "⚠️", showCancel: true, isDanger: true,
            confirmText: "Execute Action",
            input: { label: `Type "${verifyText}" to confirm`, placeholder: "...", verifyText }
        })
    };
})();

// Global Electron Close Intercept Listener
if (window.electronAPI && window.electronAPI.onAttemptClose) {
    window.electronAPI.onAttemptClose(async () => {
        // ✅ SKIP CONFIRMATION ON LOGIN PAGE
        if (document.body.classList.contains("login-page")) {
            window.electronAPI.confirmQuit();
            return;
        }

        const confirmed = await window.AuraDialog.confirm(
            "Are you sure you want to close Joshi Choice Center? Any unsaved changes may be lost.",
            "Confirm Exit",
            true // isDanger
        );
        if (confirmed) {
            window.electronAPI.confirmQuit();
        }
    });
}
