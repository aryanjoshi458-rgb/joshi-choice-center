console.log("📄 Reports page loaded");

window.allReportsData = [];
window.filteredReportsData = [];

document.addEventListener("DOMContentLoaded", () => {
  loadReports();
  initSearchAndFilter();
});
/* =========================
   LOAD REPORTS
========================= */
function loadReports() {
  // latest data first
  const reports = (JSON.parse(localStorage.getItem("transactions")) || []).reverse();
  window.allReportsData = reports; // ✅ Store globally
  const tbody = document.getElementById("reportsTableBody");

  if (!tbody) {
    console.error("❌ reportsTableBody not found");
    return;
  }

  tbody.innerHTML = "";

  if (reports.length === 0) {
    tbody.innerHTML = `<tr class="no-data-row"><td colspan="14" style="text-align:center;">No Reports Found</td></tr>`;
    filteredReportsData = []; // ✅ Clear globally
    return;
  }

  reports.forEach((r, index) => {
    const customer = r.customerName || r.name || "-";
    const mobile = r.mobileNumber || r.mobile || "-";
    const aadhar = r.aadharNumber || r.aadhar || "-";
    const address = r.address || "-";
    const service = r.serviceName || r.serviceType || r.service || "-";
    const amount = Number(r.amount) || 0;
    const charge = Number(r.charge) || 0;
    const total = Number(r.totalAmount) || Number(r.total) || (amount + charge);
    const status = (r.status || "Pending").toLowerCase();
    const txnId = r.transactionId || r.txnId || r.txn || r.id || "-";
    const date = formatDate(r.date);

    // ✅ CATEGORY BADGE LOGIC
    let catClass = "";
    let catIcon = "📄";
    if (service.toLowerCase().includes("banking")) { catClass = "banking"; catIcon = "🏦"; }
    else if (service.toLowerCase().includes("recharge") || service.toLowerCase().includes("mobile")) { catClass = "recharge"; catIcon = "📱"; }
    else if (service.toLowerCase().includes("print")) { catClass = "printing"; catIcon = "🖨️"; }

    let statusClass = "pending";
    if (status === "success") statusClass = "paid";
    else if (status === "failed") statusClass = "failed";

    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${reports.length - index}</td>
      <td>${date}</td>
      <td>${customer}</td>
      <td>${mobile}</td>
      <td>${aadhar}</td>
      <td>${address}</td>
      <td><span class="service-badge ${catClass}"><i>${catIcon}</i> ${service}</span></td>
      <td>${amount}</td>
      <td>${charge}</td>
      <td>${total}</td>
      <td>${r.paymentMode || "Cash"}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td>${txnId}</td>
      <td class="report-actions">
        <button class="btn btn-profile" title="View Profile" onclick="window.location.href='customer-profile.html?mobile=${mobile}'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>
        <button class="btn btn-edit" title="Edit Record" onclick="openEditModal('${txnId}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </button>
        <button class="btn btn-print" title="Print Receipt" onclick="printReportRow('${txnId}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        </button>
        <button class="btn btn-delete" title="Delete record" onclick="deleteReport('${txnId}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // ✅ Trigger Pagination
  if (typeof window.refreshPagination === "function") {
    window.refreshPagination();
  }

  // ✅ PREMIUM STAGGERED REVEAL
  setTimeout(() => {
    if (window.gsap && document.querySelectorAll(".report-actions .btn").length > 0) {
      gsap.from(".report-actions .btn", {
        scale: 0.7,
        opacity: 0,
        y: 10,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.out(1.7)",
        clearProps: "all"
      });
    }
  }, 100);
}

/* =========================
   DELETE TRANSACTION
========================= */
async function deleteReport(id) {
  const confirmed = await AuraDialog.confirm("Are you sure you want to delete this report?", "Delete Confirmation", true);
  if (!confirmed) return;

  let reports = JSON.parse(localStorage.getItem("transactions")) || [];
  const initialCount = reports.length;

  reports = reports.filter(r =>
    (r.transactionId || r.txnId || r.id || "").toString() !== id.toString()
  );

  if (reports.length < initialCount) {
    localStorage.setItem("transactions", JSON.stringify(reports));
    loadReports();
    if (typeof showToast === "function") showToast("Record Deleted 🗑️");
  } else {
    await AuraDialog.error("Record not found.", "Error");
  }
}


/* =========================
   DATE FORMAT FIX
========================= */
function formatDate(dateStr) {

  if (!dateStr) return "-";

  // ✅ HANDLE "22-03-2026" or "2026-04-24"
  let cleanDate = dateStr;
  if (cleanDate.includes(" ")) cleanDate = cleanDate.replace(" ", "T"); // Convert to ISO-like format for better parsing

  const d = new Date(cleanDate);

  if (isNaN(d.getTime())) {
    // Last ditch effort: if it's "2026-04-24 17:14:23", split and try date part
    const datePart = dateStr.split(" ")[0];
    if (datePart.includes("-")) {
      const parts = datePart.split("-");
      if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD -> DD-MM-YYYY
        if (parts[2].length === 4) return datePart; // Already DD-MM-YYYY
      }
    }
    return dateStr || "-";
  }

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  // Show only date
  return `${dd}-${mm}-${yyyy}`;

  return `${dd}-${mm}-${yyyy}`;
}

/* =========================
   SEARCH + FILTER INIT
========================= */
function initSearchAndFilter() {

  const box = document.getElementById("bestSearch");
  const toggle = document.getElementById("bestToggle");
  const input = document.getElementById("bestInput");
  const clear = document.getElementById("bestClear");
  const filter = document.getElementById("reportStatusFilter");

  if (!box || !input) return;

  // OPEN SEARCH
  toggle?.addEventListener("click", () => {
    box.classList.add("active");
    input.focus();
  });

  // CLOSE SEARCH
  document.addEventListener("click", (e) => {
    if (!box.contains(e.target)) {
      box.classList.remove("active");
    }
  });

  // CLEAR SEARCH
  clear?.addEventListener("click", () => {
    input.value = "";
    applyFilter();
    input.focus();
  });

  // EVENTS
  input.addEventListener("input", applyFilter);
  filter?.addEventListener("change", applyFilter);
  document.getElementById("monthFilter")?.addEventListener("change", applyFilter);

  // ✅ CATEGORY TABS (NEW)
  const tabs = document.querySelectorAll(".cat-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      window.currentCategoryFilter = tab.dataset.category;
      applyFilter();
    });
  });

  // Initial Apply
  setTimeout(applyFilter, 100);

  // ✅ Set Current Month by Default
  const monthFilter = document.getElementById("monthFilter");
  if (monthFilter && !monthFilter.value) {
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    monthFilter.value = currentMonth;
  }

  // Initial Apply
  setTimeout(applyFilter, 100);
}

