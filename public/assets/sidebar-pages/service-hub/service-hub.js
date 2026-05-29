document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".hub-tab");
    const panels = document.querySelectorAll(".hub-panel");
    const logContainer = document.getElementById("api-logs");
    let biometricCapturedData = null;

    // Aadhaar Input Auto-Formatter (XXXX-XXXX-XXXX)
    const aadhaarInput = document.getElementById("aeps-aadhaar");
    if (aadhaarInput) {
        aadhaarInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, ""); // Keep digits only
            if (value.length > 12) {
                value = value.substring(0, 12);
            }
            let formatted = "";
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formatted += "-";
                }
                formatted += value[i];
            }
            e.target.value = formatted;
        });
    }

    // Currency Input Auto-Formatter (1,000 / 10,000 / 1,00,000)
    const formatCurrencyInput = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", (e) => {
            let val = e.target.value.replace(/,/g, "").replace(/\D/g, "");
            if (val === "") {
                e.target.value = "";
                return;
            }
            const num = parseInt(val, 10);
            if (isNaN(num)) {
                e.target.value = "";
            } else {
                e.target.value = num.toLocaleString('en-IN');
            }
        });
    };
    formatCurrencyInput("aeps-amount");
    formatCurrencyInput("rec-amount");
    formatCurrencyInput("dmt-amount");

    // Mobile number focus/input/blur formatting rules
    const recNumberInput = document.getElementById("rec-number");
    if (recNumberInput) {
        recNumberInput.addEventListener("focus", () => {
            const service = document.getElementById("rec-type")?.value || "mobile";
            if (service === "mobile" && recNumberInput.value.trim() === "") {
                recNumberInput.value = "+91 ";
            }
        });

        recNumberInput.addEventListener("input", (e) => {
            const service = document.getElementById("rec-type")?.value || "mobile";
            if (service === "mobile") {
                let val = e.target.value;
                if (!val.startsWith("+91 ")) {
                    val = "+91 " + val.replace(/^\+?9?1?\s?/, "");
                }
                let digits = val.substring(4).replace(/\D/g, "");
                if (digits.length > 10) {
                    digits = digits.substring(0, 10);
                }
                e.target.value = "+91 " + digits;
            } else {
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
            }
        });

        recNumberInput.addEventListener("blur", () => {
            const val = recNumberInput.value.trim();
            if (val === "+91" || val === "+91 ") {
                recNumberInput.value = "";
            }
        });
    }


    // Aadhaar Password Visibility Toggle
    const toggleAadhaar = document.getElementById("toggle-aadhaar");
    const eyeSlash = document.getElementById("eye-slash");
    if (toggleAadhaar && aadhaarInput) {
        toggleAadhaar.addEventListener("click", () => {
            if (aadhaarInput.type === "password") {
                aadhaarInput.type = "text";
                if (eyeSlash) eyeSlash.style.display = "none";
            } else {
                aadhaarInput.type = "password";
                if (eyeSlash) eyeSlash.style.display = "block";
            }
        });
    }

    // Razorpay Key Password Visibility Toggle
    const toggleRzpKey = document.getElementById("toggle-razorpay-key");
    const rzpKeyInput = document.getElementById("razorpayKeyId");
    const rzpEyeSlash = document.getElementById("razorpay-eye-slash");
    if (toggleRzpKey && rzpKeyInput) {
        toggleRzpKey.addEventListener("click", () => {
            if (rzpKeyInput.type === "password") {
                rzpKeyInput.type = "text";
                if (rzpEyeSlash) rzpEyeSlash.style.display = "none";
            } else {
                rzpKeyInput.type = "password";
                if (rzpEyeSlash) rzpEyeSlash.style.display = "block";
            }
        });
    }

    // 0. Toggle Coming Soon Overlay based on Digital Hub Setting
    const hubActive = localStorage.getItem("jc_digital_hub_active") !== "false";
    const overlay = document.getElementById("hubComingSoon");
    if (overlay) {
        if (hubActive) {
            overlay.style.display = "none";
        } else {
            overlay.style.display = "flex";
        }
    }

    // --- PAYMENT API CONFIG ENGINE ---
    const paymentInputs = {
        active: document.getElementById("paymentApiActive"),
        keyId: document.getElementById("razorpayKeyId"),
        digitalHubActive: document.getElementById("digitalHubActive"),
        rechargeActive: document.getElementById("rechargeApiActive"),
        rechargeUrl: document.getElementById("rechargeApiUrl"),
        rechargeToken: document.getElementById("rechargeApiToken"),
        rechargeBalance: document.getElementById("rechargeLapuBalance")
    };

    function updateLapuUI() {
        const isRechargeApiActive = localStorage.getItem("jc_recharge_api_active") === "true";
        const balanceBar = document.getElementById("lapuBalanceBar");
        const balanceVal = document.getElementById("lapuBalanceVal");
        
        if (balanceBar) {
            if (isRechargeApiActive) {
                balanceBar.style.display = "flex";
                const bal = parseFloat(localStorage.getItem("jc_recharge_lapu_balance") || "5000");
                if (balanceVal) {
                    balanceVal.textContent = "\u20B9" + bal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
            } else {
                balanceBar.style.display = "none";
            }
        }
    }

    function loadPaymentSettings() {
        if (paymentInputs.active) {
            paymentInputs.active.checked = localStorage.getItem("jc_payment_api_active") === "true";
        }
        if (paymentInputs.keyId) {
            paymentInputs.keyId.value = localStorage.getItem("jc_razorpay_key_id") || "";
        }
        if (paymentInputs.digitalHubActive) {
            paymentInputs.digitalHubActive.checked = localStorage.getItem("jc_digital_hub_active") !== "false";
        }
        if (paymentInputs.rechargeActive) {
            paymentInputs.rechargeActive.checked = localStorage.getItem("jc_recharge_api_active") === "true";
        }
        if (paymentInputs.rechargeUrl) {
            paymentInputs.rechargeUrl.value = localStorage.getItem("jc_recharge_api_url") || "";
        }
        if (paymentInputs.rechargeToken) {
            paymentInputs.rechargeToken.value = localStorage.getItem("jc_recharge_api_token") || "";
        }
        if (paymentInputs.rechargeBalance) {
            paymentInputs.rechargeBalance.value = localStorage.getItem("jc_recharge_lapu_balance") || "5000";
        }
        updateLapuUI();
    }

    // Load initial settings
    loadPaymentSettings();

    // Bypass Developer Access Link Handler
    const unlockLink = document.getElementById("unlock-hub-link");
    if (unlockLink) {
        unlockLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.setItem("jc_digital_hub_active", "true");
            if (overlay) {
                overlay.style.display = "none";
            }
            if (paymentInputs.digitalHubActive) {
                paymentInputs.digitalHubActive.checked = true;
            }
            // Switch to API settings tab
            const apiTab = Array.from(tabs).find(t => t.dataset.target === "api-panel");
            if (apiTab) {
                apiTab.click();
            }
            const showToast = window.showToast || (window.parent && window.parent.showToast);
            if (showToast) {
                showToast("Developer access unlocked! ðŸ”“", "success");
            }
            // Broadcast changes to other windows/frames
            window.dispatchEvent(new Event("auraDataSynced"));
            if (window.parent) window.parent.dispatchEvent(new Event("auraDataSynced"));
        });
    }

    // Event listener for syncing across tabs/frames
    window.addEventListener("auraDataSynced", loadPaymentSettings);

    // Save button event listener
    const saveBtn = document.getElementById("savePaymentSettings");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const active = paymentInputs.active?.checked || false;
            const keyId = paymentInputs.keyId?.value.trim() || "";
            const hubActive = paymentInputs.digitalHubActive?.checked || false;
            
            const recActive = paymentInputs.rechargeActive?.checked || false;
            const recUrl = paymentInputs.rechargeUrl?.value.trim() || "";
            const recToken = paymentInputs.rechargeToken?.value.trim() || "";
            const recBalance = paymentInputs.rechargeBalance?.value.trim() || "5000";

            localStorage.setItem("jc_payment_api_active", active);
            localStorage.setItem("jc_razorpay_key_id", keyId);
            localStorage.setItem("jc_digital_hub_active", hubActive);
            
            localStorage.setItem("jc_recharge_api_active", recActive);
            localStorage.setItem("jc_recharge_api_url", recUrl);
            localStorage.setItem("jc_recharge_api_token", recToken);
            localStorage.setItem("jc_recharge_lapu_balance", recBalance);

            // Update overlay state dynamically
            const overlay = document.getElementById("hubComingSoon");
            if (overlay) {
                if (hubActive) {
                    overlay.style.display = "none";
                } else {
                    overlay.style.display = "flex";
                }
            }
            
            updateLapuUI();

            // Trigger success message
            if (window.AuraDialog) {
                window.AuraDialog.success(
                    "Credentials and Auto-Recharge API have been successfully saved and applied!", 
                    "Settings Updated"
                );
            } else {
                alert("Settings updated!");
            }

            addLog("Payment & Recharge API configurations updated by user.", "info");

            // Broadcast changes to other windows/frames
            window.dispatchEvent(new Event("auraDataSynced"));
            if (window.parent) window.parent.dispatchEvent(new Event("auraDataSynced"));
        });
    }

    // 1. Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.target;
            tabs.forEach(t => t.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(target).classList.add("active");
            addLog(`Switching to ${tab.innerText} module...`, "info");
        });
    });

    // 2. Logging System
    function addLog(msg, type = "default") {
        const entry = document.createElement("div");
        entry.className = "log-entry";
        const now = new Date();
        const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-msg ${type}">${msg}</span>`;
        logContainer.prepend(entry);
    }

    // 3. Mock API Engine
    async function simulateAPI(serviceName, data) {
        return new Promise((resolve) => {
            addLog(`Initiating ${serviceName} request to Bank Gateway...`, "info");
            // Loader removed per user request

            setTimeout(() => {
                const isSuccess = Math.random() > 0.1; // 90% Success Rate for Mock
                if (isSuccess) {
                    addLog(`${serviceName} request AUTHENTICATED by Gateway.`, "info");
                    setTimeout(() => {
                        resolve({ status: "Success", txnId: "TXN-" + Date.now() });
                    }, 1000);
                } else {
                    addLog(`${serviceName} request REJECTED by Bank.`, "error");
                    resolve({ status: "Failed", error: "Connection Timeout / Bank Server Busy" });
                }
            }, 2000);
        });
    }

    // Dynamic Razorpay Script Loader
    function loadRazorpayScript() {
        return new Promise((resolve, reject) => {
            if (typeof Razorpay !== 'undefined') {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error("Failed to load Razorpay SDK. Check internet/CSP."));
            document.body.appendChild(script);
        });
    }

    // Razorpay Checkout Trigger
    async function executePayment(serviceName, amount) {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return { status: "Success", txnId: "MOCK-TXN-" + Date.now() };
        }

        addLog(`Preparing Razorpay payment for ${serviceName} of \u20B9${amount}...`, "info");
        try {
            await loadRazorpayScript();
        } catch (err) {
            addLog(`Error loading Razorpay SDK: ${err.message}`, "error");
            AuraDialog.error(`Payment Gateway Error: ${err.message}`, "Payment Gateway");
            return { status: "Failed", error: err.message };
        }

        const keyId = localStorage.getItem("jc_razorpay_key_id");
        if (!keyId) {
            addLog("Razorpay Key ID not configured in Settings.", "error");
            AuraDialog.error("Razorpay Key ID is not configured! Please set it in Settings -> Payment API.", "Configuration Error");
            return { status: "Failed", error: "Key ID missing" };
        }

        return new Promise((resolve) => {
            const options = {
                "key": keyId,
                "amount": Math.round(parseFloat(amount) * 100), // in paise
                "currency": "INR",
                "name": "Joshi Choice Center",
                "description": serviceName,
                "handler": function (response) {
                    addLog(`Razorpay payment successful! ID: ${response.razorpay_payment_id}`, "info");
                    resolve({ status: "Success", txnId: response.razorpay_payment_id });
                },
                "modal": {
                    "ondismiss": function () {
                        addLog("Payment checkout cancelled by user.", "error");
                        resolve({ status: "Failed", error: "Payment cancelled by user" });
                    }
                },
                "prefill": {
                    "name": "Joshi Client",
                    "email": "client@joshichoice.com",
                    "contact": "9999999999"
                },
                "theme": {
                    "color": "#6366f1"
                },
                "config": {
                    "display": {
                        "blocks": {
                            "upi": {
                                "name": "Pay via UPI / QR Code",
                                "instruments": [
                                    {
                                        "method": "upi"
                                    }
                                ]
                            }
                        },
                        "sequence": [
                            "block.upi",
                            "block.other"
                        ],
                        "preferences": {
                            "show_default_blocks": true
                        }
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response) {
                addLog(`Payment failed! Desc: ${response.error.description}`, "error");
                resolve({ status: "Failed", error: response.error.description });
            });
            rzp.open();
        });
    }

    // Wrapper to choose between Real Razorpay and Mock API
    async function handleTransaction(serviceName, amount, additionalData = {}) {
        const isActive = localStorage.getItem("jc_payment_api_active") === "true";
        const keyId = localStorage.getItem("jc_razorpay_key_id");

        if (isActive && keyId) {
            return await executePayment(serviceName, amount);
        } else {
            return await simulateAPI(serviceName, { amount, ...additionalData });
        }
    }

    // 4. Transaction Save Helper
    function saveToGlobalDatabase(service, amount, status, txnId) {
        const txns = JSON.parse(localStorage.getItem("transactions") || "[]");
        const newTxn = {
            id: txnId,
            date: window.AuraDate ? window.AuraDate.toDDMMYYYY(new Date()) : new Date().toLocaleDateString('en-GB').replace(/\//g, "-"),
            customerName: "Banking Client",
            mobileNumber: "91XXXXXXXX",
            serviceType: "Digital Banking",
            serviceName: service,
            amount: amount,
            charge: 0,
            totalAmount: amount,
            paymentMode: "Bank API",
            status: status
        };
        txns.push(newTxn);
        localStorage.setItem("transactions", JSON.stringify(txns));
    }

    // 5. AEPS Transaction
    const btnAeps = document.getElementById("btn-aeps");
    if (btnAeps) {
        btnAeps.addEventListener("click", async () => {
            const amt = document.getElementById("aeps-amount").value.replace(/,/g, "");
            const bank = document.getElementById("aeps-bank").value;
            const aadhaar = document.getElementById("aeps-aadhaar").value;
            const serviceType = document.getElementById("aeps-service").value;

            // Validate selections
            if (!serviceType) {
                AuraDialog.warning("Please select a Service Type.", "Service Hub");
                return;
            }
            if (!bank) {
                AuraDialog.warning("Please select a Bank.", "Service Hub");
                return;
            }

            // Validate Aadhaar (Exactly 12 digits, in XXXX-XXXX-XXXX format)
            const aadhaarRegex = /^\d{4}-\d{4}-\d{4}$/;
            if (!aadhaarRegex.test(aadhaar)) {
                AuraDialog.warning("Please enter a valid 12-digit Aadhaar number (format: 1234-1234-1234)", "Validation Error");
                return;
            }

            // Validate biometric scan
            if (!biometricCapturedData) {
                AuraDialog.warning("Please scan your fingerprint first.", "Biometric Auth Required");
                return;
            }

            let txnName = "AEPS Transaction";
            let requireAmount = false;
            let successVerb = "processed";

            if (serviceType === "deposit") {
                txnName = "AEPS Deposit";
                requireAmount = true;
                successVerb = "deposited";
            } else if (serviceType === "withdrawal") {
                txnName = "AEPS Withdrawal";
                requireAmount = true;
                successVerb = "withdrawn";
            } else if (serviceType === "balance") {
                txnName = "Balance Enquiry";
                successVerb = "completed";
            } else if (serviceType === "statement") {
                txnName = "Mini Statement";
                successVerb = "completed";
            }

            if (requireAmount && !amt) {
                AuraDialog.warning("Please enter amount", "Validation Error");
                return;
            }

            const result = await handleTransaction(txnName, amt, { bank: bank });

            if (result.status === "Success") {
                addLog(`${txnName.toUpperCase()} SUCCESS: ID ${result.txnId}`, "info");
                saveToGlobalDatabase(`${txnName}: ${bank}`, amt || 0, "Success", result.txnId);

                let successMsg = `\u20B9${amt} ${successVerb} successfully via ${bank}. Transaction ID: ${result.txnId}`;
                if (!requireAmount) {
                    successMsg = `${txnName} ${successVerb} successfully via ${bank}. Transaction ID: ${result.txnId}`;
                }
                showSuccess(successMsg);

                // Reset biometric scan button and stored data
                biometricCapturedData = null;
                const scanFinger = document.getElementById("scan-finger");
                if (scanFinger) {
                    scanFinger.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c0-4.4 3.6-8 8-8s8 3.6 8 8M5 12c0-2.8 2.2-5 5-5s5 2.2 5 5M8 12c0-1.1.9-2 2-2s2 .9 2 2M21 12c0 4.4-3.6 8-8 8s-8-3.6-8-8M18 12c0 2.8-2.2 5-5 5s-5-2.2-5-5"/></svg> Scan Now`;
                    scanFinger.style.color = "";
                    scanFinger.style.borderColor = "";
                }
            } else {
                addLog(`${txnName.toUpperCase()} FAILED: ${result.error}`, "error");
                AuraDialog.error("Transaction Failed: " + result.error, "Transaction Status");
            }
        });
    }

    // 6. B2B Recharge API Simulator
    async function simulateRechargeB2BAPI(number, operator, amount) {
        return new Promise((resolve) => {
            const url = localStorage.getItem("jc_recharge_api_url") || "https://api.rechargeservice.in/v2/pay";
            const token = localStorage.getItem("jc_recharge_api_token") || "rec_tok_default";
            const cleanToken = token.length > 8 ? token.substring(0, 8) + "..." : token;

            addLog(`Connecting to B2B Gateway at: ${url}...`, "info");
            
            setTimeout(() => {
                addLog(`Authenticating session token key [${cleanToken}]...`, "info");
                
                setTimeout(() => {
                    // Check balance
                    const currentBalance = parseFloat(localStorage.getItem("jc_recharge_lapu_balance") || "5000");
                    const rechargeAmt = parseFloat(amount);
                    
                    if (currentBalance < rechargeAmt) {
                        addLog(`Gateway Error: Low Wallet Balance! Current: \u20B9${currentBalance}, Required: \u20B9${rechargeAmt}`, "error");
                        resolve({ status: "Failed", error: "Low Wallet Balance in B2B API Wallet!" });
                        return;
                    }
                    
                    const nextBalance = currentBalance - rechargeAmt;
                    localStorage.setItem("jc_recharge_lapu_balance", nextBalance.toString());
                    updateLapuUI();
                    
                    addLog(`API Wallet debit: -\u20B9${rechargeAmt} | New LAPU Balance: \u20B9${nextBalance.toFixed(2)}`, "info");
                    
                    setTimeout(() => {
                        addLog(`Routing request to operator [${operator.toUpperCase()}] network...`, "info");
                        
                        setTimeout(() => {
                            const refId = "B2B-" + Math.floor(100000 + Math.random() * 900000);
                            addLog(`Operator credit CONFIRMED. Reference ID: ${refId}`, "success");
                            
                            // Broadcast changes to sync elements across frames
                            window.dispatchEvent(new Event("auraDataSynced"));
                            if (window.parent) window.parent.dispatchEvent(new Event("auraDataSynced"));
                            
                            resolve({ status: "Success", txnId: refId });
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        });
    }

    // 6. Recharge Transaction
    const btnRecharge = document.getElementById("btn-recharge");
    if (btnRecharge) {
        btnRecharge.addEventListener("click", async () => {
            const type = document.getElementById("rec-type").value;
            const operator = document.getElementById("rec-operator").value;
            const amt = document.getElementById("rec-amount").value.replace(/,/g, "");
            const num = document.getElementById("rec-number").value;

            if (!type) {
                AuraDialog.warning("Please select a Service.", "Validation Error");
                return;
            }
            if (!operator) {
                AuraDialog.warning("Please select an Operator.", "Validation Error");
                return;
            }
            if (!num) {
                AuraDialog.warning("Please enter mobile / customer number.", "Validation Error");
                return;
            }
            if (type === "mobile") {
                const digits = num.replace(/\D/g, "");
                if (digits.length !== 12) { // 91 + 10 digits
                    AuraDialog.warning("Please enter a valid 10-digit mobile number.", "Validation Error");
                    return;
                }
            }
            if (!amt) {
                AuraDialog.warning("Please enter amount.", "Validation Error");
                return;
            }

            let result;
            const isRechargeApiActive = localStorage.getItem("jc_recharge_api_active") === "true";
            
            if (isRechargeApiActive) {
                result = await simulateRechargeB2BAPI(num, operator, amt);
            } else {
                result = await handleTransaction("Recharge", amt, { number: num });
            }

            if (result.status === "Success") {
                addLog(`RECHARGE SUCCESS: ${num} credited with \u20B9${amt}`, "info");
                saveToGlobalDatabase(`Mobile Recharge: ${operator}`, amt, "Success", result.txnId);
                showSuccess(`Recharge of \u20B9${amt} on ${num} successful. Transaction ID: ${result.txnId}`);
            } else {
                addLog(`RECHARGE FAILED: ${result.error || 'Transaction rejected'}`, "error");
                AuraDialog.error("Recharge Failed: " + (result.error || "Transaction rejected"), "Transaction Status");
            }
        });
    }

    // DMT Transaction
    const btnDmt = document.getElementById("btn-dmt");
    if (btnDmt) {
        btnDmt.addEventListener("click", async () => {
            const amt = document.getElementById("dmt-amount").value.replace(/,/g, "");
            const acc = document.getElementById("dmt-account").value;
            const ifsc = document.getElementById("dmt-ifsc").value;

            if (!amt || !acc || !ifsc) {
                AuraDialog.warning("Please enter account details and amount", "Validation Error");
                return;
            }

            const result = await handleTransaction("Money Transfer", amt, { account: acc, ifsc: ifsc });

            if (result.status === "Success") {
                addLog(`DMT SUCCESS: \u20B9${amt} transferred to Account ${acc}`, "info");
                saveToGlobalDatabase(`DMT to Acc: ${acc}`, amt, "Success", result.txnId);
                showSuccess(`\u20B9${amt} transferred successfully to Account ${acc}. Transaction ID: ${result.txnId}`);
            } else {
                addLog(`DMT FAILED: ${result.error || 'Transaction rejected'}`, "error");
                AuraDialog.error("Transaction Failed: " + (result.error || "Transaction rejected"), "Transaction Status");
            }
        });
    }

    // 7. Success Modal
    function showSuccess(msg) {
        document.getElementById("success-msg").innerText = msg;
        document.getElementById("success-modal").classList.add("active");
    }

    const closeHubModal = document.querySelector(".close-hub-modal");
    if (closeHubModal) {
        closeHubModal.addEventListener("click", () => {
            document.getElementById("success-modal").classList.remove("active");
        });
    }

    // Real Morpho RD Service Discovery & Capture Function
    async function discoverAndCaptureMorpho() {
        const ports = [11100, 11101, 11102, 11103, 11104, 11105];
        let activePort = null;

        addLog("Scanning local ports for Morpho RD Service...", "info");

        for (const port of ports) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 600); // Quick timeout per port
                
                // First try standard RDSERVICE discovery (some drivers support GET, some custom method)
                const response = await fetch(`http://127.0.0.1:${port}`, {
                    method: 'GET',
                    signal: controller.signal
                });
                clearTimeout(id);
                const text = await response.text();
                if (text.includes("<RDService") || text.includes("<rdservice")) {
                    activePort = port;
                    break;
                }
            } catch (e) {
                // Ignore connection errors and keep scanning
            }
        }

        if (!activePort) {
            throw new Error("No Morpho RD Service found. Make sure the driver is running.");
        }

        addLog(`Morpho RD Service found on port ${activePort}. Initializing scan...`, "info");

        // Standard Morpho PidOptions XML payload
        const pidOptions = `
            <PidOptions ver="1.0">
                <Opts fCount="1" fType="0" iCount="0" iType="0" pCount="0" pType="0" format="0" pidVer="2.0" timeout="10000" otp="" wadh="" posh="" env="P"/>
            </PidOptions>
        `.trim();

        // Send POST request to capture endpoint
        const captureResponse = await fetch(`http://127.0.0.1:${activePort}/rd/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml'
            },
            body: pidOptions
        });

        const captureText = await captureResponse.text();

        // Parse response XML manually (Regex to avoid cross-browser XML parser quirks)
        const errCodeMatch = captureText.match(/errCode="([^"]+)"/);
        const errInfoMatch = captureText.match(/errInfo="([^"]+)"/);
        const errCode = errCodeMatch ? errCodeMatch[1] : "-1";
        const errInfo = errInfoMatch ? errInfoMatch[1] : "Capture failed";

        if (errCode === "0") {
            return {
                success: true,
                xml: captureText,
                port: activePort
            };
        } else {
            throw new Error(`${errInfo} (Code: ${errCode})`);
        }
    }

    // 8. Fingerprint Scanner & Capture Handler
    const scanFinger = document.getElementById("scan-finger");
    if (scanFinger) {
        scanFinger.addEventListener("click", async (e) => {
            e.preventDefault();
            const btn = e.target.closest("button");

            btn.disabled = true;
            btn.innerText = "Connecting...";
            addLog("Initiating local hardware checks...", "info");

            try {
                // Try real hardware capture
                const result = await discoverAndCaptureMorpho();
                
                biometricCapturedData = result.xml;
                btn.innerHTML = "âœ“ Captured";
                btn.style.color = "#10b981";
                btn.style.borderColor = "#10b981";
                btn.disabled = false;

                // Log a snippet of the real captured XML
                const xmlSnippet = result.xml.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                addLog(`[Morpho XML Data Captured]: ${xmlSnippet.substring(0, 180)}...`, "info");
                
                const showToast = window.showToast || (window.parent && window.parent.showToast);
                if (showToast) showToast("Biometric Captured successfully! ðŸ‘¤", "success");

            } catch (err) {
                addLog(`Hardware scan failed: ${err.message}`, "error");
                addLog("Starting interactive Morpho simulation fallback...", "info");
                
                // Fallback to high-fidelity simulator scan
                btn.innerText = "Scanning...";
                setTimeout(() => {
                    biometricCapturedData = `<?xml version="1.0"?><PidData><Resp errCode="0" errInfo="Success"/><DeviceInfo dpId="Morpho.SmartChip" rdsId="Morpho.RDService"/><Skey>MOCK_SKEY_${Date.now()}</Skey><Data type="X">MOCK_BIOMETRIC_PID_BLOCK_DATA_${Math.random().toString(36).substring(7)}</Data></PidData>`;
                    
                    btn.innerHTML = "âœ“ Captured (Sim)";
                    btn.style.color = "#10b981";
                    btn.style.borderColor = "#10b981";
                    btn.disabled = false;

                    const xmlSnippet = biometricCapturedData.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    addLog(`[Simulated Morpho Data]: ${xmlSnippet.substring(0, 180)}...`, "info");

                    const showToast = window.showToast || (window.parent && window.parent.showToast);
                    if (showToast) showToast("Biometric Simulated successfully! ðŸ‘¤", "success");
                }, 1500);
            }
        });
    }

    // 9. "The Orbit" Animation Engine
    const orbitContainer = document.querySelector(".orbit-container");
    const orbitContent = document.querySelector(".orbit-content");
    const rings = document.querySelectorAll(".orbit-ring");
    const icons = document.querySelectorAll(".orbiting-icon");

    if (orbitContainer) {
        // Initial State
        gsap.set(orbitContent, { scale: 0.8, opacity: 0 });
        gsap.set(rings, { opacity: 0 });
        gsap.set(icons, { opacity: 0 });

        // Entrance
        const mainTl = gsap.timeline({ delay: 0.3 });
        mainTl.to(rings, { opacity: 1, stagger: 0.2, duration: 1 })
            .to(orbitContent, { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.7)" }, "-=0.5")
            .to(icons, { opacity: 1, duration: 0.5 }, "-=0.2");

        // Continuous Rotation
        gsap.to(".ring-1", { rotation: 360, transformOrigin: "center", duration: 15, repeat: -1, ease: "none" });
        gsap.to(".ring-2", { rotation: -360, transformOrigin: "center", duration: 25, repeat: -1, ease: "none" });
        gsap.to(".ring-3", { rotation: 360, transformOrigin: "center", duration: 35, repeat: -1, ease: "none" });

        // Orbiting Icons using simple math (since we can't easily use MotionPath without knowing if it's registered)
        function animateOrbit(element, radius, duration, direction = 1) {
            const obj = { angle: 0 };
            gsap.to(obj, {
                angle: 360 * direction,
                duration: duration,
                repeat: -1,
                ease: "none",
                onUpdate: () => {
                    const x = 250 + radius * Math.cos(obj.angle * (Math.PI / 180));
                    const y = 250 + radius * Math.sin(obj.angle * (Math.PI / 180));
                    gsap.set(element, { attr: { transform: `translate(${x}, ${y})` } });
                }
            });
        }

        animateOrbit(".icon-1", 100, 10, 1);
        animateOrbit(".icon-2", 160, 18, -1);
        animateOrbit(".icon-3", 220, 25, 1);

        // Content Pulse
        gsap.to(orbitContent, {
            boxShadow: "0 0 70px rgba(99, 102, 241, 0.2)",
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    // 10. Notify Form Logic
    const csForm = document.getElementById("cs-form");
    if (csForm) {
        csForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const btn = document.getElementById("notify-btn");
            const input = csForm.querySelector("input");

            btn.innerHTML = "Wait...";
            btn.disabled = true;

            setTimeout(() => {
                btn.style.background = "#10b981";
                btn.innerHTML = "âœ“ Done";
                input.value = "";
                input.placeholder = "We will notify you!";
                input.disabled = true;

                // Success celebration
                gsap.to(orbitContent, { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 });
            }, 1500);
        });
    }
});

