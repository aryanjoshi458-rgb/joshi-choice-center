document.addEventListener("DOMContentLoaded", () => {

  /* =============================
     TRANSACTION ID AUTO (OFF)
     Managed by script.js
  ============================= */


  /* =============================
     DELETE TRANSACTION (REMOVED)
     Now managed via centralized script.js: deleteTransactionById
  ============================= */


});


function renderTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const tbody = document.querySelector("#transactionTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  transactions.forEach((txn, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${txn.date || ""}</td>
      <td>${txn.customerName || ""}</td>
      <td>${txn.mobileNumber || txn.mobile || ""}</td>
      <td>${txn.aadharNumber || txn.aadhar || ""}</td>
      <td>${txn.serviceType || ""}</td>
      <td>${txn.amount || ""}</td>
      <td>${txn.charge || ""}</td>
      <td>${txn.total || ""}</td>
      <td>${txn.status || "Success"}</td>
      <td>${txn.transactionId || ""}</td>
      <td>
        <div class="row-actions">
          <button class="btn-edit-s" title="Edit" onclick="openEditModal('${txn.transactionId}')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-delete-s" title="Delete" onclick="deleteTransactionById('${txn.transactionId}')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
  // ✅ Dashboard update
  updateTodayDashboard();
}

// === Report Table Layout Fix (permanent) ===
window.addEventListener("load", () => {
  const table = document.querySelector("table");
  if (!table) return;

  table.style.width = "100%";
  table.style.tableLayout = "auto";
  table.style.borderCollapse = "collapse";

  const wrapper = table.parentElement;
  if (wrapper) {
    wrapper.style.overflowX = "auto";
    wrapper.style.width = "100%";
  }

  requestAnimationFrame(() => {
    table.style.display = "table";
  });

  console.log("✅ Report table layout fixed (permanent)");
});

// 
function formatDateDDMMYYYY() {
  document.querySelectorAll("table tbody tr").forEach(row => {
    const dateCell = row.querySelector("td:nth-child(2)"); // SN ke baad Date
    if (!dateCell) return;

    const v = dateCell.innerText.trim();
    // Match YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
    const match = v.match(/^(\d{4})-(\d{2})-(\d{2})(.*)$/);
    if (!match) return;

    const [_, y, m, d] = match;
    dateCell.innerText = `${d}-${m}-${y}`;
  });
}
window.addEventListener("load", () => {
  setTimeout(formatDateDDMMYYYY, 300);
});

function openPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  document.getElementById(pageId).classList.add('active');
}

// Printing flow logic removed, now managed in script.js




document.addEventListener("DOMContentLoaded", () => {
  // layout is already managed by window.load
});