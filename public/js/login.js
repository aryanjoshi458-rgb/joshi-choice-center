document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    // If already logged in, redirect to dashboard
    if (window.Auth && window.Auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showError('Please enter both username and password.');
            return;
        }

        if (window.Auth && window.Auth.login(username, password)) {
            // Success! Show loader and then redirect
            if (window.AppLoader) window.AppLoader.show("Authenticating...");
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            // Failure
            if (window.AppLoader) window.AppLoader.show("Validating...");
            
            setTimeout(() => {
                if (window.AppLoader) window.AppLoader.hide();
                showError('Invalid username or password.');
                passwordInput.value = '';
                passwordInput.focus();
            }, 800);
        }
    });

    // Forgot Password Logic
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const recoveryModal = document.getElementById('recoveryModal');
    const closeRecovery = document.getElementById('closeRecovery');
    const recoveryForm = document.getElementById('recoveryForm');
    const recoveryError = document.getElementById('recoveryError');

    forgotPasswordBtn.addEventListener('click', () => {
        recoveryModal.classList.add('show');
    });

    closeRecovery.addEventListener('click', () => {
        recoveryModal.classList.remove('show');
    });

    recoveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const masterKey = document.getElementById('masterKey').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();

        if (!masterKey || !newPassword) {
            showRecoveryError('Please fill all fields.');
            return;
        }

        if (window.Auth && window.Auth.resetPassword(masterKey, newPassword)) {
            // Success
            alert('Password reset successfully! You can now login.');
            recoveryModal.classList.remove('show');
            recoveryForm.reset();
        } else {
            showRecoveryError('Invalid Master Key.');
        }
    });

    function showRecoveryError(message) {
        recoveryError.textContent = message;
        recoveryError.classList.add('show');
        setTimeout(() => {
            recoveryError.classList.remove('show');
        }, 3000);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        // Shake animation for the card
        const card = document.querySelector('.login-card');
        if (card) {
            card.style.animation = 'none';
            card.offsetHeight; // trigger reflow
            card.style.animation = 'shake 0.4s ease-in-out';
        }
        
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }

    // =============================
    // DAY/NIGHT THEME TOGGLE LOGIC
    // =============================
    const themeCheckbox = document.getElementById('themeCheckbox');
    
    function updateThemeUI(theme) {
        if (!themeCheckbox) return;
        
        if (theme === 'dark') {
            themeCheckbox.checked = true;
            document.body.classList.add('dark-mode');
        } else {
            themeCheckbox.checked = false;
            document.body.classList.remove('dark-mode');
        }
    }

    if (themeCheckbox) {
        // Initial UI Sync
        const currentTheme = localStorage.getItem("theme") || "dark";
        updateThemeUI(currentTheme);

        themeCheckbox.addEventListener('change', () => {
            const newTheme = themeCheckbox.checked ? 'dark' : 'light';
            
            localStorage.setItem("theme", newTheme);
            updateThemeUI(newTheme);
            
            // Dispatch event for dashboard consistency
            window.dispatchEvent(new Event('themeChanged'));
        });
    }
});

// Add shake animation dynamically if not in CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        50% { transform: translateX(10px); }
        75% { transform: translateX(-10px); }
    }
`;
document.head.appendChild(style);
