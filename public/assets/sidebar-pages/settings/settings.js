/**
 * AURA SETTINGS LOGIC - UNIFIED VERSION
 * Cleaned, optimized, and duplicate-free.
 */



document.addEventListener("DOMContentLoaded", () => {
    // 1. GSAP INITIAL ENTRANCE
    if (typeof gsap !== 'undefined') {
        gsap.from(".aura-nav-island", { y: -30, opacity: 0, duration: 1, ease: "power4.out" });
        gsap.from(".settings-aura-body", { y: 30, opacity: 0, duration: 1, ease: "power4.out", delay: 0.2 });
    }

    // --- IMMEDIATE SECURITY LOAD ---
    // We do this early to ensure values are visible even if other scripts fail
    function initSecurityNow() {
        const u = document.getElementById("adminUsername");
        const k = document.getElementById("adminMasterKey");
        const t = document.getElementById("sessionTimeout");
        if (u) u.value = localStorage.getItem("jc_username") || "admin";
        if (k) k.value = localStorage.getItem("jc_master_key") || "8080";
        if (t) t.value = localStorage.getItem("jc_session_timeout") || "0";
    }
    initSecurityNow();

    // 2. TOP NAV & TAB NAVIGATION LOGIC
    const navBtns = document.querySelectorAll(".aura-nav-btn, .tab-btn");
    const indicator = document.querySelector(".aura-nav-indicator");
    const sections = document.querySelectorAll(".tab-content");

    function moveIndicator(btn) {
        if (!btn || !indicator || typeof gsap === 'undefined') return;
        gsap.to(indicator, {
            left: btn.offsetLeft,
            width: btn.offsetWidth,
            duration: 0.5,
            ease: "elastic.out(1, 0.8)"
        });
    }
    window.moveIndicator = moveIndicator;

    navBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-tab");
            const targetSection = document.getElementById(targetId);
            if (!targetSection || btn.classList.contains("active")) return;

            // Update Buttons
            navBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            moveIndicator(btn);

            // Auto-scroll the clicked tab into view
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

            // Animate Sections
            const currentSection = document.querySelector(".tab-content.active");
            if (currentSection && typeof gsap !== 'undefined') {
                gsap.to(currentSection, {
                    opacity: 0,
                    x: -20,
                    duration: 0.3,
                    onComplete: () => {
                        sections.forEach(s => s.classList.remove("active"));
                        targetSection.classList.add("active");

                        gsap.fromTo(targetSection,
                            { opacity: 0, x: 20 },
                            { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
                        );
                    }
                });
            } else {
                sections.forEach(s => s.classList.remove("active"));
                targetSection.classList.add("active");
            }

            // Save active tab to sessionStorage for refresh persistence
            sessionStorage.setItem("activeSettingsTab", targetId);
        });
    });

    // 3. SHOP PROFILE ENGINE
    const shopInputs = {
        name: document.getElementById("shopName"),
        owner: document.getElementById("ownerName"),
        phone: document.getElementById("phoneNumber"),
        email: document.getElementById("shopEmail"),
        address: document.getElementById("shopAddress"),
        state: document.getElementById("shopState"),
        logo: document.getElementById("shopLogo")
    };

    // Helper for Title Case (1st letter of every word capital)
    function applyTitleCase(input) {
        if (!input) return;
        input.addEventListener("input", (e) => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            let val = e.target.value;

            // Capitalize first letter and any letter after a space
            val = val.replace(/(^\w|\s\w)/g, m => m.toUpperCase());

            e.target.value = val;
            e.target.setSelectionRange(start, end); // Keep cursor position
        });
    }

    [shopInputs.name, shopInputs.owner, shopInputs.address].forEach(applyTitleCase);

    // Smart Phone Prefix Logic
    const phoneInput = shopInputs.phone;
    if (phoneInput) {
        phoneInput.addEventListener("focus", () => {
            if (phoneInput.value.length === 0) {
                phoneInput.value = "+91 ";
            }
        });

        phoneInput.addEventListener("blur", () => {
            if (phoneInput.value === "+91 " || phoneInput.value.trim() === "+91") {
                phoneInput.value = "";
            }
        });

        phoneInput.addEventListener("input", (e) => {
            let val = e.target.value;

            // Ensure +91 remains
            if (!val.startsWith("+91 ")) {
                val = "+91 " + val.replace(/^\+91\s?/, "");
            }

            // Extract digits only after prefix
            const digits = val.slice(4).replace(/\D/g, "");
            e.target.value = "+91 " + digits.slice(0, 10);
        });
    }

    const logoInput = document.getElementById("shopLogo");
    const logoPreview = document.getElementById("logoPreview");

    function loadShopProfile() {
        const data = JSON.parse(localStorage.getItem("shopProfile") || "{}");
        Object.keys(shopInputs).forEach(key => {
            if (shopInputs[key] && data[key]) shopInputs[key].value = data[key];
        });
        if (data.logo && logoPreview) {
            logoPreview.innerHTML = `<img src="${data.logo}" alt="Shop Logo">`;
        }
    }

    document.getElementById("saveShopProfile")?.addEventListener("click", () => {
        const data = {};
        Object.keys(shopInputs).forEach(key => {
            if (shopInputs[key]) data[key] = shopInputs[key].value;
        });
        if (logoPreview && logoPreview.querySelector("img")) {
            data.logo = logoPreview.querySelector("img").src;
        }

        localStorage.setItem("shopProfile", JSON.stringify(data));
        showToast("Business profile updated! 🏢", "success");
    });

    logoInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (logoPreview) logoPreview.innerHTML = `<img src="${ev.target.result}" alt="Logo">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // 4. THEME & ANIMATION ENGINE
    const themeCards = document.querySelectorAll(".aura-preset-card, .theme-card");
    // SCOPED SELECTOR: Only target cards in the Background Animation section to avoid Sidebar FX conflicts
    const animCards = document.querySelectorAll("#animation .aura-anim-card, #animation .animation-card");

    function syncThemeCards() {
        const currentTheme = localStorage.getItem("theme") || "light";
        themeCards.forEach(card => {
            const theme = card.getAttribute("data-theme");
            if (theme === currentTheme) card.classList.add("active");
            else card.classList.remove("active");
        });
    }

    syncThemeCards();
    window.addEventListener("themeChanged", syncThemeCards);

    themeCards.forEach(card => {
        card.addEventListener("click", () => {
            const theme = card.getAttribute("data-theme");
            localStorage.setItem("theme", theme);
            window.dispatchEvent(new Event("themeChanged"));

            const themeClasses = [
                "dark-mode", "eye-protector-mode", "ocean-mode", "business-mode",
                "midnight-slate-mode", "royal-amethyst-mode", "emerald-haven-mode",
                "sunset-horizon-mode", "cyberpunk-mode", "sakura-mode"
            ];
            document.body.classList.remove(...themeClasses);

            if (theme !== "default" && theme !== "light") {
                document.body.classList.add(theme + "-mode");
            }
            showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} mode active!`, "success");
        });
    });

    function syncAnimCards() {
        const currentAnim = localStorage.getItem("bgAnimation") || "none";
        animCards.forEach(card => {
            const anim = card.getAttribute("data-anim");
            if (anim === currentAnim) card.classList.add("active");
            else card.classList.remove("active");
        });
    }
    syncAnimCards();

    animCards.forEach(card => {
        card.addEventListener("click", () => {
            const anim = card.getAttribute("data-anim");
            if (!anim) return;
            localStorage.setItem("bgAnimation", anim);
            syncAnimCards();
            if (window.refreshAnimation) window.refreshAnimation();
            showToast(`${anim.charAt(0).toUpperCase() + anim.slice(1)} animations updated! ✨`, "success");
        });
    });

    // 4.2 MOUSE STYLE ENGINE
    const mouseCards = document.querySelectorAll(".aura-mouse-card");

    function syncMouseCards() {
        const currentMouse = localStorage.getItem("mouseStyle") || "default";
        mouseCards.forEach(card => {
            const mouse = card.getAttribute("data-mouse");
            if (mouse === currentMouse) card.classList.add("active");
            else card.classList.remove("active");
        });
    }

    syncMouseCards();

    mouseCards.forEach(card => {
        card.addEventListener("click", () => {
            const mouse = card.getAttribute("data-mouse");
            if (!mouse) return;
            localStorage.setItem("mouseStyle", mouse);
            syncMouseCards();

            // Dispatch event for global style application
            window.dispatchEvent(new Event("mouseStyleChanged"));

            showToast(`${mouse.charAt(0).toUpperCase() + mouse.slice(1)} mouse style active! ➹`, "success");
        });
    });

    // 4.1 SIDEBAR EFFECTS (ANIMATION & BACKGROUND)
    const sidebarAnimCards = document.querySelectorAll(".sidebar-fx-card");
    const sidebarBgCards = document.querySelectorAll(".sidebar-bg-fx-card");
    const sidebar = document.getElementById("proSidebar");

    sidebarAnimCards.forEach(card => {
        const anim = card.getAttribute("data-sidebar-anim");
        const currentAnim = localStorage.getItem("sidebarAnim") || "classic";
        if (anim === currentAnim) card.classList.add("active");

        card.addEventListener("click", () => {
            localStorage.setItem("sidebarAnim", anim);
            sidebarAnimCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            showToast(`${anim.charAt(0).toUpperCase() + anim.slice(1)} sidebar animation active! 🪄`, "success");

            if (sidebar && !sidebar.classList.contains("open")) {
                sidebar.classList.add("open");
                if (window.refreshSidebarState) window.refreshSidebarState(true);

                setTimeout(() => {
                    sidebar.classList.remove("open");
                    if (window.refreshSidebarState) window.refreshSidebarState(false);
                }, 1500);
            }
        });
    });

    sidebarBgCards.forEach(card => {
        const bg = card.getAttribute("data-sidebar-bg");
        const currentBg = localStorage.getItem("sidebarBgEffect") || "glass";
        if (bg === currentBg) card.classList.add("active");

        card.addEventListener("click", () => {
            localStorage.setItem("sidebarBgEffect", bg);
            sidebarBgCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            if (window.applySidebarBgEffect) window.applySidebarBgEffect();
            showToast(`${bg.charAt(0).toUpperCase() + bg.slice(1)} sidebar background active! ✨`, "success");
        });
    });

    // 4.2 VIEWPORT ZOOM ENGINE
    const appZoom = document.getElementById("appZoom");
    const zoomVal = document.getElementById("zoomVal");
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");
    const resetZoom = document.getElementById("resetZoom");

    function syncZoomUI() {
        const val = parseFloat(localStorage.getItem("appZoom") || "1.0");
        if (appZoom) appZoom.value = val;
        if (zoomVal) zoomVal.innerText = `${Math.round(val * 100)}%`;

        const activeBtn = document.querySelector(".aura-nav-btn.active, .tab-btn.active");
        if (activeBtn && window.moveIndicator) window.moveIndicator(activeBtn);
    }

    function changeZoom(val) {
        if (window.applyAuraZoom) {
            window.applyAuraZoom(val);
            syncZoomUI();
        } else {
            // Fallback if global script isn't loaded for some reason
            const zoom = parseFloat(val);
            document.body.style.zoom = zoom;
            localStorage.setItem("appZoom", zoom);
            syncZoomUI();
        }
    }

    appZoom?.addEventListener("input", (e) => changeZoom(e.target.value));
    zoomIn?.addEventListener("click", () => {
        let val = parseFloat(localStorage.getItem("appZoom") || "1.0");
        if (val < 1.5) changeZoom(Math.min(1.5, val + 0.05));
    });
    zoomOut?.addEventListener("click", () => {
        let val = parseFloat(localStorage.getItem("appZoom") || "1.0");
        if (val > 0.7) changeZoom(Math.max(0.7, val - 0.05));
    });
    resetZoom?.addEventListener("click", () => {
        changeZoom(1.0);
        showToast("Zoom reset to default.", "info");
    });

    // Listen for zoom changes (even if triggered globally)
    window.addEventListener("zoomChanged", syncZoomUI);

    // Initial UI sync
    syncZoomUI();

    // 5. PRINT SETTINGS LOGIC
    const printInputs = {
        title: document.getElementById("printTitle"),
        header: document.getElementById("printHeader"),
        footer1: document.getElementById("printFooter1"),
        footer2: document.getElementById("printFooter2"),
        showContact: document.getElementById("showContact"),
        showAddress: document.getElementById("showAddress"),
        taxId: document.getElementById("taxId"),
        terms: document.getElementById("receiptTerms"),
        showTax: document.getElementById("showTax"),
        logoScale: document.getElementById("logoScale")
    };
    const logoScaleVal = document.getElementById("logoScaleVal");
    const previewFormatSelect = document.getElementById("previewFormat");
    const livePreview = document.getElementById("liveReceiptPreview");
    const savePrintBtn = document.getElementById("savePrintSettings");

    const dummyTxn = {
        transactionId: "TXN12345678",
        date: new Date().toISOString(),
        customerName: "Rahul Sharma",
        mobileNumber: "9876543210",
        serviceName: "Digital Service",
        amount: 500,
        charge: 50,
        totalAmount: 550,
        status: "Success"
    };

    function updateLivePreview() {
        if (!livePreview) return;
        const format = previewFormatSelect ? previewFormatSelect.value : 1;
        const ps = {
            title: printInputs.title?.value || "TAX INVOICE",
            header: printInputs.header?.value || "OFFICIAL RECEIPT",
            footer1: printInputs.footer1?.value || "Thank You",
            footer2: printInputs.footer2?.value || "Please Visit Again",
            showContact: printInputs.showContact?.checked || false,
            showAddress: printInputs.showAddress?.checked || false,
            taxId: printInputs.taxId?.value || "",
            terms: printInputs.terms?.value || "",
            showTax: printInputs.showTax?.checked || false,
            logoScale: printInputs.logoScale?.value || 100
        };

        if (logoScaleVal) logoScaleVal.innerText = `${ps.logoScale}%`;

        const shop = JSON.parse(localStorage.getItem("shopProfile")) || {
            name: "JOSHI CHOICE CENTER",
            address: "Kodapar Square (Main)"
        };

        const date = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        const contactStr = ps.showContact ? `Mobile: ${dummyTxn.mobileNumber}` : "";
        const addressStr = ps.showAddress ? shop.address : "";

        let content = "";
        if (format == 1) {
            content = `${shop.name}\n${ps.header}\n-------------------------\nDate: ${date}\nTxn: ${dummyTxn.transactionId}\n\nCustomer: ${dummyTxn.customerName}\n${contactStr}\n\nService: ${dummyTxn.serviceName}\n\nAmount: Rs. 500.00\nCharge: Rs. 50.00\n-------------------------\nTotal: Rs. 550.00\n\nStatus: SUCCESS\n-------------------------\n${ps.footer1}`;
        } else if (format == 2) {
            content = `*************************\n  ${shop.name}\n*************************\n     ${ps.title}\n*************************\nID   : ${dummyTxn.transactionId}\nDate : ${date}\n-------------------------\nCustomer : ${dummyTxn.customerName}\nService  : ${dummyTxn.serviceName}\n-------------------------\nAmount   : Rs. 500.00\nCharge   : Rs. 50.00\n-------------------------\nNET TOTAL: Rs. 550.00\n-------------------------\nStatus   : SUCCESS\n-------------------------\n   ${ps.footer1}\n   ${ps.footer2}\n*************************`;
        } else if (format == 3) {
            content = `   ${shop.name}\n   ${ps.header}\n=========================\nDATE : ${date}\nTXN  : ${dummyTxn.transactionId}\nNAME : ${dummyTxn.customerName}\nSVC  : ${dummyTxn.serviceName}\n=========================\nAMOUNT : Rs. 500.00\nCHARGE : Rs. 50.00\nTOTAL  : Rs. 550.00\n=========================\nSTATUS : SUCCESS\n      ${ps.footer1}\n=========================`;
        } else if (format == 4) {
            content = `${shop.name}\n-------------------------\n${date} | ${dummyTxn.transactionId}\n\nName: ${dummyTxn.customerName}\nSvc : ${dummyTxn.serviceName}\n\nNet : Rs. 550.00\n\n-- ${ps.footer1} --`;
        } else {
            content = `-------------------------\n    ${ps.title}\n-------------------------\n${shop.name}\n${addressStr}\n\nTrans ID : ${dummyTxn.transactionId}\nDate     : ${date}\n-------------------------\nCustomer Details:\nName   : ${dummyTxn.customerName}\n${contactStr}\n-------------------------\nService Details:\nDescription: ${dummyTxn.serviceName}\n-------------------------\nPayment Details:\nBase Amount : Rs. 500.00\nService Chg : Rs. 50.00\nNet Payable : Rs. 550.00\n-------------------------\nStatus : SUCCESS\n-------------------------\n  ${ps.footer2}\n-------------------------`;
        }

        if (ps.taxId) content = `GST: ${ps.taxId}\n` + content;
        if (ps.terms) content += `\n\n- T&C -\n${ps.terms}`;

        livePreview.innerText = content;
    }

    function loadPrintSettings() {
        const ps = JSON.parse(localStorage.getItem("printSettings")) || {};
        if (printInputs.title) printInputs.title.value = ps.title || "TAX INVOICE";
        if (printInputs.header) printInputs.header.value = ps.header || "OFFICIAL RECEIPT";
        if (printInputs.footer1) printInputs.footer1.value = ps.footer1 || "Thank You";
        if (printInputs.footer2) printInputs.footer2.value = ps.footer2 || "Please Visit Again";
        if (printInputs.showContact) printInputs.showContact.checked = ps.showContact !== false;
        if (printInputs.showAddress) printInputs.showAddress.checked = ps.showAddress !== false;
        if (printInputs.taxId) printInputs.taxId.value = ps.taxId || "";
        if (printInputs.terms) printInputs.terms.value = ps.terms || "";
        if (printInputs.showTax) printInputs.showTax.checked = ps.showTax || false;
        if (printInputs.logoScale) printInputs.logoScale.value = ps.logoScale || 100;

        updateLivePreview();
    }

    Object.values(printInputs).forEach(el => el?.addEventListener("input", updateLivePreview));
    previewFormatSelect?.addEventListener("change", updateLivePreview);

    savePrintBtn?.addEventListener("click", () => {
        const ps = {
            title: printInputs.title?.value,
            header: printInputs.header?.value,
            footer1: printInputs.footer1?.value,
            footer2: printInputs.footer2?.value,
            showContact: printInputs.showContact?.checked,
            showAddress: printInputs.showAddress?.checked,
            taxId: printInputs.taxId?.value,
            terms: printInputs.terms?.value,
            showTax: printInputs.showTax?.checked,
            logoScale: printInputs.logoScale?.value
        };
        localStorage.setItem("printSettings", JSON.stringify(ps));
        showToast("Print Settings Saved! 🖨️", "success");
    });

    // 6. BACKUP & RESTORE LOGIC (FOCUS: CUSTOMER DATA ONLY)
    const exportBtn = document.getElementById("exportBackup");
    const importBtn = document.getElementById("importBackup");
    const importFileInput = document.getElementById("importFile");

    // Keys that represent "Business/Customer Data" vs "System Settings"
    const CUSTOMER_DATA_KEYS = ["customers", "transactions", "expenses", "pendingCustomers", "app_notifications"];

    exportBtn?.addEventListener("click", async () => {
        const backupData = {};
        let dataFound = false;

        CUSTOMER_DATA_KEYS.forEach(key => {
            const val = localStorage.getItem(key);
            if (val) {
                backupData[key] = val;
                dataFound = true;
            }
        });

        if (!dataFound) {
            showToast("No Customer Data found to export! 📭", "info");
            return;
        }

        const dataStr = JSON.stringify(backupData, null, 2);

        // Modern File System Access API
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: `joshi_customer_data_${new Date().toISOString().split('T')[0]}.json`,
                    types: [{
                        description: 'Joshi Choice Center Backup',
                        accept: { 'application/json': ['.json'] },
                    }],
                });

                const writable = await handle.createWritable();
                await writable.write(dataStr);
                await writable.close();

                showToast("Customer Data Exported Successfully! 📁", "success");
            } catch (err) {
                if (err.name === 'AbortError') {
                    showToast("Export Cancelled. No data saved. ❌", "info");
                } else {
                    console.error("Export Error:", err);
                    showToast("Export failed!", "error");
                }
            }
        } else {
            // Fallback
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `joshi_customer_data_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast("Backup initiated. Check your downloads.", "success");
        }
    });

    if (importBtn) {
        // Shared Process Logic
        const startImport = async (file) => {
            let forceProceed = false;
            if (window.AuraDialog) {
                // Generate random 4-digit code for professional security
                const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
                forceProceed = await window.AuraDialog.prompt(
                    "WARNING: Importing a backup will permanently overwrite your current Customers, Transactions, and Expenses. This action cannot be undone.",
                    "Confirm Data Restore",
                    randomCode
                );
            } else {
                forceProceed = "CONFIRM";
            }

            if (forceProceed === true || forceProceed === "CONFIRM") {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        let importedCount = 0;

                        CUSTOMER_DATA_KEYS.forEach(key => {
                            if (data[key]) {
                                localStorage.setItem(key, data[key]);
                                importedCount++;
                            }
                        });

                        if (importedCount > 0) {
                            showToast("Customer Data Restored successfully! 🔄", "success");
                            setTimeout(() => location.reload(), 1500);
                        } else {
                            showToast("No valid customer data found in file! ❌", "error");
                        }
                    } catch (err) {
                        showToast("Invalid backup file format!", "error");
                    }
                };
                reader.readAsText(file);
            } else {
                showToast("Restore Point Cancelled. No changes made. ❌", "info");
            }
        };

        // Modern File Picker
        importBtn.addEventListener("click", async () => {
            if (window.showOpenFilePicker) {
                try {
                    const [handle] = await window.showOpenFilePicker({
                        types: [{
                            description: 'Joshi Choice Center Backup',
                            accept: { 'application/json': ['.json'] },
                        }],
                    });
                    const file = await handle.getFile();
                    startImport(file);
                } catch (err) {
                    if (err.name === 'AbortError') {
                        showToast("Restore Point Cancelled. No file selected. ❌", "info");
                    }
                }
            } else {
                importFileInput?.click();
            }
        });

        // Fallback for hidden input
        importFileInput?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) startImport(file);
            else showToast("Restore Cancelled. No file selected. ❌", "info");
            e.target.value = ""; // Reset
        });
    }

    // 7. PROFESSIONAL SOFTWARE RESET
    const resetBtn = document.getElementById("resetSoftware");
    const resetModal = document.getElementById("resetModal");
    const cancelReset = document.getElementById("cancelReset");
    const confirmReset = document.getElementById("confirmReset");
    const resetComment = document.getElementById("resetComment");
    const wipingOverlay = document.getElementById("wipingOverlay");
    const wipingProgress = document.getElementById("wipingProgress");
    const wipingStatus = document.getElementById("wipingStatus");
    const wipingPercentage = document.getElementById("wipingPercentage");

    let activeResetCode = "";

    resetBtn?.addEventListener("click", async () => {
        // Generate random 4-digit code for extra security
        activeResetCode = Math.floor(1000 + Math.random() * 9000).toString();

        if (resetModal) {
            // Update modal UI if it exists in HTML
            const label = resetModal.querySelector('.verification-label') || resetModal.querySelector('p');
            if (label) label.innerHTML = `Permanently delete all data? <br><b style="color: #ef4444;">TYPE "${activeResetCode}" TO CONFIRM</b>`;

            resetModal.classList.add("active");
            if (resetComment) {
                resetComment.value = "";
                resetComment.placeholder = `Enter ${activeResetCode}`;
                if (confirmReset) confirmReset.disabled = true;
            }
        } else {
            // Fallback to AuraDialog system
            let p = await window.AuraDialog.prompt("Permanently delete all customer records, transactions, and settings?", "Are you sure?", activeResetCode);
            if (p) startWipeSequence();
        }
    });

    resetComment?.addEventListener("input", () => {
        if (confirmReset) confirmReset.disabled = resetComment.value.trim() !== activeResetCode;
    });

    cancelReset?.addEventListener("click", () => resetModal.classList.remove("active"));

    confirmReset?.addEventListener("click", () => {
        if (resetComment?.value.trim() !== activeResetCode) return;
        resetModal.classList.remove("active");
        startWipeSequence();
    });

    function startWipeSequence(isDemo = false) {
        const wipeConsole = document.getElementById("wipeConsole");
        const wipeOverlay = document.getElementById("wipingOverlay");
        const glitchOverlay = document.querySelector(".glitch-overlay");

        if (wipeOverlay && typeof gsap !== 'undefined') {
            // Reset Console for Demo
            if (wipeConsole) wipeConsole.innerHTML = "";

            // Initial Entrance
            gsap.set(wipeOverlay, { display: "flex", pointerEvents: "auto" });
            gsap.to(wipeOverlay, { opacity: 1, duration: 0.8 });

            const logs = [
                { text: "> Initializing Secured Purge Protocol...", type: "info" },
                { text: "> Loading sector mapping...", type: "info" },
                { text: "> Sector 0x001 - 0x4FF identified.", type: "info" },
                { text: "!! WARN: ACCESSING PROTECTED STORAGE !!", type: "danger" },
                { text: "> UNLINKING: customers_db.json", type: "danger" },
                { text: "> WIPING: transaction_history_logs_2024.bin", type: "danger" },
                { text: "> DELETING: user_reports_cache.tmp", type: "danger" },
                { text: "> STATUS: 0x01 PURGED", type: "success" },
                { text: "> UNLINKING: shop_profile_metadata.xml", type: "danger" },
                { text: "> WIPING: system_preferences_registry.dat", type: "danger" },
                { text: "> DELETING: authentication_tokens.secure", type: "danger" },
                { text: "> STATUS: 0x02 PURGED", type: "success" },
                { text: "> UNLINKING: notification_queue.db", type: "danger" },
                { text: "> WIPING: expense_tracker_v3.xlsx", type: "danger" },
                { text: "> DELETING: active_session_state.json", type: "danger" },
                { text: "> STATUS: 0x03 PURGED", type: "success" },
                { text: "> Finalizing system state reset...", type: "info" },
                { text: "> ALL DATA PURGED. SYSTEM_CLEAN.", type: "success" }
            ];

            function addLogLine(log) {
                if (!wipeConsole) return;
                const line = document.createElement("div");
                line.className = `log-line ${log.type}`;
                line.innerText = log.text;
                wipeConsole.appendChild(line);
                gsap.to(line, { opacity: 1, y: 0, duration: 0.3 });
                wipeConsole.scrollTop = wipeConsole.scrollHeight;
            }

            // Fake Log Intervals
            logs.forEach((log, i) => {
                setTimeout(() => addLogLine(log), i * 200);
            });

            // Progress Animation
            let progressObj = { value: 0 };
            gsap.to(progressObj, {
                value: 100,
                duration: 6,
                ease: "power2.inOut",
                onUpdate: () => {
                    const p = Math.floor(progressObj.value);
                    if (wipingProgress) wipingProgress.style.width = p + "%";
                    if (wipingPercentage) wipingPercentage.innerText = p + "%";

                    if (wipingStatus) {
                        if (p < 20) wipingStatus.innerText = "UNLINKING FILESYSTEM...";
                        else if (p < 45) wipingStatus.innerText = "PURGING PERSISTENT STORAGE...";
                        else if (p < 75) wipingStatus.innerText = "DEFRAGMENTING SECTORS...";
                        else if (p < 95) wipingStatus.innerText = "RESETTING SYSTEM REGISTER...";
                        else wipingStatus.innerText = "READY FOR REBOOT";
                    }

                    // Occasional Glitch Pulse
                    if (p % 15 === 0 && glitchOverlay) {
                        gsap.fromTo(glitchOverlay, { opacity: 0.3 }, { opacity: 0, duration: 0.1 });
                    }
                },
                onComplete: () => {
                    if (isDemo) {
                        if (wipingStatus) wipingStatus.innerText = "DEMO COMPLETE (NO DATA DELETED)";
                        document.body.classList.add("glitch-active");
                        gsap.to(glitchOverlay, { opacity: 0.8, duration: 0.1, repeat: 5, yoyo: true });
                        setTimeout(() => {
                            document.body.classList.remove("glitch-active");
                            gsap.to(wipeOverlay, {
                                opacity: 0, duration: 1, onComplete: () => {
                                    gsap.set(wipeOverlay, { display: "none", pointerEvents: "none" });
                                }
                            });
                        }, 2000);
                        return;
                    }

                    localStorage.clear();
                    if (wipingStatus) wipingStatus.innerText = "SYSTEM_WIPED_SUCCESSFULLY_0x00";

                    // FINAL GLITCH
                    document.body.classList.add("glitch-active");
                    gsap.to(glitchOverlay, { opacity: 0.8, duration: 0.1, repeat: 10, yoyo: true });

                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 1200);
                }
            });
        } else {
            if (isDemo) {
                showToast("Demo running (No deletion).", "info");
                return;
            }
            localStorage.clear();
            showToast("System Wiped! Restarting...", "error");
            setTimeout(() => location.href = "dashboard.html", 1500);
        }
    }
    window.startWipeSequence = startWipeSequence;

    // 8. AUTO-UPDATE ENGINE (PRELOAD / ELECTRON)
    const updateBtn = document.getElementById("checkUpdates");
    const updateModalEl = document.getElementById("updateModal");
    const btnUpdateNow = document.getElementById("btnUpdateNow");
    const btnUpdateLater = document.getElementById("btnUpdateLater");
    const uProgressContainer = document.getElementById("updateProgressContainer");
    const uProgressBar = document.getElementById("updateProgressBar");
    const uStepText = document.getElementById("updateStepText");
    const uPercentText = document.getElementById("updatePercentText");
    const uActionBtns = document.getElementById("updateActionButtons");
    const uStatusInline = document.getElementById("updateStatus");

    // NEW UI ELEMENTS
    const currentVDisplay = document.getElementById("currentAppVersion");
    const latestVDisplay = document.getElementById("latestAppVersion");
    const vStatusPill = document.getElementById("versionStatusPill");
    const vStatusText = document.getElementById("versionStatusText");
    const lastCheckedText = document.getElementById("lastCheckedText");

    let latestReleaseInfo = null;

    async function initVersion() {
        let currentVer = "1.3.3";
        if (window.electronAPI) {
            currentVer = await window.electronAPI.getAppVersion();
            if (currentVDisplay) currentVDisplay.innerText = `v${currentVer}`;
        }

        const lastChecked = localStorage.getItem("lastUpdateCheck");
        if (lastChecked && lastCheckedText) {
            lastCheckedText.innerText = `Last checked: ${lastChecked}`;
        }

        // Check for cached update info
        const cachedUpdate = JSON.parse(localStorage.getItem("latestReleaseInfo"));
        if (cachedUpdate && isNewerVersion(currentVer, cachedUpdate.version)) {
            latestReleaseInfo = cachedUpdate;
            applyUpdateUI(cachedUpdate);
        } else {
            // Default: Up to date or No update found yet
            if (latestVDisplay) latestVDisplay.innerText = `v${currentVer}`;
            if (vStatusPill) vStatusPill.className = "aura-status-pill success";
            if (vStatusText) vStatusText.innerText = "SOFTWARE UP TO DATE";
            localStorage.removeItem("latestReleaseInfo"); // Clean up if no longer relevant
        }
    }
    initVersion();

    function applyUpdateUI(release) {
        if (!release) return;
        if (latestVDisplay) latestVDisplay.innerText = `v${release.version}`;

        // Update Status UI (Permanent until update)
        if (vStatusPill) vStatusPill.className = "aura-status-pill warning";
        if (vStatusText) vStatusText.innerText = "UPDATE AVAILABLE";

        // Update Modal Badge
        const badge = document.getElementById("newVersionBadge");
        if (badge) badge.innerText = `Version v${release.version} Ready (${release.size || '?'} MB)`;

        // Update Modal Changelog
        if (updateModalEl) {
            const clUl = updateModalEl.querySelector(".changelog-box ul");
            if (clUl && release.changelog) {
                clUl.innerHTML = release.changelog.split('\n')
                    .filter(l => l.trim())
                    .map(line => `<li>${line.replace(/[*#-]/g, '').trim()}</li>`)
                    .join('');
            }
        }
    }

    function isNewerVersion(current, latest) {
        if (!latest || !current) return false;
        const c = current.replace('v', '').split('.').map(Number);
        const l = latest.replace('v', '').split('.').map(Number);
        for (let i = 0; i < 3; i++) {
            if ((l[i] || 0) > (c[i] || 0)) return true;
            if ((l[i] || 0) < (c[i] || 0)) return false;
        }
        return false;
    }

    updateBtn?.addEventListener("click", async () => {
        updateBtn.disabled = true;
        const btnTextSpan = updateBtn.querySelector('span');
        if (btnTextSpan) btnTextSpan.innerText = "Checking...";

        try {
            // Log local check time
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const checkDate = new Date().toLocaleDateString();
            const lastCheckStr = `${checkDate} at ${now}`;
            localStorage.setItem("lastUpdateCheck", lastCheckStr);
            if (lastCheckedText) lastCheckedText.innerText = `Last checked: ${lastCheckStr}`;

            if (!window.electronAPI) {
                // Simulation Mode
                await new Promise(r => setTimeout(r, 2000));
                const simRelease = { version: "2.5.0", changelog: "Simulated Update Found!", size: "15" };
                latestReleaseInfo = simRelease;
                localStorage.setItem("latestReleaseInfo", JSON.stringify(simRelease));
                applyUpdateUI(simRelease);
                if (updateModalEl) {
                    updateModalEl.classList.add("active");
                    updateModalEl.style.display = "flex";
                }
                showStatusChip("NEW VERSION FOUND!", "success");
            } else {
                const currentVer = await window.electronAPI.getAppVersion();
                const release = await window.electronAPI.checkForUpdate();

                if (release.error) {
                    showStatusChip(release.error.toUpperCase(), "error");
                } else {
                    if (isNewerVersion(currentVer, release.version)) {
                        latestReleaseInfo = release;
                        localStorage.setItem("latestReleaseInfo", JSON.stringify(release));
                        applyUpdateUI(release);

                        if (updateModalEl) {
                            updateModalEl.classList.add("active");
                            updateModalEl.style.display = "flex";
                        }
                    } else {
                        // Up to date
                        localStorage.removeItem("latestReleaseInfo");
                        initVersion(); // Reset UI to up-to-date
                        showStatusChip("SYSTEM IS UP TO DATE", "success");
                    }
                }
            }
        } catch (err) {
            showStatusChip("UPDATE CHECK FAILED", "error");
        } finally {
            setTimeout(() => {
                updateBtn.disabled = false;
                if (btnTextSpan) btnTextSpan.innerText = "Check for Updates";
            }, 500);
        }
    });

    btnUpdateLater?.addEventListener("click", () => {
        if (updateModalEl) {
            updateModalEl.classList.remove("active");
            if (typeof gsap !== 'undefined') {
                gsap.to(".update-card", { scale: 0.8, opacity: 0, y: 50, duration: 0.4, onComplete: () => updateModalEl.style.display = "none" });
            } else {
                updateModalEl.style.display = "none";
            }
        }
    });

    btnUpdateNow?.addEventListener("click", () => {
        if (uActionBtns) uActionBtns.style.display = "none";
        if (uProgressContainer) uProgressContainer.style.display = "block";

        if (!window.electronAPI) {
            // Fake Update Download
            if (uStepText) uStepText.innerText = "Downloading...";
            let prog = { v: 0 };
            if (typeof gsap !== 'undefined') {
                gsap.to(prog, {
                    v: 100, duration: 4, onUpdate: () => {
                        let p = Math.floor(prog.v);
                        if (uProgressBar) uProgressBar.style.width = p + "%";
                        if (uPercentText) uPercentText.innerText = p + "%";
                    }, onComplete: () => {
                        if (uStepText) uStepText.innerText = "Update Installed (Simulation)!";
                        showStatusChip("UPDATE INSTALLED (SIM)", "success");
                    }
                });
            }
            return;
        }

        if (uStepText) uStepText.innerText = "Initializing...";
        window.electronAPI.downloadUpdate(latestReleaseInfo.downloadUrl);
    });

    if (window.electronAPI) {
        window.electronAPI.onDownloadProgress((progress) => {
            if (typeof gsap !== 'undefined') gsap.to(uProgressBar, { width: progress + "%", duration: 0.3, ease: "none" });
            else if (uProgressBar) uProgressBar.style.width = progress + "%";
            if (uPercentText) uPercentText.innerText = progress + "%";
            if (uStepText) uStepText.innerText = progress < 90 ? `Downloading...` : "Finishing...";
        });
        window.electronAPI.onDownloadComplete((path) => {
            if (uStepText) {
                uStepText.innerText = "Download Successful! Restarting...";
                uStepText.style.color = "#16a34a";
            }
            setTimeout(() => window.electronAPI.restartApp(path), 1000);
        });
        window.electronAPI.onDownloadError((err) => {
            showStatusChip("DOWNLOAD FAILED", "error");
            if (uActionBtns) uActionBtns.style.display = "flex";
            if (uProgressContainer) uProgressContainer.style.display = "none";
        });
    }

    // 9. LANGUAGE SELECTION
    const langRadios = document.querySelectorAll('input[name="appLang"]');
    const saveLangBtn = document.getElementById("saveLanguage");

    function loadLangSettings() {
        const savedLang = localStorage.getItem("appLanguage") || "en";
        langRadios.forEach(r => {
            r.checked = (r.value === savedLang);
        });
    }

    saveLangBtn?.addEventListener("click", () => {
        let sel = "en";
        langRadios.forEach(r => { if (r.checked) sel = r.value; });
        localStorage.setItem("appLanguage", sel);
        if (window.LanguageManager) window.LanguageManager.setLanguage(sel);
        showToast(`Language set to ${sel === 'hi' ? 'Hindi' : 'English'}! 🌐`, "success");
    });

    // 10. CUSTOM SHORTCUTS LOGIC
    const shortcutInputs = document.querySelectorAll(".shortcut-recording-input");
    const saveShortcutsBtn = document.getElementById("saveShortcuts");
    const resetShortcutsBtn = document.getElementById("resetShortcuts");

    const defaultShortcuts = {
        "dashboard": "Alt + d", "new-customer": "Alt + n",
        "customer-directory": "Alt + c", "reports": "Alt + r",
        "expenses": "Alt + e", "settings": "Alt + s",
        "print-receipt": "Alt + p", "pending-payments": "Alt + b",
        "notifications": "Alt + i", "customer-profile": "Alt + u",
        "theme-toggle": "Alt + t"
    };

    function loadShortcuts() {
        const saved = JSON.parse(localStorage.getItem("customShortcuts") || "{}");
        const merged = { ...defaultShortcuts, ...saved };
        shortcutInputs.forEach(input => {
            const action = input.getAttribute("data-action");
            const display = input.parentElement.querySelector(".current-key-display") || input.nextElementSibling;
            if (display) display.textContent = merged[action] || "None";
            input.value = "";
        });
    }

    shortcutInputs.forEach(input => {
        input.addEventListener("keydown", (e) => {
            e.preventDefault();
            if (e.key === "Escape") {
                input.value = "";
                input.blur();
                return;
            }
            const combo = [];
            if (e.ctrlKey) combo.push("Ctrl");
            if (e.altKey) combo.push("Alt");
            if (e.shiftKey) combo.push("Shift");

            const k = e.key.charAt(0).toUpperCase() + e.key.slice(1).toLowerCase();
            if (k !== "Control" && k !== "Alt" && k !== "Shift") combo.push(k);

            if (combo.length > 0) {
                const str = combo.join(" + ");
                input.value = str;
                const display = input.parentElement.querySelector(".current-key-display") || input.nextElementSibling;
                if (display) {
                    display.textContent = str;
                    display.style.background = "#16a34a";
                    setTimeout(() => display.style.background = "", 500);
                }
            }
        });
        input.addEventListener("blur", () => input.value = "");
    });

    saveShortcutsBtn?.addEventListener("click", () => {
        const newShortcuts = {};
        shortcutInputs.forEach(input => {
            const action = input.getAttribute("data-action");
            const display = input.parentElement.querySelector(".current-key-display") || input.nextElementSibling;
            if (display && display.textContent !== "None") newShortcuts[action] = display.textContent;
        });
        localStorage.setItem("customShortcuts", JSON.stringify(newShortcuts));
        showToast("Shortcuts saved successfully! ⌨️", "success");
    });

    resetShortcutsBtn?.addEventListener("click", async () => {
        const confirmed = await AuraDialog.confirm("Reset all shortcuts to defaults?", "Reset Shortcuts", true);
        if (confirmed) {
            localStorage.removeItem("customShortcuts");
            loadShortcuts();
            showToast("Shortcuts reset to defaults.", "info");
        }
    });

    // 11. INITIAL TAB RESTORATION
    setTimeout(() => {
        const savedTab = sessionStorage.getItem("activeSettingsTab") || "shop";
        const lastBtn = document.querySelector(`.aura-nav-btn[data-tab="${savedTab}"], .tab-btn[data-tab="${savedTab}"]`);
        if (lastBtn) {
            lastBtn.click();
            // Force indicator sync after GSAP potential conflicts
            setTimeout(() => {
                if (window.moveIndicator) window.moveIndicator(lastBtn);
            }, 300);
        }
    }, 150);

    const island = document.querySelector(".aura-nav-island");
    if (island && window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            const act = document.querySelector(".aura-nav-btn.active, .tab-btn.active");
            if (act) moveIndicator(act);
        });
        ro.observe(island);
    }

    // 12. SECURITY LOGIC
    const securityInputs = {
        username: document.getElementById("adminUsername"),
        currentPass: document.getElementById("currentPassword"),
        newPass: document.getElementById("newPassword"),
        masterKey: document.getElementById("adminMasterKey"),
        timeout: document.getElementById("sessionTimeout")
    };

    function loadSecuritySettings() {
        const usernameInput = document.getElementById("adminUsername");
        const masterKeyInput = document.getElementById("adminMasterKey");
        const timeoutSelect = document.getElementById("sessionTimeout");

        if (usernameInput) {
            const savedUser = localStorage.getItem("jc_username") || "admin";
            usernameInput.value = savedUser;
        }
        if (masterKeyInput) {
            const savedKey = localStorage.getItem("jc_master_key") || "8080";
            masterKeyInput.value = savedKey;
        }
        if (timeoutSelect) {
            const savedTimeout = localStorage.getItem("jc_session_timeout") || "0";
            timeoutSelect.value = savedTimeout;
        }
    }

    document.getElementById("saveSecuritySettings")?.addEventListener("click", () => {
        const username = securityInputs.username.value.trim();
        const currentPass = securityInputs.currentPass.value;
        const newPass = securityInputs.newPass.value;
        const masterKey = securityInputs.masterKey.value.trim();
        const timeout = securityInputs.timeout.value;

        // Verify current password
        const storedPass = localStorage.getItem("jc_password") || "123";
        if (currentPass !== storedPass) {
            showShieldAlert("INCORRECT CURRENT PASSWORD", "error");
            return;
        }

        // Apply changes
        if (window.Auth) {
            window.Auth.updateCredentials(username, newPass || null);
            window.Auth.updateMasterKey(masterKey);
            localStorage.setItem("jc_session_timeout", timeout);

            // Re-sync if timeout changed
            if (window.Auth.initTimeoutMonitor) window.Auth.initTimeoutMonitor();

            // Cinematic Shield Success Animation
            showShieldAlert("SECURITY CONFIG UPDATED", "success");

            // Clear password fields
            securityInputs.currentPass.value = "";
            securityInputs.newPass.value = "";
        }
    });

    /**
     * Cinematic Shield Overlay (Success/Error)
     */
    function showShieldAlert(message, type = "success") {
        let overlay = document.querySelector(".shield-success-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "shield-success-overlay";
            document.body.appendChild(overlay);
        }

        // Set type
        overlay.className = `shield-success-overlay ${type === 'error' ? 'error' : ''}`;

        overlay.innerHTML = `
            <div class="shield-success-box">
                <svg class="shield-success-bg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                ${type === 'success' ? `
                    <svg class="checkmark-svg" viewBox="0 0 24 24">
                        <path d="M4 12L9 17L20 6" />
                    </svg>
                ` : `
                    <svg class="cross-svg" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                `}
            </div>
            <div class="shield-success-msg">${message}</div>
        `;

        // Animate In with GSAP
        overlay.classList.add("active");

        const tl = gsap.timeline();
        const box = overlay.querySelector(".shield-success-box");
        const shield = overlay.querySelector(".shield-success-bg");
        const checkmark = overlay.querySelector(".checkmark-svg path");
        const cross = overlay.querySelector(".cross-svg path");
        const msg = overlay.querySelector(".shield-success-msg");

        // Initial States
        gsap.set(box, { scale: 1, opacity: 1 });
        gsap.set(shield, { scale: 0, opacity: 0 });
        if (checkmark) gsap.set(checkmark, { strokeDashoffset: 40, strokeDasharray: 40 });
        if (cross) gsap.set(cross, { strokeDashoffset: 40, strokeDasharray: 40 });
        gsap.set(msg, { y: 20, opacity: 0 });

        // 1. Pop the Shield
        tl.to(shield, { scale: 1.2, opacity: 1, duration: 0.4, ease: "back.out(1.7)" })
            .to(shield, { scale: 1, duration: 0.2, ease: "power2.inOut" });

        // 2. Animate Checkmark/Cross (PhonePe Style - More Professional)
        if (type === 'success' && checkmark) {
            // Slower, smoother draw
            tl.to(checkmark, { strokeDashoffset: 0, duration: 1.2, ease: "power3.inOut" }, "-=0.2");
        } else if (cross) {
            tl.to(cross, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" }, "-=0.1");
        }

        // 3. Show Message
        tl.to(msg, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.3");

        // Auto Dismiss
        setTimeout(() => {
            overlay.classList.remove("active");
            gsap.to(overlay.querySelector(".shield-success-box"), { scale: 0.8, opacity: 0, duration: 0.4 });
        }, 2500);
    }

    // 13. PASSWORD VISIBILITY TOGGLE ENGINE
    document.querySelectorAll(".password-toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const inputId = btn.getAttribute("data-for");
            const input = document.getElementById(inputId);
            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>`;
                btn.style.color = "var(--aura-accent)";
            } else {
                input.type = "password";
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>`;
                btn.style.color = "var(--aura-text-soft)";
            }
        });
    });

    // INITIAL LOADS - Wrapped in try-catch to ensure one failure doesn't block others
    try { loadShopProfile(); } catch (e) { console.error("Shop load fail", e); }
    try { loadPrintSettings(); } catch (e) { console.error("Print load fail", e); }
    try { loadLangSettings(); } catch (e) { console.error("Lang load fail", e); }
    try { loadShortcuts(); } catch (e) { console.error("Shortcut load fail", e); }
    try { loadSecuritySettings(); } catch (e) { console.error("Security load fail", e); }
});
// 14. SIDEBAR LAYOUT ENGINE
const layoutCards = document.querySelectorAll('.layout-card');

