/**
 * AURA OMNI-SEARCH ENGINE
 * A professional, system-wide search system for Joshi Choice Center.
 * Features: Instant Search, Keyboard Navigation, Category Badges.
 */

(function () {
    let overlay, container, input, resultsArea, miniProfileOverlay;
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

        // Inject Mini Profile Modal HTML
        miniProfileOverlay = document.createElement('div');
        miniProfileOverlay.id = 'miniProfileOverlay';
        miniProfileOverlay.className = 'mini-profile-overlay';
        miniProfileOverlay.style.opacity = '0';
        miniProfileOverlay.style.pointerEvents = 'none';
        miniProfileOverlay.style.visibility = 'hidden';
        
        miniProfileOverlay.innerHTML = `
            <div class="mini-profile-card">
                <div class="mini-profile-avatar" id="miniProfileAvatar">C</div>
                <div class="mini-profile-name" id="miniProfileName">Customer Name</div>
                <div class="mini-profile-title">Mini Profile</div>
                <div class="mini-profile-details">
                    <div class="mini-profile-field">
                        <span class="mini-profile-label">Mobile Number</span>
                        <span class="mini-profile-value" id="miniProfileMobile">N/A</span>
                    </div>
                    <div class="mini-profile-field">
                        <span class="mini-profile-label">Aadhar Number</span>
                        <span class="mini-profile-value" id="miniProfileAadhar">N/A</span>
                    </div>
                    <div class="mini-profile-field">
                        <span class="mini-profile-label">Bank Name</span>
                        <span class="mini-profile-value" id="miniProfileBank">N/A</span>
                    </div>
                    <div class="mini-profile-field">
                        <span class="mini-profile-label">SIM/Operator</span>
                        <span class="mini-profile-value" id="miniProfileSIM">N/A</span>
                    </div>
                </div>
                <div class="mini-profile-actions">
                    <button type="button" class="mini-profile-btn close" id="miniProfileCloseBtn">Close</button>
                    <button type="button" class="mini-profile-btn view" id="miniProfileViewBtn">View Profile</button>
                </div>
            </div>
        `;
        document.body.appendChild(miniProfileOverlay);

        // Bind Close Events for Mini Profile
        document.getElementById('miniProfileCloseBtn').addEventListener('click', hideMiniProfile);
        miniProfileOverlay.addEventListener('click', (e) => {
            if (e.target === miniProfileOverlay) hideMiniProfile();
        });

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
        if ((e.altKey && e.key.toLowerCase() === 'f') || (e.ctrlKey && e.key.toLowerCase() === 'f')) {
            e.preventDefault();
            toggle();
        }
        if (e.key === 'Escape') hide();
    };

    let searchCache = { transactions: [], customers: [], pending: [] };
    let searchTimeout = null;

    const toggle = () => {
        if (overlay.classList.contains('active')) hide();
        else show();
    };

    const show = () => {
        try {
            searchCache.transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            searchCache.customers = JSON.parse(localStorage.getItem('customers') || '[]');
            searchCache.pending = JSON.parse(localStorage.getItem('pendingCustomers') || '[]');
        } catch (e) {
            console.error("Omni-Search: Data corruption detected.", e);
            searchCache = { transactions: [], customers: [], pending: [] };
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
        searchCache = { transactions: [], customers: [], pending: [] };
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
                        subtitle: `${txnId} | ${t.customerName || 'Walk-in'} | \u20B9${t.totalAmount || 0}`,
                        icon: '📄',
                        id: txnId,
                        data: t
                    });
                }
            });

         // Search Cached Pending Payments (Multi-keyword AND)
            searchCache.pending.forEach(p => {
                const searchString = `${p.name || ""} ${p.mobile || ""} ${p.work || ""} ${p.status || ""}`.toLowerCase();
                const isMatch = queryWords.every(word => searchString.includes(word));

                if (isMatch) {
                    results.push({
                        type: 'pending',
                        title: `${p.name || "Customer"} (Pending)`,
                        subtitle: `${p.work || 'Work'} | \u20B9${p.charge || 0} | ${p.status || 'Pending'}`,
                        icon: '⏳', // Pending ke liye hourglass icon
                        id: p.id,
                        data: p
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
                    <span class="omni-result-badge badge-${res.type}">${res.type === 'customer' ? 'Customer' : (res.type === 'pending' ? 'Pending' : 'Transaction')}</span>
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

    const cleanMobile = (m) => (m || "").toString().replace(/^\+91\s?/, "").replace(/\D/g, "").slice(-10);

    const getCustomerIntelligence = (customer) => {
        const customerTxns = searchCache.transactions.filter(t => {
            if (t.customerId && t.customerId === customer.id) return true;
            const targetClean = cleanMobile(customer.mobile || customer.mobileNumber);
            return targetClean !== "" && cleanMobile(t.mobileNumber || t.mobile) === targetClean;
        });

        const bankFreq = {};
        const simFreq = {};
        customerTxns.forEach(t => {
            const sName = (t.serviceName || "").toString();
            if (sName.includes("Banking")) {
                const parts = sName.split(" - ");
                if (parts.length >= 2) {
                    const bank = parts[1].trim();
                    bankFreq[bank] = (bankFreq[bank] || 0) + 1;
                }
            }
            if (sName.includes("Recharge") || sName.includes("Mobile")) {
                ["Jio", "Airtel", "Vi", "BSNL"].forEach(op => {
                    if (sName.toLowerCase().includes(op.toLowerCase())) {
                        simFreq[op] = (simFreq[op] || 0) + 1;
                    }
                });
            }
        });

        const sortedBanks = Object.entries(bankFreq).sort((a, b) => b[1] - a[1]);
        const bankName = sortedBanks.length > 0 ? sortedBanks[0][0] : "None Detected";

        const sortedSIMs = Object.entries(simFreq).sort((a, b) => b[1] - a[1]);
        const simName = sortedSIMs.length > 0 ? sortedSIMs[0][0] : "Unknown";

        return { bankName, simName };
    };

    const showMiniProfile = (customer) => {
        const intel = getCustomerIntelligence(customer);
        
        document.getElementById('miniProfileName').textContent = customer.name || "Walk-in Customer";
        
        // Circular name (e.g. Initials AJ or A)
        const nameParts = (customer.name || "C").trim().split(/\s+/);
        let initials = "";
        if (nameParts.length >= 2) {
            initials = nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        } else if (nameParts.length === 1) {
            initials = nameParts[0].charAt(0).toUpperCase();
        }
        document.getElementById('miniProfileAvatar').textContent = initials || "C";
        
        document.getElementById('miniProfileMobile').textContent = customer.mobile || customer.mobileNumber || "N/A";
        document.getElementById('miniProfileAadhar').textContent = customer.aadhar || customer.aadharNumber || "N/A";
        document.getElementById('miniProfileBank').textContent = intel.bankName;
        document.getElementById('miniProfileSIM').textContent = intel.simName;
        
        const viewBtn = document.getElementById('miniProfileViewBtn');
        if (customer.id === "GUEST" || (customer.id && customer.id.includes("WALKIN"))) {
            viewBtn.style.display = 'none';
        } else {
            viewBtn.style.display = 'block';
            viewBtn.onclick = () => {
                hideMiniProfile();
                hide();
                window.location.href = `customer-profile.html?cid=${encodeURIComponent(customer.id)}`;
            };
        }
        
        miniProfileOverlay.style.opacity = '1';
        miniProfileOverlay.style.pointerEvents = 'all';
        miniProfileOverlay.style.visibility = 'visible';
        miniProfileOverlay.classList.add('active');
        
        window.removeEventListener('keydown', handleGlobalKeydown);
        window.addEventListener('keydown', handleMiniProfileKeydown);
    };

    const hideMiniProfile = () => {
        miniProfileOverlay.style.opacity = '0';
        miniProfileOverlay.style.pointerEvents = 'none';
        miniProfileOverlay.style.visibility = 'hidden';
        miniProfileOverlay.classList.remove('active');
        
        window.removeEventListener('keydown', handleMiniProfileKeydown);
        window.addEventListener('keydown', handleGlobalKeydown);
    };

    const handleMiniProfileKeydown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            hideMiniProfile();
        }
    };

    const executeResult = (res) => {
        let customerObj = null;
        if (res.type === 'customer') {
            customerObj = res.data;
        } else if (res.type === 'txn') {
            const cleanResMob = cleanMobile(res.data.mobileNumber || res.data.mobile);
            customerObj = searchCache.customers.find(c => {
                if (c.id && res.data.customerId && c.id === res.data.customerId) return true;
                return cleanResMob !== "" && cleanMobile(c.mobile || c.mobileNumber) === cleanResMob;
            });
            if (!customerObj && res.data.customerName) {
                customerObj = searchCache.customers.find(c => (c.name || "").trim().toLowerCase() === res.data.customerName.trim().toLowerCase());
            }
        } else if (res.type === 'pending') {
            const cleanResMob = cleanMobile(res.data.mobile);
            customerObj = searchCache.customers.find(c => {
                return cleanResMob !== "" && cleanMobile(c.mobile || c.mobileNumber) === cleanResMob;
            });
            if (!customerObj && res.data.name) {
                customerObj = searchCache.customers.find(c => (c.name || "").trim().toLowerCase() === res.data.name.trim().toLowerCase());
            }
        }

        if (!customerObj) {
            customerObj = {
                id: (res.data && (res.data.customerId || res.data.id)) || "GUEST",
                name: (res.data && (res.data.customerName || res.data.name)) || "Walk-in Customer",
                mobile: (res.data && (res.data.mobileNumber || res.data.mobile)) || "N/A",
                aadhar: (res.data && (res.data.aadhar || res.data.aadharNumber)) || "N/A",
                address: (res.data && res.data.address) || "N/A"
            };
        }

        showMiniProfile(customerObj);
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
