/**
 * AURA CASH DENOMINATION CALCULATOR
 * Real-time calculation logic for payouts.
 */

document.addEventListener("DOMContentLoaded", () => {
    const denomInputs = document.querySelectorAll(".denom-input");
    const totalDenomEl = document.getElementById("totalDenomination");
    const targetAmountEl = document.getElementById("targetDenomAmount");
    const diffAmountEl = document.getElementById("diffDenomAmount");
    const matchStatusEl = document.getElementById("matchStatus");

    const cashToCustomerInput = document.getElementById("netPayable");

    function calculateDenominations() {
        let grandTotal = 0;

        denomInputs.forEach(input => {
            const denom = parseInt(input.getAttribute("data-denom"));
            const count = parseInt(input.value) || 0;
            const rowTotal = denom * count;
            
            // Update individual row total label
            const rowTotalEl = document.getElementById(`total-${denom}`);
            if (rowTotalEl) rowTotalEl.innerText = `₹${rowTotal.toLocaleString()}`;
            
            grandTotal += rowTotal;
        });

        // Update Grand Total
        if (totalDenomEl) totalDenomEl.innerText = `₹${grandTotal.toLocaleString()}`;

        // Get Target (Cash to Customer) - Strip commas before parsing
        const targetRaw = cashToCustomerInput.value || "0";
        const target = parseFloat(targetRaw.replace(/,/g, "")) || 0;
        if (targetAmountEl) targetAmountEl.innerText = `₹${target.toLocaleString()}`;

        // Calculate Difference
        const diff = grandTotal - target;
        if (diffAmountEl) {
            diffAmountEl.innerText = `₹${diff.toLocaleString()}`;
            
            // Visual feedback
            if (diff === 0 && target > 0) {
                diffAmountEl.className = "summary-value match";
                if (matchStatusEl) matchStatusEl.innerText = "MATCHED ✅";
            } else if (diff !== 0) {
                diffAmountEl.className = "summary-value mismatch";
                if (matchStatusEl) matchStatusEl.innerText = diff > 0 ? "EXCESS ⚠️" : "SHORT ❌";
            } else {
                diffAmountEl.className = "summary-value";
                if (matchStatusEl) matchStatusEl.innerText = "WAITING...";
            }
        }
    }

    // Listen for denomination inputs
    denomInputs.forEach(input => {
        input.addEventListener("input", calculateDenominations);
    });

    // Listen for changes in the main Cash to Customer field
    if (cashToCustomerInput) {
        // MutationObserver or simple interval as it's modified via calculation.js
        const observer = new MutationObserver(calculateDenominations);
        // Since netPayable is an input, we can also use 'change' or 'input' if triggered manually
        // But calculation.js sets .value directly, so we need a hook.
        
        // Let's also wrap the calculateTotal in calculation.js if possible, 
        // or just poll/listen to inputs that trigger it.
        const amountEl = document.getElementById("amount");
        const chargeEl = document.getElementById("charge");

        if (amountEl) amountEl.addEventListener("input", calculateDenominations);
        if (chargeEl) chargeEl.addEventListener("input", calculateDenominations);
    }
    
    // Initial call
    calculateDenominations();

    // Export to window for access from other scripts if needed
    window.refreshDenominations = calculateDenominations;
    
    window.resetDenominations = function() {
        denomInputs.forEach(i => i.value = "");
        calculateDenominations();
    };
});
