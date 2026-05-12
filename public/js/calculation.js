/***************************************
 * PROFESSIONAL NUMBER FORMATTING (COMMAS)
 ***************************************/

const formatWithCommas = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "";
    // Using en-IN for Indian numbering (e.g., 1,00,000) or en-US for standard (100,000)
    // The user specifically asked for 1,000 style.
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);
};

const parseCommas = (str) => {
    if (str === null || str === undefined) return 0;
    try {
        const val = str.toString().replace(/,/g, "").trim();
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    } catch(e) { 
        console.error("Calculation Error: Invalid input", e);
        return 0; 
    }
};

document.addEventListener("DOMContentLoaded", () => {

    const amountInput = document.getElementById("amount");
    const chargeInput = document.getElementById("charge");
    const totalInput = document.getElementById("totalAmount");
    const netPayableInput = document.getElementById("netPayable");
    const receivedChargeInput = document.getElementById("receivedCharge");
    const pendingChargeInput = document.getElementById("pendingCharge");


    // Helper to apply formatting live to an input (with cursor preservation)
    const applyLiveFormatting = (input) => {
        if (!input) return;
        input.addEventListener("input", (e) => {
            const cursorStart = e.target.selectionStart;
            const originalLength = e.target.value.length;
            const rawValue = parseCommas(e.target.value);

            if (e.target.value !== "") {
                const formatted = formatWithCommas(rawValue);
                e.target.value = formatted;

                // Restore cursor position accurately
                const newLength = formatted.length;
                const newCursor = cursorStart + (newLength - originalLength);
                e.target.setSelectionRange(newCursor, newCursor);
            }
        });
    };

    // Apply to all fields with comma-format class
    document.querySelectorAll(".comma-format").forEach(applyLiveFormatting);

    function calculateTotal() {
        const amountText = amountInput ? amountInput.value.trim() : "";
        const amount = amountInput ? parseCommas(amountInput.value) : 0;
        const charge = chargeInput ? parseCommas(chargeInput.value) : 0;
        const received = receivedChargeInput ? parseCommas(receivedChargeInput.value || "0") : 0;
        const serviceType = document.getElementById("txnService")?.value || "";

        if (amountText === "" || amount === 0) {
            if (totalInput) totalInput.value = "";
            if (pendingChargeInput) pendingChargeInput.value = "";
            if (netPayableInput) netPayableInput.value = "";
            // Trigger denomination update if window exists
            if (window.refreshDenominations) window.refreshDenominations();
            return;
        }

        if (totalInput) totalInput.value = formatWithCommas(amount + charge);

        // Smart Net Payable Logic
        if (netPayableInput) {
            let net = 0;
            const isWithdrawal = serviceType.toLowerCase().includes("withdrawal") || 
                               (serviceType === "Banking & Financial Services" && 
                                document.getElementById("bankService")?.value === "Cash Withdrawal") ||
                               (serviceType === "Mobile & Utility Services" && 
                                (document.getElementById("transferType")?.value === "Withdraw" || 
                                 document.getElementById("transferType")?.value === "QR_Withdraw"));

            if (isWithdrawal) {
                net = Math.max(0, amount - charge);
            } else {
                net = 0;
            }
            netPayableInput.value = formatWithCommas(net);
        }

        if (pendingChargeInput) {
            const pending = Math.max(0, charge - received);
            pendingChargeInput.value = formatWithCommas(pending);
        }

        // Trigger denomination update if window exists
        if (window.refreshDenominations) window.refreshDenominations();
    }

    // Auto-fill charge from Service Rates
    function autoFillCharge() {
        const serviceType = document.getElementById("txnService")?.value;
        const amountText = amountInput ? amountInput.value.trim() : "";
        const amount = amountInput ? parseCommas(amountInput.value) : 0;
        
        if (amountText === "" || amount === 0) {
            if (chargeInput) chargeInput.value = "";
            calculateTotal();
            return;
        }

        if (!serviceType) return;

        let subService = "";
        if (serviceType === "Banking & Financial Services") {
            subService = document.getElementById("bankService")?.value;
        } else if (serviceType === "Mobile & Utility Services") {
            subService = document.getElementById("serviceName")?.value;
        } else if (serviceType === "Printing & Document Services") {
            subService = document.getElementById("printService")?.value;
        } else if (serviceType === "Online Form & Government Services") {
            const gService = document.getElementById("govService")?.value;
            if (gService === "PAN Card Services") {
                subService = document.getElementById("panService")?.value;
            } else if (gService === "Voter ID Services") {
                subService = document.getElementById("voterService")?.value;
            } else {
                subService = gService;
            }
        }

        if (!subService || subService.includes("-- Select")) {
            if (chargeInput) chargeInput.value = "";
            calculateTotal();
            return;
        }

        const rates = JSON.parse(localStorage.getItem("serviceRates") || "[]");
        // Try to match by sub-service name exactly, or if it's in the full name
        const rate = rates.find(r =>
            r.name.toLowerCase() === subService.toLowerCase() ||
            subService.toLowerCase().includes(r.name.toLowerCase())
        );

        if (rate) {
            let charge = 0;
            if (rate.chargeType === "range") {
                const range = (rate.chargeRanges || []).find(rng => amount >= rng.min && amount <= rng.max);
                if (range) charge = range.charge;
            } else {
                charge = rate.charge || 0;
            }

            if (chargeInput) {
                chargeInput.value = formatWithCommas(charge);
                calculateTotal();
            }
        }
    }

    if (amountInput) {
        amountInput.addEventListener("input", () => {
            autoFillCharge();
            calculateTotal();
        });
    }
    if (chargeInput) chargeInput.addEventListener("input", calculateTotal);
    if (receivedChargeInput) receivedChargeInput.addEventListener("input", calculateTotal);

    // Also trigger on service changes
    const serviceSelectors = ["txnService", "bankService", "serviceName", "printService", "govService", "panService", "voterService"];
    serviceSelectors.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", autoFillCharge);
    });

    /***************************************
     * EDIT MODAL CALCULATIONS
     ***************************************/
    const editAmount = document.getElementById("editAmount");
    const editCharge = document.getElementById("editCharge");
    const editNetPayable = document.getElementById("editNetPayable");

    function calculateEditNet() {
        const a = parseCommas(editAmount.value);
        const c = parseCommas(editCharge.value);
        const s = document.getElementById("editService")?.value || "";
        
        if (editNetPayable) {
            const isWithdrawal = s.toLowerCase().includes("withdrawal") || 
                               s.toLowerCase().includes("withdraw") || 
                               s.toLowerCase().includes("payout") ||
                               s.toLowerCase().includes("qr pay");

            if (isWithdrawal) {
                editNetPayable.value = formatWithCommas(Math.max(0, a - c));
            } else {
                editNetPayable.value = "0";
            }
        }
    }

    if (editAmount && editCharge) {
        editAmount.addEventListener("input", calculateEditNet);
        editCharge.addEventListener("input", calculateEditNet);
    }

});
