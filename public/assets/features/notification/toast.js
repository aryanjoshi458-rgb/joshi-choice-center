function showToast(msg, type = "success") {
  const toastBox = document.getElementById("toastBox");
  if (!toastBox) return;

  const toast = document.createElement("div");
  toast.className = "toast " + type;
  
  // Icon based on type
  let icon = "✨";
  if (type === "error") icon = "❌";
  if (type === "info") icon = "ℹ️";

  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${msg}</span><div class="progress"></div>`;
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