/* =========================
   FILTER FUNCTION (SYNCED)
========================= */
function applyFilter() {
  const searchValue = document.getElementById("bestInput")?.value.toLowerCase() || "";
  const statusValue = document.getElementById("reportStatusFilter")?.value || "all";
  const selectedMonth = document.getElementById("monthFilter")?.value || "";
  const catFilter = window.currentCategoryFilter || "all";

  const rows = document.querySelectorAll("#reportsTable tbody tr");
  window.filteredReportsData = []; // ✅ Reset before re-populating

  window.allReportsData.forEach((r, idx) => {
    // We match against the same logic used in the loop below
    const customer = (r.customerName || "").toLowerCase();
    const mobile = (r.mobileNumber || "").toLowerCase();
    const service = (r.serviceName || r.serviceType || "").toLowerCase();
    const txnId = (r.transactionId || r.txnId || r.id || "").toString().toLowerCase();
    const statusText = (r.status || "Pending").toLowerCase();

    // Search matches
    const matchSearch = !searchValue ||
      customer.includes(searchValue) ||
      mobile.includes(searchValue) ||
      service.includes(searchValue) ||
      txnId.includes(searchValue);

    // Status matches
    const matchStatus = statusValue === "all" || statusText.includes(statusValue);

    // Month matches
    const dateStr = r.date || "";
    let rowMonth = "";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      // Handle dd-mm-yyyy or yyyy-mm-dd
      rowMonth = (parts[0].length === 2) ? parts[1] : parts[1];
    }
    const matchMonth = !selectedMonth || rowMonth === selectedMonth;

    // Category match (NEW)
    const matchCat = catFilter === "all" || service.includes(catFilter.toLowerCase());

    if (matchSearch && matchStatus && matchMonth && matchCat) {
      window.filteredReportsData.push(r);
    }
  });

  // Now hide/show the DOM rows based on index
  // (Note: allReportsData is already reversed to match table order)
  rows.forEach((row, idx) => {
    const r = window.allReportsData[idx];
    if (!r) return;

    const customer = (r.customerName || "").toLowerCase();
    const mobile = (r.mobileNumber || "").toLowerCase();
    const service = (r.serviceName || r.serviceType || "").toLowerCase();
    const txnId = (r.transactionId || r.txnId || r.id || "").toString().toLowerCase();
    const statusText = (r.status || "Pending").toLowerCase();

    const matchSearch = !searchValue ||
      customer.includes(searchValue) ||
      mobile.includes(searchValue) ||
      service.includes(searchValue) ||
      txnId.includes(searchValue);
    const matchStatus = statusValue === "all" || statusText.includes(statusValue);

    const dateStr = r.date || "";
    let rowMonth = "";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      rowMonth = (parts[0].length === 2) ? parts[1] : parts[1];
    }
    const matchMonth = !selectedMonth || rowMonth === selectedMonth;

    const matchCat = catFilter === "all" || service.includes(catFilter.toLowerCase());

    row.style.display = (matchSearch && matchStatus && matchMonth && matchCat) ? "" : "none";
  });

  // Always update metrics after filtering
  updateSummaryMetrics();

  // ✅ Trigger Pagination Refresh
  if (typeof window.refreshPagination === "function") {
    window.refreshPagination();
  }
}

