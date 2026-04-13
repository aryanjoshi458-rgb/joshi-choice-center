// ===== WAIT FOR DOM =====
document.addEventListener("DOMContentLoaded", () => {

  let selectedRow = null;

  const overlay = document.getElementById("proOverlay");
  const modal = document.getElementById("proModal");
  const toastBox = document.getElementById("toastBox");

  // ===== OPEN MODAL =====
  function openModal(row) {
    selectedRow = row;
    overlay.style.pointerEvents = "all";

    gsap.to(overlay, { opacity: 1, duration: 0.3 });
    gsap.to(modal, {
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: "power3.out"
    });
  }

  // ===== CLOSE MODAL =====
  function closeModal() {
    gsap.to(modal, {
      y: 40,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in"
    });

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      onComplete: () => overlay.style.pointerEvents = "none"
    });
  }

  // ===== TOAST =====
  function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = msg + `<div class="progress"></div>`;
    toastBox.appendChild(toast);

    const progress = toast.querySelector(".progress");

    gsap.to(toast, { x: 0, opacity: 1, duration: 0.5 });

    gsap.fromTo(progress,
      { scaleX: 1 },
      { scaleX: 0, duration: 3, ease: "linear" }
    );

    setTimeout(() => {
      gsap.to(toast, {
        x: 120,
        opacity: 0,
        duration: 0.4,
        onComplete: () => toast.remove()
      });
    }, 3000);
  }

  // ===== DELETE CONFIRM =====
  document.getElementById("proDelete").onclick = () => {
    if (!selectedRow) return;

    const id = selectedRow.getAttribute("data-id");

    if (!id) {
      console.error("❌ data-id missing in row");
      return;
    }

    // ✅ सही storage
    let data = JSON.parse(localStorage.getItem("pendingCustomers")) || [];

    // ✅ SAFE DELETE (only matching id)
    const newData = data.filter(item => String(item.id) !== String(id));

    // 🔍 DEBUG (optional)
    console.log("Before:", data);
    console.log("After:", newData);

    // save
    localStorage.setItem("pendingCustomers", JSON.stringify(newData));

    // UI remove
    selectedRow.remove();

    showToast("Deleted permanently ✅");

    closeModal();
  };

  // ===== CANCEL =====
  document.getElementById("proCancel").onclick = closeModal;

  // ===== 🔥 INTERCEPT DELETE BUTTON =====
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".btn-delete");
    if (!btn) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    const row = btn.closest("tr");

    if (!row) {
      console.error("❌ Row not found");
      return;
    }

    openModal(row);

  }, true); // capture mode

});