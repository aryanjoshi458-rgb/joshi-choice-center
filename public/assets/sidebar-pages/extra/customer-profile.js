/* TRENDY CUSTOMER PROFILE & TRACK TREE LOGIC */

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Get Mobile Number or Unique Key from URL
    const urlParams = new URLSearchParams(window.location.search);
    const mobileOrKey = urlParams.get('mobile');

    if (!mobileOrKey) {
        await AuraDialog.error("No customer specified!", "Access Error");
        window.location.href = "customer-directory.html";
        return;
    }

    // 2. Load Data
    const txns = JSON.parse(localStorage.getItem("transactions") || "[]");
    
    // Filter transactions by matching either the mobile number or the unique Guest Key
    const customerTxns = txns.filter(t => {
        const tMobile = (t.mobileNumber || t.mobile || "").toString().trim();
        const tName = (t.customerName || "Guest Customer").trim();
        const tAddr = (t.address || "No Address").trim();
        const tKey = tMobile ? tMobile : `GUEST_${tName.toUpperCase()}_${tAddr.toUpperCase()}`;
        
        return tKey === mobileOrKey;
    });

    if (customerTxns.length === 0) {
        await AuraDialog.warning("No records found for this profile!", "No Data");
        window.location.href = "customer-directory.html";
        return;
    }

    // Helper for robust date parsing (Supports YYYY-MM-DD, DD-MM-YYYY, and timestamps)
    const parseSafeDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        
        let d = new Date(dateStr);
        if (!isNaN(d)) return d;

        // Try manual parsing for DD-MM-YYYY formats
        if (typeof dateStr === 'string' && dateStr.includes("-")) {
            const parts = dateStr.split("-");
            // Case: DD-MM-YYYY...
            if (parts[0].length === 2 && parts[2].substring(0, 4).length === 4) {
                const year = parts[2].substring(0, 4);
                const month = parts[1];
                const day = parts[0];
                const time = parts[2].includes(" ") ? parts[2].split(" ")[1] : "";
                
                const iso = time ? `${year}-${month}-${day}T${time}` : `${year}-${month}-${day}`;
                d = new Date(iso);
                if (!isNaN(d)) return d;
            }
            // Case: YYYY-MM-DD... (Sometimes new Date fails on Safari/Old Electron with spaces)
            if (parts[0].length === 4) {
                const year = parts[0];
                const month = parts[1];
                const day = parts[2].substring(0, 2);
                const time = parts[2].includes(" ") ? parts[2].split(" ")[1] : "";
                
                const iso = time ? `${year}-${month}-${day}T${time}` : `${year}-${month}-${day}`;
                d = new Date(iso);
                if (!isNaN(d)) return d;
            }
        }
        
        return isNaN(d) ? new Date(0) : d;
    };

    // 3. Populate Hero Header
    const latestTxn = customerTxns[0];
    const isGuest = mobileOrKey.startsWith("GUEST_");
    
    document.getElementById("profileName").innerText = latestTxn.customerName || "Guest Customer";
    document.getElementById("profileMobile").innerText = isGuest ? "Guest (No Mobile)" : `+91 ${mobileOrKey}`;
    document.getElementById("avatarLetter").innerText = (latestTxn.customerName || "G").charAt(0).toUpperCase();

    const addrTxn = customerTxns.find(t => t.address && t.address !== "-");
    document.getElementById("profileAddress").innerText = addrTxn ? addrTxn.address : "Location Not Set";

    // 4. Calculate Stats & Bank Frequency
    let totalSpend = 0;
    let lastDate = new Date(0);
    const bankFreq = {};

    customerTxns.forEach(t => {
        totalSpend += Number(t.totalAmount || 0);
        const d = parseSafeDate(t.date);
        if (d > lastDate) lastDate = d;

        const sName = (t.serviceName || "").toString();
        if (sName.includes("Banking")) {
            const parts = sName.split(" - ");
            if (parts.length >= 2) {
                const bank = parts[1].trim();
                bankFreq[bank] = (bankFreq[bank] || 0) + 1;
            }
        }
    });

    const sortedBanks = Object.entries(bankFreq).sort((a,b) => b[1] - a[1]);
    if (sortedBanks.length > 0) {
        const primaryBank = sortedBanks[0][0];
        document.getElementById("profileBank").innerText = primaryBank;
        document.getElementById("profileBankChip").style.display = "flex";
    }

    document.getElementById("statVisits").innerText = customerTxns.length;
    document.getElementById("statSpend").innerText = `₹${new Intl.NumberFormat('en-IN').format(totalSpend.toFixed(0))}`;
    
    const lastDateStr = lastDate.getTime() === 0 ? "N/A" : lastDate.toLocaleDateString("en-GB").replace(/\//g, "-");
    document.getElementById("statLastDate").innerText = lastDateStr;

    // 5. Populate Track Tree (Timeline)
    const timeline = document.getElementById("txnTimeline");
    let html = "";
    
    // SORTING FIX: Ensure true chronological order (Newest First)
    // We sort by timestamp descending
    const sortedTxns = [...customerTxns].sort((a, b) => {
        const dateA = parseSafeDate(a.date);
        const dateB = parseSafeDate(b.date);
        
        // If timestamps are identical, sort by transaction ID descending
        if (dateB - dateA === 0) {
            const idA = (a.transactionId || "").replace(/\D/g, "");
            const idB = (b.transactionId || "").replace(/\D/g, "");
            return idB - idA;
        }
        return dateB - dateA;
    });

    sortedTxns.forEach(t => {
        const d = parseSafeDate(t.date);
        
        let day = "??";
        let month = "MMM";
        let timeStr = "";

        if (d.getTime() !== 0) {
            day = d.getDate();
            month = d.toLocaleString('en-US', { month: 'short' });
            timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        const statusClass = (t.status || "Success").toLowerCase();
        
        html += `
            <div class="timeline-node" style="opacity: 0; transform: translateX(-30px);">
                <div class="node-dot"></div>
                <div class="node-content">
                    <div class="node-left">
                        <div class="node-date-box">
                            <div class="date-day">${day}</div>
                            <div class="date-month">${month}</div>
                        </div>
                        <div class="node-info">
                            <h4>${t.serviceName || t.serviceType || "General Service"}</h4>
                            <p>${timeStr ? timeStr + ' • ' : ''}ID: ${t.transactionId || t.txnId || "N/A"}</p>
                        </div>
                    </div>
                    <div class="node-right">
                        <span class="node-amount">₹${Number(t.totalAmount || 0).toFixed(0)}</span>
                        <span class="status-tag tag-${statusClass}">${t.status || "Success"}</span>
                    </div>
                </div>
            </div>
        `;
    });

    timeline.innerHTML = html;

    // 6. GSAP ANIMATIONS
    if (window.gsap) {
        gsap.to(".timeline-node", {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
            delay: 0.3
        });

        gsap.from(".stat-card", {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
        });
    }
});