/* =========================
   UPDATE SUMMARY METRICS
========================= */
function updateSummaryMetrics() {
  let totalCommission = 0;
  let totalBusiness = 0;
  let transactionCount = 0;

  const rows = document.querySelectorAll("#reportsTable tbody tr");

  rows.forEach(row => {
    // Skip if no-data placeholder or hidden
    if (row.classList.contains("no-data-row") || row.style.display === "none") return;

    const chargeCell = row.querySelector("td:nth-child(9)");
    const totalCell = row.querySelector("td:nth-child(10)");

    const charge = parseFloat(chargeCell?.textContent.replace(/[^\d.]/g, "")) || 0;
    const total = parseFloat(totalCell?.textContent.replace(/[^\d.]/g, "")) || 0;

    totalCommission += charge;
    totalBusiness += total;
    transactionCount++;
  });

  document.getElementById("commissionValue").innerText = "₹" + totalCommission.toLocaleString();
  document.getElementById("totalBusinessValue").innerText = "₹" + totalBusiness.toLocaleString();
  document.getElementById("totalTransactionsValue").innerText = transactionCount;

  // ✅ UPDATE POCKET CARDS (Real-time category breakdown)
  let bankingTotal = 0;
  let rechargeTotal = 0;
  let otherTotal = 0;

  window.allReportsData.forEach(r => {
    const s = (r.serviceName || r.serviceType || "").toLowerCase();
    const t = Number(r.totalAmount) || (Number(r.amount) + Number(r.charge));

    if (s.includes("banking")) bankingTotal += t;
    else if (s.includes("recharge") || s.includes("mobile")) rechargeTotal += t;
    else otherTotal += t;
  });

  document.getElementById("bankingTotal").innerText = "₹" + bankingTotal.toLocaleString();
  document.getElementById("rechargeTotal").innerText = "₹" + rechargeTotal.toLocaleString();
  document.getElementById("otherTotal").innerText = "₹" + otherTotal.toLocaleString();
}


// (Cleanup: removed redundant listeners already handled by applyFilter)


/* =========================
   PRINT TRANSACTION (MODAL)
========================= */
let currentModalTxn = null;

window.printReportRow = async function (id) {
  const reports = JSON.parse(localStorage.getItem("transactions")) || [];
  currentModalTxn = reports.find(r => (r.transactionId || r.txnId || r.id).toString() === id.toString());

  if (!currentModalTxn) {
    await AuraDialog.error("Transaction not found!", "Error");
    return;
  }

  document.getElementById("printModal").style.display = "flex";
  updateModalPreview();
}

window.closePrintModal = function () {
  document.getElementById("printModal").style.display = "none";
}

window.updateModalPreview = function () {
  if (!currentModalTxn) return;
  const format = document.getElementById("modalFormat").value;
  const size = document.getElementById("modalSize").value;
  const content = generateReceiptText(currentModalTxn, format);

  const preview = document.getElementById("modalPreview");
  const shop = JSON.parse(localStorage.getItem("shopProfile")) || { name: "JOSHI CHOICE CENTER" };
  preview.innerHTML = `<div style="font-weight:bold; text-align:center; border-bottom:1px solid #ccc; margin-bottom:5px; padding-bottom:5px;">${shop.name}</div>` + content;
  preview.className = "receipt-preview size-" + size;
}

window.printFromModal = function () {
  const content = document.getElementById("modalPreview").innerText;
  const size = document.getElementById("modalSize").value;
  openInternalPrintWindow(content, size);
}

/* =========================
   FULL SEARCH PRINT MODAL
========================= */
window.openFullPrintModal = function () {
  document.getElementById("searchPrintModal").style.display = "flex";
  document.getElementById("modalSearchInput").value = "";
  document.getElementById("modalSearchList").innerHTML = "";
  document.getElementById("searchModalControls").style.display = "none";
}

window.closeSearchPrintModal = function () {
  document.getElementById("searchPrintModal").style.display = "none";
}

window.searchInModal = function () {
  const val = document.getElementById("modalSearchInput").value.toLowerCase();
  const reports = JSON.parse(localStorage.getItem("transactions")) || [];

  if (val.length < 2) {
    document.getElementById("modalSearchList").innerHTML = "";
    return;
  }

  const res = reports.filter(t =>
    (t.customerName || "").toLowerCase().includes(val) ||
    (t.mobileNumber || "").includes(val) ||
    (t.transactionId || t.txnId || t.id || "").toString().toLowerCase().includes(val)
  );

  let html = "";
  res.slice(0, 10).forEach(t => {
    const id = t.transactionId || t.txnId || t.id;
    html += `
      <div class="search-item" onclick="selectFromSearchList('${id}')">
        <span>${t.customerName}</span>
        <span class="txn">${id}</span>
      </div>
    `;
  });

  document.getElementById("modalSearchList").innerHTML = html || "<div style='padding:10px'>No results found</div>";
}

