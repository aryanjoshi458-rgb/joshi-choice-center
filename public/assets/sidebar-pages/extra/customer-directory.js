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

    // Helper for robust date parsing
    const parseSafeDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        let d = new Date(dateStr);
        if (!isNaN(d)) return d;
        if (typeof dateStr === 'string' && dateStr.includes("-")) {
            const parts = dateStr.split("-");
            if (parts[0].length === 2 && parts[2].substring(0, 4).length === 4) {
                const year = parts[2].substring(0, 4);
                const month = parts[1];
                const day = parts[0];
                const time = parts[2].includes(" ") ? parts[2].split(" ")[1] : "";
                const iso = time ? `${year}-${month}-${day}T${time}` : `${year}-${month}-${day}`;
                d = new Date(iso);
            } else if (parts[0].length === 4) {
                const year = parts[0];
                const month = parts[1];
                const day = parts[2].substring(0, 2);
                const time = parts[2].includes(" ") ? parts[2].split(" ")[1] : "";
                const iso = time ? `${year}-${month}-${day}T${time}` : `${year}-${month}-${day}`;
                d = new Date(iso);
            }
        }
        return isNaN(d) ? new Date(0) : d;
    };

    // 1. DATA EXTRACTION & STATS
    function loadCustomers() {
        const txns = JSON.parse(localStorage.getItem("transactions") || "[]");
        const customerMap = new Map();
        let totalBusiness = 0;

        const ALLOWED_CATEGORIES = [
            "Banking & Financial Services",
            "Mobile & Utility Services"
        ];

        txns.forEach(t => {
            const sName = (t.serviceName || t.serviceType || "").toString();
            const isAllowed = ALLOWED_CATEGORIES.some(cat => sName.includes(cat));
            if (!isAllowed) return;

            const mobile = (t.mobileNumber || t.mobile || "").toString().trim();
            const rawName = (t.customerName || "Guest Customer").trim();
            const rawAddr = (t.address || "No Address").trim();
            const customerKey = mobile ? mobile : `GUEST_${rawName.toUpperCase()}_${rawAddr.toUpperCase()}`;
            
            const txnAmount = Number(t.totalAmount || 0);
            totalBusiness += txnAmount;

            if (!customerMap.has(customerKey)) {
                customerMap.set(customerKey, {
                    name: rawName,
                    mobile: mobile || "Guest",
                    key: customerKey,
                    totalVisits: 0,
                    totalSpend: 0,
                    lastSeen: new Date(0),
                    firstSeen: parseSafeDate(t.date),
                    address: rawAddr,
                    banks: {},
                    history: [] 
                });
            }

            const c = customerMap.get(customerKey);
            c.totalVisits += 1;
            c.totalSpend += txnAmount;

            if (sName.includes("Banking")) {
                const parts = sName.split(" - ");
                if (parts.length >= 2) {
                    const bankName = parts[1].trim();
                    c.banks[bankName] = (c.banks[bankName] || 0) + 1;
                }
            }
            
            c.history.unshift({
                service: t.serviceName || t.serviceType || "Service",
                amount: txnAmount,
                status: (t.status || "Success").toLowerCase(),
                date: t.date
            });
            if (c.history.length > 3) c.history.pop();
            
            const txnDate = parseSafeDate(t.date);
            if (txnDate > c.lastSeen) {
                c.lastSeen = txnDate;
                if (t.customerName) c.name = t.customerName;
                if (t.address && t.address !== "-") c.address = t.address;
            }
        });

        allCustomers = Array.from(customerMap.values()).map(c => {
            const sortedBanks = Object.entries(c.banks).sort((a,b) => b[1] - a[1]);
            c.primaryBank = sortedBanks.length > 0 ? sortedBanks[0][0] : null;
            return c;
        });
        
        // Mark Top 3 with stars (on cards only)
        const sortedBySpend = [...allCustomers].sort((a,b) => b.totalSpend - a.totalSpend);
        allCustomers.forEach(c => c.isTop = false);
        sortedBySpend.slice(0, 3).filter(c => c.totalSpend > 0).forEach(c => c.isTop = true);

        // Dashboard Stats
        totalCustCount.innerText = allCustomers.length;
        totalBusinessValue.innerText = `₹${new Intl.NumberFormat('en-IN').format(totalBusiness)}`;
        const returningCusts = allCustomers.filter(c => c.totalVisits > 1).length;
        const rate = allCustomers.length > 0 ? Math.round((returningCusts / allCustomers.length) * 100) : 0;
        returningRate.innerText = `${rate}%`;

        applyFiltersAndSearch();
    }

    function createCustomerCard(c) {
        const initial = (c.name || "C").charAt(0).toUpperCase();
        const lastDate = c.lastSeen.getTime() === 0 ? "N/A" : c.lastSeen.toLocaleDateString("en-GB").replace(/\//g, "-");
        const starHtml = c.isTop ? `<div class="star-badge" title="Top 3 Customer">★</div>` : "";
        const topClass = c.isTop ? "is-top-elite" : "";
        const isGuest = c.mobile === "Guest";
        
        const bankHtml = c.primaryBank ? `
            <div class="preferred-bank">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
                <span>${c.primaryBank}</span>
            </div>
        ` : "";

        let historyHtml = "";
        if (c.history && c.history.length > 0) {
            historyHtml = `<div class="quick-preview">
                ${c.history.map(h => `
                    <div class="preview-item">
                        <span class="p-service">${h.service}</span>
                        <div style="display:flex; align-items:center;">
                            <span class="p-amount">₹${h.amount}</span>
                            <div class="p-status ${(h.status || 'success').toLowerCase()}"></div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        return `
            <div class="customer-card premium-shadow ${topClass}" onclick="viewProfile('${isGuest ? c.key : c.mobile}')" style="opacity: 1;">
                ${starHtml}
                <div class="card-top">
                    <div class="avatar ${isGuest ? 'guest-avatar' : ''}">${initial}</div>
                    <div class="info">
                        <h3>${c.name}</h3>
                        <div class="mobile">${isGuest ? 'Guest User' : '+91 ' + c.mobile}</div>
                        ${bankHtml}
                    </div>
                </div>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="val">${c.totalVisits}</span>
                        <span class="lab">Visits</span>
                    </div>
                    <div class="stat-item">
                        <span class="val">₹${new Intl.NumberFormat('en-IN').format(c.totalSpend.toFixed(0))}</span>
                        <span class="lab">Spent</span>
                    </div>
                </div>
                ${historyHtml}
                <div class="card-footer">
                    <div class="last-seen">Last: ${lastDate}</div>
                    <div class="view-link">
                        <span>Profile</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </div>
            </div>
        `;
    }

    function applyFiltersAndSearch() {
        const searchTerm = (customerSearch?.value || "").toLowerCase();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        let filtered = allCustomers.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm) || c.mobile.includes(searchTerm);
            if (!matchesSearch) return false;

            if (currentFilter === "all") return true;
            if (currentFilter === "regular") return c.totalVisits >= 3;
            if (currentFilter === "top") return c.isTop;
            if (currentFilter === "new") return c.firstSeen > thirtyDaysAgo;
            return true;
        });

        filtered.sort((a, b) => {
            if (currentSort === "lastSeen") return b.lastSeen - a.lastSeen;
            if (currentSort === "spend") return b.totalSpend - a.totalSpend;
            if (currentSort === "visits") return b.totalVisits - a.totalVisits;
            if (currentSort === "name") return a.name.localeCompare(b.name);
            return 0;
        });

        renderCustomers(filtered);
    }

    function renderCustomers(data) {
        if (!customerGrid) return;
        if (data.length === 0) {
            customerGrid.innerHTML = `<div class="loading-state">No customers found.</div>`;
            return;
        }

        customerGrid.innerHTML = data.map(c => createCustomerCard(c)).join('');
        
        if (window.gsap) {
            gsap.to("#customerGrid .customer-card", {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: "back.out(1.4)"
            });
        }
    }

    customerSearch?.addEventListener("input", applyFiltersAndSearch);
    filterTabs?.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const active = filterTabs.querySelector(".active");
            if (active) active.classList.remove("active");
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            applyFiltersAndSearch();
        });
    });
    directorySort?.addEventListener("change", (e) => {
        currentSort = e.target.value;
        applyFiltersAndSearch();
    });

    loadCustomers();
});

function viewProfile(mobileOrKey) {
    window.location.href = `customer-profile.html?mobile=${encodeURIComponent(mobileOrKey)}`;
}
