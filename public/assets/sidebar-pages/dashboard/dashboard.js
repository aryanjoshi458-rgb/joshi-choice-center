window.updateTodayDashboard = function () {
  const txns = JSON.parse(localStorage.getItem("transactions")) || [];
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const pending = JSON.parse(localStorage.getItem("pendingCustomers")) || [];
  const widgets = JSON.parse(localStorage.getItem("jc_dashboard_widgets") || '{"today":true,"earnings":true,"expenses":true,"pending":true}');
  
  const today = new Date();
  const currentD = today.getDate();
  const currentM = today.getMonth();
  const currentY = today.getFullYear();
  
  // Helper to parse numbers with commas
  const parseAmt = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(String(val).replace(/,/g, "")) || 0;
  };

  let totalCommission = 0;
  let totalAmount = 0;
  let totalTransactions = 0;

  txns.forEach(txn => {
    if (!txn.date) return;
    
    let isMatched = false;
    
    // Strategy 1: Date Object Parsing
    const checkDate = new Date(txn.date);
    if (!isNaN(checkDate.getTime())) {
        if (checkDate.getDate() === currentD &&
            checkDate.getMonth() === currentM &&
            checkDate.getFullYear() === currentY) {
            isMatched = true;
        }
    }
    
    // Strategy 2: Manual String Split Check (DD-MM-YYYY or YYYY-MM-DD)
    if (!isMatched) {
        const parts = txn.date.split(/[^0-9]/);
        if (parts.length >= 3) {
            const p1 = parseInt(parts[0]);
            const p2 = parseInt(parts[1]);
            const p3 = parseInt(parts[2]);
            
            // Case 1: DD-MM-YYYY
            if (p1 === currentD && p2 === (currentM + 1) && p3 === currentY) isMatched = true;
            // Case 2: YYYY-MM-DD
            if (p1 === currentY && p2 === (currentM + 1) && p3 === currentD) isMatched = true;
        }
    }

    if (isMatched) {
      totalTransactions++;
      totalCommission += parseAmt(txn.charge);
      totalAmount += parseAmt(txn.amount);
    }
  });

  const container = document.getElementById("dashboardContainer");
  if (!container) return;

  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  let html = `<div class="dashboard-wrapper">`;

  // 1. TODAY'S OVERVIEW
  if (widgets.today) {
    html += `
      <div class="dashboard-section">
        <div class="dashboard-grid">
          <div class="dashboard-card blue">
            <div class="icon">📑</div>
            <h3 data-i18n="total-transactions">Transactions Today</h3>
            <h1>${totalTransactions}</h1>
          </div>
          <div class="dashboard-card orange">
            <div class="icon">💰</div>
            <h3 data-i18n="total-business">Total Business</h3>
            <h1 class="privacy-sensitive">₹${totalAmount.toLocaleString('en-IN')}</h1>
          </div>
          <div class="dashboard-card green">
            <div class="icon">🪙</div>
            <h3 data-i18n="your-commission">Your Commission</h3>
            <h1 class="privacy-sensitive">₹${totalCommission.toLocaleString('en-IN')}</h1>
          </div>
        </div>
      </div>
    `;
  }

  // 2. EARNINGS & ANALYSIS
  if (widgets.earnings) {
    html += `
      <div class="dashboard-section" style="margin-top: 25px;">
        <div class="dashboard-card" style="background: var(--card-bg); border: 1px solid var(--border-color);">
          <h3>📊 Earnings Analysis</h3>
          <div style="display: flex; align-items: flex-end; gap: 15px; height: 150px; padding: 20px 0; border-bottom: 1px solid var(--border-color);">
            ${[40, 70, 45, 90, 65, 85, 100].map((h, i) => `
              <div style="flex: 1; background: ${i === 6 ? 'var(--primary-color)' : 'var(--hover-bg)'}; height: ${h}%; border-radius: 8px 8px 0 0; position: relative;">
                <div style="absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: 700;" class="privacy-sensitive">${Math.floor(h * totalCommission / 100)}</div>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 10px; color: var(--text-muted); font-size: 11px;">
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
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

  html += `</div></div>`; // Close grid and wrapper
  container.innerHTML = html;
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