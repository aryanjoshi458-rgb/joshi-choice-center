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

    // Set initial date
    if (expDateInput) {
        expDateInput.value = getTodayLocal();
    }

    // Initial Load
    loadExpenses();

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
        const todayStr = new Date().toISOString().split("T")[0];
        const tbody = document.getElementById("expenseTableBody");
        if (!tbody) return;

        tbody.innerHTML = "";
        
        // Sort by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        let todayExpenses = 0;
        let todayIncome = 0;
        
        // Calculate Today's Expenses
        expenses.forEach(exp => {
            if (exp.date === todayStr) {
                todayExpenses += exp.amount;
            }

            // Table Row Rendering
            const row = document.createElement("tr");
            row.className = "expense-row";
            row.innerHTML = `
                <td>${formatDate(exp.date)}</td>
                <td><span class="category-pill">${exp.category}</span></td>
                <td class="desc-cell">${exp.description}</td>
                <td class="amount-cell">₹${exp.amount.toFixed(2)}</td>
                <td>
                    <button class="delete-btn-premium" onclick="deleteExpense('${exp.id}')">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
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

        // Dynamic Profit Styling (Attractive & Clear)
        const profitValueEl = document.getElementById("netProfit");
        const profitStatBox = document.getElementById("profitStatBox");

        if (profitValueEl && profitStatBox) {
            if (netProfit > 0) {
                profitValueEl.className = "profit-pos";
                profitStatBox.style.borderColor = "rgba(16, 185, 129, 0.2)";
                profitStatBox.style.background = "linear-gradient(135deg, #ffffff, #f0fdf4)";
            } else if (netProfit < 0) {
                profitValueEl.className = "profit-neg";
                profitStatBox.style.borderColor = "rgba(220, 38, 38, 0.2)";
                profitStatBox.style.background = "linear-gradient(135deg, #ffffff, #fef2f2)";
            } else {
                profitValueEl.className = "";
                profitStatBox.style.borderColor = "#eef2f6";
                profitStatBox.style.background = "#ffffff";
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
