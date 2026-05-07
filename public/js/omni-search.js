/**
 * AURA OMNI-SEARCH ENGINE
 * A professional, system-wide search system for Joshi Choice Center.
 * Features: Instant Search, Keyboard Navigation, Category Badges.
 */

(function () {
    let overlay, container, input, resultsArea;
    let selectedIndex = -1;
    let currentResults = [];

    const init = () => {
        if (document.getElementById('omniSearchOverlay')) return;

        // 1. Inject HTML with explicit hidden state
        overlay = document.createElement('div');
        overlay.id = 'omniSearchOverlay';
        overlay.className = 'omni-search-overlay';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.visibility = 'hidden';
        
        overlay.innerHTML = `
            <div class="omni-search-container" id="omniSearchContainer">
                <div class="omni-search-box">
                    <svg class="omni-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" class="omni-search-input" id="omniSearchInput" placeholder="Search customers, transactions or services..." autocomplete="off">
                    <div class="omni-search-shortcut">ESC TO CLOSE</div>
                </div>
                <div class="omni-results-area" id="omniResultsArea"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        container = document.getElementById('omniSearchContainer');
        input = document.getElementById('omniSearchInput');
        resultsArea = document.getElementById('omniResultsArea');

        // 2. Event Listeners
        window.addEventListener('keydown', handleGlobalKeydown);
        input.addEventListener('input', handleSearch);
        input.addEventListener('keydown', handleInputKeydown);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hide();
        });

        // 3. Listen for IPC trigger from Main Process
        if (window.electronAPI && window.electronAPI.onTriggerOmniSearch) {
            window.electronAPI.onTriggerOmniSearch(() => {
                show();
            });
        }
    };

    const handleGlobalKeydown = (e) => {
        // Toggle with Alt + F (Find) or Ctrl + K
        if ((e.altKey && e.key.toLowerCase() === 'f') || (e.ctrlKey && e.key.toLowerCase() === 'k')) {
            e.preventDefault();
            toggle();
        }
        if (e.key === 'Escape') hide();
    };

    let searchCache = { transactions: [], customers: [] };
    let searchTimeout = null;

    const toggle = () => {
        if (overlay.classList.contains('active')) hide();
        else show();
    };

    const show = () => {
        try {
            searchCache.transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            searchCache.customers = JSON.parse(localStorage.getItem('customers') || '[]');
        } catch (e) {
            console.error("Omni-Search: Data corruption detected.", e);
            searchCache = { transactions: [], customers: [] };
        }

        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
        overlay.style.visibility = 'visible';
        overlay.classList.add('active');
        input.value = '';
        resultsArea.style.display = 'none';
        currentResults = [];
        selectedIndex = -1;
        setTimeout(() => input.focus(), 100);
    };

    const hide = () => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.visibility = 'hidden';
        overlay.classList.remove('active');
        input.blur();
        currentResults = [];
        searchCache = { transactions: [], customers: [] };
    };

    const handleSearch = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const rawQuery = input.value.trim().toLowerCase();
            if (!rawQuery) {
                resultsArea.style.display = 'none';
                currentResults = [];
                return;
            }

            const queryWords = rawQuery.split(/\s+/);
            const results = [];

            // Search Cached Customers (Multi-keyword AND)
            searchCache.customers.forEach(c => {
                const searchString = `${c.name} ${c.mobile || c.mobileNumber || ""} ${c.aadhar || c.aadharNumber || ""} ${c.address || ""}`.toLowerCase();
                const isMatch = queryWords.every(word => searchString.includes(word));
                
                if (isMatch) {
                    results.push({
                        type: 'customer',
                        title: c.name || "Unknown Customer",
                        subtitle: `Mobile: ${c.mobile || c.mobileNumber || 'N/A'} | ${c.address || 'N/A'}`,
                        icon: '👤',
                        id: c.id,
                        data: c
                    });
                }
            });

            // Search Cached Transactions (Multi-keyword AND)
            searchCache.transactions.forEach(t => {
                const searchString = `${t.transactionId || t.txnId || ""} ${t.customerName || ""} ${t.serviceName || t.serviceType || ""} ${t.totalAmount || ""}`.toLowerCase();
                const isMatch = queryWords.every(word => searchString.includes(word));

                if (isMatch) {
                    const txnId = (t.transactionId || t.txnId || t.id || "").toString();
                    results.push({
                        type: 'txn',
                        title: t.serviceName || t.serviceType || "Service",
                        subtitle: `${txnId} | ${t.customerName || 'Walk-in'} | ₹${t.totalAmount || 0}`,
                        icon: '📄',
                        id: txnId,
                        data: t
                    });
                }
            });

            currentResults = results.slice(0, 10); // Increased limit slightly
            renderResults();
        }, 150);
    };

    const renderResults = () => {
        if (currentResults.length === 0) {
            resultsArea.innerHTML = `
                <div class="omni-no-results">
                    <span>🔍</span>
                    <p>No matches found for "${input.value}"</p>
                </div>
            `;
        } else {
            resultsArea.innerHTML = currentResults.map((res, index) => `
                <div class="omni-result-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
                    <div class="omni-result-icon">${res.icon}</div>
                    <div class="omni-result-info">
                        <div class="omni-result-title">${res.title}</div>
                        <div class="omni-result-subtitle">${res.subtitle}</div>
                    </div>
                    <span class="omni-result-badge badge-${res.type}">${res.type === 'customer' ? 'Customer' : 'Transaction'}</span>
                </div>
            `).join('');

            // Add click events
            resultsArea.querySelectorAll('.omni-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const idx = parseInt(item.getAttribute('data-index'));
                    executeResult(currentResults[idx]);
                });
            });
        }
        resultsArea.style.display = 'block';
    };

    const handleInputKeydown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % currentResults.length;
            renderResults();
            scrollSelectedIntoView();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
            renderResults();
            scrollSelectedIntoView();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && currentResults[selectedIndex]) {
                executeResult(currentResults[selectedIndex]);
            } else if (currentResults.length > 0) {
                executeResult(currentResults[0]);
            }
        }
    };

    const scrollSelectedIntoView = () => {
        const selectedEl = resultsArea.querySelector('.omni-result-item.selected');
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    };

    const executeResult = (res) => {
        hide();
        if (res.type === 'customer') {
            // Navigate to high-fidelity customer profile
            window.location.href = `customer-profile.html?cid=${encodeURIComponent(res.id)}`;
        } else if (res.type === 'txn') {
            // Navigate to reports with txn id highlight
            window.location.href = `reports.html?txnId=${res.id}`;
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose toggle for manual trigger (e.g., from a button)
    window.toggleOmniSearch = toggle;
})();
