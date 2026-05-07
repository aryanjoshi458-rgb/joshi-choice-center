/* 
   AURA QUANTUM - CUSTOMER INTELLIGENCE LOGIC 
   Handles Data Fetching, Stat Calculation, and Tree Rendering
*/

async function initProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const cidFromUrl = urlParams.get('cid') || urlParams.get('mobile');

    if (!cidFromUrl) {
        if (window.AuraDialog) await AuraDialog.error("No customer specified!", "Access Error");
        window.location.href = "customer-directory.html";
        return;
    }

    // Load Data from LocalStorage
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const txns = JSON.parse(localStorage.getItem("transactions") || "[]");

    const cleanMobile = (m) => (m || "").toString().replace(/^\+91\s?/, "").replace(/\D/g, "").slice(-10);

    // Find Customer
    let customer = customers.find(c => c.id === cidFromUrl);
    if (!customer) {
        const targetClean = cleanMobile(cidFromUrl);
        customer = customers.find(c => cleanMobile(c.mobile) === targetClean);
    }

    if (!customer) {
        if (window.auraSyncComplete) {
            if (window.AuraDialog) await AuraDialog.warning("Customer not found!", "No Data");
            window.location.href = "customer-directory.html";
        }
        return;
    }

    // Filter Transactions (Smart Match)
    const customerTxns = txns.filter(t => {
        if (t.customerId && t.customerId === customer.id) return true;
        const targetClean = cleanMobile(customer.mobile);
        return targetClean !== "" && cleanMobile(t.mobileNumber || t.mobile) === targetClean;
    });

    // Date Parser Helper
    const parseSafeDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        if (dateStr instanceof Date) return dateStr;

        // Try YYYY-MM-DD first (Safe for native parsing)
        if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
            let d = new Date(dateStr);
            if (!isNaN(d.getTime())) return d;
        }

        // Custom DD-MM-YYYY or other hyphenated formats
        if (typeof dateStr === 'string' && dateStr.includes("-")) {
            const parts_space = dateStr.split(" ");
            const datePart = parts_space[0];
            const timePart = parts_space.length > 1 ? parts_space[1] : "00:00:00";
            const parts = datePart.split("-");

            if (parts.length === 3) {
                let y, m, day;
                if (parts[0].length === 4) { // YYYY-MM-DD
                    y = parts[0]; m = parts[1]; day = parts[2];
                } else { // DD-MM-YYYY
                    day = parts[0]; m = parts[1]; y = parts[2];
                }

                const isoStr = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
                let d = new Date(isoStr);
                if (!isNaN(d.getTime())) return d;
            }
        }

        let d = new Date(dateStr);
        return isNaN(d.getTime()) ? new Date(0) : d;
    };

    // UI Population
    const isGuest = customer.mobile === "Guest" || customer.id.includes("WALKIN");
    const nameTextEl = document.getElementById("profileName");
    if (nameTextEl) nameTextEl.innerText = customer.name || "Walk-in Customer";
    document.getElementById("profileMobile").innerText = isGuest ? "Not Available" : customer.mobile;
    document.getElementById("avatarLetter").innerText = (customer.name || "C").charAt(0).toUpperCase();
    document.getElementById("profileAddress").innerText = customer.address || "Location Not Specified";
    document.getElementById("profileAadhar").innerText = customer.aadhar || "No Identity Linked";

    // VIP & Trust Logic
    const vipTag = document.getElementById("vipTag");
    const trustPercent = document.getElementById("trustPercent");
    const trustFill = document.getElementById("trustFill");
    const trustStatus = document.getElementById("trustStatus");

    if (vipTag) {
        if (customerTxns.length > 5) {
            vipTag.innerText = "PREMIUM NODE";
            vipTag.style.borderColor = "var(--quantum-cyan)";
            vipTag.style.color = "var(--quantum-cyan)";
        } else if (customerTxns.length > 0) {
            vipTag.innerText = "VERIFIED ENTITY";
        } else {
            vipTag.innerText = "NEW NODE";
        }
    }

    const pendingData = JSON.parse(localStorage.getItem("pendingCustomers") || "[]");
    const customerRecords = pendingData.filter(p => {
        const cleanP = (p.mobile || "").replace(/^\+91\s?/, "").replace(/\D/g, "");
        const cleanC = (customer.mobile || "").replace(/^\+91\s?/, "").replace(/\D/g, "");
        return cleanP === cleanC && cleanC !== "";
    });

    const unpaidCount = customerRecords.filter(p => p.status === "Pending").length;

    // Calculate Total Pending Amount
    let totalPendingAmount = 0;
    customerRecords.forEach(p => {
        if (p.status === "Pending") {
            totalPendingAmount += (parseInt(p.charge) || 0);
        }
    });
    const statPending = document.getElementById("statPending");
    if (statPending) {
        statPending.innerText = `₹${new Intl.NumberFormat('en-IN').format(totalPendingAmount)}`;
    }
    let score = 100;
    if (customerRecords.length > 0) {
        const paidCount = customerRecords.length - unpaidCount;
        score = Math.round((paidCount / customerRecords.length) * 100);
    } else {
        score = customerTxns.length > 0 ? 100 : 50;
    }

    if (trustPercent && trustFill && trustStatus) {
        trustPercent.innerText = `${score}%`;
        trustFill.style.width = `${score}%`;
        if (score === 100) { trustStatus.innerText = "Elite Trust"; trustStatus.style.color = "#22c55e"; }
        else if (score >= 80) { trustStatus.innerText = "Reliable Member"; trustStatus.style.color = "#4ade80"; }
        else if (score >= 50) { trustStatus.innerText = "Average Standing"; trustStatus.style.color = "#facc15"; }
        else { trustStatus.innerText = "High Risk"; trustStatus.style.color = "#ef4444"; }
    }

    // Stats Calculation
    let totalSpend = 0; let totalCharges = 0; let lastPulse = new Date(0);
    const bankFreq = {}; const simFreq = {};

    customerTxns.forEach(t => {
        totalSpend += Number(t.amount || 0);
        totalCharges += Number(t.charge || 0);
        const d = parseSafeDate(t.date);
        if (d > lastPulse) lastPulse = d;
        const sName = (t.serviceName || "").toString();
        if (sName.includes("Banking")) {
            const parts = sName.split(" - ");
            if (parts.length >= 2) { const bank = parts[1].trim(); bankFreq[bank] = (bankFreq[bank] || 0) + 1; }
        }
        if (sName.includes("Recharge") || sName.includes("Mobile")) {
            ["Jio", "Airtel", "Vi", "BSNL"].forEach(op => { if (sName.toLowerCase().includes(op.toLowerCase())) simFreq[op] = (simFreq[op] || 0) + 1; });
        }
    });

    const sortedBanks = Object.entries(bankFreq).sort((a, b) => b[1] - a[1]);
    document.getElementById("profileBank").innerText = sortedBanks.length > 0 ? sortedBanks[0][0] : "None Detected";
    const sortedSIMs = Object.entries(simFreq).sort((a, b) => b[1] - a[1]);
    document.getElementById("profileSIM").innerText = sortedSIMs.length > 0 ? sortedSIMs[0][0] : "Unknown";

    document.getElementById("statVisits").innerText = customerTxns.length;
    document.getElementById("statSpend").innerText = `₹${new Intl.NumberFormat('en-IN').format(totalSpend)}`;
    document.getElementById("statCharges").innerText = `₹${new Intl.NumberFormat('en-IN').format(totalCharges)}`;
    document.getElementById("statLastDate").innerText = lastPulse.getTime() === 0 ? "N/A" : lastPulse.toLocaleDateString("en-GB");
    document.getElementById("statAvg").innerText = `₹${customerTxns.length ? (totalSpend / customerTxns.length).toFixed(0) : 0}`;

    // LOYALTY MILESTONE CELEBRATION (10+ VISITS)
    if (customerTxns.length >= 10 && typeof confetti === 'function') {
        const triggerCelebration = () => {
            const count = 200;
            const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

            function fire(particleRatio, opts) {
                confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio)
                });
            }

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });
        };

        // Delay slightly for visual impact after page load
        setTimeout(triggerCelebration, 1000);
    }

    // Timeline Rendering
    const tree = document.getElementById("txnTimeline");
    const txnsWithIndex = customerTxns.map((t, idx) => ({ ...t, originalIndex: idx }));
    const sortedTxns = txnsWithIndex.sort((a, b) => (parseSafeDate(b.date) - parseSafeDate(a.date)) || (b.originalIndex - a.originalIndex));

    let treeHTML = "";
    sortedTxns.forEach(t => {
        const d = parseSafeDate(t.date);
        const day = d.getDate(); const month = d.toLocaleString('en-US', { month: 'short' });
        const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const sName = (t.serviceName || "").toLowerCase();
        const amt = Number(t.amount || 0); const charge = Number(t.charge || 0);
        let label1 = "Amount"; if (sName.includes("withdrawal")) label1 = "Withdrawal"; else if (sName.includes("recharge")) label1 = "Recharge"; else if (sName.includes("deposit")) label1 = "Deposit";
        const isWithdraw = sName.includes("withdrawal") || sName.includes("cash out");
        let label3 = isWithdraw ? "Cash to Customer" : "Total Received";
        let val3 = isWithdraw ? (amt - charge) : (amt + charge);

        treeHTML += `
            <div class="tree-node">
                <div class="node-time"><span>${day}</span><span>${month}</span></div>
                <div class="node-card">
                    <div class="node-main">
                        <h4>${t.serviceName || "Service Transaction"}</h4>
                        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
                            <p style="margin: 0;">ID: ${t.transactionId || "0x-SYNC"}</p>
                            <span style="font-size: 0.7rem; color: var(--quantum-cyan); opacity: 0.8; font-weight: 700;">🕒 ${time}</span>
                        </div>
                        <div class="node-details">
                            <span class="detail-pill">${label1}: ₹${amt}</span>
                            <span class="detail-pill">Charge: ₹${charge}</span>
                            <span class="detail-pill" style="color: var(--quantum-cyan)">${label3}: ₹${val3}</span>
                        </div>
                    </div>
                    <div class="node-price"><span class="amt">₹${amt}</span><span class="status">${t.status || "SUCCESS"}</span></div>
                </div>
            </div>
        `;
    });
    tree.innerHTML = treeHTML || '<div style="text-align: center; color: var(--text-secondary); padding: 40px;">No transaction history found.</div>';

    if (window.gsap) {
        gsap.from(".tree-node", { opacity: 0, x: -20, duration: 0.5, stagger: 0.05, ease: "power2.out" });
    }

    // --- EDIT NAME LOGIC ---
    const editBtn = document.getElementById("editNameBtn");
    if (editBtn && !editBtn.dataset.listenerAdded) {
        editBtn.dataset.listenerAdded = "true";
        editBtn.onclick = async () => {
            const currentName = customer.name || "";
            const newName = await AuraDialog.promptValue("Enter new name for this entity:", "Update Identity", currentName);

            if (newName && newName !== currentName) {
                if (window.AppLoader) window.AppLoader.show("Updating Identity...");

                setTimeout(() => {
                    // Update main customers list
                    const allCustomers = JSON.parse(localStorage.getItem("customers") || "[]");
                    const cIdx = allCustomers.findIndex(c => c.id === customer.id);
                    if (cIdx >= 0) {
                        allCustomers[cIdx].name = newName;
                        localStorage.setItem("customers", JSON.stringify(allCustomers));

                        // Update current session object
                        customer.name = newName;

                        // Update UI
                        if (nameTextEl) nameTextEl.innerText = newName;
                        document.getElementById("avatarLetter").innerText = newName.charAt(0).toUpperCase();

                        if (window.AppLoader) window.AppLoader.hide();
                        AuraDialog.success("Customer name has been updated successfully!", "Update Sync Complete");

                        // Note: Global Sync is handled automatically by localStorage interceptor in aura-window.js
                    } else {
                        if (window.AppLoader) window.AppLoader.hide();
                        AuraDialog.error("Could not find customer record to update.", "Sync Error");
                    }
                }, 800);
            }
        };
    }
}

let profileInitialized = false;
document.addEventListener("DOMContentLoaded", async () => {
    if (profileInitialized) return;
    profileInitialized = true;
    initProfile();

    // Listen for Disk Sync Completion
    window.addEventListener('auraDataSynced', () => {
        initProfile();
    });

    // Animations
    if (window.gsap) {
        gsap.from(".header-meta", { opacity: 0, x: -30, duration: 0.8, ease: "power2.out" });
        gsap.from(".glass-panel", { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.4");
    }
});