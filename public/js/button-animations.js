/**
 * AURA GLOSS - Premium Button Animations
 * Powered by GSAP 3.12.5
 * Features: 3D Tilt, Magnetic Pull, Tactile Click feedback.
 */

document.addEventListener("DOMContentLoaded", () => {
    const SELECTOR = ".btn-primary, .btn-success, .btn-secondary, .btn-danger, .delete-btn, .sidebar-menu a, .back-btn, .add-rate-btn, .modal-btn";
    
    // Initialize animations for all existing and future buttons
    function initButtonAnimations() {
        const buttons = document.querySelectorAll(SELECTOR);
        
        buttons.forEach(btn => {
            // EXCLUDE SIDEBAR TOGGLE TO PREVENT POSITION DRIFT
            if (btn.id === "sidebarToggle" || btn.dataset.auraAnimated) return;
            btn.dataset.auraAnimated = "true";
            
            // Set initial transforms
            gsap.set(btn, { transformPerspective: 1000, transformStyle: "preserve-3d" });
            
            // 1. MAGNETIC + 3D TILT HOVER
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
                const rotateY = ((x - centerX) / centerX) * 10;  // Max 10 deg
                
                const moveX = (x - centerX) * 0.15; // Magnetic move
                const moveY = (y - centerY) * 0.15;
                
                gsap.to(btn, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    x: moveX,
                    y: moveY,
                    duration: 0.4,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
            
            // 2. RESET ON MOUSE LEAVE
            btn.addEventListener("mouseleave", () => {
                gsap.killTweensOf(btn); // Safety reset
                gsap.to(btn, {
                    rotationX: 0,
                    rotationY: 0,
                    x: 0,
                    y: 0,
                    scale: 1,
                    z: 0,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.5)",
                    overwrite: "auto"
                });
            });
            
            // 3. TACTILE CLICK (SQUEEZE)
            btn.addEventListener("mousedown", () => {
                gsap.to(btn, {
                    scale: 0.94,
                    z: -20,
                    duration: 0.1,
                    ease: "power2.out"
                });
            });
            
            btn.addEventListener("mouseup", () => {
                gsap.to(btn, {
                    scale: 1,
                    z: 0,
                    duration: 0.4,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    // Run Initial
    initButtonAnimations();
    
    // Watch for dynamic buttons (e.g. in reports)
    const observer = new MutationObserver((mutations) => {
        initButtonAnimations();
    });
    
    const target = document.body;
    if (target) {
        observer.observe(target, { childList: true, subtree: true });
    }
});
