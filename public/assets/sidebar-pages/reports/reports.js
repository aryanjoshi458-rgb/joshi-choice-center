console.log("📄 Reports page loaded");

let allReportsData = [];
let filteredReportsData = [];

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
  allReportsData = reports; // ✅ Store globally
  const tbody = document.getElementById("reportsTableBody");

  if (!tbody) {
    console.error("❌ reportsTableBody not found");
    return;
  }

  tbody.innerHTML = "";

  if (reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="14" style="text-align:center;">No Reports Found</td></tr>`;
    filteredReportsData = []; // ✅ Clear globally
    return;
  }

  reports.forEach((r, index) => {
    const customer = r.customerName || "-";
    const mobile = r.mobileNumber || "-";
    const aadhar = r.aadharNumber || "-";
    const address = r.address || "N/A";
    const service = r.serviceName || r.serviceType || "-";
    const amount = Number(r.amount) || 0;
    const charge = Number(r.charge) || 0;
    const total = Number(r.totalAmount) || (amount + charge);
    const status = (r.status || "Pending").toLowerCase();
    const txnId = r.transactionId || r.txnId || r.id || "-";
    const date = formatDate(r.date);

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
      <td>${service}</td>
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
function deleteReport(id) {
  if (!confirm("Are you sure you want to delete this report?")) return;

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
    alert("Record not found.");
  }
}


/* =========================
   DATE FORMAT FIX
========================= */
function formatDate(dateStr) {

  if (!dateStr) return "-";

  // ✅ HANDLE "22-03-2026" FORMAT (Confirm it is not YYYY-MM-DD)
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) return dateStr;
  }

  const d = new Date(dateStr);

  if (isNaN(d)) return "-";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

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

  const rows = document.querySelectorAll("#reportsTable tbody tr");
  filteredReportsData = []; // ✅ Reset before re-populating

  allReportsData.forEach((r, idx) => {
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

    if (matchSearch && matchStatus && matchMonth) {
      filteredReportsData.push(r);
    }
  });

  // Now hide/show the DOM rows based on index
  // (Note: allReportsData is already reversed to match table order)
  rows.forEach((row, idx) => {
    const r = allReportsData[idx];
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

    row.style.display = (matchSearch && matchStatus && matchMonth) ? "" : "none";
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
    // Only count visible rows
    if (row.style.display !== "none") {
      const chargeCell = row.querySelector("td:nth-child(9)");
      const totalCell = row.querySelector("td:nth-child(10)");

      const charge = parseFloat(chargeCell?.textContent.replace(/[^\d.]/g, "")) || 0;
      const total = parseFloat(totalCell?.textContent.replace(/[^\d.]/g, "")) || 0;

      totalCommission += charge;
      totalBusiness += total;
      transactionCount++;
    }
  });

  document.getElementById("commissionValue").innerText = "₹" + totalCommission.toLocaleString();
  document.getElementById("totalBusinessValue").innerText = "₹" + totalBusiness.toLocaleString();
  document.getElementById("totalTransactionsValue").innerText = transactionCount;
}


// (Cleanup: removed redundant listeners already handled by applyFilter)


/* =========================
   PRINT TRANSACTION (MODAL)
========================= */
let currentModalTxn = null;

window.printReportRow = function (id) {
  const reports = JSON.parse(localStorage.getItem("transactions")) || [];
  currentModalTxn = reports.find(r => (r.transactionId || r.txnId || r.id).toString() === id.toString());

  if (!currentModalTxn) {
    alert("Transaction not found!");
    return;
  }

  document.getElementById("printModal").style.display = "block";
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
  preview.innerText = content;
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
  document.getElementById("searchPrintModal").style.display = "block";
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
  preview.innerText = content;
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

  const showContact = ps.showContact ? `Mobile: ${mobile}` : "";
  const showAddress = ps.showAddress ? shop.address : "";
  let out = "";
  if (f == 1) {
    out = `
${shop.name}
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

Status: ${status}
-------------------------
${ps.footer1}
`;
  } else if (f == 2) {
    out = `
*************************
  ${shop.name}
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
-------------------------
Status   : ${status}
-------------------------
   ${ps.footer1}
   ${ps.footer2}
*************************
`;
  } else if (f == 3) {
    out = `
   ${shop.name}
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
${shop.name}
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
${shop.name}
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
-------------------------
Status : ${status}
-------------------------
  ${ps.footer2}
-------------------------
`;
  }

  // ADD DETAILING (NEW)
  if (ps.taxId) out = `GST: ${ps.taxId}\n` + out.trimStart();
  if (ps.terms) out = out.trimEnd() + `\n\n- T&C -\n${ps.terms}`;

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
  const fontSize = isA4 ? "16px" : (size === "58" ? "10px" : "12px");

  const doc = iframe.contentWindow.document;
  const shop = JSON.parse(localStorage.getItem("shopProfile")) || {};
  const ps = JSON.parse(localStorage.getItem("printSettings")) || { logoScale: 100 };
  const logoHtml = shop.logo ? `<div style="text-align:center;"><img src="${shop.logo}" style="width:${ps.logoScale || 100}%; max-width:100%; margin-bottom:10px;"></div>` : "";

  doc.open();
  doc.write(`
<html>
<head>
<style>
@page { size: ${isA4 ? 'A4 ' + orientation : 'auto'}; margin: ${isA4 ? '20mm' : '0'}; }
body{ font-family: monospace; margin:0; padding:10px; background:white; }
.wrapper{ max-width:${maxWidth}; margin:auto; }
.receipt{ white-space: pre-line; font-size:${fontSize}; }
</style>
</head>
<body onload="window.print()">
<div class="wrapper">
${logoHtml}
<div class="receipt">${content}</div>
</div>
</body>
</html>
`);
  doc.close();
}

window.openPdfModal = function () {
  if (filteredReportsData.length === 0) {
    alert("No records to export!");
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

  document.getElementById("pdfPreviewArea").innerHTML = reportContent;
  document.getElementById("pdfModal").style.display = "flex";

  // ✅ Hide Top Elements for Immersive Preview
  const elementsToHide = ["sidebarToggle", "assistantSpeaker", "themeToggle"];
  elementsToHide.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.visibility = "hidden";
  });
};

window.closePdfModal = function () {
  document.getElementById("pdfModal").style.display = "none";

  // ✅ Restore Top Elements
  const elementsToShow = ["sidebarToggle", "assistantSpeaker", "themeToggle"];
  elementsToShow.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.visibility = "visible";
  });
};

window.downloadPdfFromModal = function () {
  const element = document.getElementById("pdfPreviewArea");

  if (typeof html2pdf === 'undefined') {
    alert("PDF library not loaded properly. Please refresh the page.");
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
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    btn.innerText = originalText;
    btn.disabled = false;

    // ✅ Fix: Delay popup until Save Dialog is closed
    // We detect this by waiting for the window to regain focus
    const showSuccessToast = () => {
      if (typeof showToast === "function") {
        showToast("PDF Saved Successfully ✅");
      }
      window.removeEventListener('focus', showSuccessToast);
    };

    window.addEventListener('focus', showSuccessToast);

    // Fallback in case focus event doesn't fire (e.g. non-blocking dialogs)
    setTimeout(() => {
      if (typeof showToast === "function") {
        window.removeEventListener('focus', showSuccessToast);
        // We only show it if the listener is still there (meaning focus hasn't fired yet)
        // But actually, it's safer to just let focus handle it if possible.
      }
    }, 10000);

  }).catch(err => {


    console.error("PDF Download Error:", err);
    btn.innerText = originalText;
    btn.disabled = false;
    alert("Failed to download PDF. Please try again.");
  });
};

/* =========================
   EDIT TRANSACTION LOGIC
========================= */
window.openEditModal = function (id) {
  const reports = JSON.parse(localStorage.getItem("transactions")) || [];
  const t = reports.find(r => (r.transactionId || r.txnId || r.id).toString() === id.toString());

  if (!t) {
    alert("Transaction not found!");
    return;
  }

  // Populate fields
  document.getElementById("editTxnId").value = id;

  // Date conversion for <input type="date">
  let dateVal = t.date;
  if (dateVal.includes("-") && dateVal.split("-")[0].length === 2) {
    const parts = dateVal.split("-");
    dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  document.getElementById("editDate").value = dateVal;

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
   GLOBAL LOADER HELPERS (UPDATED)
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


