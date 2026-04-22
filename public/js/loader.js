(function () {
    // Global AppLoader API
    window.AppLoader = {
        show: function (message = "Processing...") {
            let loaderWrapper = document.getElementById('global-loader');
            if (!loaderWrapper) {
                loaderWrapper = document.createElement('div');
                loaderWrapper.id = 'global-loader';
                loaderWrapper.className = 'loader-wrapper';
                loaderWrapper.innerHTML = `
                    <div class="loader-content-wrapper">
                        <div class="skeleton-loader">
                            <div class="skeleton-circle"></div>
                            <div class="skeleton-lines">
                                <div class="skeleton-line short"></div>
                                <div class="skeleton-line long"></div>
                            </div>
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
        hide: function () {
            const loader = document.getElementById('global-loader');
            if (loader) {
                // Immediately disable interaction to prevent blocking inputs during fade-out
                loader.style.pointerEvents = 'none';
                loader.classList.add('loader-hidden');

                // Remove from DOM once transition is done
                const removeLoader = () => {
                    if (loader && loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                };
                
                // Safety: Remove after 600ms (matches CSS transition)
                setTimeout(removeLoader, 600);
                
                // Extra Safety: If still in DOM after 1s, force remove
                setTimeout(removeLoader, 1000);
            }
        }
    };

    // Initial load logic
    function init() {
        // Check if we should skip the auto-loader (e.g., on Login page)
        const skipLoader = document.documentElement.hasAttribute('data-no-auto-loader') ||
            (document.body && document.body.hasAttribute('data-no-auto-loader'));

        if (skipLoader) {
            return;
        }

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
