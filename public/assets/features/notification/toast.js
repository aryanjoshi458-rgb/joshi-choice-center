function showToast(msg, type = "success") {
  const toastBox = document.getElementById("toastBox");
  if (!toastBox) return;

  const toast = document.createElement("div");
  toast.className = "toast " + type;

  // Clean SVG icon based on type
  let iconHTML = "";
  if (type === "success") {
    iconHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === "error") {
    iconHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  } else {
    iconHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `<span class="toast-icon">${iconHTML}</span> <span class="toast-msg">${msg}</span><div class="progress"></div>`;
  toastBox.appendChild(toast);

  const progress = toast.querySelector(".progress");

  // GSAP Entrance
  gsap.to(toast, {
    x: 0,
    opacity: 1,
    duration: 0.6,
    ease: "back.out(1.7)"
  });

  // Progress Bar
  gsap.fromTo(progress,
    { scaleX: 1 },
    { scaleX: 0, duration: 4, ease: "linear" }
  );

  // Exit
  setTimeout(() => {
    gsap.to(toast, {
      x: 150,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => toast.remove()
    });
  }, 4000);
}
