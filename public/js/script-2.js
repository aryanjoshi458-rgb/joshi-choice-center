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
      <td>${txn.mobile || ""}</td>
      <td>${txn.aadhar || ""}</td>
      <td>${txn.serviceType || ""}</td>
      <td>${txn.amount || ""}</td>
      <td>${txn.charge || ""}</td>
      <td>${txn.total || ""}</td>
      <td>${txn.status || "Success"}</td>
      <td>${txn.transactionId || ""}</td>
      <td>
        <div class="row-actions">
          <button class="btn-edit-s" onclick="openEditModal('${txn.transactionId}')">Edit</button>
          <button class="btn-delete-s" onclick="deleteTransactionById('${txn.transactionId}')">Delete</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
  // ✅ ADD THIS (VERY IMPORTANT)
  filterTodayData();

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
    if (!v.match(/^\d{4}-\d{2}-\d{2}$/)) return;

    const [y, m, d] = v.split("-");
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

// IS CODE SE TODAYS REPORTS ME JAB DATA BAAD ME AYEGA VO DATA LIST ME PAHLE UPER AYEGA
window.addEventListener("load", () => {
  setTimeout(() => {
    const tables = document.querySelectorAll("table");

    tables.forEach(table => {
      const heading = table.closest("div")?.innerText || "";

      if (heading.toLowerCase().includes("today")) {
        const tbody = table.querySelector("tbody");
        if (!tbody) return;

        const rows = Array.from(tbody.querySelectorAll("tr"));
        tbody.innerHTML = "";
        rows.reverse().forEach(r => tbody.appendChild(r));
      }
    });
  }, 0);
});

// IS CODE SE TODAYS REPORTS ME DATA SIRF AAJ KA HOGA 24 HOUR KA BAS
// ✅ FIXED - ONLY TODAY DATA FILTER (PRO VERSION)
function filterTodayData() {
  const today = new Date();

  const rows = document.querySelectorAll("#reportTable tbody tr");

  rows.forEach(row => {
    const dateCell = row.children[1];
    if (!dateCell) return;

    const dateText = dateCell.innerText.trim();

    // Safe format check
    if (!dateText.includes("-")) return;

    const parts = dateText.split("-");
    if (parts.length !== 3) return;

    // dd-mm-yyyy → yyyy-mm-dd
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const d = new Date(formattedDate);

    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    row.style.display = isToday ? "" : "none";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  filterTodayData();
});