// ENHANCED SETTINGS LOGIC

document.addEventListener("DOMContentLoaded", () => {
    // 1. TAB SWITCHING
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");

            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(tabId).classList.add("active");

            // Persist tab choice
            localStorage.setItem("lastActiveSettingsTab", tabId);
        });
    });

    // Restore last active tab
    function restoreLastTab() {
        const lastTab = localStorage.getItem("lastActiveSettingsTab");
        if (lastTab) {
            const btn = document.querySelector(`.tab-btn[data-tab="${lastTab}"]`);
            if (btn) {
                btn.click();
            }
        }
    }

    restoreLastTab();

    // 2. SHOP PROFILE LOGIC
    const shopNameInput = document.getElementById("shopName");
    const ownerNameInput = document.getElementById("ownerName");
    const phoneInput = document.getElementById("phoneNumber");
    const emailInput = document.getElementById("shopEmail");
    const addressInput = document.getElementById("shopAddress");
    const stateInput = document.getElementById("shopState");
    const saveShopBtn = document.getElementById("saveShopProfile");
    const logoInput = document.getElementById("shopLogo");
    const logoPreview = document.getElementById("logoPreview");

    // Load Shop Data
    function loadShopData() {
        const data = JSON.parse(localStorage.getItem("shopProfile") || "{}");
        if (data.name) shopNameInput.value = data.name;
        if (data.owner) ownerNameInput.value = data.owner;
        if (data.phone) phoneInput.value = data.phone;
        if (data.email) emailInput.value = data.email;
        if (data.address) addressInput.value = data.address;
        if (data.state) stateInput.value = data.state;
        if (data.logo) {
            logoPreview.innerHTML = `<img src="${data.logo}" alt="Logo">`;
        }
    }

    // Save Shop Data
    saveShopBtn.addEventListener("click", () => {
        const data = {
            name: shopNameInput.value,
            owner: ownerNameInput.value,
            phone: phoneInput.value,
            email: emailInput.value,
            address: addressInput.value,
            state: stateInput.value,
            logo: logoPreview.querySelector("img") ? logoPreview.querySelector("img").src : null
        };
        localStorage.setItem("shopProfile", JSON.stringify(data));
        showNotification("Shop profile saved successfully!", "success");
    });

    // Logo Upload
    logoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                logoPreview.innerHTML = `<img src="${event.target.result}" alt="Logo">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // 3. THEME SELECTION
    const themeCards = document.querySelectorAll(".theme-card");
    const currentTheme = localStorage.getItem("theme") || "light";

    // Set active class on load
    // Clear all and set saved theme
    themeCards.forEach(card => card.classList.remove("active"));
    themeCards.forEach(card => {
        if (card.getAttribute("data-theme") === currentTheme) {
            card.classList.add("active");
        }
        card.addEventListener("click", () => {
            const theme = card.getAttribute("data-theme");
            localStorage.setItem("theme", theme);

            themeCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            // Apply theme globally
            const themeClasses = [
                "dark-mode", "eye-protector-mode", "ocean-mode", "business-mode",
                "midnight-slate-mode", "royal-amethyst-mode", "emerald-haven-mode",
                "sunset-horizon-mode", "cyberpunk-mode", "sakura-mode"
            ];
            document.body.classList.remove(...themeClasses);

            if (theme !== "default" && theme !== "light") {
                document.body.classList.add(theme + "-mode");
            }

            showNotification(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied!`, "success");

            // Sync with old theme toggle if exists
            const slider = document.querySelector(".slider");
            if (slider) {
                if (theme === "dark") {
                    slider.classList.replace("light", "dark");
                } else {
                    slider.classList.replace("dark", "light");
                }
            }
        });
    });

    // 4. ANIMATION SELECTION
    const animCards = document.querySelectorAll(".animation-card");
    const currentAnim = localStorage.getItem("bgAnimation") || "none";

    // Clear all and set saved animation
    animCards.forEach(card => card.classList.remove("active"));
    animCards.forEach(card => {
        if (card.getAttribute("data-anim") === currentAnim) {
            card.classList.add("active");
        }
        card.addEventListener("click", () => {
            const anim = card.getAttribute("data-anim");
            localStorage.setItem("bgAnimation", anim);

            animCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            // Refresh animation globally
            if (window.refreshAnimation) window.refreshAnimation();

            let msg = "";
            if (anim === "none") msg = "Animations disabled!";
            else if (anim === "nexus") msg = "Geometric Nexus enabled! 🕸️";
            else if (anim === "auto") msg = "Dynamic Fusion (Auto-Cycle) started! 🔄";
            else msg = `${anim.charAt(0).toUpperCase() + anim.slice(1)} animation applied! ✨`;

            showNotification(msg, "success");
        });
    });

    // 5. PRINT SETTINGS LOGIC
    const printTitleInput = document.getElementById("printTitle");
    const printHeaderInput = document.getElementById("printHeader");
    const printFooter1Input = document.getElementById("printFooter1");
    const printFooter2Input = document.getElementById("printFooter2");
    const showContactInput = document.getElementById("showContact");
    const showAddressInput = document.getElementById("showAddress");
    const taxIdInput = document.getElementById("taxId"); // NEW
    const receiptTermsInput = document.getElementById("receiptTerms"); // NEW
    const showTaxInput = document.getElementById("showTax"); // NEW
    const logoScaleInput = document.getElementById("logoScale"); // NEW
    const logoScaleVal = document.getElementById("logoScaleVal"); // NEW
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
        const format = previewFormatSelect.value;
        const ps = {
            title: printTitleInput.value || "TAX INVOICE",
            header: printHeaderInput.value || "OFFICIAL RECEIPT",
            footer1: printFooter1Input.value || "Thank You",
            footer2: printFooter2Input.value || "Please Visit Again",
            showContact: showContactInput.checked,
            showAddress: showAddressInput.checked,
            taxId: taxIdInput.value, // NEW
            terms: receiptTermsInput.value, // NEW
            showTax: showTaxInput.checked, // NEW
            logoScale: logoScaleInput.value // NEW
        };

        // Update Slider Value Label
        if (logoScaleVal) logoScaleVal.innerText = `${ps.logoScale}%`;

        const shop = JSON.parse(localStorage.getItem("shopProfile")) || {
            name: "JOSHI CHOICE CENTER",
            address: "Kodapar Square (Main)"
        };

        const date = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        const showContact = ps.showContact ? `Mobile: ${dummyTxn.mobileNumber}` : "";
        const showAddress = ps.showAddress ? shop.address : "";

        let content = "";
        if (format == 1) {
            content = `${shop.name}\n${ps.header}\n-------------------------\nDate: ${date}\nTxn: ${dummyTxn.transactionId}\n\nCustomer: ${dummyTxn.customerName}\n${showContact}\n\nService: ${dummyTxn.serviceName}\n\nAmount: Rs. 500.00\nCharge: Rs. 50.00\n-------------------------\nTotal: Rs. 550.00\n\nStatus: SUCCESS\n-------------------------\n${ps.footer1}`;
        } else if (format == 2) {
            content = `*************************\n  ${shop.name}\n*************************\n     ${ps.title}\n*************************\nID   : ${dummyTxn.transactionId}\nDate : ${date}\n-------------------------\nCustomer : ${dummyTxn.customerName}\nService  : ${dummyTxn.serviceName}\n-------------------------\nAmount   : Rs. 500.00\nCharge   : Rs. 50.00\n-------------------------\nNET TOTAL: Rs. 550.00\n-------------------------\nStatus   : SUCCESS\n-------------------------\n   ${ps.footer1}\n   ${ps.footer2}\n*************************`;
        } else if (format == 3) {
            content = `   ${shop.name}\n   ${ps.header}\n=========================\nDATE : ${date}\nTXN  : ${dummyTxn.transactionId}\nNAME : ${dummyTxn.customerName}\nSVC  : ${dummyTxn.serviceName}\n=========================\nAMOUNT : Rs. 500.00\nCHARGE : Rs. 50.00\nTOTAL  : Rs. 550.00\n=========================\nSTATUS : SUCCESS\n      ${ps.footer1}\n=========================`;
        } else if (format == 4) {
            content = `${shop.name}\n-------------------------\n${date} | ${dummyTxn.transactionId}\n\nName: ${dummyTxn.customerName}\nSvc : ${dummyTxn.serviceName}\n\nNet : Rs. 550.00\n\n-- ${ps.footer1} --`;
        } else if (format == 5) {
            content = `-------------------------\n    ${ps.title}\n-------------------------\n${shop.name}\n${showAddress}\n\nTrans ID : ${dummyTxn.transactionId}\nDate     : ${date}\n-------------------------\nCustomer Details:\nName   : ${dummyTxn.customerName}\n${showContact}\n-------------------------\nService Details:\nDescription: ${dummyTxn.serviceName}\n-------------------------\nPayment Details:\nBase Amount : Rs. 500.00\nService Chg : Rs. 50.00\nNet Payable : Rs. 550.00\n-------------------------\nStatus : SUCCESS\n-------------------------\n  ${ps.footer2}\n-------------------------`;
        }

        // ADD DETAILING TO PREVIEW (NEW)
        if (ps.taxId) {
            content = `GST: ${ps.taxId}\n` + content;
        }
        if (ps.terms) {
            content += `\n\n- T&C -\n${ps.terms}`;
        }

        livePreview.innerText = content;

        // Apply logo scale to a container if logo exists in preview (conceptual)
        // Since it's a text preview, we can visualize scale via font-size of header or padding
        // but it's mainly for the actual printing logic which uses these ps values.
    }

    function loadPrintSettings() {
        const ps = JSON.parse(localStorage.getItem("printSettings")) || {
            title: "TAX INVOICE",
            header: "OFFICIAL RECEIPT",
            footer1: "Thank You",
            footer2: "Please Visit Again",
            showContact: true,
            showAddress: true,
            taxId: "",
            terms: "",
            showTax: false,
            logoScale: 100
        };

        printTitleInput.value = ps.title;
        printHeaderInput.value = ps.header;
        printFooter1Input.value = ps.footer1;
        printFooter2Input.value = ps.footer2;
        showContactInput.checked = ps.showContact;
        showAddressInput.checked = ps.showAddress;

        // NEW FIELDS LOAD
        if (taxIdInput) taxIdInput.value = ps.taxId || "";
        if (receiptTermsInput) receiptTermsInput.value = ps.terms || "";
        if (showTaxInput) showTaxInput.checked = ps.showTax || false;
        if (logoScaleInput) logoScaleInput.value = ps.logoScale || 100;
        if (logoScaleVal) logoScaleVal.innerText = `${ps.logoScale || 100}%`;

        updateLivePreview();
    }

    // Live update listeners
    [printTitleInput, printHeaderInput, printFooter1Input, printFooter2Input, showContactInput, showAddressInput,
        previewFormatSelect, taxIdInput, receiptTermsInput, showTaxInput, logoScaleInput].forEach(el => {
            if (el) el.addEventListener("input", updateLivePreview);
        });

    savePrintBtn.addEventListener("click", () => {
        const ps = {
            title: printTitleInput.value,
            header: printHeaderInput.value,
            footer1: printFooter1Input.value,
            footer2: printFooter2Input.value,
            showContact: showContactInput.checked,
            showAddress: showAddressInput.checked,
            taxId: taxIdInput.value,
            terms: receiptTermsInput.value,
            showTax: showTaxInput.checked,
            logoScale: logoScaleInput.value
        };

        localStorage.setItem("printSettings", JSON.stringify(ps));
        if (typeof showToast === "function") {
            showToast("Print Settings Saved! 🖨️");
        }
    });

    loadPrintSettings();


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

    resetBtn.addEventListener("click", () => {
        resetModal.classList.add("active");
        if (resetComment) {
            resetComment.value = "";
            confirmReset.disabled = true;
        }
    });

    if (resetComment) {
        resetComment.addEventListener("input", () => {
            const comment = resetComment.value.trim();
            confirmReset.disabled = comment !== "CONFIRM"; // Exact match required
        });
    }

    cancelReset.addEventListener("click", () => {
        resetModal.classList.remove("active");
    });

    confirmReset.addEventListener("click", () => {
        const comment = resetComment ? resetComment.value.trim() : "";
        if (comment !== "CONFIRM") return;

        resetModal.classList.remove("active");
        startWipeSequence();
    });

    function startWipeSequence() {
        // 1. Show wiping screen
        gsap.to(wipingOverlay, { opacity: 1, pointerEvents: "auto", duration: 0.5 });

        // 2. Animate progress
        let progressObj = { value: 0 };
        gsap.to(progressObj, {
            value: 100,
            duration: 4,
            ease: "power1.inOut",
            onUpdate: () => {
                const p = Math.floor(progressObj.value);
                wipingProgress.style.width = p + "%";
                wipingPercentage.innerText = p + "%";

                // Update status text
                if (p < 30) wipingStatus.innerText = "Clearing Customer Records...";
                else if (p < 60) wipingStatus.innerText = "Wiping Transaction History...";
                else if (p < 90) wipingStatus.innerText = "Resetting System Preferences...";
                else wipingStatus.innerText = "Finalizing Reset...";
            },
            onComplete: () => {
                // 3. Clear data
                localStorage.clear();
                localStorage.setItem("theme", "light");
                localStorage.setItem("bgAnimation", "none");

                // 4. Reset UI Classes immediately
                const allCustomClasses = [
                    "dark-mode", "eye-protector-mode", "ocean-mode", "business-mode",
                    "midnight-slate-mode", "royal-amethyst-mode", "emerald-haven-mode",
                    "sunset-horizon-mode", "cyberpunk-mode", "sakura-mode"
                ];
                document.body.classList.remove(...allCustomClasses);

                // 5. Final message and reload
                wipingStatus.innerText = "System Cleaned Successfully!";
                gsap.to(wipingOverlay, {
                    backgroundColor: "#16a34a",
                    duration: 0.8,
                    delay: 0.5,
                    onComplete: () => {
                        window.location.href = "dashboard.html";
                    }
                });
            }
        });
    }

    // 8. DATA BACKUP & RESTORE LOGIC (NEW)
    const exportBtn = document.getElementById("exportBackup");
    const importBtn = document.getElementById("importBackup");
    const importFileInput = document.getElementById("importFile");

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const backupData = {};
            const keysToBackup = [
                "customers", "transactions", "shopProfile", "printSettings",
                "theme", "bgAnimation", "lastActiveSettingsTab",
                "appLanguage"
            ];

            keysToBackup.forEach(key => {
                const val = localStorage.getItem(key);
                if (val !== null) backupData[key] = val;
            });

            const dataStr = JSON.stringify(backupData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            const date = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `joshi_backup_${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification("Data exported successfully!", "success");
        });
    }

    if (importBtn && importFileInput) {
        importBtn.addEventListener("click", () => {
            importFileInput.click();
        });

        importFileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (confirm("WARNING: Importing a backup will overwrite all your current data. Are you sure you want to proceed?")) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);

                        // Clear current and set new
                        Object.keys(data).forEach(key => {
                            localStorage.setItem(key, data[key]);
                        });

                        showNotification("Data restored successfully! Reloading...", "success");

                        setTimeout(() => {
                            location.reload();
                        }, 1500);

                    } catch (err) {
                        showNotification("Invalid backup file!", "error");
                        console.error("Import Error:", err);
                    }
                };
                reader.readAsText(file);
            }
            // Reset input for next time
            importFileInput.value = "";
        });
    }

    // 9. PROFESSIONAL ABOUT / UPDATE CHECK
    const { ipcRenderer } = require('electron');
    const updateBtn = document.getElementById("checkUpdates");
    const updateModal = document.getElementById("updateModal");
    const btnUpdateNow = document.getElementById("btnUpdateNow");
    const btnUpdateLater = document.getElementById("btnUpdateLater");
    const updateProgressContainer = document.getElementById("updateProgressContainer");
    const updateProgressBar = document.getElementById("updateProgressBar");
    const updateStepText = document.getElementById("updateStepText");
    const updatePercentText = document.getElementById("updatePercentText");
    const updateActionButtons = document.getElementById("updateActionButtons");
    const updateStatusInline = document.getElementById("updateStatus");

    let latestReleaseInfo = null;

    async function initVersion() {
        const currentVer = await ipcRenderer.invoke('get-app-version');
        const vDisplay = document.getElementById("currentAppVersion");
        if (vDisplay) vDisplay.innerText = `Version ${currentVer}`;
    }

    initVersion();

    function isNewerVersion(current, latest) {
        if (!latest) return false;
        const c = current.split('.').map(Number);
        const l = latest.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
            if ((l[i] || 0) > (c[i] || 0)) return true;
            if ((l[i] || 0) < (c[i] || 0)) return false;
        }
        return false;
    }

    updateBtn.addEventListener("click", async () => {
        updateBtn.disabled = true;
        updateBtn.innerText = "Checking...";
        updateStatusInline.innerHTML = ""; // Clear previous

        try {
            const currentVer = await ipcRenderer.invoke('get-app-version');
            const release = await ipcRenderer.invoke('check-for-update');

            if (release.error) {
                showNotification(release.error, "error");
                updateBtn.disabled = false;
                updateBtn.innerText = "Check for Updates";
                return;
            }

            if (isNewerVersion(currentVer, release.version)) {
                latestReleaseInfo = release;
                document.getElementById("newVersionBadge").innerText = `Version ${release.version} Ready (${release.size} MB)`;
                
                // Set Changelog
                const changelogUl = updateModal.querySelector(".changelog-box ul");
                if (changelogUl && release.changelog) {
                    const features = release.changelog.split('\n').filter(l => l.trim().length > 0);
                    changelogUl.innerHTML = features.map(line => `<li>${line.replace(/[*#-]/g, '').trim()}</li>`).join('');
                }

                updateModal.classList.add("active");
            } else {
                updateStatusInline.innerHTML = `<span style="color: #16a34a; font-size: 0.9rem; margin-top: 10px; display: block; font-weight: 600;">Software is up to date (v${currentVer}) ✅</span>`;
            }
        } catch (err) {
            console.error(err);
            showNotification("Failed to check for updates.", "error");
        }

        updateBtn.disabled = false;
        updateBtn.innerText = "Check for Updates";
    });

    btnUpdateLater.addEventListener("click", () => {
        updateModal.classList.remove("active");
    });

    btnUpdateNow.addEventListener("click", () => {
        if (!latestReleaseInfo || !latestReleaseInfo.downloadUrl) {
            showNotification("No update file found.", "error");
            return;
        }

        // Hide buttons, show progress
        updateActionButtons.style.display = "none";
        updateProgressContainer.style.display = "block";
        updateStepText.innerText = "Starting Download...";

        ipcRenderer.send('download-update', latestReleaseInfo.downloadUrl);
    });

    ipcRenderer.on('download-progress', (event, progress) => {
        gsap.to(updateProgressBar, { width: progress + "%", duration: 0.3, ease: "none" });
        updatePercentText.innerText = progress + "%";
        
        if (progress < 10) updateStepText.innerText = "Establishing secure connection...";
        else if (progress < 90) updateStepText.innerText = `Downloading assets (${latestReleaseInfo.size} MB)...`;
        else updateStepText.innerText = "Finalizing download...";
    });

    ipcRenderer.on('download-complete', (event, path) => {
        updateStepText.innerText = "Update Downloaded! Installing...";
        updateStepText.style.color = "#16a34a";
        
        setTimeout(() => {
            updateStepText.innerText = "System ready. Starting installer...";
            setTimeout(() => {
                ipcRenderer.send('restart-app', path);
            }, 1500);
        }, 1000);
    });

    ipcRenderer.on('download-error', (event, error) => {
        showNotification("Download Failed: " + error, "error");
        updateActionButtons.style.display = "flex";
        updateProgressContainer.style.display = "none";
    });


    // 10. LANGUAGE SELECTION LOGIC (NEW)
    const langRadios = document.querySelectorAll('input[name="appLang"]');
    const saveLangBtn = document.getElementById("saveLanguage");

    function loadLangSettings() {
        const savedLang = localStorage.getItem("appLanguage") || "en";
        langRadios.forEach(radio => {
            if (radio.value === savedLang) {
                radio.checked = true;
            }
        });
    }

    if (saveLangBtn) {
        saveLangBtn.addEventListener("click", () => {
            let selectedLang = "en";
            langRadios.forEach(radio => {
                if (radio.checked) selectedLang = radio.value;
            });

            if (window.LanguageManager) {
                window.LanguageManager.setLanguage(selectedLang);
                showNotification(`Language set to ${selectedLang === 'hi' ? 'Hindi' : 'English'}!`, "success");
            }
        });
    }

    loadLangSettings();

    // 11. CUSTOM SHORTCUTS LOGIC
    const shortcutInputs = document.querySelectorAll(".shortcut-recording-input");
    const saveShortcutsBtn = document.getElementById("saveShortcuts");
    const resetShortcutsBtn = document.getElementById("resetShortcuts");

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

    function loadShortcuts() {
        const saved = JSON.parse(localStorage.getItem("customShortcuts") || "{}");
        const shortcuts = { ...defaultShortcuts, ...saved };

        shortcutInputs.forEach(input => {
            const action = input.getAttribute("data-action");
            const display = input.parentElement.querySelector(".current-key-display");
            if (display) {
                display.innerText = shortcuts[action] || "None";
            }
        });
    }

    shortcutInputs.forEach(input => {
        input.addEventListener("keydown", (e) => {
            e.preventDefault();

            // Handle Escape to clear or cancel
            if (e.key === "Escape") {
                input.value = "";
                input.blur();
                return;
            }

            const combination = [];
            if (e.ctrlKey) combination.push("Ctrl");
            if (e.altKey) combination.push("Alt");
            if (e.shiftKey) combination.push("Shift");

            const key = e.key.toLowerCase();
            if (key !== "control" && key !== "alt" && key !== "shift") {
                combination.push(key);
            }

            if (combination.length > 0) {
                const shortcutStr = combination.join(" + ");
                input.value = shortcutStr;

                // Visual feedback
                const display = input.parentElement.querySelector(".current-key-display");
                if (display) {
                    display.innerText = shortcutStr;
                    display.style.background = "#16a34a"; // Green for temporary feedback
                    setTimeout(() => display.style.background = "#2563eb", 500);
                }
            }
        });

        input.addEventListener("focus", () => {
            input.parentElement.style.borderColor = "#2563eb";
            input.parentElement.style.boxShadow = "0 0 0 4px rgba(37, 99, 235, 0.1)";
        });

        input.addEventListener("blur", () => {
            input.parentElement.style.borderColor = "";
            input.parentElement.style.boxShadow = "";
        });
    });

    if (saveShortcutsBtn) {
        saveShortcutsBtn.addEventListener("click", () => {
            const newShortcuts = {};
            shortcutInputs.forEach(input => {
                const action = input.getAttribute("data-action");
                const val = input.parentElement.querySelector(".current-key-display").innerText;
                if (val && val !== "None") {
                    newShortcuts[action] = val;
                }
            });

            localStorage.setItem("customShortcuts", JSON.stringify(newShortcuts));
            showNotification("Shortcuts saved successfully! ⌨️", "success");
        });
    }

    if (resetShortcutsBtn) {
        resetShortcutsBtn.addEventListener("click", () => {
            if (confirm("Reset all shortcuts to defaults?")) {
                localStorage.removeItem("customShortcuts");
                loadShortcuts();
                showNotification("Shortcuts reset to defaults.", "success");
            }
        });
    }

    loadShortcuts();

    // Initialize
    loadShopData();
});

// Notification Helper (if not globally available)
function showNotification(msg, type) {
    if (window.showToast) {
        window.showToast(msg, type);
    } else {
        alert(msg);
    }
}