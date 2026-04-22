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

    // Helper to apply formatting live to an input
    const applyLiveFormatting = (input) => {
        if (!input) return;
        input.addEventListener("input", (e) => {
            const rawValue = parseCommas(e.target.value);
            // Only format if there's a value to prevent cursor jumping on empty
            if (e.target.value !== "") {
                const formatted = formatWithCommas(rawValue);
                // Simple cursor management: if formatting added a comma, we might need to adjust
                // but for simple cases, just setting value works.
                e.target.value = formatted;
            }
        });
    };

    // Apply to all fields with comma-format class
    document.querySelectorAll(".comma-format").forEach(applyLiveFormatting);

    function calculateTotal() {
        const amount = parseCommas(amountInput.value);
        const charge = parseCommas(chargeInput.value);

        if (totalInput) totalInput.value = formatWithCommas(amount + charge);
        if (netPayableInput) netPayableInput.value = formatWithCommas(amount - charge);
    }

    if (amountInput) amountInput.addEventListener("input", calculateTotal);
    if (chargeInput) chargeInput.addEventListener("input", calculateTotal);

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
