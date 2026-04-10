document.addEventListener("DOMContentLoaded", () => {

  const txns = JSON.parse(localStorage.getItem("transactions")) || [];
  const today = new Date();

  let totalCommission = 0;
  let totalAmount = 0;
  let totalTransactions = 0;

  txns.forEach(txn => {
    if (!txn.date) return;

    let dStr = txn.date;
    const parts = dStr.split("-");
    if (parts.length === 3) {
      // If date is saved as dd-mm-yyyy, convert to yyyy-mm-dd for parsing
      if (parts[0].length === 2 && parts[2].length === 4) {
        dStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return;

    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    if (isToday) {
      totalTransactions++;
      totalCommission += Number(txn.charge) || 0;
      totalAmount += Number(txn.totalAmount || txn.total || txn.amount) || 0;
    }
  });

  const container = document.getElementById("dashboardContainer");

  if(!container) return;

  container.innerHTML = `
  <div class="dashboard-wrapper">

    <div class="dashboard-title">
    </div>

    <div class="dashboard-grid">

      <div class="dashboard-card blue">
        <div class="icon">📑</div>
        <h3 data-i18n="total-transactions">Total Transactions Today</h3>
        <h1>${totalTransactions}</h1>
      </div>

      <div class="dashboard-card orange">
        <div class="icon">💰</div>
        <h3 data-i18n="total-business">Total Business Today</h3>
        <h1>₹${totalAmount}</h1>
      </div>

      <div class="dashboard-card green">
        <div class="icon">🪙</div>
        <h3 data-i18n="your-commission">Your Commission Today</h3>
        <h1>₹${totalCommission}</h1>
      </div>

    </div>

  </div>
  `;

});