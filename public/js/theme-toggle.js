document.addEventListener("DOMContentLoaded", () => {
  console.log("Aura V4: Initializing Seasonal Sync Engine...");
  
  const themeToggle = document.getElementById("themeToggleV4");
  const knob = document.getElementById("celestialKnob");
  const skyWindow = document.querySelector(".celestial-sky-window");

  const darkSound = new Audio("../public/sounds/dark-on.mp3");
  const lightSound = new Audio("../public/sounds/light-on.mp3");
  darkSound.volume = 0.5;
  lightSound.volume = 0.5;

  const ALL_THEME_CLASSES = [
    "dark-mode", "eye-protector-mode", "ocean-mode", "business-mode", 
    "midnight-slate-mode", "royal-amethyst-mode", "emerald-haven-mode", 
    "sunset-horizon-mode", "cyberpunk-mode", "sakura-mode", 
    "summer-mode", "monsoon-mode", "winter-mode"
  ];

  function getAutoSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) return "summer";
    if (month >= 6 && month <= 9) return "monsoon";
    return "winter";
  }

  function initSkyAtmosphere(mode = null, season = null) {
    if (!skyWindow || !themeToggle) return;

    const currentMode = mode || (document.body.classList.contains("dark-mode") ? "dark" : "light");
    const currentSeason = season || getAutoSeason();
    
    // Clear old atmosphere
    skyWindow.innerHTML = ""; 
    
    // Sync Seasonal Class to Container
    themeToggle.classList.remove("season-summer", "season-winter", "season-monsoon");
    themeToggle.classList.add(`season-${currentSeason}`);
    
    console.log(`Aura V4: Atmosphere Sync -> ${currentMode} | ${currentSeason}`);

    // Create 16 atmospheric slots
    for(let i=0; i<16; i++) {
        const particle = document.createElement("span");
        particle.className = "celestial-fx-particle";
        
        if (currentMode === "light" || currentMode === "theme-light") { // Handle any light variant
            if (currentSeason === "summer") particle.classList.add("fx-day-ray");
            else if (currentSeason === "monsoon") particle.classList.add("fx-day-rain");
            else particle.classList.add("fx-day-cloud");
        } else {
            if (currentSeason === "summer") particle.classList.add("fx-night-star");
            else if (currentSeason === "monsoon") particle.classList.add("fx-night-rain");
            else particle.classList.add("fx-night-snow");
        }

        particle.style.left = `${Math.random() * 95}%`;
        particle.style.top = `${Math.random() * 90}%`;
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.animationDuration = `${Math.random() * 4 + 2}s`;
        
        skyWindow.appendChild(particle);
    }
  }

  function applyTheme(isUserAction = false) {
    const savedTheme = localStorage.getItem("theme") || "light";
    
    document.body.classList.remove(...ALL_THEME_CLASSES);
    if (savedTheme !== "light") {
      document.body.classList.add(`${savedTheme}-mode`);
    }
    
    // Update Slider UI if it exists
    initSkyAtmosphere(); 
    
    if (isUserAction) {
        window.dispatchEvent(new Event("themeChanged"));
    }
  }

  // Startup: Apply theme immediately
  applyTheme(false);

  // --- MOUSE STYLE ENGINE ---
  const ALL_MOUSE_CLASSES = [
    "ms-default", "ms-macbook", "ms-gaming", "ms-stealth", "ms-minimal"
  ];

  function applyMouseStyle() {
    const mouse = localStorage.getItem("mouseStyle") || "default";
    document.body.classList.remove(...ALL_MOUSE_CLASSES);
    document.body.classList.add(`ms-${mouse}`);
  }

  // Initial load
  applyMouseStyle();

  // Listen for changes
  window.addEventListener("mouseStyleChanged", applyMouseStyle);

  // Global listeners
  window.addEventListener("themeChanged", () => {
    applyTheme(false);
  });

  // UI Component Logic (Only if present)
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isNowDark = !document.body.classList.contains("dark-mode");
      localStorage.setItem("theme", isNowDark ? "dark" : "light");
      
      if (isNowDark) { darkSound.play().catch(()=>{}); } 
      else { lightSound.play().catch(()=>{}); }
      
      applyTheme(true);
    });
  }

  // GLOBAL DEBUG API
  window.testAura = (mode, season) => {
    localStorage.setItem("theme", mode);
    applyTheme(true);
    initSkyAtmosphere(mode, season);
    return `Testing Sync: ${mode} ${season}...`;
  };

  // 11. VIEWPORT ZOOM GLOBAL ENGINE
  window.applyAuraZoom = (val = null) => {
    const zoom = val || localStorage.getItem("appZoom") || "1.0";
    document.body.style.zoom = parseFloat(zoom);
    if (val) localStorage.setItem("appZoom", zoom);
    window.dispatchEvent(new CustomEvent("zoomChanged", { detail: { zoom: parseFloat(zoom) } }));
  };

  // Initial load zoom
  window.applyAuraZoom();
});

