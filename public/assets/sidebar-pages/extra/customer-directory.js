/* ADVANCED CUSTOMER DIRECTORY LOGIC - JOSHI CHOICE CENTER */

document.addEventListener("DOMContentLoaded", () => {
    const customerGrid = document.getElementById("customerGrid");
    const customerSearch = document.getElementById("customerSearch");
    const totalCustCount = document.getElementById("totalCustCount");
    const totalBusinessValue = document.getElementById("totalBusinessValue");
    const returningRate = document.getElementById("returningRate");
    const filterTabs = document.getElementById("filterTabs");
    const directorySort = document.getElementById("directorySort");

    let allCustomers = [];
    let currentFilter = "all";
    let currentSort = "lastSeen";

    // 1. DATA EXTRACTION & STATS
    function loadCustomers() {
        const txns = JSON.parse(localStorage.getItem("transactions") || "[]");
        const customerMap = new Map();
        let totalBusiness = 0;

        txns.forEach(t => {
            const mobile = t.mobileNumber.toString();
            const txnAmount = Number(t.totalAmount || 0);
            totalBusiness += txnAmount;

            if (!customerMap.has(mobile)) {
                customerMap.set(mobile, {
                    name: t.customerName || "Customer",
                    mobile: mobile,
                    totalVisits: 0,
                    totalSpend: 0,
                    lastSeen: new Date(0),
                    firstSeen: new Date(t.date || Date.now()),
                    address: t.address || "-",
                    history: [] // Store last 3 txns
                });
            }

            const c = customerMap.get(mobile);
            c.totalVisits += 1;
            c.totalSpend += txnAmount;
            
            // Manage History (Keep last 3)
            c.history.unshift({
                service: t.serviceName || "Service",
                amount: txnAmount,
                status: (t.status || "Success").toLowerCase(),
                date: t.date
            });
            if (c.history.length > 3) c.history.pop();
            
            const txnDate = new Date(t.date);
            if (txnDate > c.lastSeen) {
                c.lastSeen = txnDate;
                if (t.customerName) c.name = t.customerName;
                if (t.address && t.address !== "-") c.address = t.address;
            }
        });

        allCustomers = Array.from(customerMap.values());
        
        // Calculate Top Customers
        const sortedBySpend = [...allCustomers].sort((a,b) => b.totalSpend - a.totalSpend);
        const topThreshold = sortedBySpend.length >= 5 ? sortedBySpend[Math.floor(allCustomers.length * 0.1) || 4].totalSpend : 0;
        
        allCustomers.forEach(c => {
            if (c.totalSpend >= topThreshold && c.totalSpend > 0) c.isTop = true;
        });

        // Dashboard Stats
        totalCustCount.innerText = allCustomers.length;
        totalBusinessValue.innerText = `₹${new Intl.NumberFormat('en-IN').format(totalBusiness)}`;
        
        const returningCusts = allCustomers.filter(c => c.totalVisits > 1).length;
        const rate = allCustomers.length > 0 ? Math.round((returningCusts / allCustomers.length) * 100) : 0;
        returningRate.innerText = `${rate}%`;

        applyFiltersAndSearch();
    }

    // 2. FILTER & SORT ENGINE
    function applyFiltersAndSearch() {
        const searchTerm = customerSearch.value.toLowerCase();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        let filtered = allCustomers.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm) || c.mobile.includes(searchTerm);
            if (!matchesSearch) return false;

            if (currentFilter === "all") return true;
            if (currentFilter === "regular") return c.totalVisits >= 5;
            if (currentFilter === "top") return c.isTop;
            if (currentFilter === "new") return new Date(c.firstSeen) > thirtyDaysAgo;
            
            return true;
        });

        // Apply Sorting
        filtered.sort((a, b) => {
            if (currentSort === "lastSeen") return b.lastSeen - a.lastSeen;
            if (currentSort === "spend") return b.totalSpend - a.totalSpend;
            if (currentSort === "visits") return b.totalVisits - a.totalVisits;
            if (currentSort === "name") return a.name.localeCompare(b.name);
            return 0;
        });

        renderCustomers(filtered);
    }

    // 3. RENDERING
    function renderCustomers(data) {
        if (data.length === 0) {
            customerGrid.innerHTML = `<div class="loading-state">No customers found matching your criteria.</div>`;
            return;
        }

        let html = "";
        data.forEach(c => {
            const initial = c.name.charAt(0).toUpperCase();
            const lastDate = c.lastSeen.getTime() === 0 ? "N/A" : c.lastSeen.toLocaleDateString("en-GB").replace(/\//g, "-");
            const starHtml = c.isTop ? `<div class="star-badge" title="Top Customer">★</div>` : "";
            const topClass = c.isTop ? "is-top-elite" : "";
            
            // Build Quick Preview HTML
            let historyHtml = "";
            if (c.history && c.history.length > 0) {
                historyHtml = `<div class="quick-preview">
                    <span class="preview-title">Recent Activity</span>
                    ${c.history.map(h => `
                        <div class="preview-item">
                            <span class="p-service">${h.service}</span>
                            <div style="display:flex; align-items:center;">
                                <span class="p-amount">₹${h.amount}</span>
                                <div class="p-status ${h.status}"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
            }

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
                            <span class="val">₹${new Intl.NumberFormat('en-IN').format(c.totalSpend.toFixed(0))}</span>
                            <span class="lab">Total Spend</span>
                        </div>
                    </div>

                    ${historyHtml}

                    <div class="card-footer" style="margin-top: ${historyHtml ? '15px' : '0'}">
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

        gsap.to(".customer-card", {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "back.out(1.4)"
        });
    }

    // 4. EVENT LISTENERS
    customerSearch.addEventListener("input", applyFiltersAndSearch);

    filterTabs.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            filterTabs.querySelector(".active").classList.remove("active");
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            applyFiltersAndSearch();
        });
    });

    directorySort.addEventListener("change", (e) => {
        currentSort = e.target.value;
        applyFiltersAndSearch();
    });

    loadCustomers();
});

function viewProfile(mobile) {
    window.location.href = `customer-profile.html?mobile=${mobile}`;
}