let searchModalSelectedTxn = null;

window.selectFromSearchList = function (id) {
  const reports = JSON.parse(localStorage.getItem("transactions")) || [];
  searchModalSelectedTxn = reports.find(r => (r.transactionId || r.txnId || r.id).toString() === id.toString());

  if (!searchModalSelectedTxn) return;

  document.getElementById("searchModalControls").style.display = "block";
  document.getElementById("modalSearchList").innerHTML = "";
  updateSearchModalPreview();
}

window.updateSearchModalPreview = function () {
  if (!searchModalSelectedTxn) return;
  const format = document.getElementById("searchModalFormat").value;
  const size = document.getElementById("searchModalSize").value;
  const content = generateReceiptText(searchModalSelectedTxn, format);

  const preview = document.getElementById("searchModalPreview");
  const shop = JSON.parse(localStorage.getItem("shopProfile")) || { name: "JOSHI CHOICE CENTER" };
  preview.innerHTML = `<div style="font-weight:bold; text-align:center; border-bottom:1px solid #ccc; margin-bottom:5px; padding-bottom:5px;">${shop.name}</div>` + content;
  preview.className = "receipt-preview size-" + size;
}

window.printFromSearchModal = function () {
  const content = document.getElementById("searchModalPreview").innerText;
  const size = document.getElementById("searchModalSize").value;
  openInternalPrintWindow(content, size);
}