function loadSidebarLayout() {
    const current = localStorage.getItem('sidebarLayout') || 'classic';
    layoutCards.forEach(card => {
        if (card.getAttribute('data-sidebar-layout') === current) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

layoutCards.forEach(card => {
    card.addEventListener('click', () => {
        const layout = card.getAttribute('data-sidebar-layout');
        localStorage.setItem('sidebarLayout', layout);

        // Visual Update
        layoutCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Apply to body live
        const layouts = ['classic', 'compact', 'floating', 'minimal', 'rail', 'navbar'];
        layouts.forEach(l => document.body.classList.remove('layout-' + l));
        document.body.classList.add('layout-' + layout);

        // Cinematic Feedback
        if (window.showShieldAlert) {
            showShieldAlert(layout.toUpperCase() + ' LAYOUT APPLIED', 'success');
        }
    });
});


loadSidebarLayout();

// 15. SIDEBAR STYLE ENGINE
const styleCards = document.querySelectorAll('.style-card');

function loadSidebarStyle() {
    const current = localStorage.getItem('sidebarStyle') || 'simple';
    styleCards.forEach(card => {
        if (card.getAttribute('data-sidebar-style') === current) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

styleCards.forEach(card => {
    card.addEventListener('click', () => {
        const style = card.getAttribute('data-sidebar-style');
        localStorage.setItem('sidebarStyle', style);

        // Visual Update
        styleCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Apply live
        if (window.applySidebarStyle) {
            window.applySidebarStyle();
        }

        // Cinematic Feedback
        if (window.showShieldAlert) {
            showShieldAlert(style.toUpperCase() + ' STYLE APPLIED', 'success');
        }
    });
});

loadSidebarStyle();

