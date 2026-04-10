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

  deleteBtn.addEventListener("click", () => {
    const selectedCustomerId = customerSelect.value;

    if (!selectedCustomerId) {
      alert("Attention: Please select a customer to delete.");
      return;
    }

    if (confirm("Are you sure you want to delete this customer?")) {
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

      alert("Deleted: Customer deleted successfully.");
      console.log("✅ Customer deleted");
    }
  });
});
