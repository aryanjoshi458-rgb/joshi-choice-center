document.addEventListener("DOMContentLoaded", function () {

  // ===== FIND SEARCH/FILTER ROW =====
  const searchRow = document.querySelector("select")?.closest("div");
  if (!searchRow) return;

  // ADD CLASS (for CSS)
  searchRow.classList.add("report-top-bar");

  // ===== LEFT WRAP =====
  const leftWrap = document.createElement("div");
  leftWrap.classList.add("report-left");

  while (searchRow.firstChild) {
    leftWrap.appendChild(searchRow.firstChild);
  }

  searchRow.appendChild(leftWrap);

  // ===== RIGHT BUTTONS =====
  const btnBox = document.createElement("div");
  btnBox.id = "reportActions";

  btnBox.innerHTML = `
    <button class="btn-print">Print</button>
    <button class="btn-pdf">PDF</button>
    <button class="btn-excel">Excel</button>
  `;

  searchRow.appendChild(btnBox);

  // ===== TABLE DATA =====
  function getTableData() {
    return [...document.querySelectorAll("table tbody tr")].map(row => {
      const c = row.querySelectorAll("td");
      return {
        sn: c[0]?.innerText,
        name: c[2]?.innerText,
        mobile: c[3]?.innerText,
        txn: c[11]?.innerText
      };
    });
  }

  // ===== PRINT =====
  document.querySelector(".btn-print").onclick = function () {
    if (typeof openFullPrintModal === "function") {
      openFullPrintModal();
    } else {
      console.error("openFullPrintModal function not found!");
    }
  };

  // ===== PDF =====
  document.querySelector(".btn-pdf").onclick = function () {
    if (typeof openPdfModal === "function") {
      openPdfModal();
    } else {
      console.error("openPdfModal function not found!");
    }
  };

  // ===== EXCEL (Refined for Design) =====
  document.querySelector(".btn-excel").onclick = async function () {
    const table = document.querySelector("table");
    if (!table) return;

    // Use the second header row (nth-child(2)) to avoid the filter row
    const headerRow = table.querySelector("thead tr:nth-child(2)");
    if (!headerRow) return;

    const headers = [...headerRow.querySelectorAll("th")].map(th => th.innerText).slice(0, -1);
    
    // ✅ Fix: Use filteredReportsData instead of DOM rows to capture all pages
    let dataToExport = [];
    if (window.filteredReportsData && window.filteredReportsData.length > 0) {
      dataToExport = window.filteredReportsData.map((r, idx) => {
        const amount = Number(r.amount) || 0;
        const charge = Number(r.charge) || 0;
        const total = Number(r.totalAmount) || (amount + charge);
        const date = typeof formatDate === "function" ? formatDate(r.date) : (r.date || "-");
        
        return [
          window.filteredReportsData.length - idx, // SN
          date,
          r.customerName || "-",
          r.mobileNumber || "-",
          r.aadharNumber || "-",
          r.address || "N/A",
          r.serviceName || r.serviceType || "-",
          amount,
          charge,
          total,
          r.paymentMode || "Cash",
          (r.status || "Pending").toUpperCase(),
          r.transactionId || r.txnId || r.id || "-"
        ];
      });
    } else {
      // Fallback to DOM if filteredReportsData is not available
      dataToExport = [...table.querySelectorAll("tbody tr")]
        .filter(tr => tr.style.display !== "none")
        .map(tr => [...tr.querySelectorAll("td")].map(td => td.innerText).slice(0, -1));
    }

    const rows = dataToExport;

    if (rows.length === 0) {
      if (window.AuraDialog) await AuraDialog.warning("No records to export!", "Empty Data");
      else alert("No records to export!");
      return;
    }

    // --- Build Professional HTML Table for Excel ---
    let tableHtml = `<table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">`;
    
    // Branded Header (Emerald Green)
    tableHtml += `
      <tr>
        <th colspan="${headers.length}" style="text-align: center; font-size: 24px; font-weight: bold; background: #10b981; color: white; padding: 20px; border: 1px solid #10b981;">JOSHI CHOICE CENTER</th>
      </tr>
      <tr>
        <th colspan="${headers.length}" style="text-align: center; font-size: 16px; background: #f8fafc; color: #4b5563; padding: 10px; border: 1px solid #e5e7eb;">Transaction Report Details</th>
      </tr>
      <tr>
        <th colspan="${Math.floor(headers.length/2)}" style="text-align: left; padding: 12px; font-weight: bold; border-bottom: 3px solid #10b981; background: #ffffff;">Generated on: ${new Date().toLocaleDateString('en-GB')}</th>
        <th colspan="${headers.length - Math.floor(headers.length/2)}" style="text-align: right; padding: 12px; font-weight: bold; border-bottom: 3px solid #10b981; background: #ffffff;">Total Records: ${rows.length}</th>
      </tr>
      <tr><td colspan="${headers.length}" style="height: 10px;"></td></tr>
      <tr style="background: #f1f5f9;">
    `;

    // Table Headers
    headers.forEach(h => {
      tableHtml += `<th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-weight: bold; color: #334155; font-size: 13px;">${h}</th>`;
    });
    tableHtml += `</tr>`;

    // Data Rows with alternating colors
    rows.forEach((r, idx) => {
      const bgColor = idx % 2 === 0 ? "#ffffff" : "#f9fafb";
      tableHtml += `<tr style="background: ${bgColor};">`;
      r.forEach(cell => {
        tableHtml += `<td style="border: 1px solid #e5e7eb; padding: 10px; color: #4b5563; font-size: 12px; text-align: left;">${cell}</td>`;
      });
      tableHtml += `</tr>`;
    });

    tableHtml += `</table>`;

    const template = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Transactions</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>${tableHtml}</body>
      </html>
    `;

    const blob = new Blob([template], { type: "application/vnd.ms-excel" });

    // USE MODERN FILE SYSTEM ACCESS API FOR BETTER CONTROL
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `Joshi_Choice_Center_Report_${new Date().toISOString().split('T')[0]}.xls`,
          types: [{
            description: 'Excel File',
            accept: { 'application/vnd.ms-excel': ['.xls'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        if (typeof showToast === "function") showToast("Excel Saved Successfully ✅");
      } catch (err) {
        if (err.name === 'AbortError') {
          if (typeof showToast === "function") showToast("Export Cancelled ⚠️", "warning");
        } else {
          console.error("Excel Export Error:", err);
          if (typeof showToast === "function") showToast("Export Failed ❌", "error");
        }
      }
    } else {
      // Fallback for older browsers
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Joshi_Choice_Center_Report_${new Date().toISOString().split('T')[0]}.xls`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (typeof showToast === "function") showToast("Export Initiated ✅");
    }
  };




});