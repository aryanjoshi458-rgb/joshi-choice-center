document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expenseForm");
    const expenseTableBody = document.getElementById("expenseTableBody");
    const expenseSearch = document.getElementById("expenseSearch");
    
    const expDateInput = document.getElementById("expDate");
    
    function getTodayLocal() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Export for use inside loadExpenses
    window.getTodayLocal = getTodayLocal;

    // Set initial date
    if (expDateInput) {
        expDateInput.value = getTodayLocal();
    }

    // Initial Load
    loadExpenses();

    // Listen for Disk Sync Completion
    const refreshExpenses = () => {
        loadExpenses();
    };
    window.addEventListener('auraDataSynced', refreshExpenses);
    if (window.auraSyncComplete) refreshExpenses();

    // Toggle Conditional Fields
    const expCategory = document.getElementById("expCategory");
    const conditionalFields = document.getElementById("conditionalFields");

    if (expCategory && conditionalFields) {
        expCategory.addEventListener("change", () => {
            if (expCategory.value !== "") {
                conditionalFields.style.display = "block";
                // Required attributes when visible
                document.getElementById("expDescription").required = true;
                document.getElementById("expAmount").required = true;
            } else {
                conditionalFields.style.display = "none";
                document.getElementById("expDescription").required = false;
                document.getElementById("expAmount").required = false;
            }
        });
    }

    // Handle Form Submission
    if (expenseForm) {
        expenseForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newExpense = {
                id: Date.now().toString(),
                date: document.getElementById("expDate").value,
                category: document.getElementById("expCategory").value,
                description: document.getElementById("expDescription").value,
                amount: parseFloat(document.getElementById("expAmount").value)
            };

            if (window.AppLoader) window.AppLoader.show("Saving Expense...");

            setTimeout(() => {
                saveExpense(newExpense);
                expenseForm.reset();
                // Reset date after reset
                expDateInput.value = getTodayLocal();
                
                // Hide conditional fields again
                if (conditionalFields) {
                    conditionalFields.style.display = "none";
                    document.getElementById("expDescription").required = false;
                    document.getElementById("expAmount").required = false;
                }
                
                if (window.AppLoader) window.AppLoader.hide();

                if (typeof showToast === "function") {
                    showToast("Expense Saved Successfully! 💸");
                }
            }, 800);
        });
    }

    // Search Functionality
    if (expenseSearch) {
        expenseSearch.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const rows = expenseTableBody.querySelectorAll("tr");
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(term) ? "" : "none";
            });
        });
    }

    function saveExpense(expense) {
        const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        expenses.push(expense);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        
        // Log Notification
        if (window.parent && window.parent.createAppNotification) {
            window.parent.createAppNotification(
                "Expense Logged",
                `Category: ${expense.category}, Amount: ₹${expense.amount}, Desc: ${expense.description}`,
                "system"
            );
        } else if (window.createAppNotification) {
            window.createAppNotification(
                "Expense Logged",
                `Category: ${expense.category}, Amount: ₹${expense.amount}, Desc: ${expense.description}`,
                "system"
            );
        }

        loadExpenses();
    }

    function loadExpenses() {
        const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        const todayStr = getTodayLocal();
        const tbody = document.getElementById("expenseTableBody");
        if (!tbody) return;

        tbody.innerHTML = "";
        
        const categoryIcons = {
            "Stationery": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
            "Electricity": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`,
            "Rent": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
            "Salary": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
            "Refreshment": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
            "Maintenance": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
            "Internet": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
            "Others": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
        };

        // Sort by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        let todayExpenses = 0;
        let todayIncome = 0;
        
        // Calculate Today's Expenses
        expenses.forEach(exp => {
            if (exp.date === todayStr) {
                todayExpenses += exp.amount;
            }

            const icon = categoryIcons[exp.category] || categoryIcons["Others"];

            // Table Row Rendering
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${formatDate(exp.date)}</td>
                <td>
                    <div class="category-pill">
                        ${icon}
                        <span>${exp.category}</span>
                    </div>
                </td>
                <td style="color: #94a3b8; font-weight: 400;">${exp.description}</td>
                <td class="amount-text">₹${exp.amount.toFixed(2)}</td>
                <td>
                    <button class="delete-btn-q" onclick="deleteExpense('${exp.id}')" title="Remove Entry">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Calculate Today's Income from Transactions
        const todayTransactions = transactions.filter(txn => {
            let dStr = txn.date;
            const parts = dStr.split("-");
            if (parts.length === 3 && parts[0].length === 2) {
                dStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dStr === todayStr;
        });

        todayIncome = todayTransactions.reduce((sum, txn) => sum + (Number(txn.totalAmount || txn.total || txn.amount) || 0), 0);

        const netProfit = todayIncome - todayExpenses;

        // Update Stats UI
        document.getElementById("todayIncome").innerText = `₹${todayIncome.toFixed(2)}`;
        document.getElementById("todayTotal").innerText = `₹${todayExpenses.toFixed(2)}`;
        document.getElementById("netProfit").innerText = `₹${netProfit.toFixed(2)}`;

        // Dynamic Profit Styling
        const profitValueEl = document.getElementById("netProfit");
        
        if (profitValueEl) {
            profitValueEl.classList.remove("profit-positive", "profit-negative");
            if (netProfit > 0) {
                profitValueEl.classList.add("profit-positive");
            } else if (netProfit < 0) {
                profitValueEl.classList.add("profit-negative");
            }
        }
    }

    // Export delete function to window
    window.deleteExpense = async (id) => {
        const confirmed = await AuraDialog.confirm("Are you sure you want to delete this expense?", "Delete Expense", true);
        if (!confirmed) return;
        
        let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        expenses = expenses.filter(e => e.id !== id);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        loadExpenses();
        
        if (typeof showToast === "function") {
            showToast("Expense Deleted! 🗑️");
        }
    };

    function formatDate(dateStr) {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            // Check if it's already yyyy-mm-dd or dd-mm-yyyy
            if (parts[0].length === 4) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to DD-MM-YYYY
            }
            return dateStr;
        }
        return dateStr;
    }
});
