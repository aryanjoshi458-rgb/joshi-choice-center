window.updateTodayDashboard = function () {
  const txns = JSON.parse(localStorage.getItem("transactions")) || [];
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const pending = JSON.parse(localStorage.getItem("pendingCustomers")) || [];
  const customers = JSON.parse(localStorage.getItem("customers")) || [];
  const widgets = JSON.parse(localStorage.getItem("jc_dashboard_widgets") || '{"today":true,"earnings":false,"expenses":false,"pending":false,"clock":true,"actions":true,"stats":false,"recentTxns":true,"topServices":true,"profit":false,"notes":true}');

  const today = new Date();
  const currentD = today.getDate();
  const currentM = today.getMonth();
  const currentY = today.getFullYear();

  // 1. HELPER: Robust Date Parsing
  const parseSafeDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split(/[^0-9]/);
    if (parts.length >= 3) {
      if (parts[0].length === 4) return new Date(parts[0], parts[1] - 1, parts[2]); // YYYY-MM-DD
      return new Date(parts[2], parts[1] - 1, parts[0]); // DD-MM-YYYY
    }
    return new Date(dateStr);
  };

  const parseAmt = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(String(val).replace(/,/g, "")) || 0;
  };

  const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

  let totalCommission = 0;
  let totalAmount = 0;
  let totalTransactions = 0;
  let totalOverallEarnings = 0;
  let totalOverallExpenses = 0;
  let totalPendingAmount = 0;

  // Last 7 days analytics map
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return { date: d, commission: 0 };
  }).reverse();

  txns.forEach(txn => {
    const tDate = parseSafeDate(txn.date);
    totalOverallEarnings += parseAmt(txn.charge);

    // Today's Stats
    const isToday = tDate.getDate() === currentD && tDate.getMonth() === currentM && tDate.getFullYear() === currentY;
    if (isToday) {
      totalTransactions++;
      totalCommission += parseAmt(txn.charge);
      totalAmount += parseAmt(txn.amount);
    }

    // Last 7 Days Analytics
    last7Days.forEach(day => {
      if (tDate.getDate() === day.date.getDate() &&
        tDate.getMonth() === day.date.getMonth() &&
        tDate.getFullYear() === day.date.getFullYear()) {
        day.commission += parseAmt(txn.charge);
      }
    });
  });

  expenses.forEach(exp => {
    totalOverallExpenses += parseAmt(exp.amount);
  });

  pending.forEach(p => {
    if (p.status === "Pending") {
      totalPendingAmount += parseAmt(p.charge);
    }
  });

  const container = document.getElementById("dashboardContainer");
  if (!container) return;

  let html = `<div class="dashboard-wrapper">`;

  // --- TOP ROW: CLOCK ---
  if (widgets.clock) {
    html += `<div style="margin-bottom: 25px;">`;
    html += `
      <div class="dashboard-card clock-card" style="max-width: 400px;">
        <div class="clock-time" id="dashClockTime">00:00:00</div>
        <div class="clock-date">${today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      </div>
    `;
    html += `</div>`;
  }

  // 1. TODAY'S OVERVIEW
  if (widgets.today) {
    html += `
      <div class="dashboard-section">
        <div class="dashboard-grid">
          <div class="dashboard-card blue">
            <div class="card-header">
                <div class="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h3 data-i18n="total-transactions">Transactions Today</h3>
            </div>
            <div class="card-body">
                <h1>${totalTransactions}</h1>
                <div class="card-trend up">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    <span>Live</span>
                </div>
            </div>
          </div>
          <div class="dashboard-card orange">
            <div class="card-header">
                <div class="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                </div>
                <h3 data-i18n="total-business">Total Business</h3>
            </div>
            <div class="card-body">
                <h1 class="privacy-sensitive">${formatCurrency(totalAmount)}</h1>
                <div class="card-trend">
                    <span>Revenue</span>
                </div>
            </div>
          </div>
          <div class="dashboard-card green">
            <div class="card-header">
                <div class="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8l-8 8"></path><path d="M12 8l4 4"></path><path d="M8 12l4 4"></path></svg>
                </div>
                <h3 data-i18n="your-commission">Your Commission</h3>
            </div>
            <div class="card-body">
                <h1 class="privacy-sensitive">${formatCurrency(totalCommission)}</h1>
                <div class="card-trend safe">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span>Earned</span>
                </div>
            </div>
          </div>
          <div class="dashboard-card purple">
            <div class="card-header">
                <div class="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
                </div>
                <h3 data-i18n="pending-amount">Pending Amount</h3>
            </div>
            <div class="card-body">
                <h1 class="privacy-sensitive" style="color: #fff;">${formatCurrency(totalPendingAmount)}</h1>
                <div class="card-trend" style="background: rgba(255,255,255,0.2); color: #fff;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    <span>Outstanding</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 2. EARNINGS & ANALYSIS (Real Data)
  if (widgets.earnings) {
    const maxVal = Math.max(...last7Days.map(d => d.commission), 100);
    html += `
      <div class="dashboard-section" style="margin-top: 25px;">
        <div class="dashboard-card" style="background: var(--card-bg); border: 1px solid var(--border-color); font-family: 'Outfit', sans-serif;">
          <h3 style="margin-bottom: 20px;">📊 Earnings Analysis (Last 7 Days)</h3>
          <div style="display: flex; align-items: flex-end; gap: 15px; height: 150px; padding: 20px 0; border-bottom: 1px solid var(--border-color);">
            ${last7Days.map((d, i) => {
      const h = (d.commission / maxVal) * 100;
      return `
              <div style="flex: 1; background: ${i === 6 ? 'var(--primary-color)' : 'var(--hover-bg)'}; height: ${Math.max(5, h)}%; border-radius: 8px 8px 0 0; position: relative; transition: height 1s ease;">
                <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: 700; width: 100%; text-align: center;" class="privacy-sensitive">₹${d.commission}</div>
              </div>
              `;
    }).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 10px; color: var(--text-muted); font-size: 11px;">
            ${last7Days.map(d => `<span>${d.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 3. TWO COLUMN WIDGETS
  html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 25px;">`;

  // RECENT EXPENSES
  if (widgets.expenses) {
    const recentExp = expenses.slice(-4).reverse();
    html += `
      <div class="dashboard-card" style="background: var(--card-bg); border: 1px solid var(--border-color);">
        <h3 style="display: flex; justify-content: space-between; align-items: center;">
          Recent Expenses
          <span style="font-size: 0.6em; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 8px; border-radius: 20px;">Daily Log</span>
        </h3>
        <div style="margin-top: 15px;">
          ${recentExp.length ? recentExp.map(e => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
              <div>
                <div style="font-weight: 600; font-size: 0.9em;">${e.reason || 'Expense'}</div>
                <div style="font-size: 0.7em; color: var(--text-muted);">${e.date || ''}</div>
              </div>
              <div style="font-weight: 700; color: #ef4444;" class="privacy-sensitive">₹${e.amount}</div>
            </div>
          `).join('') : '<p style="color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;">No recent expenses found.</p>'}
        </div>
      </div>
    `;
  }

  // PENDING LIST
  if (widgets.pending) {
    const activePending = pending.filter(p => p.status !== 'Paid').slice(0, 4);
    html += `
    <div class="dashboard-card" style="background: var(--card-bg); border: 1px solid var(--border-color);">
    <h3 style="display: flex; justify-content: space-between; align-items: center;">
    Pending List
    <span style="font-size: 0.6em; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 4px 10px; border-radius: 20px;">
    Alerts
    </span>
    </h3>
    <div style="margin-top: 15px;">
    ${activePending.length ? activePending.map(p => `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
      <div>
      <div style="font-weight: 600; font-size: 0.9em;">${p.name}</div>
      <div style="font-size: 0.7em; color: var(--text-muted);">${p.work || ''}</div>
      </div>
      <div style="font-weight: 700; color: #f59e0b;" class="privacy-sensitive">₹${p.charge}</div>
      </div>
      `).join('') : '<p style="color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;">No pending payments! 🎉</p>'}
      </div>
      </div>
      `;
  }


  // QUICK ACTIONS (MOVED HERE)
  if (widgets.actions) {
    html += `
        <div class="dashboard-card" style="background: var(--card-bg); border: 1px solid var(--border-color);">
          <h3 style="display: flex; align-items: center; gap: 10px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            Quick Launch Center
          </h3>
          <div class="quick-actions-grid">
            <a href="new-customer.html" class="quick-action-btn">
              <div class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg></div>
              New Customer
            </a>
            <a href="print-receipt.html" class="quick-action-btn">
              <div class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg></div>
              Print Receipt
            </a>
            <a href="reports.html" class="quick-action-btn">
              <div class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg></div>
              View Reports
            </a>
            <a href="customer-directory.html" class="quick-action-btn">
              <div class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              Directory
            </a>
          </div>
        </div>
      `;
  }

  // SYSTEM INSIGHTS
  if (widgets.stats) {
    html += `
      <div class="dashboard-card" style="background: var(--card-bg); border: 1px solid var(--border-color);">
        <h3>System Insights</h3>
        <div class="stats-list">
          <div class="stat-item">
            <div class="stat-label">Total Transactions</div>
            <div class="stat-value">${txns.length}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Customer Database</div>
            <div class="stat-value">${customers.length}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Active Pending</div>
            <div class="stat-value">${pending.filter(p => p.status !== 'Paid').length}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">App Version</div>
            <div class="stat-value" style="color: var(--primary-color);">v3.0.0</div>
          </div>
        </div>
      </div>
    `;
  }

  // RECENT TRANSACTIONS (NEW)
  if (widgets.recentTxns) {
    const recentTxns = txns.slice(-5).reverse();
    html += `
      <div class="dashboard-card" style="background: var(--card-bg); border: 1px solid var(--border-color);">
        <h3>Recent Activity</h3>
        <div style="margin-top: 15px;">
          ${recentTxns.length ? recentTxns.map(t => {
      const name = t.customerName || t.name || "Unknown";
      const service = t.serviceName || t.serviceType || t.service || "General";
      const charge = t.charge || t.amount || 0;
      return `
              <div class="txn-mini-item">
                <div class="txn-mini-info">
                  <div class="txn-mini-name">${name}</div>
                  <div class="txn-mini-date">${t.date || ''} | ${service}</div>
                </div>
                <div class="txn-mini-amount">+₹${charge}</div>
              </div>
            `;
    }).join('') : '<p style="color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;">No recent activity.</p>'}
        </div>
      </div>
    `;
  }

  // TOP SERVICES / RATES (NEW)
  if (widgets.topServices) {
    const rates = JSON.parse(localStorage.getItem("serviceRates") || "[]").slice(0, 4);
    html += `
      <div class="dashboard-card" style="background: var(--card-bg); border: 1px solid var(--border-color);">
        <h3>Service Rates</h3>
        <div style="margin-top: 15px;">
          ${rates.length ? rates.map(r => `
            <div class="service-item">
              <div class="service-name">${r.name || 'Service'}</div>
              <div class="service-rate">₹${r.price || r.rate || 0}</div>
            </div>
          `).join('') : `
            <div class="service-item"><div class="service-name">Aadhaar Print</div><div class="service-rate">₹50</div></div>
            <div class="service-item"><div class="service-name">Pan Card</div><div class="service-rate">₹200</div></div>
            <div class="service-item"><div class="service-name">Money Transfer</div><div class="service-rate">₹25</div></div>
            <div class="service-item"><div class="service-name">Photo Studio</div><div class="service-rate">₹100</div></div>
          `}
        </div>
      </div>
    `;
  }

  // PROFIT OVERVIEW
  if (widgets.profit) {
    const total = totalOverallEarnings + totalOverallExpenses || 1;
    const earnPerc = (totalOverallEarnings / total) * 100;
    const expPerc = (totalOverallExpenses / total) * 100;

    html += `
      <div class="dashboard-card" style="background: var(--card-bg); border: 1px solid var(--border-color);">
        <h3>Profit & Balance</h3>
        <div style="margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">Net Profit</span>
            <span style="font-weight: 800; color: #10b981;">+${formatCurrency(totalOverallEarnings - totalOverallExpenses)}</span>
          </div>
          <div class="profit-bar-container">
            <div class="profit-bar-fill earnings" style="width: ${earnPerc}%"></div>
            <div class="profit-bar-fill expenses" style="width: ${expPerc}%"></div>
          </div>
          <div class="profit-legend">
            <span style="color: #10b981;">● Income</span>
            <span style="color: #ef4444;">● Expense</span>
          </div>
        </div>
      </div>
    `;
  }

  // QUICK NOTES (NEW)
  if (widgets.notes) {
    const savedNotes = localStorage.getItem("jc_dash_notes") || "";
    html += `
      <div class="dashboard-card" style="background: var(--card-bg); border: 1px solid var(--border-color);">
        <h3 style="display: flex; justify-content: space-between; align-items: center;">
          Quick Notes
          <span style="font-size: 0.6em; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 4px 8px; border-radius: 20px;">Saved</span>
        </h3>
        <textarea class="notes-area" id="dashNotes" placeholder="Write something important..." oninput="localStorage.setItem('jc_dash_notes', this.value)">${savedNotes}</textarea>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 8px; text-align: right;">Auto-saves instantly</div>
      </div>
    `;
  }

  html += `</div></div>`; // Close grid and wrapper
  container.innerHTML = html;

  // Initialize Clock if widget exists
  if (widgets.clock) {
    if (window.dashClockInterval) clearInterval(window.dashClockInterval);
    window.dashClockInterval = setInterval(() => {
      const now = new Date();
      const clockEl = document.getElementById("dashClockTime");
      if (clockEl) {
        clockEl.innerText = now.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } else {
        clearInterval(window.dashClockInterval);
      }
    }, 1000);
  }
};

// Listen for focus to refresh data
window.addEventListener("focus", () => {
  if (typeof window.updateTodayDashboard === "function") {
    window.updateTodayDashboard();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  window.updateTodayDashboard();
});

// Initial run
window.updateTodayDashboard();