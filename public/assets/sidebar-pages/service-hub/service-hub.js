document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".hub-tab");
    const panels = document.querySelectorAll(".hub-panel");
    const logContainer = document.getElementById("api-logs");

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
                        resolve({ status: "Success", txnId: "TXN" + Date.now() });
                    }, 1000);
                } else {
                    addLog(`${serviceName} request REJECTED by Bank.`, "error");
                    resolve({ status: "Failed", error: "Connection Timeout / Bank Server Busy" });
                }
            }, 2000);
        });
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
            const amt = document.getElementById("aeps-amount").value;
            const bank = document.getElementById("aeps-bank").value;

            if (!amt && document.getElementById("aeps-service").value === "withdrawal") {
                alert("Please enter amount");
                return;
            }

            const result = await simulateAPI("AEPS Withdrawal", { amount: amt, bank: bank });
            // Loader hide removed per user request

            if (result.status === "Success") {
                addLog(`TRANSACTION SUCCESS: ID ${result.txnId}`, "info");
                saveToGlobalDatabase(`AEPS: ${bank}`, amt, "Success", result.txnId);
                showSuccess(`₹${amt} withdrawn successfully via ${bank}. Transaction ID: ${result.txnId}`);
            } else {
                addLog(`TRANSACTION FAILED: ${result.error}`, "error");
                alert("Transaction Failed: " + result.error);
            }
        });
    }

    // 6. Recharge Transaction
    const btnRecharge = document.getElementById("btn-recharge");
    if (btnRecharge) {
        btnRecharge.addEventListener("click", async () => {
            const amt = document.getElementById("rec-amount").value;
            const num = document.getElementById("rec-number").value;

            if (!amt || !num) {
                alert("Please enter number and amount");
                return;
            }

            const result = await simulateAPI("Recharge", { amount: amt, number: num });
            // Loader hide removed per user request

            if (result.status === "Success") {
                addLog(`RECHARGE SUCCESS: ${num} credited with ₹${amt}`, "info");
                saveToGlobalDatabase("Mobile Recharge", amt, "Success", result.txnId);
                showSuccess(`Recharge of ₹${amt} on ${num} successful.`);
            } else {
                addLog(`RECHARGE FAILED`, "error");
                alert("Recharge Failed");
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

    // 8. Fingerprint Mock
    const scanFinger = document.getElementById("scan-finger");
    if (scanFinger) {
        scanFinger.addEventListener("click", (e) => {
            e.preventDefault();
            const btn = e.target.closest("button");
            btn.innerText = "Scanning...";
            addLog("Waiting for biometric input...", "info");
            setTimeout(() => {
                btn.innerHTML = "✓ Captured";
                btn.style.color = "#10b981";
                addLog("Biometric template captured successfully.", "info");
            }, 1500);
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
                btn.innerHTML = "✓ Done";
                input.value = "";
                input.placeholder = "We will notify you!";
                input.disabled = true;

                // Success celebration
                gsap.to(orbitContent, { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 });
            }, 1500);
        });
    }
});
