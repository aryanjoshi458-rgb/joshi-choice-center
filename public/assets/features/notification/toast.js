// ===== SHARED TOAST UTILITY =====
// Requires: gsap and #toastBox in HTML

function showToast(msg, type = "success") {
  const toastBox = document.getElementById("toastBox");
  if (!toastBox) {
    console.warn("toastBox not found in DOM");
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.innerHTML = msg + `<div class="progress"></div>`;
  toastBox.appendChild(toast);

  const progress = toast.querySelector(".progress");

  // GSAP Animations
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

// Make it globally accessible
window.showToast = showToast;
