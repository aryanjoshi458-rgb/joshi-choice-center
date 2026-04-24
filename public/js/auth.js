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
         * Session Timeout Logic
         */
        timeoutTimer: null,
        
        initTimeoutMonitor() {
            const timeoutMinutes = parseInt(localStorage.getItem('jc_session_timeout') || '0');
            if (timeoutMinutes <= 0) return; // Disable if 0 (Never)

            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
            events.forEach(name => {
                document.addEventListener(name, () => this.resetTimeout());
            });

            this.resetTimeout();
        },

        resetTimeout() {
            const timeoutMinutes = parseInt(localStorage.getItem('jc_session_timeout') || '0');
            if (timeoutMinutes <= 0) return;

            if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
            
            this.timeoutTimer = setTimeout(() => {
                if (this.isLoggedIn()) {
                    console.log("Session timed out due to inactivity.");
                    this.logout();
                }
            }, timeoutMinutes * 60 * 1000);
        },

        /**
         * Logs out the user.
         */
        logout() {
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
}
