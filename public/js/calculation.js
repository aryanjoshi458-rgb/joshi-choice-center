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
        if (netPayableInput) netPayableInput.value = formatWithCommas(amount - charge);
        
        if (pendingChargeInput) {
            const pending = charge - received;
            pendingChargeInput.value = formatWithCommas(Math.max(0, pending));
        }
    }

    if (amountInput) amountInput.addEventListener("input", calculateTotal);
    if (chargeInput) chargeInput.addEventListener("input", calculateTotal);
    if (receivedChargeInput) receivedChargeInput.addEventListener("input", calculateTotal);

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
