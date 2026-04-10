/***************************************
 * AMOUNT + CHARGE AUTO TOTAL
 ***************************************/

document.addEventListener("DOMContentLoaded", () => {

  const amountInput = document.getElementById("amount");
  const chargeInput = document.getElementById("charge");
  const totalInput = document.getElementById("totalAmount");

  // Safety check
  if (!amountInput || !chargeInput || !totalInput) return;

  function calculateTotal() {
    const amount = parseFloat(amountInput.value) || 0;
    const charge = parseFloat(chargeInput.value) || 0;

    totalInput.value = amount + charge;
  }

  // Amount change
  amountInput.addEventListener("input", calculateTotal);

  // Charge change
  chargeInput.addEventListener("input", calculateTotal);

});
