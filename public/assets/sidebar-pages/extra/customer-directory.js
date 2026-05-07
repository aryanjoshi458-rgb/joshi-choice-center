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
    let currentView = "grid"; // grid or list

    // View Toggle Logic
    const viewToggle = document.getElementById("viewToggle");
    viewToggle?.querySelectorAll(".view-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            viewToggle.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentView = btn.dataset.view;

            // Switch container class
            if (currentView === "list") {
                customerGrid.classList.remove("customer-grid");
                customerGrid.classList.add("customer-list");
            } else {
                customerGrid.classList.remove("customer-list");
                customerGrid.classList.add("customer-grid");
            }

            applyFiltersAndSearch();
        });
    });

    // Helper for robust date parsing (Handles ISO, YYYY-MM-DD, DD-MM-YYYY with time)
    const parseSafeDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        if (dateStr instanceof Date) return dateStr;

        if (typeof dateStr === 'string') {
            const datePart = dateStr.split(" ")[0];
            const timePart = dateStr.includes(" ") ? "T" + dateStr.split(" ")[1] : "T00:00:00";
            const parts = datePart.split("-");

            if (parts.length === 3) {
                let y, m, d;
                if (parts[0].length === 4) { // YYYY-MM-DD
                    y = parts[0]; m = parts[1]; d = parts[2];
                } else if (parts[2].length === 4) { // DD-MM-YYYY
                    d = parts[0]; m = parts[1]; y = parts[2];
                }
                
                if (y && m && d) {
                    const isoStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}${timePart}`;
                    const res = new Date(isoStr);
                    if (!isNaN(res.getTime())) return res;
                }
            }
        }
        const res = new Date(dateStr);
        return isNaN(res.getTime()) ? new Date(0) : res;
    };

    // 1. DATA EXTRACTION & STATS (Optimized for CID System)
    function loadCustomers() {
        const savedCustomers = JSON.parse(localStorage.getItem("customers") || "[]");
        const txns = JSON.parse(localStorage.getItem("transactions") || "[]");
        let totalBusiness = 0;

        // Create a map of customer stats using the Unique CID
        const statsMap = new Map();
        txns.forEach(t => {
            // Priority: Transaction CID -> Derived CID (Backward compatibility)
            let cid = t.customerId;
            if (!cid) {
                const aadhar = (t.aadharNumber || "").replace(/-/g, "");
                const mobile = (t.mobileNumber || t.mobile || "").replace(/^\+91\s?/, "").replace(/\D/g, "");
                cid = aadhar.length === 12 ? "CID-A-" + aadhar : (mobile.length === 10 ? "CID-M-" + mobile : null);
            }

            if (!cid) return; // Skip guest txns with no ID

            const txnAmount = Number(t.amount || 0);
            totalBusiness += txnAmount;

            if (!statsMap.has(cid)) {
                statsMap.set(cid, {
                    totalVisits: 0,
                    totalSpend: 0,
                    lastSeen: new Date(0),
                    banks: {},
                    history: []
                });
            }

            const s = statsMap.get(cid);
            s.totalVisits += 1;
            s.totalSpend += txnAmount;

            const sName = (t.serviceName || t.serviceType || "").toString();
            if (sName.includes("Banking")) {
                const parts = sName.split(" - ");
                if (parts.length >= 2) {
                    const bankName = parts[1].trim();
                    s.banks[bankName] = (s.banks[bankName] || 0) + 1;
                }
            }

            s.history.unshift({
                service: t.serviceName || t.serviceType || "Service",
                amount: txnAmount,
                status: (t.status || "Success").toLowerCase(),
                date: t.date
            });
            if (s.history.length > 3) s.history.pop();

            const txnDate = parseSafeDate(t.date);
            if (txnDate > s.lastSeen) s.lastSeen = txnDate;
        });

        // Build the display list
        allCustomers = savedCustomers.map((c, index) => {
            const s = statsMap.get(c.id) || {
                totalVisits: 0,
                totalSpend: 0,
                lastSeen: new Date(0),
                banks: {},
                history: []
            };

            const lastVisitDate = parseSafeDate(c.lastVisit);
            const txnDate = s.lastSeen.getTime() === 0 ? lastVisitDate : s.lastSeen;

            // Use the later of the two dates (Profile Update vs Last Transaction)
            const finalLastSeen = lastVisitDate > txnDate ? lastVisitDate : txnDate;
            const sortedBanks = Object.entries(s.banks).sort((a, b) => b[1] - a[1]);

            return {
                ...c,
                originalIndex: index,
                totalVisits: s.totalVisits,
                totalSpend: s.totalSpend,
                lastSeen: finalLastSeen,
                history: s.history,
                primaryBank: sortedBanks.length > 0 ? sortedBanks[0][0] : null
            };
        });

        // Mark Top 3 with stars (on cards only)
        const sortedBySpend = [...allCustomers].sort((a, b) => b.totalSpend - a.totalSpend);
        allCustomers.forEach(c => { c.isTop = false; c.isRecent = false; });
        sortedBySpend.slice(0, 3).filter(c => c.totalSpend > 0).forEach(c => c.isTop = true);

        // ✅ Mark Newest/Current Profile (Latest Activity or Latest Added)
        const sortedByDate = [...allCustomers].sort((a, b) => (b.lastSeen - a.lastSeen) || (b.originalIndex - a.originalIndex));
        if (sortedByDate.length > 0) sortedByDate[0].isRecent = true;

        // Dashboard Stats
        totalCustCount.innerText = allCustomers.length;
        totalBusinessValue.innerText = `₹${new Intl.NumberFormat('en-IN').format(totalBusiness)}`;
        const returningCusts = allCustomers.filter(c => c.totalVisits > 1).length;
        const rate = allCustomers.length > 0 ? Math.round((returningCusts / allCustomers.length) * 100) : 0;
        returningRate.innerText = `${rate}%`;

        applyFiltersAndSearch();
    }

    function createCustomerCard(c) {
        const initial = (c.name || "Walk-in Customer").charAt(0).toUpperCase();
        const lastDate = c.lastSeen.getTime() === 0 ? "N/A" : c.lastSeen.toLocaleDateString("en-GB").replace(/\//g, "-");
        const recentClass = c.isRecent ? "is-recent-highlight" : "";
        const topClass = c.isTop ? "is-top-elite" : "";
        const avatarColor = c.isTop ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)";

        let historyHtml = "";
        if (c.history && c.history.length > 0) {
            historyHtml = `
                <div class="card-activity">
                    <p class="activity-label">LATEST ACTIVITY</p>
                    ${c.history.slice(0, 2).map(h => `
                        <div class="activity-row">
                            <span class="act-name">${h.serviceName || h.service || "Service"}</span>
                            <span class="act-amt">₹${h.amount}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="customer-card ${topClass} ${recentClass}" onclick="viewProfile('${c.id}')">
                <div class="card-glass-glow"></div>
                <div class="btn-delete-profile" onclick="deleteCustomerProfile(event, '${c.id}', '${c.name}')" title="Delete Profile">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                </div>
                
                <div class="card-header">
                    <div class="avatar-wrap">
                        <div class="avatar-main" style="background: ${avatarColor}">${initial}</div>
                        ${c.isTop ? '<div class="elite-crown">👑</div>' : ''}
                    </div>
                    <div class="header-content">
                        <h3 title="${c.name || "Walk-in Customer"}">${c.name || "Walk-in Customer"}</h3>
                        <span class="sub-text">${(c.mobile && c.mobile !== "Guest") ? c.mobile : "No Mobile Linked"}</span>
                    </div>
                </div>

                <div class="card-stats-v2">
                    <div class="stat-v2-item">
                        <span class="v2-val">${c.totalVisits}</span>
                        <span class="v2-lab">Visits</span>
                    </div>
                    <div class="stat-v2-item">
                        <span class="v2-val">₹${new Intl.NumberFormat('en-IN').format(c.totalSpend.toFixed(0))}</span>
                        <span class="v2-lab">Business</span>
                    </div>
                </div>

                <div class="card-footer-v2">
                    <div class="meta-v2">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span>${lastDate}</span>
                    </div>
                    <div class="action-chip">
                        Profile
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </div>

                ${historyHtml}
            </div>
        `;
    }

    function createCustomerRow(c) {
        const initial = (c.name || "Walk-in Customer").charAt(0).toUpperCase();
        const lastDate = c.lastSeen.getTime() === 0 ? "N/A" : c.lastSeen.toLocaleDateString("en-GB").replace(/\//g, "-");
        const recentClass = c.isRecent ? "is-recent-highlight" : "";
        const topClass = c.isTop ? "is-top-elite" : "";
        const avatarColor = c.isTop ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)";

        return `
            <div class="customer-row ${topClass} ${recentClass}" onclick="viewProfile('${c.id}')">
                <div class="card-glass-glow"></div>
                <div class="row-avatar-wrap">
                    <div class="row-avatar" style="background: ${avatarColor}">${initial}</div>
                    ${c.isTop ? '<div class="row-crown">👑</div>' : ''}
                </div>
                <div class="row-info-main">
                    <h3>${c.name || "Walk-in Customer"}</h3>
                    <span class="row-sub">${(c.mobile && c.mobile !== "Guest") ? c.mobile : "N/A"}</span>
                </div>
                <div class="row-stat-v2">
                    <span class="v2-lab">VISITS</span>
                    <span class="v2-val">${c.totalVisits}</span>
                </div>
                <div class="row-stat-v2">
                    <span class="v2-lab">BUSINESS</span>
                    <span class="v2-val">₹${new Intl.NumberFormat('en-IN').format(c.totalSpend.toFixed(0))}</span>
                </div>
                <div class="row-meta-v2">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:0.5; margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>${lastDate}</span>
                </div>
                <div class="row-action-v2">
                    <div class="action-chip">
                        Profile
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </div>
                <div class="btn-delete-profile" onclick="deleteCustomerProfile(event, '${c.id}', '${c.name}')" title="Delete Profile">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
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
            if (currentFilter === "new") return parseSafeDate(c.lastVisit) > thirtyDaysAgo;
            return true;
        });

        filtered.sort((a, b) => {
            if (currentSort === "lastSeen") {
                // FORCE Recent/Newest Profile to the very top only when sorting by Last Active
                if (a.isRecent && !b.isRecent) return -1;
                if (!a.isRecent && b.isRecent) return 1;
                
                const diff = b.lastSeen.getTime() - a.lastSeen.getTime();
                return diff !== 0 ? diff : (b.originalIndex - a.originalIndex);
            }
            if (currentSort === "spend") return b.totalSpend - a.totalSpend;
            if (currentSort === "visits") return b.totalVisits - a.totalVisits;
            if (currentSort === "name") {
                const nameA = a.name ? a.name.toLowerCase() : "";
                const nameB = b.name ? b.name.toLowerCase() : "";
                return nameA.localeCompare(nameB);
            }

            // Fallback to Creation Order
            return b.originalIndex - a.originalIndex;
        });

        renderCustomers(filtered);
    }

    function renderCustomers(data) {
        if (!customerGrid) return;
        if (data.length === 0) {
            customerGrid.innerHTML = `<div class="loading-state">No customers found.</div>`;
            return;
        }

        if (currentView === "list") {
            customerGrid.innerHTML = data.map(c => createCustomerRow(c)).join('');
        } else {
            customerGrid.innerHTML = data.map(c => createCustomerCard(c)).join('');
        }

        if (window.gsap) {
            const selector = currentView === "list" ? ".customer-row" : ".customer-card";

            // Standard stagger reveal
            gsap.from("#customerGrid " + selector, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.05,
                ease: "back.out(1.4)",
                clearProps: "all"
            });

            // ✅ Extra 1s Pop for the Recent/Current Profile
            gsap.from("#customerGrid .is-recent-highlight", {
                scale: 0.9,
                duration: 1,
                delay: 0.2,
                ease: "elastic.out(1, 0.3)",
                clearProps: "all"
            });
        }
    }

    customerSearch?.addEventListener("input", applyFiltersAndSearch);
    filterTabs?.querySelectorAll("button").forEach(btn => {
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
    
    // Alt + G for Search Focus
    window.addEventListener("keydown", (e) => {
        if (e.altKey && e.key.toLowerCase() === 'g') {
            e.preventDefault();
            customerSearch?.focus();
            
            // Subtle scroll to search box if needed
            customerSearch?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Listen for Disk Sync Completion
    const refreshDirectory = () => {
        loadCustomers();
    };
    window.addEventListener('auraDataSynced', refreshDirectory);
    if (window.auraSyncComplete) refreshDirectory();

    loadCustomers();
});

async function deleteCustomerProfile(event, cid, name) {
    if (event) event.stopPropagation();

    const confirm = window.AuraDialog ?
        await AuraDialog.confirm(`Are you sure you want to delete the profile for <b>${name}</b>? This action cannot be undone.`, "Delete Profile") :
        window.confirm(`Delete profile for ${name}?`);

    if (confirm) {
        if (window.AppLoader) window.AppLoader.show("Deleting Profile...");

        setTimeout(() => {
            let customers = JSON.parse(localStorage.getItem("customers") || "[]");
            customers = customers.filter(c => c.id !== cid);
            localStorage.setItem("customers", JSON.stringify(customers));

            if (window.AppLoader) window.AppLoader.hide();
            if (typeof showToast === "function") showToast("Profile deleted successfully. 🗑️");

            // Trigger a global sync event if needed
            window.dispatchEvent(new CustomEvent('auraDataSynced'));
        }, 600);
    }
}

function viewProfile(cid) {
    window.location.href = `customer-profile.html?cid=${encodeURIComponent(cid)}`;
}
