/* RATE LIST LOGIC */
document.addEventListener("DOMContentLoaded", () => {
    const rateTableBody = document.getElementById("rateTableBody");
    const searchInput = document.getElementById("searchRates");
    const addRateBtn = document.getElementById("addRateBtn");

    // Modal Elements
    const rateModal = document.getElementById("rateModal");
    const rateForm = document.getElementById("rateForm");
    const serviceNameInput = document.getElementById("serviceName");
    const serviceCategoryInput = document.getElementById("serviceCategory");
    const servicePriceInput = document.getElementById("servicePrice");
    const serviceChargeInput = document.getElementById("serviceCharge");
    const saveRateBtn = document.getElementById("saveRateBtn");
    const cancelRateBtn = document.getElementById("cancelRateBtn");

    let editMode = false;
    let editId = null;

    // Default Rates to seed
    const defaultRates = [
        { id: "1", name: "Aadhaar Print (Color)", category: "Govt Services", price: 30, charge: 5 },
        { id: "2", name: "Aadhaar Download + Print", category: "Govt Services", price: 50, charge: 10 },
        { id: "3", name: "Passport Photo (8 Copy)", category: "Photography", price: 50, charge: 0 },
        { id: "4", name: "Scanning (Per Page)", category: "Document", price: 10, charge: 0 },
        { id: "5", name: "Lamination (A4)", category: "Document", price: 20, charge: 0 },
        { id: "6", name: "Pan Card Application", category: "Govt Services", price: 250, charge: 50 },
        { id: "7", name: "Money Transfer (Upto 5k)", category: "Banking", price: 50, charge: 25 }
    ];

    // Load Rates
    function loadRates(filter = "") {
        let rates = JSON.parse(localStorage.getItem("serviceRates"));
        if (!rates) {
            rates = defaultRates;
            localStorage.setItem("serviceRates", JSON.stringify(rates));
        }

        rateTableBody.innerHTML = "";

        const filtered = rates.filter(r =>
            r.name.toLowerCase().includes(filter.toLowerCase()) ||
            r.category.toLowerCase().includes(filter.toLowerCase())
        );

        filtered.forEach(rate => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div class="service-name-text" style="font-weight: 600;">${rate.name}</div>
                </td>
                <td><span class="category-tag">${rate.category}</span></td>
                <td><span class="price-tag">₹${rate.price}</span></td>
                <td><span class="charge-tag">₹${rate.charge || 0}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" data-id="${rate.id}">✏️</button>
                        <button class="action-btn delete" data-id="${rate.id}">🗑️</button>
                    </div>
                </td>
            `;
            rateTableBody.appendChild(tr);
        });

        attachActionListeners();
    }

    // Search logic
    searchInput.addEventListener("input", (e) => {
        loadRates(e.target.value);
    });

    // Modal Logic
    addRateBtn.addEventListener("click", () => {
        editMode = false;
        editId = null;
        rateForm.reset();
        rateModal.classList.add("active");
    });

    cancelRateBtn.addEventListener("click", () => {
        rateModal.classList.remove("active");
    });

    saveRateBtn.addEventListener("click", () => {
        const name = serviceNameInput.value.trim();
        const category = serviceCategoryInput.value.trim();
        const price = Number(servicePriceInput.value);
        const charge = Number(serviceChargeInput.value);

        if (!name || !price) {
            AuraDialog.error("Name and Price are required!", "Input Error");
            return;
        }

        let rates = JSON.parse(localStorage.getItem("serviceRates")) || [];

        if (editMode) {
            const index = rates.findIndex(r => r.id === editId);
            if (index !== -1) {
                rates[index] = { id: editId, name, category, price, charge };
            }
        } else {
            const newRate = {
                id: Date.now().toString(),
                name,
                category,
                price,
                charge
            };
            rates.push(newRate);
        }

        localStorage.setItem("serviceRates", JSON.stringify(rates));
        rateModal.classList.remove("active");
        loadRates();
        if (window.showToast) window.showToast("Rate updated!", "success");
    });

    function attachActionListeners() {
        document.querySelectorAll(".action-btn.delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                const confirmed = await AuraDialog.confirm("Are you sure you want to delete this service?", "Delete Service", true);
                if (confirmed) {
                    let rates = JSON.parse(localStorage.getItem("serviceRates")) || [];
                    rates = rates.filter(r => r.id !== id);
                    localStorage.setItem("serviceRates", JSON.stringify(rates));
                    loadRates();
                    if (window.showToast) window.showToast("Service deleted!", "error");
                }
            });
        });

        document.querySelectorAll(".action-btn.edit").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                let rates = JSON.parse(localStorage.getItem("serviceRates")) || [];
                const rate = rates.find(r => r.id === id);

                if (rate) {
                    editMode = true;
                    editId = id;
                    serviceNameInput.value = rate.name;
                    serviceCategoryInput.value = rate.category;
                    servicePriceInput.value = rate.price;
                    serviceChargeInput.value = rate.charge || 0;
                    rateModal.classList.add("active");
                }
            });
        });
    }

    loadRates();
});
