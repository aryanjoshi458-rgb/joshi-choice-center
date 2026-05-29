/**
 * Auth Manager for Joshi Choice Center
 * Handles session storage, dynamic credentials, and recovery.
 */

if (!window.Auth) {
    const Auth = {
        // Config - Now loads from localStorage with defaults
        init() {
            if (!localStorage.getItem('jc_username')) {
                localStorage.setItem('jc_username', 'admin');
            }
            if (!localStorage.getItem('jc_password')) {
                localStorage.setItem('jc_password', '123');
            }
            if (!localStorage.getItem('jc_master_key')) {
                localStorage.setItem('jc_master_key', '8080');
            }

            // Start inactivity monitor
            this.initTimeoutMonitor();
        },

        /**
         * Attempts to log in the user.
         */
        login(username, password) {
            this.init();
            const storedUser = localStorage.getItem('jc_username');
            const storedPass = localStorage.getItem('jc_password');

            if (username === storedUser && password === storedPass) {
                sessionStorage.setItem('jc_isLoggedIn', 'true');
                sessionStorage.setItem('jc_lastLogin', new Date().toISOString());
                this.resetTimeout();
                return true;
            }
            return false;
        },

        /**
         * Verifies the Master Recovery Key.
         */
        verifyMasterKey(key) {
            const storedKey = localStorage.getItem('jc_master_key') || '8080';
            return key === storedKey;
        },

        /**
         * Updates Security Settings
         */
        updateCredentials(newUsername, newPassword) {
            if (newUsername) localStorage.setItem('jc_username', newUsername);
            if (newPassword) localStorage.setItem('jc_password', newPassword);
            return true;
        },

        updateMasterKey(newKey) {
            if (newKey) localStorage.setItem('jc_master_key', newKey);
            return true;
        },

        /**
         * Resets password using Master Key (Recovery)
         */
        resetPassword(masterKey, newPassword) {
            if (this.verifyMasterKey(masterKey)) {
                localStorage.setItem('jc_password', newPassword);
                return true;
            }
            return false;
        },

        /**
         * Session Timeout Logic
         */
        timeoutTimer: null,
        finalTimeoutTimer: null,
        warningInterval: null,
        warningElement: null,

        initTimeoutMonitor() {
            const timeoutMinutes = parseInt(localStorage.getItem('jc_session_timeout') || '0');
            if (timeoutMinutes <= 0) return; // Disable if 0 (Never)

            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
            events.forEach(name => {
                document.addEventListener(name, () => this.resetTimeout());
            });

            this.resetTimeout();
            
            // Expose test function for dev console
            window.testSessionTimeout = () => {
                console.log("Triggering test session timeout warning...");
                this.showTimeoutWarning();
            };
        },

        resetTimeout() {
            const timeoutMinutes = parseInt(localStorage.getItem('jc_session_timeout') || '0');
            if (timeoutMinutes <= 0) return;

            if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
            
            // Hide warning if it's showing
            this.hideTimeoutWarning();

            // Total time in ms
            const totalMs = timeoutMinutes * 60 * 1000;
            // Time to wait before showing 30s warning
            const warningDelay = Math.max(0, totalMs - 30000);

            this.timeoutTimer = setTimeout(() => {
                if (this.isLoggedIn()) {
                    this.showTimeoutWarning();
                }
            }, warningDelay);
        },

        showTimeoutWarning() {
            // Prevent multiple warnings
            if (this.warningElement) return;

            let timeLeft = 30;

            // Create overlay
            this.warningElement = document.createElement('div');
            this.warningElement.id = 'aura-session-warning';
            this.warningElement.innerHTML = `
                <div class="aura-session-warning-overlay">
                    <div class="aura-session-horizontal-card">
                        <div class="aura-sh-card-content">
                            <div class="aura-sh-icon-box">
                                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                            </div>
                            <div class="aura-sh-text-content">
                                <h2>Session Expiring</h2>
                                <p>Please move your mouse or press any key to remain logged in securely.</p>
                            </div>
                            <div class="aura-sh-timer-display">
                                <span id="aura-countdown-timer">30</span><span class="sec-label">sec</span>
                            </div>
                        </div>
                        <div class="aura-sh-progress-track">
                            <div class="aura-sh-progress-bar"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(this.warningElement);

            // Animate in
            setTimeout(() => {
                if(this.warningElement) {
                    this.warningElement.firstElementChild.style.opacity = '1';
                    const modal = this.warningElement.firstElementChild.firstElementChild;
                    modal.style.transform = 'scale(1) translateY(0)';
                }
            }, 50);

            const timerEl = document.getElementById('aura-countdown-timer');

            this.warningInterval = setInterval(() => {
                timeLeft--;
                if(timerEl) timerEl.innerText = timeLeft;
            }, 1000);

            this.finalTimeoutTimer = setTimeout(() => {
                console.log("Session timed out due to inactivity.");
                this.logout();
            }, 30000);
        },

        hideTimeoutWarning() {
            if (this.warningInterval) {
                clearInterval(this.warningInterval);
                this.warningInterval = null;
            }
            if (this.finalTimeoutTimer) {
                clearTimeout(this.finalTimeoutTimer);
                this.finalTimeoutTimer = null;
            }
            if (this.warningElement && this.warningElement.parentNode) {
                const el = this.warningElement;
                // Animate out
                el.firstElementChild.style.opacity = '0';
                el.firstElementChild.firstElementChild.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    if (el.parentNode) el.parentNode.removeChild(el);
                }, 500);
                this.warningElement = null;
            }
        },

        /**
         * Logs out the user.
         */
        logout() {
            this.hideTimeoutWarning();
            // Only show loader if we have ui interaction
            if (window.AppLoader) window.AppLoader.show("Session Expired...");
            sessionStorage.removeItem('jc_isLoggedIn');
            sessionStorage.removeItem('jc_lastLogin');
            sessionStorage.removeItem('activeSettingsTab'); // Reset settings tab on logout

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 800);
        },

        isLoggedIn() {
            return sessionStorage.getItem('jc_isLoggedIn') === 'true';
        },

        protectPage() {
            if (!this.isLoggedIn()) {
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
            }
        }
    };

    // Initialize on first load
    Auth.init();
    window.Auth = Auth;

    // Auto-protect if requested via URL or other means (optional)
}

// Global safety check
if (window.Auth && !window.location.pathname.includes('login.html')) {
    window.Auth.protectPage();
}
