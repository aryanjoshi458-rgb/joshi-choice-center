/* CUSTOMER DIRECTORY LOGIC - JOSHI CHOICE CENTER */

document.addEventListener("DOMContentLoaded", () => {
    const customerGrid = document.getElementById("customerGrid");
    const customerSearch = document.getElementById("customerSearch");
    const totalCustCount = document.getElementById("totalCustCount");

    let allCustomers = [];

    // 1. DATA EXTRACTION
    function loadCustomers() {
        const txns = JSON.parse(localStorage.getItem("transactions") || "[]");
        const customerMap = new Map();

        txns.forEach(t => {
            const mobile = t.mobileNumber.toString();
            if (!customerMap.has(mobile)) {
                customerMap.set(mobile, {
                    name: t.customerName || "Customer",
                    mobile: mobile,
                    totalVisits: 0,
                    totalSpend: 0,
                    lastSeen: new Date(0),
                    address: t.address || "-"
                });
            }

            const c = customerMap.get(mobile);
            c.totalVisits += 1;
            c.totalSpend += Number(t.totalAmount || 0);
            
            const txnDate = new Date(t.date);
            if (txnDate > c.lastSeen) {
                c.lastSeen = txnDate;
                // If this is a newer txn, update name/address if they were missing
                if (t.customerName) c.name = t.customerName;
                if (t.address && t.address !== "-") c.address = t.address;
            }
        });

        allCustomers = Array.from(customerMap.values());
        
        // Calculate Top Customers (Top 5 by Spend)
        const sortedBySpend = [...allCustomers].sort((a,b) => b.totalSpend - a.totalSpend);
        const top5Threshold = sortedBySpend.length >= 5 ? sortedBySpend[4].totalSpend : 0;
        
        allCustomers.forEach(c => {
            if (c.totalSpend >= top5Threshold && c.totalSpend > 0) {
                c.isTop = true;
            }
        });

        allCustomers.sort((a, b) => b.lastSeen - a.lastSeen); // Keep newest last seen first
        
        totalCustCount.innerText = allCustomers.length;
        renderCustomers(allCustomers);
    }

    // 2. RENDERING
    function renderCustomers(data) {
        if (data.length === 0) {
            customerGrid.innerHTML = `<div class="loading-state">No customers found matching your search.</div>`;
            return;
        }

        let html = "";
        data.forEach((c, idx) => {
            const initial = c.name.charAt(0).toUpperCase();
            const lastDate = c.lastSeen.getTime() === 0 ? "N/A" : c.lastSeen.toLocaleDateString("en-GB").replace(/\//g, "-");
            const starHtml = c.isTop ? `<div class="star-badge" title="Top Customer">★</div>` : "";
            const topClass = c.isTop ? "is-top-elite" : "";
            
            html += `
                <div class="customer-card premium-shadow ${topClass}" onclick="viewProfile('${c.mobile}')" style="opacity: 0; transform: translateY(20px);">
                    ${starHtml}
                    <div class="card-top">
                        <div class="avatar">${initial}</div>
                        <div class="info">
                            <h3>${c.name}</h3>
                            <div class="mobile">+91 ${c.mobile}</div>
                        </div>
                    </div>
                    
                    <div class="card-stats">
                        <div class="stat-item">
                            <span class="val">${c.totalVisits}</span>
                            <span class="lab">Visits</span>
                        </div>
                        <div class="stat-item">
                            <span class="val">₹${c.totalSpend.toFixed(0)}</span>
                            <span class="lab">Total Spend</span>
                        </div>
                    </div>

                    <div class="card-footer">
                        <div class="last-seen">Last: ${lastDate}</div>
                        <div class="view-link">
                            <span>View Profile</span>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                    </div>
                </div>
            `;
        });

        customerGrid.innerHTML = html;

        // Animate entrance
        gsap.to(".customer-card", {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "back.out(1.7)"
        });
    }

    // 3. SEARCH LOGIC
    customerSearch.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase();
        const filtered = allCustomers.filter(c => 
            c.name.toLowerCase().includes(val) || 
            c.mobile.includes(val)
        );
        renderCustomers(filtered);
    });

    // Initial Load
    loadCustomers();
});

function viewProfile(mobile) {
    window.location.href = `customer-profile.html?mobile=${mobile}`;
}
