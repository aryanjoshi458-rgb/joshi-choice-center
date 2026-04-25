/**
 * AURA SIDEBAR LOGIC - REFINED
 * Premium sliding indicator and optimized animations.
 */

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("proSidebar");
    const toggleBtn = document.getElementById("sidebarToggle");
    const menuContainer = document.querySelector(".sidebar-menu");
    const menuItems = document.querySelectorAll(".sidebar-menu a");

    if (!sidebar || !toggleBtn || !menuContainer) return;

    // 1. INJECT SLIDING INDICATOR
    const indicator = document.createElement("div");
    indicator.className = "aura-sidebar-indicator";
    menuContainer.appendChild(indicator);

    // 2. INJECT NAVBAR SCROLL ARROWS
    const btnLeft = document.createElement("button");
    btnLeft.className = "nav-scroll-btn left";
    btnLeft.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>';

    const btnRight = document.createElement("button");
    btnRight.className = "nav-scroll-btn right";
    btnRight.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';

    sidebar.appendChild(btnLeft);
    sidebar.appendChild(btnRight);

    btnLeft.addEventListener("click", () => {
        menuContainer.scrollBy({ left: -250, behavior: "smooth" });
    });

    btnRight.addEventListener("click", () => {
        menuContainer.scrollBy({ left: 250, behavior: "smooth" });
    });

    function moveIndicator(target, show = true) {
        if (!target || !indicator) return;

        const isNavbar = document.body.classList.contains("layout-navbar");

        if (isNavbar) {
            // Horizontal Logic
            gsap.to(indicator, {
                left: target.offsetLeft,
                width: target.offsetWidth,
                top: "auto",
                bottom: -1,
                height: 3,
                opacity: show ? 1 : 0,
                duration: 0.4,
                ease: "power2.out"
            });
        } else {
            // Vertical Logic
            gsap.to(indicator, {
                top: target.offsetTop,
                height: target.offsetHeight,
                left: 12, // Default sidebar left
                width: "calc(100% - 24px)",
                opacity: show ? 1 : 0,
                duration: 0.4,
                ease: "power2.out"
            });
        }
    }

    /**
     * Updates sidebar state and manages class-based layout.
     * @param {boolean} animate - Whether to trigger GSAP stagger animations.
     */
    function refreshSidebarState(animate = true) {
        const isOpen = sidebar.classList.contains("open");
        document.body.classList.toggle("sidebar-open", isOpen);
        localStorage.setItem("sidebarState", isOpen ? "open" : "closed");

        if (isOpen) {
            if (animate) {
                const animType = localStorage.getItem("sidebarAnim") || "classic";

                // 1. Reset items to base hidden state before starting specific animation
                gsap.set(menuItems, { clearProps: "all" });

                // 2. Map of different animation styles
                const animStyles = {
                    classic: {
                        from: { x: -15, opacity: 0 },
                        to: { x: 0, opacity: 1, stagger: 0.04, duration: 0.5, ease: "power3.out" }
                    },
                    elastic: {
                        from: { x: -40, opacity: 0, scale: 0.8 },
                        to: { x: 0, opacity: 1, scale: 1, stagger: 0.06, duration: 0.8, ease: "elastic.out(1, 0.6)" }
                    },
                    ghost: {
                        from: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
                        to: { opacity: 1, scale: 1, filter: "blur(0px)", stagger: 0.05, duration: 0.6, ease: "power2.out" }
                    },
                    gravity: {
                        from: { y: -30, opacity: 0 },
                        to: { y: 0, opacity: 1, stagger: 0.04, duration: 0.5, ease: "bounce.out" }
                    },
                    perspective: {
                        from: { rotationY: -90, opacity: 0, transformOrigin: "left center" },
                        to: { rotationY: 0, opacity: 1, stagger: 0.05, duration: 0.7, ease: "back.out(1.7)" }
                    },
                    zoom: {
                        from: { scale: 0, opacity: 0, transformOrigin: "center center" },
                        to: { scale: 1, opacity: 1, stagger: 0.03, duration: 0.4, ease: "expo.out" }
                    }
                };

                const style = animStyles[animType] || animStyles.classic;
                gsap.fromTo(menuItems, style.from, { ...style.to, delay: 0.2 });
            } else {
                gsap.set(menuItems, { x: 0, opacity: 1, scale: 1, rotationY: 0, y: 0 });
            }
            // Position indicator on active page after a short delay
            setTimeout(() => {
                const activeLink = document.querySelector(".sidebar-menu a.active");
                moveIndicator(activeLink, true);
            }, 300);
        } else {
            gsap.to(indicator, { opacity: 0, duration: 0.2 });
        }
    }

    // 2. MENU INTERACTIVE LOGIC (HOVER/CLICK)
    menuItems.forEach(item => {
        item.addEventListener("mouseenter", () => {
            if (sidebar.classList.contains("open")) {
                moveIndicator(item, true);
            }
        });

        item.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            moveIndicator(item, true);

            // Clear Settings tab persistence when navigating to any other page
            const href = item.getAttribute("href");
            if (href && !href.includes("settings.html")) {
                sessionStorage.removeItem("activeSettingsTab");
            }
        });
    });

    menuContainer.addEventListener("mouseleave", () => {
        const activeLink = document.querySelector(".sidebar-menu a.active");
        if (sidebar.classList.contains("open")) {
            moveIndicator(activeLink, true);
        }
    });

    // 3. EVENT LISTENERS
    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("open");
        refreshSidebarState(true);

        // Tactile pulse on the icon span to avoid transform conflicts on the button itself
        const iconSpan = toggleBtn.querySelector("span");
        if (iconSpan) {
            gsap.fromTo(iconSpan,
                { scale: 0.85 },
                { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.3)" }
            );
        }
    });

    document.addEventListener("click", (e) => {
        if (
            sidebar.classList.contains("open") &&
            !sidebar.contains(e.target) &&
            !toggleBtn.contains(e.target)
        ) {
            sidebar.classList.remove("open");
            refreshSidebarState(false);
        }
    });

    // 5. SIDEBAR BACKGROUND EFFECTS (ENHANCED)
    let sidebarFxCanvas = null;
    let sidebarFxCtx = null;
    let sidebarFxFrameId = null;
    let sidebarFxDrops = [];

    const initSidebarCanvas = () => {
        if (sidebarFxCanvas) return;
        sidebarFxCanvas = document.createElement("canvas");
        sidebarFxCanvas.className = "sidebar-fx-canvas";
        sidebar.appendChild(sidebarFxCanvas);
        sidebarFxCtx = sidebarFxCanvas.getContext("2d");
        resizeSidebarCanvas();
    };

    const resizeSidebarCanvas = () => {
        if (!sidebarFxCanvas) return;
        const rect = sidebar.getBoundingClientRect();
        sidebarFxCanvas.width = rect.width;
        sidebarFxCanvas.height = rect.height;
    };

    const renderSidebarRain = () => {
        if (!sidebarFxCtx || !sidebarFxCanvas) return;

        // Initialize drops if empty
        if (sidebarFxDrops.length === 0) {
            for (let i = 0; i < 60; i++) {
                sidebarFxDrops.push({
                    x: Math.random() * sidebarFxCanvas.width,
                    y: Math.random() * sidebarFxCanvas.height,
                    len: Math.random() * 20 + 10,
                    speed: Math.random() * 10 + 10,
                    width: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.3 + 0.1
                });
            }
        }

        const draw = () => {
            sidebarFxCtx.clearRect(0, 0, sidebarFxCanvas.width, sidebarFxCanvas.height);
            sidebarFxDrops.forEach(d => {
                sidebarFxCtx.strokeStyle = `rgba(174, 194, 224, ${d.opacity})`;
                sidebarFxCtx.lineWidth = d.width;
                sidebarFxCtx.lineCap = "round";
                sidebarFxCtx.beginPath();
                sidebarFxCtx.moveTo(d.x, d.y);
                sidebarFxCtx.lineTo(d.x - 1, d.y + d.len);
                sidebarFxCtx.stroke();

                d.y += d.speed;
                d.x -= 0.5;
                if (d.y > sidebarFxCanvas.height) {
                    d.y = -d.len;
                    d.x = Math.random() * sidebarFxCanvas.width;
                }
            });
            sidebarFxFrameId = requestAnimationFrame(draw);
        };
        draw();
    };

    const killSidebarFx = () => {
        if (sidebarFxFrameId) cancelAnimationFrame(sidebarFxFrameId);
        sidebarFxFrameId = null;
        sidebarFxDrops = [];
        if (sidebarFxCtx) sidebarFxCtx.clearRect(0, 0, sidebarFxCanvas.width, sidebarFxCanvas.height);
    };

    const applySidebarBgEffect = () => {
        const effect = localStorage.getItem("sidebarBgEffect") || "glass";

        // Remove existing bg classes
        sidebar.classList.remove("bg-mesh", "bg-cyber", "bg-dust", "bg-aurora", "bg-ripple", "bg-summer", "bg-monsoon", "bg-winter");

        killSidebarFx();

        if (effect !== "glass") {
            sidebar.classList.add(`bg-${effect}`);

            if (effect === "monsoon") {
                initSidebarCanvas();
                renderSidebarRain();
            }
        }
    };

    const applySidebarStyle = () => {
        const style = localStorage.getItem("sidebarStyle") || "simple";
        sidebar.classList.remove("style-simple", "style-glass");
        if (style !== "glass") {
            sidebar.classList.add(`style-${style}`);
        }
    };

    window.applySidebarBgEffect = applySidebarBgEffect; // Expose for settings.js
    window.applySidebarStyle = applySidebarStyle; // Expose for settings.js

    // 6. INITIAL RESTORE
    const restoreState = () => {
        const savedState = localStorage.getItem("sidebarState");
        const layout = localStorage.getItem("sidebarLayout") || "classic";

        // Ensure default style is 'simple'
        if (!localStorage.getItem("sidebarStyle")) {
            localStorage.setItem("sidebarStyle", "simple");
        }

        document.body.classList.add('notransition');
        sidebar.classList.add('notransition');

        // Apply Layout Class
        const layouts = ["classic", "compact", "floating", "minimal", "rail", "navbar"];
        layouts.forEach(l => document.body.classList.remove(`layout-${l}`));
        document.body.classList.add(`layout-${layout}`);

        applySidebarBgEffect();
        applySidebarStyle();

        if (savedState === "open") {
            sidebar.classList.add("open");
            refreshSidebarState(false);
        } else {
            sidebar.classList.remove("open");
            refreshSidebarState(false);
        }

        void sidebar.offsetWidth;
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.body.classList.remove('notransition');
                sidebar.classList.remove('notransition');
            }, 100);
        });
    };

    restoreState();

    // 7. WINDOW RESIZE
    window.addEventListener("resize", () => {
        resizeSidebarCanvas();
        if (sidebar.classList.contains("open")) {
            const activeLink = document.querySelector(".sidebar-menu a.active");
            moveIndicator(activeLink, true);
        }
    });

    // 8. NOTIFICATION BADGE ENGINE
    function updateNotificationBadge() {
        const notifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
        const unreadCount = notifs.filter(n => !n.read).length;

        // Find Notification link
        const notifLink = Array.from(menuItems).find(a => a.getAttribute("href") === "notifications.html");

        if (!notifLink) return;

        let badge = notifLink.querySelector(".sidebar-badge");

        if (unreadCount > 0) {
            if (!badge) {
                badge = document.createElement("span");
                badge.className = "sidebar-badge";
                notifLink.appendChild(badge);
            }
            badge.innerText = unreadCount > 99 ? "99+" : unreadCount;
        } else if (badge) {
            badge.remove();
        }
    }

    // Run on load
    updateNotificationBadge();

    // Listen for storage changes (cross-tab sync)
    window.addEventListener("storage", (e) => {
        if (e.key === "app_notifications") updateNotificationBadge();
    });

    // Expose for other scripts
    window.updateSidebarBadge = updateNotificationBadge;
});