(function() {
    // Global AppLoader API
    window.AppLoader = {
        show: function(message = "Processing...") {
            let loaderWrapper = document.getElementById('global-loader');
            if (!loaderWrapper) {
                loaderWrapper = document.createElement('div');
                loaderWrapper.id = 'global-loader';
                loaderWrapper.className = 'loader-wrapper';
                loaderWrapper.innerHTML = `
                    <div class="loader-content-wrapper">
                        <div aria-label="Orange and tan hamster running in a metal wheel" role="img" class="wheel-and-hamster">
                            <div class="wheel"></div>
                            <div class="hamster">
                                <div class="hamster__body">
                                    <div class="hamster__head">
                                        <div class="hamster__ear"></div>
                                        <div class="hamster__eye"></div>
                                        <div class="hamster__nose"></div>
                                    </div>
                                    <div class="hamster__limb hamster__limb--fr"></div>
                                    <div class="hamster__limb hamster__limb--fl"></div>
                                    <div class="hamster__limb hamster__limb--br"></div>
                                    <div class="hamster__limb hamster__limb--bl"></div>
                                    <div class="hamster__tail"></div>
                                </div>
                            </div>
                            <div class="spoke"></div>
                        </div>
                        <div class="loader-status-text">${message}</div>
                    </div>
                `;
                // Always append to body to ensure .dark-mode selectors work
                if (document.body) {
                    document.body.insertBefore(loaderWrapper, document.body.firstChild);
                } else {
                    // If body isn't ready, wait for it
                    document.addEventListener('DOMContentLoaded', () => {
                        document.body.insertBefore(loaderWrapper, document.body.firstChild);
                    });
                }
            } else {
                const textEl = loaderWrapper.querySelector('.loader-status-text');
                if (textEl) textEl.innerText = message;
                loaderWrapper.classList.remove('loader-hidden');
            }
        },
        hide: function() {
            const loader = document.getElementById('global-loader');
            if (loader) {
                loader.classList.add('loader-hidden');
                // We keep it in DOM but hidden to allow quick re-show without re-injecting
                // or we can remove it. Let's remove it after transition for cleaner DOM.
                setTimeout(() => {
                    if (loader.classList.contains('loader-hidden') && loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                }, 500);
            }
        }
    };

    // Initial load logic
    function init() {
        // Show immediately for page load
        window.AppLoader.show("Loading Application...");

        // Hide when ready
        const hideOnReady = () => {
            setTimeout(() => window.AppLoader.hide(), 500);
        };

        if (document.readyState === 'complete') {
            hideOnReady();
        } else {
            window.addEventListener('load', hideOnReady);
        }
    }

    init();
})();
