/**************************************************
 * JOSHI CHOICE CENTER
 * UNIFIED TRANSACTION & CUSTOMER LOGIC
 * FINAL PROFESSIONAL VERSION WITH RECEIPT PRINTING
 * UPDATED: CONDITIONAL FIELD VALIDATION
 **************************************************/

/* CORE APP LOGIC - JOSHI CHOICE CENTER */

// 0. GLOBAL NOTIFICATION HELPER
window.createAppNotification = function(title, desc, cat = "system") {
    const newNotif = {
        id: Date.now(),
        title: title,
        desc: desc,
        cat: cat,
        time: new Date().toISOString(),
        read: false
    };
    
    let allNotifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
    allNotifs.unshift(newNotif);
    localStorage.setItem("app_notifications", JSON.stringify(allNotifs));

    if (window.updateSidebarBadge) window.updateSidebarBadge();
};

document.addEventListener("DOMContentLoaded", () => {
  // Initial Loads
  loadTransactionsToTable();
  if (typeof updateNextTransactionId === "function") updateNextTransactionId();

  // --- Core Elements ---
  const custName = document.getElementById("custName");
  const custMobile = document.getElementById("custMobile");
  const custAadhar = document.getElementById("custAadhar");
  const custAddress = document.getElementById("custAddress");

  const nameStar = document.getElementById("nameReqStar");
  const aadharStar = document.getElementById("aadharReqStar");
  const addrStar = document.getElementById("addrReqStar");
  const mobileStar = document.getElementById("mobileReqStar");

  const txnDate = document.getElementById("txnDate");
  const serviceType = document.getElementById("txnService");
  const saveTransactionBtn = document.getElementById("saveTransaction");
  const saveAndPrintBtn = document.getElementById("saveAndPrint");
  const resetFormBtn = document.getElementById("resetForm");

  // ================================
  // 1. INPUT FORMATTING & LOOKUP
  // ================================

  // Mobile Formatting & Auto-Lookup
  if (custMobile) {
    custMobile.addEventListener("input", () => {
      custMobile.value = custMobile.value.replace(/\D/g, "");

      if (custMobile.value.length === 10) {
        const customers = JSON.parse(localStorage.getItem("customers")) || [];
        const existingCust = customers.find(c => c.mobile === custMobile.value);

        if (existingCust) {
          custName.value = existingCust.name || "";
          custAadhar.value = existingCust.aadhar || "";
          custAddress.value = existingCust.address || "";

          if (typeof showToast === "function") {
            showToast("Welcome Back! Customer details auto-filled. ✨");
          }
        }
      }
    });
  }

  // Name Capitalization
  if (custName) {
    custName.addEventListener("input", function () {
      let val = this.value.replace(/\s+/g, " ").trimStart();
      this.value = val.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    });
  }

  // Aadhar Formatting
  if (custAadhar) {
    custAadhar.addEventListener("input", () => {
      let value = custAadhar.value.replace(/\D/g, "").slice(0, 12);
      let formatted = "";
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += "-";
        formatted += value[i];
      }
      custAadhar.value = formatted;
    });
  }

  // ================================
  // 2. UNIFIED SAVE & PRINT LOGIC
  // ================================

  async function performSave(shouldPrint = false) {
    // Shared Validation
    const isBanking = serviceType.value === "Banking & Financial Services";

    const isMobileRecharge = serviceType.value === "Mobile & Utility Services" && 
                             document.getElementById("serviceName")?.value === "Mobile Recharge";

    if (isMobileRecharge) {
      if (!custMobile.value || custMobile.value.length !== 10) {
        if (window.AppLoader) window.AppLoader.hide();
        await AuraDialog.error("Mobile Number is MANDATORY for Mobile Recharge.", "Input Error");
        custMobile.focus();
        return;
      }
    }
    if (!serviceType.value) {
      if (window.AppLoader) window.AppLoader.hide();
      await AuraDialog.warning("Please select a service type.", "Selection Required");
      serviceType.focus();
      return;
    }

    // Banking-Specific Validation
    if (isBanking) {
      if (!custName.value.trim()) {
        if (window.AppLoader) window.AppLoader.hide();
        await AuraDialog.error("Customer Name is MANDATORY for Banking services.", "Validation Error");
        custName.focus();
        return;
      }
      const aadharDigits = custAadhar.value.replace(/-/g, "");
      if (aadharDigits.length !== 12) {
        if (window.AppLoader) window.AppLoader.hide();
        await AuraDialog.error("Aadhar Card is MANDATORY (12 digits) for Banking services.", "Validation Error");
        custAadhar.focus();
        return;
      }
      if (!custAddress.value.trim()) {
        if (window.AppLoader) window.AppLoader.hide();
        await AuraDialog.error("Address is MANDATORY for Banking services.", "Validation Error");
        custAddress.focus();
        return;
      }
    }

    // A. Save/Update Customer
    let customers = JSON.parse(localStorage.getItem("customers")) || [];
    const custIdx = customers.findIndex(c => c.mobile === custMobile.value);

    // Default Name if none provided (e.g. Mobile recharge)
    const finalName = custName.value.trim() || "Walk-in Customer";

    const customerData = {
      id: custIdx >= 0 ? customers[custIdx].id : Date.now(),
      name: finalName,
      mobile: custMobile.value.trim(),
      aadhar: custAadhar.value.trim(),
      address: custAddress.value.trim()
    };

    if (custIdx >= 0) customers[custIdx] = customerData;
    else customers.push(customerData);
    localStorage.setItem("customers", JSON.stringify(customers));

    // B. Save Transaction
    const allTxns = JSON.parse(localStorage.getItem("transactions")) || [];
    const transactionId = "TXN" + String(allTxns.length + 1).padStart(3, "0");

    // Helper to strip commas
    const unformat = (val) => String(val || "0").replace(/,/g, "");

    // Determine the full service name based on category
    const category = serviceType.options[serviceType.selectedIndex].text.trim();
    let subService = "";

    if (category === "Banking & Financial Services") {
      const bank = document.getElementById("bankSelect")?.value;
      const bService = document.getElementById("bankService")?.value;
      if (bank && bank !== "-- Select Bank --") subService = bank;
      if (bService && bService !== "-- Select Service --") {
        subService = subService ? `${subService} - ${bService}` : bService;
      }
    } else if (category === "Mobile & Utility Services") {
      const uService = document.getElementById("serviceName")?.value;
      if (uService && uService !== "-- Select --") subService = uService;
    } else if (category === "Printing & Document Services") {
      const pService = document.getElementById("printService")?.value;
      if (pService && pService !== "-- Select --") subService = pService;
    }

    const fullServiceName = subService ? `${category} - ${subService}` : category;

    const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const transaction = {
      date: `${txnDate.value} ${currentTime}`,
      customerName: customerData.name,
      mobileNumber: customerData.mobile,
      aadharNumber: customerData.aadhar,
      address: customerData.address,
      serviceName: fullServiceName,
      amount: unformat(document.getElementById("amount")?.value),
      charge: unformat(document.getElementById("charge")?.value),
      totalAmount: unformat(document.getElementById("totalAmount")?.value),
      netPayable: unformat(document.getElementById("netPayable")?.value),
      paymentMode: document.getElementById("paymentMode")?.value || "Cash",
      status: document.getElementById("status")?.value || "Success",
      targetId: document.getElementById("targetId")?.value || "",
      receiverName: document.getElementById("receiverName")?.value || "",
      externalRefNo: document.getElementById("externalRefNo")?.value || "",
      transactionId
    };

    allTxns.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(allTxns));

    // B. Generate Notification for New Transaction
    if (window.createAppNotification) {
        window.createAppNotification(
            "New Transaction Saved",
            `Customer: ${transaction.customerName}, Service: ${transaction.serviceName}, Amount: ₹${transaction.totalAmount}`,
            "transaction"
        );
    }

    // C. Handle Printing
    if (shouldPrint) {
      printReceiptInternal(transaction);
    }

    // D. Show Loader for Effect
    if (window.AppLoader) window.AppLoader.show(shouldPrint ? "Generating Receipt..." : "Saving Transaction...");

    setTimeout(async () => {
      // Final Success & Reset
      if (window.AppLoader) window.AppLoader.hide();

      if (typeof showToast === "function") {
        showToast(shouldPrint ? "Transaction Saved & Receipt Generated! 🖨️" : "Transaction Saved Successfully! ✅");
      } else {
        await AuraDialog.success("Saved!", "Success");
      }

      loadTransactionsToTable();
      resetTransactionForm();
    }, 800);
  }

  if (saveTransactionBtn) {
    saveTransactionBtn.addEventListener("click", () => performSave(false));
  }

  if (saveAndPrintBtn) {
    saveAndPrintBtn.addEventListener("click", () => performSave(true));
  }

  if (resetFormBtn) {
    resetFormBtn.addEventListener("click", () => {
      resetTransactionForm();
      if (typeof showToast === "function") showToast("Form Reset 🗑️");
    });
  }

  // ================================
  // 3. DYNAMIC FORM FLOW
  // ================================
  const blocks = {
    bank: document.getElementById("bankBlock"),
    bankService: document.getElementById("bankServiceBlock"),
    print: document.getElementById("printServiceBlock"),
    serviceName: document.getElementById("serviceNameBlock"),
    operator: document.getElementById("operatorBlock"),
    electricity: document.getElementById("electricityBlock"),
    transfer: document.getElementById("transferBlock"),
    externalRef: document.getElementById("externalRefBlock"),
    amount: document.getElementById("amountBlock"),
    // Sub-groups for conditional visibility
    amountGroup: document.getElementById("amountGroup"),
    chargeGroup: document.getElementById("chargeGroup"),
    totalGroup: document.getElementById("totalGroup"),
    netPayableGroup: document.getElementById("netPayableGroup"),
    paymentModeGroup: document.getElementById("paymentModeGroup"),
    denomination: document.getElementById("cashDenominationBlock")
  };

  function hideAllBlocks() {
    Object.values(blocks).forEach(b => { if (b) b.style.display = "none"; });
  }

  if (serviceType) {
    serviceType.addEventListener("change", function () {
      hideAllBlocks();

      // Reset Sub-groups visibility to default (shown)
      ["amountGroup", "chargeGroup", "totalGroup", "paymentModeGroup"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "block";
      });

      const val = this.value;

      // Update Asterisks & Required Flags
      const isBanking = val === "Banking & Financial Services";
      nameStar.style.display = isBanking ? "inline" : "none";
      aadharStar.style.display = isBanking ? "inline" : "none";
      addrStar.style.display = isBanking ? "inline" : "none";
      if (mobileStar) mobileStar.style.display = "none"; // Hide by default

      if (isBanking) {
        blocks.bank.style.display = "block";
      } else {
        if (blocks.denomination) blocks.denomination.style.display = "none";
        if (val === "Mobile & Utility Services") {
          blocks.serviceName.style.display = "block";
          // Check if already set to Mobile Recharge
          const sName = document.getElementById("serviceName")?.value;
          if (sName === "Mobile Recharge" && mobileStar) mobileStar.style.display = "inline";
        } else if (val === "Printing & Document Services") {
          blocks.print.style.display = "block";
          if (blocks.chargeGroup) blocks.chargeGroup.style.display = "none"; // Hide Charge for Printing
        }
      }
    });
  }

  // Bank Selection Flow
  const bankSelect = document.getElementById("bankSelect");
  const bankService = document.getElementById("bankService");
  if (bankSelect) {
    bankSelect.addEventListener("change", function () {
      if (this.value !== "-- Select Bank --") blocks.bankService.style.display = "block";
      else { blocks.bankService.style.display = "none"; blocks.amount.style.display = "none"; }
    });
  }
  if (bankService) {
    bankService.addEventListener("change", function () {
      const val = this.value;
      if (val !== "-- Select Service --") {
        blocks.amount.style.display = "grid";

        // Redundant logic removed, managed by script.js      
        // Conditional visibility within amountBlock
        const isWithdraw = val === "Cash Withdrawal";
        const isEnquiry = val === "Balance Enquiry" || val === "Mini Statement";

        // 1. Hide Payment Mode for Cash Withdrawal, Show Net Payable
        blocks.paymentModeGroup.style.display = isWithdraw ? "none" : "block";
        if (blocks.netPayableGroup) blocks.netPayableGroup.style.display = isWithdraw ? "block" : "none";

        // 2. Hide Amount/Charge for Balance Enquiry or Mini Statement
        const amountDisplay = isEnquiry ? "none" : "block";
        blocks.amountGroup.style.display = amountDisplay;
        blocks.chargeGroup.style.display = amountDisplay;
        blocks.totalGroup.style.display = amountDisplay;

        // If enquiry, Payment Mode should also be hidden as no payment occurs
        if (isEnquiry) blocks.paymentModeGroup.style.display = "none";

        // 3. Show Denomination Calculator for Cash Withdrawal
        if (blocks.denomination) {
          blocks.denomination.style.display = isWithdraw ? "block" : "none";
          if (isWithdraw && typeof window.refreshDenominations === "function") {
            window.refreshDenominations();
          }
        }

      } else {
        blocks.amount.style.display = "none";
      }
    });
  }

  const printServiceSelect = document.getElementById("printService");
  if (printServiceSelect) {
    printServiceSelect.addEventListener("change", function () {
      if (this.value !== "-- Select --") {
        blocks.amount.style.display = "grid";
      } else {
        blocks.amount.style.display = "none";
      }
    });
  }

  // Utility Services Flow
  const serviceNameSelect = document.getElementById("serviceName");
  if (serviceNameSelect) {
    serviceNameSelect.addEventListener("change", function () {
      const val = this.value;
      const needsOperator = ["Mobile Recharge"];
      const isTransfer = val === "Money Transfer (PhonePe/UPI)";
      const isGooglePlay = val === "Google Play Recharge";

      blocks.operator.style.display = needsOperator.includes(val) ? "block" : "none";
      if (mobileStar) mobileStar.style.display = (val === "Mobile Recharge") ? "inline" : "none";
      blocks.electricity.style.display = (val === "Electricity Bill Payment") ? "block" : "none";
      blocks.transfer.style.display = isTransfer ? "grid" : "none";
      blocks.externalRef.style.display = (isTransfer || isGooglePlay) ? "block" : "none";

      if (!needsOperator.includes(val) && val !== "-- Select --" && val !== "Electricity Bill Payment") {
        blocks.amount.style.display = "grid";
      } else if (val === "-- Select --") {
        blocks.amount.style.display = "none";
      }
    });
  }

  const electricitySelect = document.getElementById("electricitySelect");
  if (electricitySelect) {
    electricitySelect.addEventListener("change", function () {
      blocks.amount.style.display = (this.value !== "-- Select --") ? "grid" : "none";
    });
  }

  const operatorNameSelect = document.getElementById("operatorName");
  if (operatorNameSelect) {
    operatorNameSelect.addEventListener("change", function () {
      blocks.amount.style.display = (this.value !== "-- Select --") ? "grid" : "none";
    });
  }

});

