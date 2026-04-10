document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".notification-alert")) return;

  const alertBtn = document.createElement("button");
  alertBtn.className = "notification-alert";
  alertBtn.innerHTML = `<span>🔔</span> Alerts`;
  alertBtn.title = "Notifications";

  // 👉 theme toggle ke niche lagana
  const themeToggle =
    document.querySelector(".theme-toggle") ||
    document.querySelector(".dark-mode-toggle");

  if (themeToggle && themeToggle.parentElement) {
    themeToggle.parentElement.appendChild(alertBtn);
    alertBtn.style.marginTop = "8px";
  } else {
    // fallback (safe)
    alertBtn.style.position = "fixed";
    alertBtn.style.top = "70px";
    alertBtn.style.right = "20px";
    document.body.appendChild(alertBtn);
  }
});