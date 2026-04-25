document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".notification-alert")) return;

  const alertBtn = document.createElement("button");
  alertBtn.className = "notification-alert";
  alertBtn.id = "globalAlertBtn";
  alertBtn.innerHTML = `
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
    <span>Alerts</span>
  `;
  alertBtn.title = "Notifications";

  // Redirect on Click
  alertBtn.addEventListener("click", () => {
    window.location.href = "notifications.html";
  });

  // 👉 theme toggle ke niche lagana (Right Side Cluster)
  const themeToggle = document.getElementById("themeToggleV4");

  if (themeToggle) {
    themeToggle.parentElement.appendChild(alertBtn);
  } else {
    // Fallback if ID is different
    const fallbackToggle = document.getElementById("themeToggle");
    if (fallbackToggle) {
        fallbackToggle.parentElement.appendChild(alertBtn);
    } else {
        alertBtn.style.position = "fixed";
        alertBtn.style.right = "20px";
        alertBtn.style.bottom = "20px";
        document.body.appendChild(alertBtn);
    }
  }

  // BADGE LOGIC
  function updateAlertButtonBadge() {
    const notifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
    const unreadCount = notifs.filter(n => !n.read).length;
    
    let badge = alertBtn.querySelector(".alert-badge");
    
    if (unreadCount > 0) {
        if (!badge) {
            badge = document.createElement("div");
            badge.className = "alert-badge";
            alertBtn.appendChild(badge);
        }
        badge.innerText = unreadCount;
    } else if (badge) {
        badge.remove();
    }
  }

  updateAlertButtonBadge();

  // --- DYNAMIC TEXT LOGIC (Welcome / Alerts) ---
  const alertText = alertBtn.querySelector("span");
  if (alertText) {
    let mode = 'alerts';
    setInterval(() => {
        if (mode === 'alerts') {
            alertText.innerText = "Welcome";
            alertBtn.classList.add("welcome-mode");
            mode = 'welcome';
        } else {
            alertText.innerText = "Alerts";
            alertBtn.classList.remove("welcome-mode");
            mode = 'alerts';
        }
    }, 5000);
  }

  window.addEventListener("storage", (e) => {
    if (e.key === "app_notifications") updateAlertButtonBadge();
  });
  
  // Hook into global badge update
  const originalUpdate = window.updateSidebarBadge;
  window.updateSidebarBadge = function() {
    if (originalUpdate) originalUpdate();
    updateAlertButtonBadge();
  };
});