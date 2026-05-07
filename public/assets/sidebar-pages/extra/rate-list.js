/* RATE LIST LOGIC - PREMIUM REDESIGN v2 */
document.addEventListener("DOMContentLoaded", () => {
    const servicesGrid = document.getElementById("servicesGrid");
    const categoryTabs = document.getElementById("categoryTabs");
    const searchInput = document.getElementById("searchRates");
    const addRateBtn = document.getElementById("addRateBtn");
    const resetRatesBtn = document.getElementById("resetRatesBtn");
    const listViewBtn = document.getElementById("listViewBtn");
    const gridViewBtn = document.getElementById("gridViewBtn");

    // Modal Elements
    const rateModal = document.getElementById("rateModal");
    const rateForm = document.getElementById("rateForm");
    const serviceNameInput = document.getElementById("serviceName");
    const serviceCategoryInput = document.getElementById("serviceCategory");
    const servicePriceInput = document.getElementById("servicePrice");
    const serviceChargeInput = document.getElementById("serviceCharge");
    const chargeTypeSelect = document.getElementById("chargeType");
    const fixedChargeContainer = document.getElementById("fixedChargeContainer");
    const rangeChargeContainer = document.getElementById("rangeChargeContainer");
    const rangeList = document.getElementById("rangeList");
    const addRangeBtn = document.getElementById("addRangeBtn");
    const saveRateBtn = document.getElementById("saveRateBtn");
    const cancelRateBtn = document.getElementById("cancelRateBtn");

    let editMode = false;
    let editId = null;
    let activeCategory = "all";
    let viewMode = "list"; // Default to list

    const defaultRates = [
        { id: "1", name: "Aadhaar Print (Color)", category: "Govt Services", price: 30, chargeType: "fixed", charge: 5 },
        { id: "2", name: "Aadhaar Download + Print", category: "Govt Services", price: 50, chargeType: "fixed", charge: 10 },
        { id: "3", name: "Passport Photo (8 Copy)", category: "Photography", price: 50, chargeType: "fixed", charge: 0 },
        { id: "4", name: "Scanning (Per Page)", category: "Document", price: 10, chargeType: "fixed", charge: 0 },
        { id: "5", name: "Lamination (A4)", category: "Document", price: 20, chargeType: "fixed", charge: 0 },
        { id: "6", name: "Pan Card Application", category: "Govt Services", price: 250, chargeType: "fixed", charge: 50 },
        {
            id: "7", name: "Cash Withdrawal", category: "Banking", price: 0, chargeType: "range", chargeRanges: [
                { min: 0, max: 1000, charge: 10 },
                { min: 1001, max: 2000, charge: 20 },
                { min: 2001, max: 3000, charge: 30 },
                { min: 3001, max: 5000, charge: 50 },
                { min: 5001, max: 10000, charge: 100 }
            ]
        },
        { id: "8", name: "Mobile Recharge", category: "Mobile & Utility", price: 0, chargeType: "fixed", charge: 1 }
    ];

    const serviceMap = [
        { name: "Cash Deposit", cat: "Banking" },
        { name: "Cash Withdrawal", cat: "Banking" },
        { name: "Balance Enquiry", cat: "Banking" },
        { name: "Mini Statement", cat: "Banking" },
        { name: "Account Opening", cat: "Banking" },
        { name: "Fund Transfer", cat: "Banking" },
        { name: "Black & White Photocopy", cat: "Printing" },
        { name: "PDF Print Out", cat: "Printing" },
        { name: "Document Lamination", cat: "Document" },
        { name: "New PAN Card Application", cat: "Govt Services" },
        { name: "Correction in PAN Card", cat: "Govt Services" },
        { name: "PAN Card Reprint / Lost", cat: "Govt Services" },
        { name: "New Voter ID Registration", cat: "Govt Services" },
        { name: "Correction in Voter ID", cat: "Govt Services" },
        { name: "Replacement / Lost Voter ID", cat: "Govt Services" },
        { name: "Aadhaar Linking (Voter)", cat: "Govt Services" },
        { name: "Mobile Recharge", cat: "Mobile & Utility" },
        { name: "Google Play Recharge", cat: "Mobile & Utility" },
        { name: "Money Transfer (PhonePe/UPI)", cat: "Mobile & Utility" },
        { name: "Electricity Bill Payment", cat: "Mobile & Utility" }
    ];

    function getRates() {
        let rates = JSON.parse(localStorage.getItem("serviceRates"));
        if (!rates) {
            rates = defaultRates;
            localStorage.setItem("serviceRates", JSON.stringify(rates));
        }
        return rates;
    }

    function renderTabs() {
        const rates = getRates();
        const categories = ["all", ...new Set(rates.map(r => r.category))];

        categoryTabs.innerHTML = "";
        categories.forEach(cat => {
            const btn = document.createElement("button");
            btn.className = `cat-tab ${activeCategory === cat ? "active" : ""}`;
            btn.textContent = cat === "all" ? "All Services" : cat;
            btn.onclick = () => {
                activeCategory = cat;
                renderTabs();
                renderServices();
            };
            categoryTabs.appendChild(btn);
        });
    }

    function renderServices(filter = "") {
        const rates = getRates();
        servicesGrid.innerHTML = "";

        // Apply view mode class
        if (viewMode === "list") servicesGrid.classList.add("list-view");
        else servicesGrid.classList.remove("list-view");

        const filtered = rates.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(filter.toLowerCase()) ||
                r.category.toLowerCase().includes(filter.toLowerCase());
            const matchesCat = activeCategory === "all" || r.category === activeCategory;
            return matchesSearch && matchesCat;
        });

        const categoryIcons = {
            "Govt Services": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3"></path><path d="M5 21V10"></path><path d="M9 21V10"></path><path d="M15 21V10"></path><path d="M19 21V10"></path><path d="M2 7l10-5 10 5"></path></svg>`,
            "Photography": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
            "Document": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
            "Banking": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
            "Mobile & Utility": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`,
            "Printing": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,
            "Default": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
        };

        filtered.forEach(rate => {
            const card = document.createElement("div");
            card.className = "service-card";

            const icon = categoryIcons[rate.category] || categoryIcons["Default"];

            let chargeHtml = "";
            if (rate.chargeType === "range") {
                chargeHtml = `<span class="charge-tag range" title="${rate.chargeRanges.map(r => `₹${r.min}-${r.max}: ₹${r.charge}`).join('\n')}">Dynamic 📊</span>`;
            } else {
                chargeHtml = `₹${rate.charge || 0}`;
            }

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <div class="header-icon" style="width: 38px; height: 38px; background: rgba(99, 102, 241, 0.1); color: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${icon}
                    </div>
                    <div style="overflow: hidden;">
                        <h3 class="service-name" style="margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${rate.name}</h3>
                        <span class="cat-badge" style="margin: 0;">${rate.category}</span>
                    </div>
                </div>
                <div class="card-stats">
                    <div class="stat-box">
                        <span class="stat-label">Base Price</span>
                        <span class="stat-value">₹${rate.price}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Service Charge</span>
                        <span class="stat-value">${chargeHtml}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="card-btn edit" data-id="${rate.id}" title="Edit Service">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="card-btn delete" data-id="${rate.id}" title="Delete Service">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            `;
            servicesGrid.appendChild(card);
        });

        attachActionListeners();
    }

    function attachActionListeners() {
        // We use direct assignment to ensure they work after render
        servicesGrid.querySelectorAll(".card-btn.delete").forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const confirmed = await window.AuraDialog.confirm("Delete this service rate permanently?", "Delete Service", true);
                if (confirmed) {
                    if (window.AppLoader) window.AppLoader.show("Removing Service...");
                    
                    setTimeout(() => {
                        let rates = getRates().filter(r => r.id !== id);
                        localStorage.setItem("serviceRates", JSON.stringify(rates));
                        renderServices();
                        renderTabs();
                        if (window.AppLoader) window.AppLoader.hide();
                        if (window.showToast) window.showToast("Service deleted!", "error");
                    }, 600);
                }
            };
        });

        servicesGrid.querySelectorAll(".card-btn.edit").forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const rate = getRates().find(r => r.id === id);
                if (rate) {
                    editMode = true;
                    editId = id;
                    serviceNameInput.value = rate.name;
                    serviceCategoryInput.value = rate.category;
                    servicePriceInput.value = rate.price;

                    chargeTypeSelect.value = rate.chargeType || "fixed";
                    toggleChargeMode(rate.chargeType || "fixed");

                    if (rate.chargeType === "range") {
                        rangeList.innerHTML = "";
                        (rate.chargeRanges || []).forEach(rng => addRangeRow(rng.min, rng.max, rng.charge));
                    } else {
                        serviceChargeInput.value = rate.charge || 0;
                    }

                    document.getElementById("modalTitle").textContent = "Edit Service Rate";
                    rateModal.classList.add("active");
                }
            };
        });
    }

    function toggleChargeMode(mode) {
        if (mode === "fixed") {
            fixedChargeContainer.style.display = "block";
            rangeChargeContainer.style.display = "none";
        } else {
            fixedChargeContainer.style.display = "none";
            rangeChargeContainer.style.display = "block";
            if (rangeList.children.length === 0) addRangeRow();
        }
    }

    function addRangeRow(min = "", max = "", charge = "") {
        const div = document.createElement("div");
        div.className = "range-row";
        div.style.display = "flex"; div.style.gap = "5px"; div.style.marginBottom = "5px";
        div.innerHTML = `
            <input type="number" class="modal-input range-min" placeholder="Min" value="${min}" style="flex:1;">
            <input type="number" class="modal-input range-max" placeholder="Max" value="${max}" style="flex:1;">
            <input type="number" class="modal-input range-charge" placeholder="Charge" value="${charge}" style="flex:1;">
            <button type="button" class="remove-range" style="background:none; border:none; color:#ff4d4d; cursor:pointer;">&times;</button>
        `;
        rangeList.appendChild(div);
        div.querySelector(".remove-range").onclick = () => div.remove();
    }

    // Initialize
    function init() {
        renderTabs();
        renderServices();

        // Populate Suggestions Logic
        const suggestionsBox = document.getElementById("serviceSuggestions");
        
        function renderSuggestions(filter = "") {
            const filtered = serviceMap.filter(s => 
                s.name.toLowerCase().includes(filter.toLowerCase())
            );
            
            if (filtered.length === 0) {
                suggestionsBox.classList.remove("active");
                return;
            }
            
            suggestionsBox.innerHTML = filtered.map(s => `
                <div class="suggestion-item" data-name="${s.name}" data-cat="${s.cat}">
                    ${s.name}
                </div>
            `).join("");
            
            suggestionsBox.classList.add("active");
            
            // Add click listeners to items
            suggestionsBox.querySelectorAll(".suggestion-item").forEach(item => {
                item.onclick = () => {
                    serviceNameInput.value = item.dataset.name;
                    serviceCategoryInput.value = item.dataset.cat;
                    suggestionsBox.classList.remove("active");
                };
            });
        }

        if (serviceNameInput) {
            serviceNameInput.addEventListener("input", (e) => {
                renderSuggestions(e.target.value);
                
                // Auto-Category for exact match (manual typing)
                const match = serviceMap.find(s => s.name === e.target.value);
                if (match && serviceCategoryInput) {
                    serviceCategoryInput.value = match.cat;
                }
            });

            // Close suggestions on blur (with delay for click)
            serviceNameInput.addEventListener("blur", () => {
                setTimeout(() => suggestionsBox.classList.remove("active"), 200);
            });

            // Show all on focus if empty
            serviceNameInput.addEventListener("focus", () => {
                renderSuggestions(serviceNameInput.value);
            });
        }

        // Main Action Listeners
        if (addRateBtn) addRateBtn.onclick = () => {
            editMode = false;
            editId = null;
            rateForm.reset();
            toggleChargeMode("fixed");
            rangeList.innerHTML = "";
            document.getElementById("modalTitle").textContent = "Add New Service";
            rateModal.classList.add("active");
        };

        if (cancelRateBtn) cancelRateBtn.onclick = () => rateModal.classList.remove("active");

        if (saveRateBtn) saveRateBtn.onclick = handleSaveRate;

        if (resetRatesBtn) resetRatesBtn.onclick = handleReset;

        if (listViewBtn) listViewBtn.onclick = () => {
            viewMode = "list";
            listViewBtn.classList.add("active");
            gridViewBtn.classList.remove("active");
            renderServices();
        };

        if (gridViewBtn) gridViewBtn.onclick = () => {
            viewMode = "grid";
            gridViewBtn.classList.add("active");
            listViewBtn.classList.remove("active");
            renderServices();
        };

        if (searchInput) searchInput.oninput = (e) => renderServices(e.target.value);
        if (chargeTypeSelect) chargeTypeSelect.onchange = (e) => toggleChargeMode(e.target.value);
        if (addRangeBtn) addRangeBtn.onclick = () => addRangeRow();
    }

    async function handleReset() {
        const confirmed = await window.AuraDialog.confirm("Reset all rates to original defaults?", "Reset", true);
        if (confirmed) {
            localStorage.removeItem("serviceRates");
            activeCategory = "all";
            renderTabs();
            renderServices();
        }
    }

    function handleSaveRate() {
        const name = serviceNameInput.value.trim();
        const category = serviceCategoryInput.value.trim();
        const price = Number(servicePriceInput.value);
        const chargeType = chargeTypeSelect.value;

        if (!name || isNaN(price)) {
            if (window.AuraDialog) window.AuraDialog.error("Please fill required fields.");
            return;
        }

        let chargeData = { chargeType };
        if (chargeType === "range") {
            const ranges = [];
            rangeList.querySelectorAll(".range-row").forEach(row => {
                ranges.push({
                    min: Number(row.querySelector(".range-min").value),
                    max: Number(row.querySelector(".range-max").value),
                    charge: Number(row.querySelector(".range-charge").value)
                });
            });
            chargeData.chargeRanges = ranges;
            chargeData.charge = 0;
        } else {
            chargeData.charge = Number(serviceChargeInput.value);
            chargeData.chargeRanges = [];
        }

        let rates = getRates();
        const rateData = { id: editMode ? editId : Date.now().toString(), name, category, price, ...chargeData };

        if (editMode) {
            const idx = rates.findIndex(r => r.id === editId);
            if (idx !== -1) rates[idx] = rateData;
        } else {
            rates.push(rateData);
        }

        if (window.AppLoader) window.AppLoader.show(editMode ? "Updating Service..." : "Adding Service...");

        setTimeout(() => {
            localStorage.setItem("serviceRates", JSON.stringify(rates));
            rateModal.classList.remove("active");
            renderServices();
            renderTabs();
            if (window.AppLoader) window.AppLoader.hide();
            if (window.showToast) window.showToast(editMode ? "Rate updated!" : "New service added!", "success");
        }, 800);
    }

    init();
});
