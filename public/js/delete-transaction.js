document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ delete-transaction.js loaded");

  const deleteBtn = document.getElementById("deleteTransaction");
  const customerSelect = document.getElementById("customerSelect");

  if (!deleteBtn || !customerSelect) {
    // Silent return if components not found on current page
    return;
  }

  /* ===============================
     DELETE CUSTOMER LOGIC (FIXED)
  ================================ */

  deleteBtn.addEventListener("click", async () => {
    const selectedCustomerId = customerSelect.value;

    if (!selectedCustomerId) {
      await AuraDialog.warning("Attention: Please select a customer to delete.", "Selection Required");
      return;
    }

    const confirmed = await AuraDialog.confirm("Are you sure you want to delete this customer?", "Delete Confirmation", true);
    if (confirmed) {
      let customers = JSON.parse(localStorage.getItem("customers")) || [];

      customers = customers.filter(
        c => String(c.id) !== String(selectedCustomerId)
      );

      localStorage.setItem("customers", JSON.stringify(customers));

      // 🔥 REMOVE CUSTOMER FROM DROPDOWN (NO REFRESH NEEDED)
      const selectedOption = customerSelect.querySelector(`option[value="${selectedCustomerId}"]`);

      if (selectedOption) {
        selectedOption.remove();
      }

      customerSelect.value = "";

      if (typeof loadCustomers === "function") {
        loadCustomers();
      }

      await AuraDialog.success("Deleted: Customer deleted successfully.", "Deleted");
      console.log("✅ Customer deleted");
    }
  });
});
