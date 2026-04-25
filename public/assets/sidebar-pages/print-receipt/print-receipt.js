let txns = JSON.parse(localStorage.getItem("transactions")) || [];
let selectedTxn = null;

// Helper to format date
function formatDate(dateStr) {
  if (!dateStr) return "-";
  
  // Handle formats like "24-04-2026" or "2026-04-24"
  let cleanDate = dateStr;
  if (cleanDate.includes(" ")) cleanDate = cleanDate.split(" ")[0];
  
  // If already DD-MM-YYYY, return as is
  if (/^\d{2}-\d{2}-\d{4}$/.test(cleanDate)) return cleanDate;

  const d = new Date(cleanDate);
  if (isNaN(d.getTime())) return dateStr;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
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
  preview.innerHTML = content; // Changed to innerHTML to support new colorful designs
  preview.className = "receipt-preview size-" + size;
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
    out = `${ps.header}\n-------------------------\nDate: ${date}\nTxn: ${txnId}\n\nCustomer: ${name}\n${showContact}\n\nService: ${service}\n\nAmount: Rs. ${amount}\nCharge: Rs. ${charge}\n-------------------------\nTotal: Rs. ${total}\n\nMode: ${paymentMode}\nStatus: ${status}\n-------------------------\n${ps.footer1}`;
  } else if (f == 2) {
    out = `*************************\n     ${ps.title}\n*************************\nID   : ${txnId}\nDate : ${date}\n-------------------------\nCustomer : ${name}\nService  : ${service}\n-------------------------\nAmount   : Rs. ${amount}\nCharge   : Rs. ${charge}\n-------------------------\nNET TOTAL: Rs. ${total}\n-------------------------\nMode     : ${paymentMode}\nStatus   : ${status}\n-------------------------\n   ${ps.footer1}\n   ${ps.footer2}\n*************************`;
  } else if (f == 3) {
    out = `    ${ps.header}\n=========================\nDATE : ${date}\nTXN  : ${txnId}\nNAME : ${name}\nSVC  : ${service}\n=========================\nAMOUNT : Rs. ${amount}\nCHARGE : Rs. ${charge}\nTOTAL  : Rs. ${total}\n=========================\nMODE   : ${paymentMode}\nSTATUS : ${status}\n      ${ps.footer1}\n=========================`;
  } else if (f == 4) {
    out = `${shop.name}\n-------------------------\n${date} | ${txnId}\n\nName: ${name}\nSvc : ${service}\n\nNet : Rs. ${total} (${paymentMode})\n\n-- ${ps.footer1} --`;
  } else if (f == 5) {
    out = `-------------------------\n    ${ps.title}\n-------------------------\n${shop.name}\n${showAddress}\n\nTrans ID : ${txnId}\nDate     : ${date}\n-------------------------\nCustomer Details:\nName   : ${name}\n${showContact}\n-------------------------\nService Details:\nDescription: ${service}\n-------------------------\nPayment Details:\nBase Amount : Rs. ${amount}\nService Chg : Rs. ${charge}\nNet Payable : Rs. ${total}\nPayment Mode: ${paymentMode}\n-------------------------\nStatus : ${status}\n-------------------------\n  ${ps.footer2}\n-------------------------`;
  } else if (f == 6) {
    // MODERN COLORFUL DESIGN (HTML) - RESPECTS GLOBAL SETTINGS
    const ps = JSON.parse(localStorage.getItem("printSettings")) || {};
    const logoImg = (ps.showLogo !== false && shop.logo) ? `<img src="${shop.logo}" style="height: 40px; margin-bottom: 10px;">` : "";
    const showShopAddress = ps.showAddress !== false ? `<div style="font-size: 0.8em; color: #64748b; margin-top: 2px;">${showAddress}</div>` : "";
    const showContactRow = ps.showContact !== false ? `<div style="font-size: 0.9em; color: #64748b; margin-top: 4px;"><span style="color: #4f46e5;">📞</span> ${mobile}</div>` : "";
    const pMode = paymentMode || "CASH";
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
    <strong>Payment Details:</strong> Paid via ${paymentMode}
  </div>

  <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; font-size: 0.8em; color: #64748b; font-style: italic;">
    ${ps.footer1}
  </div>
</div>
`;
  }

  // ADD DETAILING (NEW)
  if (f <= 5) {
    if (ps.taxId) out = `GST: ${ps.taxId}\n` + out.trimStart();
    if (ps.terms) out = out.trimEnd() + `\n\n- TERMS & CONDITIONS -\n${ps.terms}`;
  } else {
    // For HTML formats, add GST and Terms if present
    if (ps.taxId || ps.terms) {
      let extra = `<div style="margin-top: 15px; font-size: 0.75em; border-top: 1px dashed #ccc; padding-top: 10px; color: #666; white-space: normal;">`;
      if (ps.taxId) extra += `<div><strong>GSTIN:</strong> ${ps.taxId}</div>`;
      if (ps.terms) extra += `<div style="margin-top: 5px;"><strong>TERMS & CONDITIONS:</strong> ${ps.terms}</div>`;
      extra += `</div>`;
      out += extra;
    }
  }

  return out;
}

window.printReceipt = async function () {
  if (!selectedTxn) {
    await AuraDialog.warning("Please select a transaction first!", "Selection Required");
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
  const shop = JSON.parse(localStorage.getItem("shopProfile")) || { name: "JOSHI CHOICE CENTER" };
  const ps = JSON.parse(localStorage.getItem("printSettings")) || { logoScale: 100 };
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

window.sendWhatsApp = async function () {
  if (!selectedTxn) {
    await AuraDialog.warning("Please select a transaction first!", "Selection Required");
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
    await AuraDialog.error("Invalid mobile number for WhatsApp!", "Invalid Number");
    return;
  }

  const whatsappUrl = `https://wa.me/91${mobile}?text=${encodedMsg}`;
  window.open(whatsappUrl, '_blank');
};