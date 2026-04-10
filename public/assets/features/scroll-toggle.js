document.addEventListener("DOMContentLoaded", () => {
  // Check if scrollArrow already exists in HTML (e.g., in new-customer.html)
  let btn = document.getElementById("scrollArrow");
  
  if (!btn) {
    // If not found, create a new one
    btn = document.createElement("button");
    btn.id = "scrollToggleBtn";
    document.body.appendChild(btn);
  } else {
    // If existing, ensure it has the right transition class if needed
    // (CSS handles both #scrollArrow and #scrollToggleBtn)
  }

  const upSVG = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
  const downSVG = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

  let mode = "down"; // down = scroll to bottom, up = scroll to top
  
  // Set initial icon
  btn.innerHTML = downSVG;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Show button logic
    if (scrollTop > 100 || maxScroll > 200) {
        btn.classList.add("show");
    } else {
        btn.classList.remove("show");
    }

    // Toggle icon and mode
    if (scrollTop < 100) {
      btn.innerHTML = downSVG;
      mode = "down";
    } else {
      btn.innerHTML = upSVG;
      mode = "up";
    }
  });

  btn.addEventListener("click", () => {
    if (mode === "up") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  });

  console.log("✅ Premium Scroll Toggle initialized");
});
