/**
 * Aura Window Engine v3
 * Handles custom title bar, professional menu bar, and theme syncing
 */
(function () {
    function injectTitleBar() {
        if (document.querySelector('.aura-titlebar')) return;

        const titleBar = document.createElement('div');
        titleBar.className = 'aura-titlebar';

        const pageTitle = document.title || 'Joshi Choice Center';

        titleBar.innerHTML = `
            <div class="aura-titlebar-left">
                <div class="aura-titlebar-logo">JC</div>
                <div class="aura-titlebar-menu">
                    <div class="aura-menu-item" data-menu-index="0">File</div>
                    <div class="aura-menu-item" data-menu-index="1">Edit</div>
                    <div class="aura-menu-item" data-menu-index="2">View</div>
                    <div class="aura-menu-item" data-menu-index="3">Window</div>
                    <div class="aura-menu-item" data-menu-index="4">Help</div>
                </div>
            </div>
            <div class="aura-titlebar-center">
                <div class="aura-titlebar-title">${pageTitle}</div>
            </div>
            <div class="aura-titlebar-right" style="width: 138px; height: 100%; -webkit-app-region: no-drag;"></div>
        `;

        document.body.prepend(titleBar);

        // Menu Click Logic
        titleBar.querySelectorAll('.aura-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-menu-index'));
                if (window.electronAPI && window.electronAPI.showMenu) {
                    const rect = e.target.getBoundingClientRect();
                    window.electronAPI.showMenu({
                        index: index,
                        x: Math.round(rect.left),
                        y: Math.round(rect.bottom)
                    });
                }
            });
        });
    }

    function syncThemeWithMain() {
        const body = document.body;
        const html = document.documentElement;

        // Theme to Color Map (Source of Truth Fallback)
        const themeMap = {
            'dark-mode': { bg: '#0f172a', symbol: '#ffffff' },
            'midnight-slate-mode': { bg: '#0f172a', symbol: '#ffffff' },
            'royal-amethyst-mode': { bg: '#2e1065', symbol: '#ffffff' },
            'cyberpunk-mode': { bg: '#000000', symbol: '#ffffff' },
            'ocean-mode': { bg: '#f0f9ff', symbol: '#000000' },
            'business-mode': { bg: '#f0fdf4', symbol: '#000000' },
            'eye-protector-mode': { bg: '#fdf6e3', symbol: '#000000' },
            'sunset-horizon-mode': { bg: '#fff1f2', symbol: '#000000' },
            'sakura-mode': { bg: '#fff5f6', symbol: '#000000' }
        };

        let currentTheme = localStorage.getItem('theme') || 'light';
        let isDarkMode = body.classList.contains('dark-mode') ||
            body.classList.contains('midnight-slate-mode') ||
            body.classList.contains('royal-amethyst-mode') ||
            body.classList.contains('cyberpunk-mode');

        // Check which class is actually active
        let activeClass = '';
        for (const cls of Object.keys(themeMap)) {
            if (body.classList.contains(cls)) {
                activeClass = cls;
                break;
            }
        }

        const computedStyle = getComputedStyle(body);
        let bgColor = computedStyle.getPropertyValue('--bg-color').trim();

        // Final fallback if variable is missing or invalid
        if (!bgColor || bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
            if (activeClass && themeMap[activeClass]) {
                bgColor = themeMap[activeClass].bg;
            } else {
                bgColor = isDarkMode ? '#0f172a' : '#f5f7fb';
            }
        }

        const symbolColor = (isDarkMode || (activeClass && themeMap[activeClass]?.symbol === '#ffffff')) ? '#ffffff' : '#000000';

        if (window.electronAPI && window.electronAPI.updateTitleBar) {
            window.electronAPI.updateTitleBar({
                color: bgColor,
                symbolColor: symbolColor
            });
        }

        // Update the HTML title bar to match exactly
        const titlebar = document.querySelector('.aura-titlebar');
        if (titlebar) {
            titlebar.style.backgroundColor = bgColor;
            titlebar.style.color = symbolColor;
            titlebar.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        }
    }

    // Inject Omni-Search Assets
    function injectOmniSearch() {
        if (!document.getElementById('omniSearchCSS')) {
            const link = document.createElement('link');
            link.id = 'omniSearchCSS';
            link.rel = 'stylesheet';
            link.href = '../public/css/omni-search.css';
            document.head.appendChild(link);
        }
        if (!document.getElementById('omniSearchJS')) {
            const script = document.createElement('script');
            script.id = 'omniSearchJS';
            script.src = '../public/js/omni-search.js';
            document.head.appendChild(script);
        }
    }

    // Initialize with a small delay to ensure classes are applied
    function init() {
        injectTitleBar();
        injectOmniSearch();

        // Reset zoom level to 100% to fix any distortion
        if (window.electronAPI && window.electronAPI.resetZoom) {
            window.electronAPI.resetZoom();
        }

        // Listen for About Modal from native menu
        if (window.electronAPI && window.electronAPI.onShowAboutModal) {
            window.electronAPI.onShowAboutModal(() => {
                showAboutModal();
            });
        }

        // Listen for Update Check from native menu
        if (window.electronAPI && window.electronAPI.onTriggerUpdateCheck) {
            window.electronAPI.onTriggerUpdateCheck(() => {
                checkForUpdates(true); // true means show "up to date" message
            });
        }

        syncThemeWithMain();
        setTimeout(syncThemeWithMain, 100);
        setTimeout(syncThemeWithMain, 500); // Triple check
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Listen for theme changes
    window.addEventListener('themeChanged', () => {
        setTimeout(syncThemeWithMain, 100);
    });

    // Robust Full Screen Detection
    const checkFullScreen = () => {
        // Method 1: Media Query (Standard)
        const isCSSFullScreen = window.matchMedia('(display-mode: fullscreen)').matches;

        // Method 2: Dimension Check (Fallback for Electron)
        // In fullscreen, the window usually matches screen dimensions
        const isDimensionFullScreen = (window.innerWidth >= screen.width - 5) && (window.innerHeight >= screen.height - 5);

        if (!document.body) return;

        if (isCSSFullScreen || isDimensionFullScreen) {
            document.body.classList.add('is-fullscreen');
        } else {
            document.body.classList.remove('is-fullscreen');
        }
    };

    // Listen for Full Screen change from Main process (Register only once)
    if (window.electronAPI && window.electronAPI.onFullScreenState && !window.hasFullScreenListener) {
        window.hasFullScreenListener = true;
        window.electronAPI.onFullScreenState((isFullScreen) => {
            if (!document.body) return;
            if (isFullScreen) {
                document.body.classList.add('is-fullscreen');
            } else {
                document.body.classList.remove('is-fullscreen');
            }
        });
    }

    // Frequent check to ensure sync
    setInterval(checkFullScreen, 500);
    window.addEventListener('resize', checkFullScreen);
    checkFullScreen(); // Initial check

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                syncThemeWithMain();
            }
        });
    });

    if (document.body) {
        observer.observe(document.body, { attributes: true });
    }

    if (document.body) {
        observer.observe(document.body, { attributes: true });
    }

    // Inject Animated Border Styles
    function injectBorderStyles() {
        if (document.getElementById('aboutBorderStyles')) return;
        const style = document.createElement('style');
        style.id = 'aboutBorderStyles';
        style.innerHTML = `
            @keyframes rotateBorder {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }

            .about-animated-container {
                position: relative;
                width: 440px;
                padding: 3px;
                border-radius: 32px;
                overflow: hidden;
                background: #e2e8f0;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }

            .about-animated-container::before {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                width: 200%;
                height: 200%;
                background: conic-gradient(
                    transparent, 
                    #4f46e5, 
                    #818cf8, 
                    #4f46e5, 
                    transparent 30%
                );
                animation: rotateBorder 4s linear infinite;
                z-index: 0;
            }

            .about-card-inner {
                position: relative;
                z-index: 1;
                background: white;
                border-radius: 30px;
                padding: 40px 30px;
                text-align: center;
                height: 100%;
            }

            .dark-mode .about-card-inner {
                background: #0f172a;
            }

            .dark-mode .about-animated-container {
                background: #1e293b;
            }

            .tech-pills-container {
                display: flex;
                justify-content: center;
                gap: 8px;
                margin-bottom: 30px;
                flex-wrap: wrap;
            }

            .tech-pill {
                padding: 6px 14px;
                background: #f1f5f9;
                color: #4f46e5;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: 800;
                border: 1px solid #e2e8f0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: default;
                letter-spacing: 0.5px;
            }

            .tech-pill:hover {
                transform: translateY(-4px) scale(1.05);
                background: #4f46e5;
                color: white;
                box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
                border-color: #4f46e5;
            }

            .dark-mode .tech-pill {
                background: rgba(79, 70, 229, 0.1);
                color: #818cf8;
                border-color: rgba(79, 70, 229, 0.2);
            }

            .dark-mode .tech-pill:hover {
                background: #4f46e5;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    // --- ABOUT MODAL SYSTEM (ANIMATED BORDER EDITION) ---
    function showAboutModal() {
        injectBorderStyles();
        if (document.getElementById('aboutModalOverlay')) {
            document.getElementById('aboutModalOverlay').classList.add('active');
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'aboutModalOverlay';
        overlay.className = 'aura-modal-overlay active';
        overlay.style.backdropFilter = 'blur(8px)';

        overlay.innerHTML = `
            <div class="about-animated-container">
                <div class="about-card-inner">
                    <!-- Logo Section -->
                    <div style="width: 80px; height: 80px; background: #4f46e5; border-radius: 22px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);">
                        <span style="font-size: 36px; font-weight: 900; color: white;">JC</span>
                    </div>

                    <h2 style="font-size: 1.8rem; font-weight: 800; color: #1e293b; margin: 0;" class="theme-text">Joshi Choice Center</h2>
                    <div id="aboutAppVersion" style="font-size: 0.8rem; font-weight: 700; color: #6366f1; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">PREMIUM V... PRO</div>

                    <div style="margin: 30px 0; border-top: 1px solid rgba(0,0,0,0.05); border-bottom: 1px solid rgba(0,0,0,0.05); padding: 25px 0;" class="theme-divider">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <span style="font-size: 0.7rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Developer</span>
                            <span style="font-size: 0.9rem; color: #1e293b; font-weight: 700;" class="theme-text">Aryan Joshi</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <span style="font-size: 0.7rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">System Status</span>
                            <span style="font-size: 0.9rem; color: #10b981; font-weight: 800;">Licensed & Active</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <span style="font-size: 0.7rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Engine</span>
                            <span style="font-size: 0.85rem; color: #64748b; font-weight: 700;" class="theme-text-muted">Aura Core & Cyrus v2.0</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.7rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Environment</span>
                            <span style="font-size: 0.85rem; color: #64748b; font-weight: 700;" class="theme-text-muted">Electron x64</span>
                        </div>
                    </div>

                    <p style="font-size: 0.9rem; color: #64748b; line-height: 1.6; margin-bottom: 25px;" class="theme-text-muted">
                        A premier business management ecosystem engineered for speed, security, and unified financial control.
                    </p>

                    <!-- Tech Stack Ecosystem -->
                    <div class="tech-pills-container">
                        <span class="tech-pill">HTML5</span>
                        <span class="tech-pill">CSS3</span>
                        <span class="tech-pill">ES6+</span>
                        <span class="tech-pill">NODE.JS</span>
                    </div>

                    <button onclick="document.getElementById('aboutModalOverlay').classList.remove('active')" 
                            style="width: 100%; padding: 15px; background: #1e293b; color: white; border-radius: 15px; border: none; font-size: 0.95rem; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.1);" class="theme-btn">
                        DISMISS
                    </button>

                    <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 25px; font-weight: 600;">
                        &copy; 2026 Joshi Choice Center. All Rights Reserved.
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const updateTheme = () => {
            const isDark = document.body.classList.contains('dark-mode');
            const card = overlay.querySelector('.about-card-inner');
            const texts = card.querySelectorAll('.theme-text');
            const mutedText = card.querySelector('.theme-text-muted');
            const btn = card.querySelector('.theme-btn');
            const divider = card.querySelector('.theme-divider');

            if (isDark) {
                texts.forEach(el => el.style.color = '#f8fafc');
                if (mutedText) mutedText.style.color = '#94a3b8';
                if (btn) btn.style.background = '#4f46e5';
                if (divider) divider.style.borderColor = 'rgba(255,255,255,0.05)';
            } else {
                texts.forEach(el => el.style.color = '#1e293b');
                if (mutedText) mutedText.style.color = '#64748b';
                if (btn) btn.style.background = '#1e293b';
                if (divider) divider.style.borderColor = 'rgba(0,0,0,0.05)';
            }
        };

        updateTheme();
        window.addEventListener('themeChanged', updateTheme);

        // Set Dynamic Version
        if (window.electronAPI && window.electronAPI.getAppVersion) {
            window.electronAPI.getAppVersion().then(version => {
                const versionEl = document.getElementById('aboutAppVersion');
                if (versionEl) versionEl.innerText = `PREMIUM V${version} PRO`;
            });
        }
    }

    // --- UPDATE SYSTEM ---
    async function checkForUpdates(showUpToDate = false) {
        if (!window.electronAPI || !window.electronAPI.checkForUpdate) return;

        try {
            // Show a "Checking..." notification if using AuraDialog or similar
            if (showUpToDate && window.AuraDialog) {
                window.AuraDialog.alert("Checking for updates...", "System Update", "info");
            }

            const currentVersion = await window.electronAPI.getAppVersion();
            const updateInfo = await window.electronAPI.checkForUpdate();

            if (updateInfo.error) {
                if (showUpToDate && window.AuraDialog) {
                    window.AuraDialog.alert(updateInfo.error, "Update Error", "error");
                }
                return;
            }

            // Proper Version Comparison Logic
            const isNewer = (curr, latest) => {
                if (!latest || !curr) return false;
                const c = curr.replace('v', '').split('.').map(Number);
                const l = latest.replace('v', '').split('.').map(Number);
                for (let i = 0; i < 3; i++) {
                    if ((l[i] || 0) > (c[i] || 0)) return true;
                    if ((l[i] || 0) < (c[i] || 0)) return false;
                }
                return false;
            };

            if (isNewer(currentVersion, updateInfo.version)) {
                // New update available
                if (window.AuraDialog) {
                    window.AuraDialog.confirm(
                        `A new version (${updateInfo.version}) is available. Would you like to view details and download?`,
                        "Update Available",
                        (confirmed) => {
                            if (confirmed && updateInfo.downloadUrl) {
                                window.electronAPI.downloadUpdate(updateInfo.downloadUrl);
                            }
                        },
                        "Update Now",
                        "Later"
                    );
                }
            } else {
                if (showUpToDate && window.AuraDialog) {
                    window.AuraDialog.alert("You are using the latest version of Joshi Choice Center.", "Up to Date", "success");
                }
            }
        } catch (error) {
            console.error("Update check failed:", error);
        }
    }

})();
