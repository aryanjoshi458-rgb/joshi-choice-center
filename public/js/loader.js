(function () {
    // Global AppLoader API - Quantum Phase Edition
    window.AppLoader = {
        show: function (message = "Initializing...") {
            let loaderWrapper = document.getElementById('global-loader');
            if (!loaderWrapper) {
                loaderWrapper = document.createElement('div');
                loaderWrapper.id = 'global-loader';
                loaderWrapper.className = 'loader-wrapper';

                loaderWrapper.innerHTML = `
                    <div class="quantum-system">
                        <div class="quantum-ring"></div>
                        <div class="quantum-core">
                            <span>JC</span>
                        </div>
                        <div class="data-stream" id="quantum-particles"></div>
                    </div>
                    <div class="loader-status-container">
                        <div class="loader-status-text">${message}</div>
                        <div class="loader-progress-bar">
                            <div class="loader-progress-inner"></div>
                        </div>
                    </div>
                `;

                if (document.body) {
                    document.body.insertBefore(loaderWrapper, document.body.firstChild);
                    this.startParticles();
                } else {
                    document.addEventListener('DOMContentLoaded', () => {
                        document.body.insertBefore(loaderWrapper, document.body.firstChild);
                        this.startParticles();
                    });
                }
            } else {
                const textEl = loaderWrapper.querySelector('.loader-status-text');
                if (textEl) textEl.innerText = message;
                loaderWrapper.classList.remove('loader-hidden');
            }
        },

        startParticles: function () {
            const container = document.getElementById('quantum-particles');
            if (!container) return;

            this.particleTimer = setInterval(() => {
                this.createNode(container);
            }, 100);
        },

        createNode: function (container) {
            const node = document.createElement('div');
            node.className = 'stream-node';

            const angle = Math.random() * Math.PI * 2;
            const radius = 60 + Math.random() * 40;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            node.style.left = '50%';
            node.style.top = '50%';

            container.appendChild(node);

            node.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.5, offset: 0.2 },
                { transform: `translate(${-50 + x}px, ${-50 + y}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'ease-out'
            }).onfinish = () => node.remove();
        },

        hide: function () {
            const loader = document.getElementById('global-loader');
            if (loader) {
                if (this.particleTimer) clearInterval(this.particleTimer);
                loader.style.pointerEvents = 'none';
                loader.classList.add('loader-hidden');

                setTimeout(() => {
                    if (loader && loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                }, 400); // Faster exit
            }
        }
    };

    // Initial load logic
    function init() {
        const skipLoader = document.documentElement.hasAttribute('data-no-auto-loader') ||
            (document.body && document.body.hasAttribute('data-no-auto-loader'));

        if (skipLoader) return;

        window.AppLoader.show("System Accessing...");

        const hideOnReady = () => {
            // Reduced delay to 300ms for snappier feel
            setTimeout(() => window.AppLoader.hide(), 300);
        };

        if (document.readyState === 'complete') {
            hideOnReady();
        } else {
            window.addEventListener('load', hideOnReady);
        }
    }

    init();
})();