/* =========================
   CORE PRINT HELPERS
========================= */
function generateReceiptText(t, f) {
  // Load settings
  const ps = JSON.parse(localStorage.getItem("printSettings")) || {
    title: "TAX INVOICE",
    header: "OFFICIAL RECEIPT",
    footer1: "Thank You",
    footer2: "Please Visit Again",
    showContact: true,
    showAddress: true,
    taxId: "",
    terms: "",
    showTax: false,
    logoScale: 100
  };

  const shop = JSON.parse(localStorage.getItem("shopProfile")) || {
    name: "JOSHI CHOICE CENTER",
    address: "Kodapar Square (Main)"
  };

  const date = formatDate(t.date);
  const txnId = t.transactionId || t.txnId || t.id || "-";
  const name = t.customerName || "-";
  const service = t.serviceName || t.serviceType || "-";
  const amount = Number(t.amount || 0).toFixed(2);
  const charge = Number(t.charge || 0).toFixed(2);
  const total = Number(t.totalAmount || (Number(amount) + Number(charge))).toFixed(2);
  const status = (t.status || "Paid").toUpperCase();
  const mobile = t.mobileNumber || "-";
  const pMode = t.paymentMode || "Cash";

  const showContact = ps.showContact ? `Mobile: ${mobile}` : "";
  const showAddress = ps.showAddress ? shop.address : "";
  let out = "";
  if (f == 1) {
    out = `
${ps.header}
-------------------------
Date: ${date}
Txn: ${txnId}

Customer: ${name}
${showContact}

Service: ${service}

Amount: Rs. ${amount}
Charge: Rs. ${charge}
-------------------------
Total: Rs. ${total}
Mode: ${pMode}

Status: ${status}
-------------------------
${ps.footer1}
`;
  } else if (f == 2) {
    out = `
*************************
     ${ps.title}
*************************
ID   : ${txnId}
Date : ${date}
-------------------------
Customer : ${name}
Service  : ${service}
-------------------------
Amount   : Rs. ${amount}
Charge   : Rs. ${charge}
-------------------------
NET TOTAL: Rs. ${total}
Mode     : ${pMode}
-------------------------
Status   : ${status}
-------------------------
   ${ps.footer1}
   ${ps.footer2}
*************************
`;
  } else if (f == 3) {
    out = `
    ${ps.header}
=========================
DATE : ${date}
TXN  : ${txnId}
NAME : ${name}
SVC  : ${service}
=========================
AMOUNT : Rs. ${amount}
CHARGE : Rs. ${charge}
TOTAL  : Rs. ${total}
=========================
STATUS : ${status}
      ${ps.footer1}
=========================
`;
  } else if (f == 4) {
    out = `
-------------------------
${date} | ${txnId}

Name: ${name}
Svc : ${service}

Net : Rs. ${total}

-- ${ps.footer1} --
`;
  } else if (f == 5) {
    out = `
-------------------------
    ${ps.title}
-------------------------
${showAddress}

Trans ID : ${txnId}
Date     : ${date}
-------------------------
Customer Details:
Name   : ${name}
${showContact}
-------------------------
Service Details:
Description: ${service}
-------------------------
Payment Details:
Base Amount : Rs. ${amount}
Service Chg : Rs. ${charge}
Net Payable : Rs. ${total}
Payment Mode: ${pMode}
-------------------------
Status : ${status}
-------------------------
  ${ps.footer2}
-------------------------
`;
  } else if (f == 6) {
    // MODERN COLORFUL DESIGN (HTML) - RESPECTS GLOBAL SETTINGS
    const ps = JSON.parse(localStorage.getItem("printSettings")) || {};
    const logoImg = (ps.showLogo !== false && shop.logo) ? `<img src="${shop.logo}" style="height: 40px; margin-bottom: 10px;">` : "";
    const showShopAddress = ps.showAddress !== false ? `<div style="font-size: 0.8em; color: #64748b; margin-top: 2px;">${showAddress}</div>` : "";
    const showContactRow = ps.showContact !== false ? `<div style="font-size: 0.9em; color: #64748b; margin-top: 4px;"><span style="color: #4f46e5;">📞</span> ${mobile}</div>` : "";
    const paymentModeRow = ps.showPaymentMode !== false ? `
      <div style="display: flex; justify-content: space-between; font-size: 0.9em; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e2e8f0; color: #1e293b; font-weight: 700;">
        <span>Payment Mode:</span>
        <span style="color: #4f46e5;">${pMode.toUpperCase()}</span>
      </div>` : "";
    
    const termsSection = ps.terms ? `
      <div style="margin-top: 15px; padding: 10px; border-top: 1px solid #f1f5f9; font-size: 0.75em; color: #94a3b8; line-height: 1.4; background: rgba(0,0,0,0.02); border-radius: 8px;">
        <strong style="color: #64748b; display: block; margin-bottom: 3px;">Terms & Conditions:</strong>
        ${ps.terms}
      </div>` : "";

    out = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 5px; color: #1e293b; white-space: normal;">
  <div style="text-align: center; margin-bottom: 15px;">
    ${logoImg}
    <div style="font-size: 1.3em; font-weight: 800; color: #f8fafc; text-transform: uppercase; letter-spacing: 1px;">${shop.name}</div>
    ${showShopAddress}
  </div>

  <div style="background: linear-gradient(135deg, #4f46e5, #818cf8); color: white; padding: 12px; border-radius: 12px; text-align: center; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);">
    <div style="font-size: 1.1em; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">${ps.title || "TAX INVOICE"}</div>
    <div style="font-size: 0.8em; opacity: 0.9; margin-top: 3px;">${ps.header || "OFFICIAL RECEIPT"}</div>
  </div>
  
  <div style="display: flex; justify-content: space-between; font-size: 0.8em; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
    <div><strong>Date:</strong> ${date}</div>
    <div><strong>TXN:</strong> <span style="color: #4f46e5; font-weight: bold;">${txnId}</span></div>
  </div>

  <div style="background: #f8fafc; padding: 12px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #4f46e5;">
    <div style="font-size: 0.7em; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Customer Details</div>
    <div style="font-size: 1.1em; font-weight: 800; color: #1e293b;">${name}</div>
    ${showContactRow}
  </div>

  <div style="background: #f0f9ff; padding: 12px; border-radius: 10px; margin-bottom: 15px; border: 1px solid #bae6fd;">
    <div style="font-size: 0.7em; font-weight: 700; color: #0ea5e9; text-transform: uppercase; margin-bottom: 5px;">Service Details</div>
    <div style="font-size: 1em; font-weight: 600; color: #0369a1; line-height: 1.4;">${service}</div>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 15px;">
     <div style="display: flex; justify-content: space-between; font-size: 0.9em; margin-bottom: 5px; color: #475569;">
       <span>Base Amount:</span>
       <span>₹${amount}</span>
     </div>
     <div style="display: flex; justify-content: space-between; font-size: 0.9em; margin-bottom: 5px; color: #475569;">
       <span>Service Charges:</span>
       <span>₹${charge}</span>
     </div>
     ${paymentModeRow}
  </div>

  <div style="background: #1e293b; color: white; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <div style="font-size: 0.75em; opacity: 0.8; text-transform: uppercase;">Total Paid</div>
      <div style="font-size: 1.4em; font-weight: 800;">₹${total}</div>
    </div>
    <div style="background: ${status === 'SUCCESS' || status === 'PAID' ? '#10b981' : '#f59e0b'}; padding: 6px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 800;">${status}</div>
  </div>

  ${termsSection}

  <div style="text-align: center; margin-top: 20px; font-size: 0.8em; color: #94a3b8; font-style: italic;">
    <div style="margin-bottom: 2px;">${ps.footer1 || "Thank You"}</div>
    <div>${ps.footer2 || "Please Visit Again"}</div>
  </div>
</div>
`;
  } else if (f == 7) {
    // PROFESSIONAL BUSINESS PRO (COLORFUL TABLE) - UPDATED WITH BRANDING
    const statusColor = (status === 'SUCCESS' || status === 'PAID') ? '#10b981' : '#f59e0b';
    const logoImg = shop.logo ? `<img src="${shop.logo}" style="height: 35px; margin-right: 10px;">` : "";
    out = `
<div style="font-family: sans-serif; color: #e2e8f0; line-height: 1.4; white-space: normal;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
    <div style="display: flex; align-items: center;">
      ${logoImg}
      <div>
        <div style="font-size: 1.2em; font-weight: 800; color: #f8fafc; text-transform: uppercase;">${shop.name}</div>
        <div style="font-size: 0.75em; color: #94a3b8;">${showAddress}</div>
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 1.1em; font-weight: 700; color: #4f46e5;">${ps.title}</div>
      <span style="background: ${statusColor}15; color: ${statusColor}; padding: 3px 8px; border-radius: 4px; font-size: 0.7em; font-weight: 800; border: 1px solid ${statusColor}40;">${status}</span>
    </div>
  </div>

  <table style="width: 100%; font-size: 0.85em; margin-bottom: 15px; color: #94a3b8;">
    <tr>
      <td>Invoice No: <span style="color: #f8fafc; font-weight: 600;">#${txnId}</span></td>
      <td style="text-align: right;">Date: <span style="color: #f8fafc; font-weight: 600;">${date}</span></td>
    </tr>
  </table>

  <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; margin-bottom: 15px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 0.85em;">
      <tr style="background: rgba(255,255,255,0.05); color: #f8fafc;">
        <th style="text-align: left; padding: 10px;">Description</th>
        <th style="text-align: right; padding: 10px;">Total</th>
      </tr>
      <tr>
        <td style="padding: 10px; color: #e2e8f0; font-weight: 600;">${service}</td>
        <td style="padding: 10px; text-align: right; font-weight: 700; color: #f8fafc;">₹${total}</td>
      </tr>
    </table>
  </div>

  <div style="text-align: right; font-size: 0.9em; margin-bottom: 20px; color: #94a3b8;">
    <div style="margin-bottom: 4px;">Base Amount: <span style="color: #f8fafc;">₹${amount}</span></div>
    <div style="margin-bottom: 4px;">Service Charges: <span style="color: #f8fafc;">₹${charge}</span></div>
    <div style="font-size: 1.1em; font-weight: 800; color: #4f46e5; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">Amount Paid: ₹${total}</div>
  </div>

  <div style="background: rgba(245, 158, 11, 0.05); border: 1px dashed rgba(245, 158, 11, 0.3); padding: 8px; border-radius: 6px; font-size: 0.75em; color: #f59e0b; margin-bottom: 15px;">
    <strong>Payment Details:</strong> Paid via ${pMode}
  </div>

  <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; font-size: 0.8em; color: #64748b; font-style: italic;">
    ${ps.footer1}
  </div>
</div>
`;
  }

  // ADD DETAILING (NEW) - Only for non-HTML formats (1-5)
  if (f <= 5) {
    if (ps.taxId) out = `GST: ${ps.taxId}\n` + out.trimStart();
    if (ps.terms) out = out.trimEnd() + `\n\n- TERMS & CONDITIONS -\n${ps.terms}`;
  } else {
    // For HTML formats, add GST and Terms if present
    if (ps.taxId || ps.terms) {
      let extra = `<div style="margin-top: 15px; font-size: 0.75em; border-top: 1px dashed #ccc; padding-top: 10px; color: #666;">`;
      if (ps.taxId) extra += `<div><strong>GSTIN:</strong> ${ps.taxId}</div>`;
      if (ps.terms) extra += `<div style="margin-top: 5px;"><strong>Terms:</strong> ${ps.terms}</div>`;
      extra += `</div>`;
      out += extra;
    }
  }

  return out;
}

function openInternalPrintWindow(content, size) {
  const iframe = document.getElementById("printFrame");
  if (!iframe) {
    console.error("printFrame not found!");
    return;
  }

  const isA4 = size.startsWith("a4");
  const orientation = size === "a4-l" ? "landscape" : "portrait";
  const maxWidth = size === "58" ? "260px" : size === "80" ? "340px" : "100%";
    const doc = iframe.contentWindow.document;
  const shop = JSON.parse(localStorage.getItem("shopProfile")) || { name: "JOSHI CHOICE CENTER" };
  const ps = JSON.parse(localStorage.getItem("printSettings")) || { logoScale: 100 };
  const fontSize = ps.fontSize || "12px";
  const logoHtml = shop.logo ? `<div style="text-align:center;"><img src="${shop.logo}" style="width:${ps.logoScale || 100}%; max-width:100%; margin-bottom:10px;"></div>` : "";
  const shopNameHeader = `<div style="font-size:1.2em; font-weight:bold; text-align:center; margin-bottom:5px;">${shop.name}</div>`;
  
  // Detect if content is HTML (new formats 6 & 7)
  const isHtml = content.trim().startsWith("<div");
  const bodyStyle = isHtml ? "font-family: sans-serif; margin:0; padding:10px; background:white;" : "font-family: monospace; margin:0; padding:10px; background:white;";
  const contentStyle = isHtml ? "" : "white-space: pre-line;";

  doc.open();
  doc.write(`
<html>
<head>
<style>
@page { size: ${isA4 ? 'A4 ' + orientation : 'auto'}; margin: ${isA4 ? '20mm' : '0'}; }
body{ ${bodyStyle} }
.wrapper{ max-width:${maxWidth}; margin:auto; }
.receipt{ ${contentStyle} font-size:${fontSize}; }
</style>
</head>
<body onload="window.print()">
<div class="wrapper">
${logoHtml}
${!isHtml ? shopNameHeader : ""}
<div class="receipt">${content}</div>
</div>
</body>
</html>
`);
  doc.close();
}


window.openPdfModal = async function () {
  if (filteredReportsData.length === 0) {
    await AuraDialog.warning("No records to export!", "Empty Report");
    return;
  }

  const headers = ["SN", "Date", "Customer", "Mobile", "Aadhar", "Address", "Service", "Amount", "Charge", "Total", "Mode", "Status", "TXN ID"];

  let tableHtml = `<table class="pdf-report-table"><thead><tr>`;
  headers.forEach(h => tableHtml += `<th>${h}</th>`);
  tableHtml += `</tr></thead><tbody>`;

  filteredReportsData.forEach((r, idx) => {
    const globalIdx = filteredReportsData.length - idx;
    const amount = Number(r.amount) || 0;
    const charge = Number(r.charge) || 0;
    const total = Number(r.totalAmount) || (amount + charge);

    tableHtml += `<tr>
      <td>${globalIdx}</td>
      <td>${formatDate(r.date)}</td>
      <td>${r.customerName || "-"}</td>
      <td>${r.mobileNumber || "-"}</td>
      <td>${r.aadharNumber || "-"}</td>
      <td>${r.address || "N/A"}</td>
      <td>${r.serviceName || r.serviceType || "-"}</td>
      <td>${amount}</td>
      <td>${charge}</td>
      <td>${total}</td>
      <td>${r.paymentMode || "Cash"}</td>
      <td>${(r.status || "Pending").toUpperCase()}</td>
      <td>${r.transactionId || "-"}</td>
    </tr>`;
  });
  tableHtml += `</tbody></table>`;

  const reportContent = `
    <div class="pdf-report-container">
      <div class="pdf-report-header">
        <h1>JOSHI CHOICE CENTER</h1>
        <p>Professional Service Report | Transaction Details</p>
      </div>
      
      <div class="pdf-report-meta">
        <span>📅 <strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</span>
        <span>📊 <strong>Total Records:</strong> ${filteredReportsData.length}</span>
      </div>

      ${tableHtml}

      <div class="pdf-report-footer">
        <p>© ${new Date().getFullYear()} Joshi Choice Center - Authentic Digital Services</p>
      </div>
    </div>
  `;

  const orientation = document.getElementById("pdfOrientation")?.value || "landscape";
  const isPortrait = orientation === "portrait";

  document.getElementById("pdfPreviewArea").innerHTML = reportContent;
  document.getElementById("pdfPreviewArea").className = `pdf-preview-area ${orientation}`;
  document.getElementById("pdfModal").style.display = "flex";

  // ✅ Hide Top Elements for Immersive Preview
  const elementsToHide = ["sidebarToggle", "assistantSpeaker", "themeToggleV4", "assistantSpeaker"];
  elementsToHide.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.visibility = "hidden";
  });

  // ✅ Prevent Body Scroll
  document.body.style.overflow = "hidden";
};

window.closePdfModal = function () {
  document.getElementById("pdfModal").style.display = "none";

  // ✅ Restore Top Elements
  const elementsToShow = ["sidebarToggle", "assistantSpeaker", "themeToggleV4"];
  elementsToShow.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.visibility = "visible";
  });

  // ✅ Restore Body Scroll
  document.body.style.overflow = "";
};

window.downloadPdfFromModal = async function () {
  const element = document.getElementById("pdfPreviewArea");

  if (typeof html2pdf === 'undefined') {
    await AuraDialog.error("PDF library not loaded properly. Please refresh the page.", "System Error");
    return;
  }

  const btn = document.querySelector("#pdfModal .btn-print-final");
  const originalText = btn.innerText;
  btn.innerText = "⏳ Downloading...";
  btn.disabled = true;

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Joshi_Choice_Center_Report_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: document.getElementById("pdfOrientation")?.value || 'landscape' },
    pagebreak: { mode: 'css', avoid: 'tr' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    btn.innerText = originalText;
    btn.disabled = false;

    // ✅ Wait for the user to finish with the Save Dialog
    const handleCompletion = () => {
      // 1. Close the modal only AFTER they are done saving/cancelling
      closePdfModal();

      // 2. Show the professional success toast
      if (typeof showToast === "function") {
        showToast("PDF Export Process Finished ✅");
      }

      window.removeEventListener('focus', handleCompletion);
    };

    // Add listener to detect when focus returns to the app
    window.addEventListener('focus', handleCompletion);

    // Fallback: If for some reason focus doesn't fire, we still want to re-enable things
    setTimeout(() => {
      btn.disabled = false;
      btn.innerText = originalText;
    }, 500);

  }).catch(async err => {
    console.error("PDF Download Error:", err);
    btn.innerText = originalText;
    btn.disabled = false;
    await AuraDialog.error("Failed to download PDF. Please try again.", "Download Error");
  });
};

/* =========================
   EDIT TRANSACTION LOGIC
========================= */
window.openEditModal = async function (id) {
  const reports = JSON.parse(localStorage.getItem("transactions")) || [];
  const t = reports.find(r => (r.transactionId || r.txnId || r.id).toString() === id.toString());

  if (!t) {
    await AuraDialog.error("Transaction not found!", "Error");
    return;
  }

  // Populate fields
  document.getElementById("editTxnId").value = id;

  // Date conversion for <input type="date">
  let dateVal = t.date;
  const editDateInput = document.getElementById("editDate");

  if (dateVal.includes("-") && dateVal.split("-")[0].length === 2) {
    // Already in DD-MM-YYYY
    if (editDateInput.type === "date") {
      const parts = dateVal.split("-");
      dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`; // to YYYY-MM-DD
    }
  } else if (dateVal.includes("-") && dateVal.split("-")[0].length === 4) {
    // In YYYY-MM-DD
    if (editDateInput.type === "text") {
      const parts = dateVal.split("-");
      dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`; // to DD-MM-YYYY
    }
  }
  editDateInput.value = dateVal;

  document.getElementById("editName").value = t.customerName || "";
  document.getElementById("editMobile").value = t.mobileNumber || "";
  document.getElementById("editAadhar").value = t.aadharNumber || "";
  document.getElementById("editAddress").value = t.address || "";
  document.getElementById("editService").value = t.serviceName || t.serviceType || "";
  document.getElementById("editAmount").value = t.amount || 0;
  document.getElementById("editCharge").value = t.charge || 0;

  const paymentModeEl = document.getElementById("editPaymentMode");
  if (paymentModeEl) paymentModeEl.value = t.paymentMode || "Cash";

  document.getElementById("editStatus").value = t.status || "Success";

  // New Fields
  const targetIdEl = document.getElementById("editTargetId");
  if (targetIdEl) targetIdEl.value = t.targetId || "";

  const externalRefEl = document.getElementById("editExternalRef");
  if (externalRefEl) externalRefEl.value = t.externalRefNo || "";

  document.getElementById("editModal").style.display = "flex";
}

window.closeEditModal = function () {
  document.getElementById("editModal").style.display = "none";
}

window.saveTransactionEdit = function () {
  const id = document.getElementById("editTxnId").value;
  let reports = JSON.parse(localStorage.getItem("transactions")) || [];
  const index = reports.findIndex(r => (r.transactionId || r.txnId || r.id).toString() === id.toString());

  if (index === -1) {
    alert("Error: Transaction not found in database.");
    return;
  }

  // Update object
  reports[index].date = document.getElementById("editDate").value;
  reports[index].customerName = document.getElementById("editName").value;
  reports[index].mobileNumber = document.getElementById("editMobile").value;
  reports[index].aadharNumber = document.getElementById("editAadhar").value;
  reports[index].address = document.getElementById("editAddress").value;
  reports[index].serviceName = document.getElementById("editService").value;
  reports[index].amount = document.getElementById("editAmount").value;
  reports[index].charge = document.getElementById("editCharge").value;

  const paymentModeEl = document.getElementById("editPaymentMode");
  if (paymentModeEl) reports[index].paymentMode = paymentModeEl.value;

  reports[index].totalAmount = Number(reports[index].amount) + Number(reports[index].charge);
  reports[index].status = document.getElementById("editStatus").value;

  // New Fields
  const targetIdEl = document.getElementById("editTargetId");
  if (targetIdEl) reports[index].targetId = targetIdEl.value;

  const externalRefEl = document.getElementById("editExternalRef");
  if (externalRefEl) reports[index].externalRefNo = externalRefEl.value;

  // Save and Refresh
  localStorage.setItem("transactions", JSON.stringify(reports));

  closeEditModal();
  loadReports();
  applyFilter(); // This will also update summary metrics

  if (typeof showToast === "function") {
    showToast("Transaction Updated Successfully ✅");
  }
}

/* =========================
   GLOBAL LOADER HELPERS
========================= */
function showLoader(msg = "Processing...") {
  if (window.AppLoader) {
    window.AppLoader.show(msg);
  }
}

function hideLoader() {
  if (window.AppLoader) {
    window.AppLoader.hide();
  }
}


