let txns = JSON.parse(localStorage.getItem("transactions")) || [];
let selectedTxn = null;

// Helper to format date
function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB").replace(/\//g, "-");
  } catch (e) {
    return dateStr;
  }
}

document.getElementById("search").oninput = function () {
  let val = this.value.toLowerCase();
  let res = txns.filter(t =>
    (t.customerName || "").toLowerCase().includes(val) ||
    (t.mobileNumber || "").includes(val) ||
    (t.transactionId || "").toLowerCase().includes(val)
  );

  let html = "";
  res.forEach(t => {
    html += `<div class="list-item" onclick="selectTxn('${t.transactionId}')">
      ${t.customerName} - ${t.transactionId}
    </div>`;
  });
  document.getElementById("list").innerHTML = html;
};

window.selectTxn = function (id) {
  selectedTxn = txns.find(x => x.transactionId == id);
  updatePreview();
};

window.updatePreview = function () {
  if (!selectedTxn) return;
  const format = document.getElementById("format").value;
  const size = document.getElementById("pageSize").value;
  const content = generateReceiptText(selectedTxn, format);

  const preview = document.getElementById("preview");
  preview.innerText = content;
  preview.className = "receipt size-" + size;
};

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
  const paymentMode = (t.paymentMode || "Cash").toUpperCase();
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

Mode: ${paymentMode}
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
Mode     : ${paymentMode}
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
MODE   : ${paymentMode}
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

Net : Rs. ${total} (${paymentMode})

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
Payment Mode: ${paymentMode}
-------------------------
Status : ${status}
-------------------------
  ${ps.footer2}
-------------------------
`;
  }

  // ADD NEW DETAILING (GST & TERMS)
  if (ps.taxId) {
    out = `GST: ${ps.taxId}\n` + out.trimStart();
  }
  if (ps.terms) {
    out = out.trimEnd() + `\n\n- T&C -\n${ps.terms}`;
  }

  return out;
}

window.printReceipt = function () {
  if (!selectedTxn) {
    alert("Please select a transaction first!");
    return;
  }
  const format = document.getElementById("format").value;
  const size = document.getElementById("pageSize").value;
  const content = generateReceiptText(selectedTxn, format);
  openInternalPrintWindow(content, size);
};

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

window.sendWhatsApp = function () {
  if (!selectedTxn) {
    alert("Please select a transaction first!");
    return;
  }

  const t = selectedTxn;
  const shop = JSON.parse(localStorage.getItem("shopProfile")) || { name: "JOSHI CHOICE CENTER" };
  
  // Format message
  const msg = `*RECEIPT FROM ${shop.name}*
------------------------------
*Date:* ${formatDate(t.date)}
*Txn ID:* ${t.transactionId}
*Customer:* ${t.customerName}
*Service:* ${t.serviceName}
------------------------------
*Total Amount:* ₹${t.totalAmount}
*Payment Mode:* ${(t.paymentMode || "Cash").toUpperCase()}
*Status:* ${t.status.toUpperCase()}
------------------------------
Thank you for visiting!`;

  const encodedMsg = encodeURIComponent(msg);
  const mobileInput = t.mobileNumber.toString();
  const mobile = mobileInput.replace(/\D/g, ''); // Remove non-digits
  
  // Check if mobile is valid
  if (mobile.length < 10) {
    alert("Invalid mobile number for WhatsApp!");
    return;
  }

  const whatsappUrl = `https://wa.me/91${mobile}?text=${encodedMsg}`;
  window.open(whatsappUrl, '_blank');
};