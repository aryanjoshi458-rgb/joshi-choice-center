/***************************************
 * PROFESSIONAL NUMBER FORMATTING (COMMAS)
 ***************************************/

const formatWithCommas = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "";
    // Using en-IN for Indian numbering (e.g., 1,00,000) or en-US for standard (100,000)
    // The user specifically asked for 1,000 style.
    return new Intl.NumberFormat('en-IN').format(num);
};

const parseCommas = (str) => {
    if (!str) return 0;
    return parseFloat(str.toString().replace(/,/g, "")) || 0;
};

document.addEventListener("DOMContentLoaded", () => {

    const amountInput = document.getElementById("amount");
    const chargeInput = document.getElementById("charge");
    const totalInput = document.getElementById("totalAmount");
    const netPayableInput = document.getElementById("netPayable");
    const receivedChargeInput = document.getElementById("receivedCharge");
    const pendingChargeInput = document.getElementById("pendingCharge");


    // Helper to apply formatting live to an input
    const applyLiveFormatting = (input) => {
        if (!input) return;
        input.addEventListener("input", (e) => {
            const rawValue = parseCommas(e.target.value);
            if (e.target.value !== "") {
                const formatted = formatWithCommas(rawValue);
                e.target.value = formatted;
            }
        });
    };

    // Apply to all fields with comma-format class
    document.querySelectorAll(".comma-format").forEach(applyLiveFormatting);

    function calculateTotal() {
        const amount = parseCommas(amountInput.value);
        const charge = parseCommas(chargeInput.value);
        const received = parseCommas(receivedChargeInput?.value || "0");

        if (totalInput) totalInput.value = formatWithCommas(amount + charge);
        
        // Net Payable logic: For Withdrawal, it's Amount - Charge
        // For others, it might be different, but keeping existing logic
        if (netPayableInput) netPayableInput.value = formatWithCommas(amount - charge);
        
        if (pendingChargeInput) {
            const pending = charge - received;
            pendingChargeInput.value = formatWithCommas(Math.max(0, pending));
        }
    }

    // Auto-fill charge from Service Rates
    function autoFillCharge() {
        const serviceType = document.getElementById("txnService")?.value;
        const amount = parseCommas(amountInput.value);
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

        if (!subService || subService.includes("-- Select")) return;

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
        if (editNetPayable) {
            editNetPayable.value = formatWithCommas(a - c);
        }
    }

    if (editAmount && editCharge) {
        editAmount.addEventListener("input", calculateEditNet);
        editCharge.addEventListener("input", calculateEditNet);
    }

});
