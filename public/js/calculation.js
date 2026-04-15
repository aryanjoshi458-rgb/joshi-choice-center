/***************************************
 * AMOUNT + CHARGE AUTO TOTAL
 ***************************************/

document.addEventListener("DOMContentLoaded", () => {

  const amountInput = document.getElementById("amount");
  const chargeInput = document.getElementById("charge");
  const totalInput = document.getElementById("totalAmount");
  const netPayableInput = document.getElementById("netPayable");

  // Safety check
  if (!amountInput || !chargeInput || !totalInput || !netPayableInput) return;

  function calculateTotal() {
    const amount = parseFloat(amountInput.value) || 0;
    const charge = parseFloat(chargeInput.value) || 0;

    totalInput.value = amount + charge;
    netPayableInput.value = amount - charge;
  }

  // Amount change
  amountInput.addEventListener("input", calculateTotal);

  // Charge change
  chargeInput.addEventListener("input", calculateTotal);

  /***************************************
   * EDIT MODAL CALCULATIONS
   ***************************************/
  const editAmount = document.getElementById("editAmount");
  const editCharge = document.getElementById("editCharge");
  const editNetPayable = document.getElementById("editNetPayable");

  function calculateEditNet() {
    const a = parseFloat(editAmount.value) || 0;
    const c = parseFloat(editCharge.value) || 0;
    if (editNetPayable) {
      editNetPayable.value = a - c;
    }
  }

  if (editAmount && editCharge) {
    editAmount.addEventListener("input", calculateEditNet);
    editCharge.addEventListener("input", calculateEditNet);
  }

});
