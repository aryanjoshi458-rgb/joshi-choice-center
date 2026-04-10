document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".slider");
  const toggle = document.querySelector(".slider-toggle");
  const accent = document.querySelector(".slider-accent");

  // ===============================
  // THEME SOUND EFFECTS
  // ===============================
  const darkSound = new Audio("../public/sounds/dark-on.mp3");
  const lightSound = new Audio("../public/sounds/light-on.mp3");

  darkSound.volume = 0.5;
  lightSound.volume = 0.5;

  let isUserAction = false;

  // =============================
  // APPLY SAVED THEME ON LOAD
  // =============================
  function applyTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    
    // Remote all theme classes
    document.body.classList.remove("dark-mode", "eye-protector-mode", "ocean-mode", "business-mode");
    
    // Add theme class if not light
    if (savedTheme !== "light") {
      document.body.classList.add(savedTheme + "-mode");
    }

    // Update old slider UI if present
    if (slider && toggle && accent) {
        if (savedTheme === "dark") {
          slider.classList.replace("light", "dark");
          toggle.classList.replace("light", "dark");
          accent.classList.replace("light", "dark");
        } else {
          slider.classList.replace("dark", "light");
          toggle.classList.replace("dark", "light");
          accent.classList.replace("dark", "light");
        }
    }
  }

  applyTheme();

  // Listen for changes from other scripts
  window.addEventListener("themeChanged", () => {
    applyTheme();
  });

  // =============================
  // TOGGLE CLICK (RETAINING FOR BACKWARD COMPATIBILITY)
  // =============================
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isCurrentlyDark = document.body.classList.contains("dark-mode");
      isUserAction = true;
      
      if (!isCurrentlyDark) {
        localStorage.setItem("theme", "dark");
        darkSound.play();
      } else {
        localStorage.setItem("theme", "light");
        lightSound.play();
      }
      applyTheme();
    });
  }
});

