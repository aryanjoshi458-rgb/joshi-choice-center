document.addEventListener('DOMContentLoaded', () => {
    // 1. CINEMATIC INTRO SEQUENCE (GSAP)
    function playIntro() {
        const tl = gsap.timeline();

        // Initial setup
        gsap.set(".login-card", { visibility: "visible", opacity: 0, scale: 0.95, y: 20 });
        gsap.set(".login-logo", { scale: 0.5, opacity: 0, rotate: -10 });
        gsap.set(".signature-mask-path", { strokeDashoffset: 1200 });

        tl.to(".login-logo", {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 1.2,
            ease: "elastic.out(1, 0.8)"
        })
            .to(".login-card", {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 1,
                ease: "expo.out"
            }, "-=0.8")
            .to(".signature-mask-path", {
                strokeDashoffset: 0,
                duration: 2.5,
                ease: "power1.inOut"
            }, "-=0.5")
            .from(".login-header p", {
                y: 10,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=1.5")
            .to(".form-group", {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.6,
                ease: "power2.out"
            }, "-=1.2")
            .to(".login-btn, .forgot-password-link, .login-card-footer", {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.8");
    }

    // Play intro
    playIntro();

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

            gsap.to(".login-card", { y: -20, opacity: 0, scale: 0.95, duration: 0.5, ease: "power2.in" });

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

    // =============================
    // FORGOT PASSWORD RECOVERY
    // =============================
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const recoveryModal = document.getElementById('recoveryModal');
    const closeRecovery = document.getElementById('closeRecovery');
    const recoveryForm = document.getElementById('recoveryForm');
    const recoveryError = document.getElementById('recoveryError');

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => {
            recoveryModal.classList.add('show');
            // GSAP Premium Opening Animation
            gsap.fromTo(".recovery-card",
                { scale: 0.8, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
            );
            gsap.fromTo(".recovery-modal",
                { backgroundColor: "rgba(0,0,0,0)" },
                { backgroundColor: "rgba(0,0,0,0.8)", duration: 0.4 }
            );
        });
    }

    if (closeRecovery) {
        closeRecovery.addEventListener('click', () => {
            gsap.to(".recovery-card", {
                scale: 0.9,
                opacity: 0,
                y: 10,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    recoveryModal.classList.remove('show');
                }
            });
            gsap.to(".recovery-modal", { backgroundColor: "rgba(0,0,0,0)", duration: 0.3 });
        });
    }

    if (recoveryForm) {
        recoveryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const masterKey = document.getElementById('masterKey').value.trim();
            const newPassword = document.getElementById('newPassword').value.trim();

            if (!masterKey || !newPassword) {
                showError('Please fill all fields.');
                return;
            }

            if (window.Auth && window.Auth.resetPassword(masterKey, newPassword)) {
                if (window.AuraDialog) AuraDialog.success('Your password has been reset successfully!', 'Update Success');
                recoveryModal.classList.remove('show');
                recoveryForm.reset();
            } else {
                showError('Invalid Master Key.');
            }
        });
    }

    // Theme Toggle Logic
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
        const currentTheme = localStorage.getItem("theme") || "dark";
        updateThemeUI(currentTheme);

        themeCheckbox.addEventListener('change', () => {
            const newTheme = themeCheckbox.checked ? 'dark' : 'light';
            localStorage.setItem("theme", newTheme);
            updateThemeUI(newTheme);
            window.dispatchEvent(new Event('themeChanged'));
        });
    }

    async function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
            gsap.to(".login-card", { x: 10, repeat: 3, yoyo: true, duration: 0.05, ease: "none" });
            setTimeout(() => errorMessage.classList.remove('show'), 3000);
        } else {
            await AuraDialog.error(message, "Login Failed");
        }
    }

    // =============================
    // LIQUID WAVE LABEL ENGINE
    // =============================
    const floatingLabels = document.querySelectorAll('.floating-group label');
    floatingLabels.forEach(label => {
        const text = label.innerText;
        label.innerHTML = text.split('').map((char, index) => {
            // Preserve spaces
            const displayChar = char === ' ' ? '&nbsp;' : char;
            return `<span style="transition-delay: ${index * 40}ms">${displayChar}</span>`;
        }).join('');
    });
});
