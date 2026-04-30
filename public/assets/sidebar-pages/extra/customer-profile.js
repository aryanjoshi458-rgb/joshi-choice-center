/* 
   AURA QUANTUM - CUSTOMER INTELLIGENCE LOGIC 
   Handles Data Fetching, Stat Calculation, and Tree Rendering
*/

document.addEventListener("DOMContentLoaded", async () => {
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
    
    // Find Customer
    let customer = customers.find(c => c.id === cidFromUrl);
    if (!customer) {
        const cleanInput = cidFromUrl.replace(/^\+91\s?/, "").replace(/\D/g, "");
        customer = customers.find(c => {
            const cleanC = c.mobile.replace(/^\+91\s?/, "").replace(/\D/g, "");
            return cleanC === cleanInput;
        });
    }

    if (!customer) {
        if (window.AuraDialog) await AuraDialog.warning("Customer not found in database!", "No Data");
        window.location.href = "customer-directory.html";
        return;
    }

    // Filter Transactions
    const customerTxns = txns.filter(t => {
        if (t.customerId && t.customerId === customer.id) return true;
        const tMobile = (t.mobileNumber || t.mobile || "").toString().trim();
        const cleanTMobile = tMobile.replace(/^\+91\s?/, "").replace(/\D/g, "");
        const cleanCustMobile = customer.mobile.replace(/^\+91\s?/, "").replace(/\D/g, "");
        return cleanTMobile === cleanCustMobile && cleanCustMobile !== "";
    });

    // Date Parser Helper
    const parseSafeDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        
        // Try standard parsing first (handles YYYY-MM-DD HH:mm:ss)
        let d = new Date(dateStr);
        
        // If it fails, handle the custom DD-MM-YYYY HH:mm:ss format
        if (isNaN(d)) {
            const [datePart, timePart] = dateStr.split(" ");
            const parts = datePart.split("-");
            if (parts.length === 3) {
                // If parts[0] is DD (Length 2), convert to ISO YYYY-MM-DD
                const isoDate = parts[0].length === 2 
                    ? `${parts[2]}-${parts[1]}-${parts[0]}` 
                    : datePart;
                
                d = timePart ? new Date(`${isoDate}T${timePart}`) : new Date(isoDate);
            }
        }
        return isNaN(d) ? new Date(0) : d;
    };

    // UI Population
    const isGuest = customer.mobile === "Guest" || customer.id.includes("WALKIN");
    document.getElementById("profileName").innerText = customer.name || "Walk-in Customer";
    document.getElementById("profileMobile").innerText = isGuest ? "Not Available" : customer.mobile;
    document.getElementById("avatarLetter").innerText = (customer.name || "C").charAt(0).toUpperCase();
    document.getElementById("profileAddress").innerText = customer.address || "Location Not Specified";
    document.getElementById("profileAadhar").innerText = customer.aadhar || "No Identity Linked";

    // VIP & Trust Logic
    const vipTag = document.getElementById("vipTag");
    const trustPercent = document.getElementById("trustPercent");
    const trustFill = document.getElementById("trustFill");
    const trustStatus = document.getElementById("trustStatus");

    // 1. VIP Status
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

    // 2. Trust Score (Based on Pending Payments)
    const pendingData = JSON.parse(localStorage.getItem("pendingCustomers") || "[]");
    const customerRecords = pendingData.filter(p => {
        const cleanP = (p.mobile || "").replace(/^\+91\s?/, "").replace(/\D/g, "");
        const cleanC = (customer.mobile || "").replace(/^\+91\s?/, "").replace(/\D/g, "");
        return cleanP === cleanC && cleanC !== "";
    });

    const unpaidCount = customerRecords.filter(p => p.status === "Pending").length;
    let score = 100;
    
    if (customerRecords.length > 0) {
        const paidCount = customerRecords.length - unpaidCount;
        score = Math.round((paidCount / customerRecords.length) * 100);
    } else {
        score = customerTxns.length > 0 ? 100 : 50;
    }

    if (trustPercent && trustFill && trustStatus) {
        setTimeout(() => {
            trustPercent.innerText = `${score}%`;
            trustFill.style.width = `${score}%`;
            
            if (score === 100) {
                trustStatus.innerText = "Elite Trust";
                trustStatus.style.color = "#22c55e";
            } else if (score >= 80) {
                trustStatus.innerText = "Reliable Member";
                trustStatus.style.color = "#4ade80";
            } else if (score >= 50) {
                trustStatus.innerText = "Average Standing";
                trustStatus.style.color = "#facc15";
            } else {
                trustStatus.innerText = "High Risk";
                trustStatus.style.color = "#ef4444";
            }
        }, 500);
    }

    // Stats Calculation
    let totalSpend = 0;
    let totalCharges = 0;
    let lastPulse = new Date(0);
    const bankFreq = {};
    const simFreq = {};

    customerTxns.forEach(t => {
        const baseAmt = Number(t.amount || 0);
        const chargeAmt = Number(t.charge || 0);
        
        totalSpend += baseAmt;
        totalCharges += chargeAmt;

        const d = parseSafeDate(t.date);
        if (d > lastPulse) lastPulse = d;

        const sName = (t.serviceName || "").toString();
        if (sName.includes("Banking")) {
            const parts = sName.split(" - ");
            if (parts.length >= 2) {
                const bank = parts[1].trim();
                bankFreq[bank] = (bankFreq[bank] || 0) + 1;
            }
        }
        if (sName.includes("Recharge") || sName.includes("Mobile")) {
            const operators = ["Jio", "Airtel", "Vi", "BSNL"];
            operators.forEach(op => {
                if (sName.toLowerCase().includes(op.toLowerCase())) {
                    simFreq[op] = (simFreq[op] || 0) + 1;
                }
            });
        }
    });

    const sortedBanks = Object.entries(bankFreq).sort((a,b) => b[1] - a[1]);
    document.getElementById("profileBank").innerText = sortedBanks.length > 0 ? sortedBanks[0][0] : "None Detected";

    const sortedSIMs = Object.entries(simFreq).sort((a,b) => b[1] - a[1]);
    document.getElementById("profileSIM").innerText = sortedSIMs.length > 0 ? sortedSIMs[0][0] : "Unknown";

    document.getElementById("statVisits").innerText = customerTxns.length;
    document.getElementById("statSpend").innerText = `₹${new Intl.NumberFormat('en-IN').format(totalSpend)}`;
    document.getElementById("statCharges").innerText = `₹${new Intl.NumberFormat('en-IN').format(totalCharges)}`;
    document.getElementById("statLastDate").innerText = lastPulse.getTime() === 0 ? "N/A" : lastPulse.toLocaleDateString("en-GB");
    document.getElementById("statAvg").innerText = `₹${customerTxns.length ? (totalSpend / customerTxns.length).toFixed(0) : 0}`;

    // Tree Rendering
    const tree = document.getElementById("txnTimeline");
    
    // Sort logic: Primary = Date (Newest first), Secondary = Original Index (Newest first)
    const txnsWithIndex = customerTxns.map((t, idx) => ({ ...t, originalIndex: idx }));
    const sortedTxns = txnsWithIndex.sort((a, b) => {
        const dateDiff = parseSafeDate(b.date) - parseSafeDate(a.date);
        if (dateDiff !== 0) return dateDiff;
        return b.originalIndex - a.originalIndex;
    });
    
    let treeHTML = "";
    sortedTxns.forEach(t => {
        const d = parseSafeDate(t.date);
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        const sName = (t.serviceName || "").toLowerCase();
        const isWithdrawal = sName.includes("withdrawal") || sName.includes("withdraw");
        const amt = Number(t.amount || 0);
        const charge = Number(t.charge || 0);

        let label1 = "Amount";
        if (isWithdrawal) label1 = "Withdrawal";
        else if (sName.includes("recharge")) label1 = "Recharge";
        else if (sName.includes("deposit")) label1 = "Deposit";

        let label3 = isWithdrawal ? "Cash to Customer" : "Total Received";
        let val3 = isWithdrawal ? (amt - charge) : (amt + charge);
        
        treeHTML += `
            <div class="tree-node">
                <div class="node-time">
                    <span>${day}</span>
                    <span>${month}</span>
                </div>
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
                    <div class="node-price">
                        <span class="amt">₹${amt}</span>
                        <span class="status">${t.status || "SUCCESS"}</span>
                        <div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 5px;">${label1} Amount</div>
                    </div>
                </div>
            </div>
        `;
    });

    tree.innerHTML = treeHTML || '<div style="text-align: center; color: var(--text-secondary); padding: 40px;">No transaction history nodes found in the AURA & CYRUS database.</div>';

    // Animations
    if (window.gsap) {
        const tl = gsap.timeline();
        tl.from(".header-meta", { opacity: 0, x: -30, duration: 0.8, ease: "power2.out" })
          .from(".glass-panel", { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.4")
          .from(".tree-node", { opacity: 0, x: -20, duration: 0.5, stagger: 0.05, ease: "power2.out" }, "-=0.2");
        
        // Hover effects for cards
        document.querySelectorAll('.node-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, { scale: 1.02, duration: 0.3 });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { scale: 1, duration: 0.3 });
            });
        });
    }
});