/**
 * AURA WELCOME LOGIC - SYSTEM INITIALIZATION
 * Handles the first-time boot experience.
 */

const AuraWelcome = (() => {
    let overlay = null;

    function createOverlay() {
        overlay = document.createElement("div");
        overlay.className = "aura-welcome-overlay";
        overlay.innerHTML = `
            <div class="welcome-vignette"></div>
            <div class="welcome-particles" id="welcomeParticles"></div>
            
            <div class="welcome-core">
                <div class="core-ring" id="ring1"></div>
                <div class="core-ring" id="ring2"></div>
                <div class="welcome-logo">JC</div>
            </div>

            <div class="welcome-text-group">
                <div class="welcome-title">Joshi Choice Center</div>
                <div class="welcome-subtitle">Aura Core v2.1.1 - Initializing System</div>
            </div>

            <div class="welcome-progress-wrap">
                <div class="welcome-progress-fill" id="welcomeProgress"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        createParticles();
    }

    function createParticles() {
        const container = document.getElementById("welcomeParticles");
        for (let i = 0; i < 50; i++) {
            const p = document.createElement("div");
            p.className = "w-particle";
            const size = Math.random() * 3;
            p.style.width = size + "px";
            p.style.height = size + "px";
            p.style.left = Math.random() * 100 + "%";
            p.style.top = Math.random() * 100 + "%";
            container.appendChild(p);

            // Animate each particle
            gsap.to(p, {
                y: "-=100",
                x: "+=" + (Math.random() * 40 - 20),
                opacity: 0,
                duration: 2 + Math.random() * 3,
                repeat: -1,
                ease: "none",
                delay: Math.random() * 5
            });
        }
    }

    function runAnimation() {
        if (!overlay) createOverlay();

        const tl = gsap.timeline({
            onComplete: () => {
                // Final clean up
                gsap.to(overlay, {
                    opacity: 0,
                    duration: 1.5,
                    ease: "power2.inOut",
                    onComplete: () => {
                        overlay.remove();
                        localStorage.setItem("aura_first_run_complete", "true");
                    }
                });
            }
        });

        // 1. Core Blast
        tl.to(".welcome-core", { opacity: 1, scale: 1, duration: 1.5, ease: "elastic.out(1, 0.7)" });
        
        // 2. Rings Pulse
        tl.to("#ring1", { scale: 1.5, opacity: 0, duration: 2, repeat: -1 }, 0.5);
        tl.to("#ring2", { scale: 1.3, opacity: 0, duration: 2.5, repeat: -1, delay: 0.5 }, 0.5);

        // 3. Text Entrance
        tl.to(".welcome-text-group", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.5");

        // 4. Progress Initialization
        tl.to(".welcome-progress-wrap", { opacity: 1, duration: 0.5 }, "-=0.2");
        tl.to("#welcomeProgress", { width: "100%", duration: 4, ease: "power1.inOut" });

        // 5. System Check Logs
        tl.call(() => {
            const subtitle = document.querySelector(".welcome-subtitle");
            if (subtitle) subtitle.innerText = "System Optimized. Ready for Business.";
        }, null, "-=0.5");

        return tl;
    }

    return {
        init: () => {
            const isFirstRun = !localStorage.getItem("aura_first_run_complete");
            if (isFirstRun) {
                // Ensure DOM is ready and GSAP is loaded
                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", runAnimation);
                } else {
                    runAnimation();
                }
            }
        },
        test: () => {
            // For dev console testing
            localStorage.removeItem("aura_first_run_complete");
            location.reload();
        }
    };
})();

// Auto-init
AuraWelcome.init();

// Export for console testing
window.testWelcome = AuraWelcome.test;