// --- Helper Functions ---

window.printReceiptInternal = function (t) {
  const shop = JSON.parse(localStorage.getItem("shopProfile")) || { name: "JOSHI CHOICE CENTER", address: "Kodapar Square" };
  const ps = JSON.parse(localStorage.getItem("printSettings")) || {
    header: "OFFICIAL RECEIPT",
    footer1: "Thank You",
    taxId: "",
    terms: "",
    logoScale: 100
  };

  let content = `
${shop.name}
${ps.header}
-------------------------
Date: ${t.date}
Txn: ${t.transactionId}

Customer: ${t.customerName}
Mobile: ${t.mobileNumber}

Service: ${t.serviceName}

Amount: Rs. ${Number(t.amount || 0).toFixed(2)}
Charge: Rs. ${Number(t.charge || 0).toFixed(2)}
-------------------------
Total: Rs. ${Number(t.totalAmount || 0).toFixed(2)}
${t.netPayable && Number(t.netPayable) !== 0 ? `Cash to Customer: Rs. ${Number(t.netPayable).toFixed(2)}` : ""}

Mode: ${(t.paymentMode || "Cash").toUpperCase()}
Status: ${(t.status || "Paid").toUpperCase()}
-------------------------
${ps.footer1}
  `;

  if (ps.taxId) content = `GST: ${ps.taxId}\n` + content.trimStart();
  if (ps.terms) content = content.trimEnd() + `\n\n- T&C -\n${ps.terms}`;

  const logoHtml = shop.logo ? `<div style="text-align:center;"><img src="${shop.logo}" style="width:${ps.logoScale || 100}%; max-width:100%; margin-bottom:10px;"></div>` : "";

  const iframe = document.getElementById("printFrame");
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <html>
    <head><style>body{font-family:monospace; white-space: pre-line; padding: 20px; text-align: left;} .wrapper{max-width:340px; margin:auto;}</style></head>
    <body onload="window.print()">
      <div class="wrapper">
        ${logoHtml}
        <div>${content}</div>
      </div>
    </body>
    </html>
  `);
  doc.close();
};

window.loadTransactionsToTable = function () {
  const tbody = document.querySelector("#reportTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const txns = JSON.parse(localStorage.getItem("transactions")) || [];

  // Robust Today string check
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split("T")[0];
  const todayStrAlt = `${String(todayDate.getDate()).padStart(2, "0")}-${String(todayDate.getMonth() + 1).padStart(2, "0")}-${todayDate.getFullYear()}`;

  const todayTxns = txns.filter(t => {
    if (!t.date) return false;
    // Check if date matches today (using startsWith to handle time part)
    return t.date.startsWith(todayStr) || t.date.startsWith(todayStrAlt);
  });

  // Display newest first
  const displayTxns = [...todayTxns].reverse();

  displayTxns.forEach((txn, index) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = displayTxns.length - index;
    row.insertCell(1).innerText = txn.date;
    row.insertCell(2).innerText = txn.customerName;
    row.insertCell(3).innerText = txn.mobileNumber;
    row.insertCell(4).innerText = txn.aadharNumber;
    row.insertCell(5).innerText = txn.address || "N/A";
    row.insertCell(6).innerText = txn.serviceName;
    // Helper for table display
    const f = (val) => {
        const n = parseFloat(String(val || "0").replace(/,/g, ""));
        return isNaN(n) ? "0" : new Intl.NumberFormat('en-IN').format(n);
    };

    row.insertCell(7).innerText = f(txn.amount);
    row.insertCell(8).innerText = f(txn.charge);
    row.insertCell(9).innerText = f(txn.totalAmount);
    row.insertCell(10).innerText = txn.paymentMode;

    const statusClass = (txn.status || "").toLowerCase() === "success" ? "paid" : ((txn.status || "").toLowerCase() === "failed" ? "failed" : "pending");
    row.insertCell(11).innerHTML = `<span class="status-badge ${statusClass}">${txn.status || "Success"}</span>`;

    row.insertCell(12).innerText = txn.transactionId;
    row.insertCell(13).innerHTML = `
      <div class="row-actions">
        <button class="btn-edit-s" onclick="openEditModal('${txn.transactionId}')">Edit</button>
        <button class="btn-delete-s" onclick="deleteTransactionById('${txn.transactionId}')">Delete</button>
      </div>
    `;
  });

  if (typeof updateNextTransactionId === "function") updateNextTransactionId();
  if (typeof window.refreshPagination === "function") window.refreshPagination();
};

window.deleteTransactionById = async function (id) {
  const confirmed = await AuraDialog.confirm("Are you sure you want to delete this transaction permanently?", "Delete Confirmation", true);
  if (!confirmed) return;

  let txns = JSON.parse(localStorage.getItem("transactions")) || [];
  const initialCount = txns.length;
  txns = txns.filter(t => (t.transactionId || t.txnId || t.id).toString() !== id.toString());

  if (txns.length < initialCount) {
    localStorage.setItem("transactions", JSON.stringify(txns));
    loadTransactionsToTable(); // Refresh current table
    if (typeof showToast === "function") showToast("Transaction Deleted 🗑️");
  } else {
    AuraDialog.error("Record not found!", "Error");
  }
};

window.openEditModal = function (id) {
  const reports = JSON.parse(localStorage.getItem("transactions")) || [];
  const t = reports.find(r => (r.transactionId || r.txnId || r.id).toString() === id.toString());

  if (!t) {
    AuraDialog.error("Transaction not found!", "Error");
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

  // Helper to format modal fields
  const f = (val) => {
      const n = parseFloat(String(val || "0").replace(/,/g, ""));
      return isNaN(n) ? "0" : new Intl.NumberFormat('en-IN').format(n);
  };

  document.getElementById("editName").value = t.customerName || "";
  document.getElementById("editMobile").value = t.mobileNumber || "";
  document.getElementById("editAadhar").value = t.aadharNumber || "";
  document.getElementById("editAddress").value = t.address || "";
  document.getElementById("editService").value = t.serviceName || t.serviceType || "";
  document.getElementById("editAmount").value = f(t.amount);
  document.getElementById("editCharge").value = f(t.charge);

  if (document.getElementById("editNetPayable")) {
    document.getElementById("editNetPayable").value = f(t.netPayable || (Number(t.amount || 0) - Number(t.charge || 0)));
    document.getElementById("editNetPayableGroup").style.display = (t.serviceName || "").includes("Cash Withdrawal") ? "block" : "none";
  }

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
  const modal = document.getElementById("editModal");
  if (modal) modal.style.display = "none";
}

window.saveTransactionEdit = function () {
  const id = document.getElementById("editTxnId").value;
  let reports = JSON.parse(localStorage.getItem("transactions")) || [];
  const index = reports.findIndex(r => (r.transactionId || r.txnId || r.id).toString() === id.toString());

  if (index === -1) {
    AuraDialog.error("Error: Transaction not found in database.", "Error");
    return;
  }

  const unformat = (val) => String(val || "0").replace(/,/g, "");

  // Update object
  reports[index].date = document.getElementById("editDate").value;
  reports[index].customerName = document.getElementById("editName").value;
  reports[index].mobileNumber = document.getElementById("editMobile").value;
  reports[index].aadharNumber = document.getElementById("editAadhar").value;
  reports[index].address = document.getElementById("editAddress").value;
  reports[index].serviceName = document.getElementById("editService").value;
  
  // Save unformatted values
  reports[index].amount = unformat(document.getElementById("editAmount").value);
  reports[index].charge = unformat(document.getElementById("editCharge").value);

  const paymentModeEl = document.getElementById("editPaymentMode");
  if (paymentModeEl) reports[index].paymentMode = paymentModeEl.value;

  const a = parseFloat(reports[index].amount) || 0;
  const c = parseFloat(reports[index].charge) || 0;

  reports[index].totalAmount = (a + c).toString();
  reports[index].netPayable = (a - c).toString();
  reports[index].status = document.getElementById("editStatus").value;

  // New Fields
  const targetIdEl = document.getElementById("editTargetId");
  if (targetIdEl) reports[index].targetId = targetIdEl.value;

  const externalRefEl = document.getElementById("editExternalRef");
  if (externalRefEl) reports[index].externalRefNo = externalRefEl.value;

  // Show Loader
  if (window.AppLoader) window.AppLoader.show("Updating Data...");

  setTimeout(() => {
    // Save and Refresh
    localStorage.setItem("transactions", JSON.stringify(reports));

    closeEditModal();
    loadTransactionsToTable();

    if (window.AppLoader) window.AppLoader.hide();

    if (typeof showToast === "function") {
      showToast("Record Updated Successfully ✅");
    }
  }, 800);
}


window.updateNextTransactionId = function () {
  const text = document.getElementById("transactionIdText");
  const txns = JSON.parse(localStorage.getItem("transactions")) || [];
  const nextId = "TXN" + String(txns.length + 1).padStart(3, "0");
  if (text) text.innerText = nextId;
};

window.resetTransactionForm = function () {
  const form = document.querySelector(".unified-card");
  if (!form) return;

  // Clear inputs
  form.querySelectorAll("input").forEach(i => {
    if (i.id !== "txnDate") i.value = "";
  });
  form.querySelectorAll("select").forEach(s => s.selectedIndex = 0);

  // Reset Date
  const txnDate = document.getElementById("txnDate");
  if (txnDate) txnDate.value = new Date().toISOString().split("T")[0];

  // Hide All dynamic blocks (including Denomination)
  const dynamicBlocks = ["bankBlock", "bankServiceBlock", "printServiceBlock", "serviceNameBlock", "operatorBlock", "electricityBlock", "transferBlock", "externalRefBlock", "amountBlock", "cashDenominationBlock"];
  dynamicBlocks.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  // Reset Denominations
  if (typeof window.resetDenominations === "function") {
    window.resetDenominations();
  }

  // Reset Stars
  ["nameReqStar", "aadharReqStar", "addrReqStar"].forEach(id => {
    const star = document.getElementById(id);
    if (star) star.style.display = "none";
  });
  if (mobileStar) mobileStar.style.display = "none";

  // Reset Sub-groups visibility
  const subGroups = ["amountGroup", "chargeGroup", "totalGroup", "paymentModeGroup"];
  subGroups.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === "netPayableGroup") ? "none" : "block";
  });

  if (typeof updateNextTransactionId === "function") updateNextTransactionId();
};

// Set initial date
(function () {
  const txnDate = document.getElementById("txnDate");
  if (txnDate) txnDate.value = new Date().toISOString().split("T")[0];
})();