/* ADVANCED NOTIFICATION CENTER JS - JOSHI CHOICE CENTER */

document.addEventListener("DOMContentLoaded", () => {
    initNotificationCenter();
});

function initNotificationCenter() {
    const notifFeed = document.getElementById("notifFeed");
    const unreadBadge = document.getElementById("unreadBadge");
    const filterLinks = document.querySelectorAll(".filter-link");
    const markAllReadBtn = document.getElementById("markAllRead");
    const clearAllBtn = document.getElementById("clearAllNotifs");
    const generateSummaryBtn = document.getElementById("generateSummary");

    let currentFilter = "all";

    // 1. Load Notifications
    function getNotifications() {
        let notifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
        
        // Seed initial notifications if empty
        if (notifs.length === 0) {
            notifs = [
                {
                    id: Date.now() + 1,
                    title: "Welcome to Notification Center",
                    desc: "You can now track all your center activities, transactions, and system alerts here in real-time.",
                    cat: "system",
                    time: new Date().toISOString(),
                    read: false
                },
                {
                    id: Date.now() + 2,
                    title: "System Update: Comma Formatting",
                    desc: "The professional comma-separator feature is now active for all financial inputs.",
                    cat: "system",
                    time: new Date().toISOString(),
                    read: false
                }
            ];
            localStorage.setItem("app_notifications", JSON.stringify(notifs));
        }
        return notifs;
    }

    // 2. Render Feed
    function renderFeed() {
        const allNotifs = getNotifications();
        
        // Sort newest first
        allNotifs.sort((a, b) => new Date(b.time) - new Date(a.time));

        let filtered = allNotifs.filter(n => {
            if (currentFilter === "all") return true;
            return n.cat === currentFilter;
        });

        if (filtered.length === 0) {
            notifFeed.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔔</div>
                    <h3>No notifications found</h3>
                    <p>Try switching categories or come back later.</p>
                </div>
            `;
            unreadBadge.innerText = allNotifs.filter(n => !n.read).length;
            return;
        }

        notifFeed.innerHTML = filtered.map(n => {
            const timeStr = formatNotifTime(n.time);
            const icon = getNotifIcon(n.cat);
            
            return `
                <div class="notif-item ${n.read ? '' : 'unread'}" data-cat="${n.cat}" data-id="${n.id}">
                    <div class="notif-icon-box">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
                            ${icon}
                        </svg>
                    </div>
                    <div class="notif-content">
                        <h4 class="notif-title">${n.title}</h4>
                        <p class="notif-desc">${n.desc}</p>
                        <div class="notif-meta">
                            <span>${timeStr}</span>
                            <span>#${n.cat.toUpperCase()}</span>
                        </div>
                        ${!n.read ? `
                            <div class="notif-actions">
                                <button class="notif-btn primary" onclick="markAsRead(${n.id})">Mark as Read</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Update Global Unread Badge
        unreadBadge.innerText = allNotifs.filter(n => !n.read).length;
        
        // Entrance animation
        gsap.from(".notif-item", {
            x: -20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: "power2.out"
        });
    }

    // 3. Daily Summary Logic
    function updateDailySummary() {
        const txns = JSON.parse(localStorage.getItem("transactions") || "[]");
        const todayStr = new Date().toISOString().split("T")[0];
        
        const todayTxns = txns.filter(t => t.date === todayStr);
        const totalAmount = todayTxns.reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);
        
        document.getElementById("sumBusiness").innerText = `₹${new Intl.NumberFormat('en-IN').format(totalAmount)}`;
        document.getElementById("sumTxns").innerText = todayTxns.length;
    }

    // 4. Generate Business Summary Notification
    function generateDailySummaryNotif() {
        const txns = JSON.parse(localStorage.getItem("transactions") || "[]");
        const todayStr = new Date().toISOString().split("T")[0];
        const todayTxns = txns.filter(t => t.date === todayStr);
        
        if (todayTxns.length === 0) {
            showToast("No transactions found for today to summarize! ❌");
            return;
        }

        const totalAmount = todayTxns.reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);
        const totalCharge = todayTxns.reduce((sum, t) => sum + Number(t.charge || 0), 0);
        
        const newNotif = {
            id: Date.now(),
            title: "Daily Business Summary",
            desc: `Today's Summary: Total Transactions: ${todayTxns.length}, Business: ₹${new Intl.NumberFormat('en-IN').format(totalAmount)}, Service Profit: ₹${new Intl.NumberFormat('en-IN').format(totalCharge)}.`,
            cat: "reminder",
            time: new Date().toISOString(),
            read: false
        };

        let allNotifs = getNotifications();
        allNotifs.unshift(newNotif);
        localStorage.setItem("app_notifications", JSON.stringify(allNotifs));
        renderFeed();
        showToast("Daily summary generated! 📊");
    }

    // 5. Global Actions
    markAllReadBtn.addEventListener("click", () => {
        let allNotifs = getNotifications();
        allNotifs.forEach(n => n.read = true);
        localStorage.setItem("app_notifications", JSON.stringify(allNotifs));
        renderFeed();
        showToast("All notifications marked as read ✅");
    });

    clearAllBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all notifications?")) {
            localStorage.setItem("app_notifications", "[]");
            renderFeed();
            showToast("Notification center cleared 🗑️");
        }
    });

    generateSummaryBtn.addEventListener("click", generateDailySummaryNotif);

    filterLinks.forEach(link => {
        link.addEventListener("click", () => {
            filterLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            currentFilter = link.dataset.filter;
            renderFeed();
        });
    });

    // Helper: Mark Single as Read
    window.markAsRead = function(id) {
        let allNotifs = getNotifications();
        const idx = allNotifs.findIndex(n => n.id === id);
        if (idx !== -1) {
            allNotifs[idx].read = true;
            localStorage.setItem("app_notifications", JSON.stringify(allNotifs));
            renderFeed();
        }
    };

    // Utils
    function formatNotifTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    }

    function getNotifIcon(cat) {
        switch(cat) {
            case 'transaction': return '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 14 15 11"/>';
            case 'system': return '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>';
            case 'security': return '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';
            case 'reminder': return '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
            default: return '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>';
        }
    }

    // Initial Load
    renderFeed();
    updateDailySummary();
}
