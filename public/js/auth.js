/**
 * Auth Manager for Joshi Choice Center
 * Handles session storage, dynamic credentials, and recovery.
 */

const Auth = {
    // Config
    MASTER_KEY: '8080', // In a real app, this should be more secure or hashed

    /**
     * Initializes credentials in localStorage if not present.
     */
    init() {
        if (!localStorage.getItem('jc_username')) {
            localStorage.setItem('jc_username', 'admin');
        }
        if (!localStorage.getItem('jc_password')) {
            localStorage.setItem('jc_password', '123');
        }
    },

    /**
     * Attempts to log in the user.
     * @param {string} username 
     * @param {string} password 
     * @returns {boolean}
     */
    login(username, password) {
        this.init();
        const storedUser = localStorage.getItem('jc_username');
        const storedPass = localStorage.getItem('jc_password');

        if (username === storedUser && password === storedPass) {
            sessionStorage.setItem('jc_isLoggedIn', 'true');
            sessionStorage.setItem('jc_lastLogin', new Date().toISOString());
            return true;
        }
        return false;
    },

    /**
     * Verifies the Master Recovery Key.
     * @param {string} key 
     * @returns {boolean}
     */
    verifyMasterKey(key) {
        return key === this.MASTER_KEY;
    },

    /**
     * Resets the password using the Master Key.
     * @param {string} masterKey 
     * @param {string} newPassword 
     * @returns {boolean}
     */
    resetPassword(masterKey, newPassword) {
        if (this.verifyMasterKey(masterKey)) {
            localStorage.setItem('jc_password', newPassword);
            return true;
        }
        return false;
    },

    /**
     * Logs out the user.
     */
    logout() {
        sessionStorage.removeItem('jc_isLoggedIn');
        sessionStorage.removeItem('jc_lastLogin');
        window.location.href = 'login.html';
    },

    /**
     * Checks if the user is currently logged in.
     * @returns {boolean}
     */
    isLoggedIn() {
        return sessionStorage.getItem('jc_isLoggedIn') === 'true';
    },

    /**
     * Protects a page by redirecting to login if not authenticated.
     */
    protectPage() {
        if (!this.isLoggedIn()) {
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    }
};

// Initialize on load
Auth.init();

// Export to window
window.Auth = Auth;
