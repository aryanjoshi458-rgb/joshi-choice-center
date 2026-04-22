/* TRENDY CUSTOMER PROFILE & TRACK TREE LOGIC */

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Get Mobile Number from URL
    const urlParams = new URLSearchParams(window.location.search);
    const mobile = urlParams.get('mobile');

    if (!mobile) {
        await AuraDialog.error("No customer specified!", "Access Error");
        window.location.href = "customer-directory.html";
        return;
    }

    // 2. Load Data
    const txns = JSON.parse(localStorage.getItem("transactions") || "[]");
    const customerTxns = txns.filter(t => t.mobileNumber.toString() === mobile.toString());

    if (customerTxns.length === 0) {
        await AuraDialog.warning("No transaction records found for this mobile number!", "No Records");
        window.location.href = "customer-directory.html";
        return;
    }

    // 3. Populate Hero Header
    const latestTxn = customerTxns[0];
    document.getElementById("profileName").innerText = latestTxn.customerName || "Premium Customer";
    document.getElementById("profileMobile").innerText = `+91 ${mobile}`;
    document.getElementById("avatarLetter").innerText = (latestTxn.customerName || "C").charAt(0).toUpperCase();

    const addrTxn = customerTxns.find(t => t.address && t.address !== "-");
    document.getElementById("profileAddress").innerText = addrTxn ? addrTxn.address : "Location Not Set";

    // 4. Calculate Stats
    let totalSpend = 0;
    let lastDate = new Date(0);

    customerTxns.forEach(t => {
        totalSpend += Number(t.totalAmount || 0);
        const d = new Date(t.date);
        if (d > lastDate) lastDate = d;
    });

    document.getElementById("statVisits").innerText = customerTxns.length;
    document.getElementById("statSpend").innerText = `₹${totalSpend.toFixed(0)}`;
    document.getElementById("statLastDate").innerText = lastDate.toLocaleDateString("en-GB").replace(/\//g, "-");

    // 5. Populate Track Tree (Timeline)
    const timeline = document.getElementById("txnTimeline");
    let html = "";
    
    // Sort transactions by date (newest first)
    customerTxns.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        const d = new Date(t.date);
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const statusClass = t.status.toLowerCase();
        
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
                            <p>${timeStr} • ID: ${t.transactionId || "N/A"}</p>
                        </div>
                    </div>
                    <div class="node-right">
                        <span class="node-amount">₹${Number(t.totalAmount).toFixed(0)}</span>
                        <span class="status-tag tag-${statusClass}">${t.status}</span>
                    </div>
                </div>
            </div>
        `;
    });

    timeline.innerHTML = html;

    // 6. GSAP ANIMATIONS
    gsap.to(".timeline-node", {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.3
    });

    // Animate stats cards
    gsap.from(".stat-card", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)"
    });
});
