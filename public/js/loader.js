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
                        <div class="loader-uiverse"></div>
                        <div class="loader-status-text">${message}</div>
                    </div>
                `;
                if (document.body) {
                    document.body.prepend(loaderWrapper);
                } else {
                    // Fallback if body not ready
                    document.documentElement.appendChild(loaderWrapper);
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
