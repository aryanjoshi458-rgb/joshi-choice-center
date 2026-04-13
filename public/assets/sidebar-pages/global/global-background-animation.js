/**
 * GSAP-Powered Global Background Animation Manager
 * Version: 2.0 (Ultra Premium)
 */

document.addEventListener("DOMContentLoaded", () => {
    let currentTimeline = null;
    let mouseX = 0;
    let mouseY = 0;

    // Listen for mouse movement for interactivity
    document.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    let autoCycleTimer = null;
    const availableAnims = ["squares", "grid", "particles", "waves", "circles", "liquid", "cyber", "nexus", "bubbles"];

    /**
     * Re-renders the animation based on localStorage settings.
     */
    window.refreshAnimation = function() {
        const bgContainer = document.querySelector(".animated-bg");
        if (!bgContainer) return;

        // Killing existing timelines and timers to save memory
        if (currentTimeline) {
            currentTimeline.kill();
            currentTimeline = null;
        }
        if (autoCycleTimer) {
            clearInterval(autoCycleTimer);
            autoCycleTimer = null;
        }
        
        // Clear GSAP tweens on old elements
        gsap.killTweensOf(".animated-bg *");
        bgContainer.innerHTML = ""; 

        const animType = localStorage.getItem("bgAnimation") || "squares";
        
        if (animType === "auto") {
            startAutoCycle(bgContainer);
            return;
        }

        renderSingleAnimation(animType, bgContainer);
    };

    function renderSingleAnimation(type, container) {
        container.innerHTML = "";
        switch(type) {
            case "squares": renderFloatingSquares(container); break;
            case "grid": renderSquareGrid(container); break;
            case "particles": renderQuantumParticles(container); break;
            case "waves": renderWaves(container); break;
            case "circles": renderCircles(container); break;
            case "liquid": renderLiquidFlow(container); break;
            case "cyber": renderCyberNetwork(container); break;
            case "nexus": renderGeometricNexus(container); break;
            case "bubbles": renderBubbles(container); break;
            case "none": container.innerHTML = ""; break;
            default: renderFloatingSquares(container); break;
        }
    }

    function startAutoCycle(container) {
        let index = 0;
        const runCycle = () => {
            const nextAnim = availableAnims[index];
            renderSingleAnimation(nextAnim, container);
            index = (index + 1) % availableAnims.length;
        };
        
        runCycle();
        autoCycleTimer = setInterval(runCycle, 20000); // Cycle every 20 seconds
    }

    /**
     * Mode: Floating Geometric Squares
     */
    function renderFloatingSquares(container) {
        const count = 20;
        for (let i = 0; i < count; i++) {
            const square = document.createElement("div");
            square.className = "gs-square";
            const size = Math.random() * 60 + 20;
            
            Object.assign(square.style, {
                position: "absolute",
                width: `${size}px`,
                height: `${size}px`,
                border: "2px solid var(--primary-color)",
                opacity: Math.random() * 0.2 + 0.1,
                borderRadius: Math.random() > 0.8 ? "50%" : "4px",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transformStyle: "preserve-3d"
            });

            container.appendChild(square);

            gsap.to(square, {
                x: `+=${Math.random() * 200 - 100}`,
                y: `+=${Math.random() * 200 - 100}`,
                rotation: Math.random() * 360,
                rotationX: Math.random() * 360,
                rotationY: Math.random() * 360,
                duration: Math.random() * 10 + 10,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        // Mouse Interactivity
        gsap.to(container, {
            x: () => mouseX * 50,
            y: () => mouseY * 50,
            duration: 2,
            ease: "power2.out",
            repeat: -1,
            modifier: {
                x: () => mouseX * 50,
                y: () => mouseY * 50
            }
        });
    }

    /**
     * Mode: Geometric Nexus (New Premium Replacement)
     */
    function renderGeometricNexus(container) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        container.appendChild(canvas);

        const nodes = [];
        const nodeCount = 100;
        const maxDistance = 150;

        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 1.5 + 1
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color') || '#2563eb';
            
            ctx.strokeStyle = primaryColor;
            ctx.fillStyle = primaryColor;

            for (let i = 0; i < nodeCount; i++) {
                const n1 = nodes[i];
                n1.x += n1.vx;
                n1.y += n1.vy;

                if (n1.x < 0 || n1.x > canvas.width) n1.vx *= -1;
                if (n1.y < 0 || n1.y > canvas.height) n1.vy *= -1;

                ctx.beginPath();
                ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < nodeCount; j++) {
                    const n2 = nodes[j];
                    const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

                    if (dist < maxDistance) {
                        ctx.globalAlpha = (1 - (dist / maxDistance)) * 0.4;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }
            if (localStorage.getItem("bgAnimation") === "nexus" || localStorage.getItem("bgAnimation") === "auto") {
                requestAnimationFrame(draw);
            }
        }
        draw();
    }

    /**
     * Mode: Square Grid Wave
     */
    function renderSquareGrid(container) {
        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(auto-fill, 50px)";
        grid.style.width = "110vw";
        grid.style.height = "110vh";
        grid.style.position = "absolute";
        grid.style.top = "-5vh";
        grid.style.left = "-5vw";
        grid.style.opacity = "0.1";

        const count = Math.ceil((window.innerWidth * window.innerHeight) / (50 * 50)) + 100;
        for (let i = 0; i < count; i++) {
            const cell = document.createElement("div");
            cell.style.width = "48px";
            cell.style.height = "48px";
            cell.style.border = "1px solid var(--primary-color)";
            grid.appendChild(cell);
        }

        container.appendChild(grid);

        gsap.to(grid.children, {
            scale: 0.1,
            duration: 2,
            stagger: {
                grid: "auto",
                from: "center",
                amount: 1.5,
                repeat: -1,
                yoyo: true
            },
            ease: "sine.inOut"
        });
    }

    /**
     * Mode: Quantum Particles (GSAP)
     */
    function renderQuantumParticles(container) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        container.appendChild(canvas);

        const particles = [];
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                color: "var(--primary-color)",
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary-color') || '#3b82f6';
                ctx.globalAlpha = p.opacity;
                ctx.fill();

                // Advanced motion
                p.x += (mouseX * 2);
                p.y += (mouseY * 2);
            });
            requestAnimationFrame(draw);
        }

        particles.forEach(p => {
            gsap.to(p, {
                x: `+=${Math.random() * 100 - 50}`,
                y: `+=${Math.random() * 100 - 50}`,
                duration: Math.random() * 3 + 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });

        draw();
    }

    /**
     * Mode: Liquid Flow (Refined)
     */
    function renderLiquidFlow(container) {
        container.innerHTML = `
            <div class="liquid-wrapper">
                <div class="orb-l orb-l1"></div>
                <div class="orb-l orb-l2"></div>
                <div class="orb-l orb-l3"></div>
            </div>
        `;
        
        gsap.to(".orb-l1", {
            x: "80vw", y: "20vh", duration: 15, repeat: -1, yoyo: true, ease: "sine.inOut"
        });
        gsap.to(".orb-l2", {
            x: "-60vw", y: "80vh", duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1
        });
        gsap.to(".orb-l3", {
            x: "30vw", y: "40vh", scale: 1.5, duration: 20, repeat: -1, yoyo: true, ease: "sine.inOut"
        });
    }

    /**
     * Mode: Cyber Network
     */
    function renderCyberNetwork(container) {
        container.innerHTML = `
            <div class="cyber-overlay"></div>
            <div class="cyber-lines"></div>
        `;
        const lines = container.querySelector(".cyber-lines");
        for(let i=0; i<15; i++) {
            const line = document.createElement("div");
            line.className = "cyber-line";
            line.style.left = `${Math.random() * 100}%`;
            line.style.height = `${Math.random() * 40 + 20}%`;
            lines.appendChild(line);
            
            gsap.to(line, {
                top: "110%",
                duration: Math.random() * 2 + 1,
                repeat: -1,
                ease: "none",
                delay: Math.random() * 2
            });
        }
    }

    /**
     * Mode: Soft Waves (Restored)
     */
    function renderWaves(container) {
        container.innerHTML = `
            <div class="wave-container">
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
            </div>
        `;
    }

    /**
     * Mode: Floating Bubbles (Restored by Popular Demand)
     */
    function renderBubbles(container) {
        container.innerHTML = "";
        for (let i = 0; i < 20; i++) {
            const bubble = document.createElement("div");
            bubble.className = "bubble";
            const size = Math.random() * 60 + 20;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 100}vw`;
            bubble.style.bottom = `-100px`;
            bubble.style.animationDelay = `${Math.random() * 10}s`;
            bubble.style.animationDuration = `${Math.random() * 12 + 8}s`;
            container.appendChild(bubble);
        }
    }

    /**
     * Mode: Animated Circles (Restored)
     */
    function renderCircles(container) {
        container.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="var(--primary-color)" />
                        <stop offset="100%" stop-color="var(--bg-color)" />
                    </linearGradient>
                </defs>
                <circle cx="20%" cy="30%" r="120" fill="url(#grad1)" opacity="0.3">
                    <animate attributeName="cy" values="30%;70%;30%" dur="12s" repeatCount="indefinite" />
                </circle>
                <circle cx="80%" cy="60%" r="150" fill="var(--primary-color)" opacity="0.1">
                    <animate attributeName="cy" values="60%;20%;60%" dur="15s" repeatCount="indefinite" />
                </circle>
                <circle cx="50%" cy="80%" r="100" fill="var(--primary-color)" opacity="0.2">
                    <animate attributeName="cx" values="50%;70%;50%" dur="10s" repeatCount="indefinite" />
                </circle>
            </svg>
        `;
    }

    // Handle Window Resize
    window.addEventListener("resize", () => {
        if(localStorage.getItem("bgAnimation") !== "none") {
            window.refreshAnimation();
        }
    });

    // Initial Call
    window.refreshAnimation();
});