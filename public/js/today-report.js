// DELETE ROW (Refactored to match centralized logic)
async function deleteRow(btn, id) {
  if (id && typeof window.deleteTransactionById === "function") {
    window.deleteTransactionById(id);
  } else {
    const confirmed = await AuraDialog.confirm("Remove this row from view?", "Remove Row");
    if (confirmed) btn.closest("tr").remove();
  }
}

// UPDATE SERIAL NUMBER
function updateSN() {
  const rows = document.querySelectorAll("#reportTable tbody tr");
  rows.forEach((row, index) => {
    row.cells[0].innerText = index + 1;
  });
}

// SEARCH FUNCTION
function searchTable() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#reportTable tbody tr");

  rows.forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(input)
      ? ""
      : "none";
  });

  if (typeof window.refreshPagination === "function") {
    window.refreshPagination();
  }
}
