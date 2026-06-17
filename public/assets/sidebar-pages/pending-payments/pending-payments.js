// ===== LOAD DATA =====
function loadCustomers() {
    let list = JSON.parse(localStorage.getItem("pendingCustomers") || "[]");
    
    // Ye code tumhare purane aur naye sabhi data ko hamesha Date ke hisab se (newest first) sort karke fix kar dega
    list.sort((a, b) => b.id - a.id);
    localStorage.setItem("pendingCustomers", JSON.stringify(list));

    let html = "";

    // Helper function to calculate days diff
    function getDaysDiff(dateString) {
        if (!dateString) return 0;
        let parts = dateString.split("-");
        if(parts.length !== 3) return 0;
        let recordDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        let today = new Date();
        const diffTime = today - recordDate;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    list.forEach((c, i) => {
        let statusClass = c.status == "Paid" ? "paid" : "pending";
        let dateColor = "";
        let ageIcon = "";
        
        if (c.status === "Pending") {
            let daysDiff = getDaysDiff(c.date);
            if (daysDiff >= 90) {
                dateColor = "color: #ef4444; text-shadow: 0 0 8px rgba(239, 68, 68, 0.4); font-weight: 800;";
                ageIcon = " 🚨";
            } else if (daysDiff >= 60) {
                dateColor = "color: #f87171; font-weight: 800;";
                ageIcon = " 🔥";
            } else if (daysDiff >= 30) {
                dateColor = "color: #f97316; font-weight: 700;";
                ageIcon = " ⏳";
            } else if (daysDiff >= 15) {
                dateColor = "color: #eab308; font-weight: 700;";
                ageIcon = " ⚠️";
            }
        }

        html += `
        <tr data-id="${c.id}" class="aura-table-row">
            <td><span class="aura-index">${list.length - i}</span></td>
            <td style="white-space: nowrap; ${dateColor ? dateColor : 'font-weight: 600; opacity: 0.9;'}">${c.date}${ageIcon}</td>
            <td style="font-weight: 700;">${c.name}</td>
            <td style="white-space: nowrap;"><span class="aura-mobile-tag">${c.mobile}</span></td>
            <td>${c.work}</td>
            <td style="font-weight: 700; color: var(--primary-color);">\u20B9${c.charge}</td>
            <td>
                <span class="status ${statusClass}">
                    ${c.status}
                </span>
            </td>
            <td>
                <div class="aura-action-group">
                    <button class="btn btn-paid" onclick="markPaid(${i})" title="Mark as Paid">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button class="btn btn-pending" onclick="markPending(${i})" title="Mark as Pending">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </button>
                    <button class="btn" onclick="editCustomer(${i})" title="Edit Record" style="background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); margin-right: 6px;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn btn-delete" onclick="deleteCustomer(${i})" title="Delete Record">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </div>
            </td>
        </tr>
        `;
    });

    const tableBody = document.getElementById("customerTable");
    if (tableBody) tableBody.innerHTML = html;
    updatePendingTotal();
    filterTable();
}



// ===== ADD CUSTOMER =====
let isAddingCustomer = false;
function addCustomer() {
    if (isAddingCustomer) return;
    isAddingCustomer = true;

    let date = document.getElementById("date").value;
    let rawName = document.getElementById("name").value.trim();
    let mobileRaw = document.getElementById("mobile").value;
    let work = document.getElementById("work").value.trim();
    let charge = document.getElementById("charge").value.trim();

    if (!date || !rawName || !mobileRaw || !work || !charge) {
        AuraDialog.error("Please fill all fields", "Validation Error");
        isAddingCustomer = false; // 🔥 RESET
        return;
    }

    if (window.AppLoader) window.AppLoader.show("Adding Payment Record...");

    setTimeout(() => {
        let name = rawName
            .toLowerCase()
            .split(" ")
            .filter(w => w)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

        let digits = mobileRaw.replace(/\D/g, '');

        if (digits.length > 10 && digits.startsWith("91")) {
            digits = digits.slice(2);
        }

        digits = digits.slice(0, 10);

        if (digits.length !== 10) {
            if (window.AppLoader) window.AppLoader.hide();
            AuraDialog.error("Enter valid 10 digit mobile number", "Invalid Mobile");
            isAddingCustomer = false; // 🔥 RESET
            return;
        }

        let mobile = "+91 " + digits;

        let list = JSON.parse(localStorage.getItem("pendingCustomers") || "[]");

        // ✅ FIX: ID ADD KIYA
        list.unshift({
            id: Date.now().toString(),   // 🔥 IMPORTANT
            date: window.AuraDate ? window.AuraDate.toDDMMYYYY(date) : date,
            name: name,
            mobile: mobile,
            work: work,
            charge: charge,
            status: "Pending"
        });

        localStorage.setItem("pendingCustomers", JSON.stringify(list));

        document.getElementById("name").value = "";
        document.getElementById("mobile").value = "+91 ";
        document.getElementById("work").value = "";
        document.getElementById("charge").value = "";

        loadCustomers();
        if (window.AppLoader) window.AppLoader.hide();
        isAddingCustomer = false; // 🔥 RESET SUCCESS

        // Log Notification
        if (window.parent && window.parent.createAppNotification) {
            window.parent.createAppNotification(
                "New Pending Payment",
                `Customer: ${name}, Service: ${work}, Amount: \u20B9${charge}`,
                "reminder"
            );
        }

        if (window.parent && typeof window.parent.showToast === "function") {
            window.parent.showToast("Record Added! 📝");
        } else if (typeof showToast === "function") {
            showToast("Record Added! 📝");
        }
    }, 600);
}



// ===== STATUS =====
function markPaid(i) {
    if (window.AppLoader) window.AppLoader.show("Updating Status...");
    setTimeout(() => {
        let list = JSON.parse(localStorage.getItem("pendingCustomers"));
        const record = list[i];
        record.status = "Paid";
        
        // 🔥 SYNC: Update main transactions database
        if (record.txnId) {
            let txns = JSON.parse(localStorage.getItem("transactions") || "[]");
            const tIdx = txns.findIndex(t => (t.transactionId || t.txnId).toString() === record.txnId.toString());
            if (tIdx >= 0) {
                txns[tIdx].status = "Success"; // Flip to Success in main report
                txns[tIdx].pendingCharge = "0";
                txns[tIdx].receivedCharge = txns[tIdx].charge;
                localStorage.setItem("transactions", JSON.stringify(txns));
            }
        }

        localStorage.setItem("pendingCustomers", JSON.stringify(list));
        loadCustomers();
        if (window.AppLoader) window.AppLoader.hide();

        if (window.parent && window.parent.createAppNotification) {
            window.parent.createAppNotification(
                "Payment Received",
                `Customer: ${record.name} has paid \u20B9${record.charge}`,
                "transaction"
            );
        }

        if (window.parent && typeof window.parent.showToast === "function") {
            window.parent.showToast("Status: PAID! ✅");
        } else if (typeof showToast === "function") {
            showToast("Status: PAID! ✅");
        }
    }, 500);
}

function markPending(i) {
    if (window.AppLoader) window.AppLoader.show("Updating Status...");
    setTimeout(() => {
        let list = JSON.parse(localStorage.getItem("pendingCustomers"));
        const record = list[i];
        record.status = "Pending";

        // 🔥 SYNC: Update main transactions database
        if (record.txnId) {
            let txns = JSON.parse(localStorage.getItem("transactions") || "[]");
            const tIdx = txns.findIndex(t => (t.transactionId || t.txnId).toString() === record.txnId.toString());
            if (tIdx >= 0) {
                txns[tIdx].status = "Pending";
                localStorage.setItem("transactions", JSON.stringify(txns));
            }
        }

        localStorage.setItem("pendingCustomers", JSON.stringify(list));
        loadCustomers();
        if (window.AppLoader) window.AppLoader.hide();
        if (window.parent && typeof window.parent.showToast === "function") {
            window.parent.showToast("Status: PENDING! ⏳");
        } else if (typeof showToast === "function") {
            showToast("Status: PENDING! ⏳");
        }
    }, 500);
}



// ===== DELETE =====
async function deleteCustomer(i) {
    const confirmed = await AuraDialog.confirm("Are you sure you want to delete this payment record?", "Delete Confirmation", true);
    if (!confirmed) return;

    if (window.AppLoader) window.AppLoader.show("Deleting Record...");
    setTimeout(() => {
        let list = JSON.parse(localStorage.getItem("pendingCustomers"));
        list.splice(i, 1);
        localStorage.setItem("pendingCustomers", JSON.stringify(list));
        loadCustomers();
        if (window.AppLoader) window.AppLoader.hide();
        if (window.parent && typeof window.parent.showToast === "function") {
            window.parent.showToast("Record Deleted! 🗑️");
        } else if (typeof showToast === "function") {
            showToast("Record Deleted! 🗑️");
        }
    }, 500);
}



// ===== LIVE INPUT CONTROL =====
document.addEventListener("DOMContentLoaded", function () {

    // NAME CAPITAL
    let nameFields = [document.getElementById("name"), document.getElementById("editName")];
    nameFields.forEach(nameField => {
        if (nameField) {
            nameField.addEventListener("input", function () {
                let words = this.value.toLowerCase().split(" ");
                this.value = words.map(w =>
                    w ? w.charAt(0).toUpperCase() + w.slice(1) : ""
                ).join(" ");
            });
        }
    });


    // MOBILE +91 FIX (SMART FOCUS)
    let mobileFields = [document.getElementById("mobile"), document.getElementById("editMobile")];
    mobileFields.forEach(mobileField => {
        if (mobileField) {
            if (mobileField.id === "mobile") {
                mobileField.value = "";
            }

            mobileField.addEventListener("focus", function () {
                let val = this.value.trim();
                if (val === "" || val === "+91") {
                    this.value = "+91 ";
                    this.dispatchEvent(new Event("input"));
                } else if (!val.startsWith("+91")) {
                    this.value = "+91 " + val;
                }
            });

            mobileField.addEventListener("blur", function () {
                let val = this.value.trim();
                if (val === "+91" || val === "") {
                    this.value = "";
                    this.dispatchEvent(new Event("input"));
                } else if (val.startsWith("+91 ")) {
                    this.value = val.substring(4);
                } else if (val.startsWith("+91")) {
                    this.value = val.substring(3);
                }
            });

            mobileField.addEventListener("input", function () {
                let val = this.value;
                if (!val.startsWith("+91 ") && document.activeElement === this) {
                    let digits = val.replace(/\D/g, '');
                    if (digits.length > 10 && digits.startsWith("91")) {
                        digits = digits.slice(2);
                    }
                    digits = digits.slice(0, 10);
                    this.value = "+91 " + digits;
                } else if (document.activeElement === this) {
                    let rest = val.substring(4);
                    let digits = rest.replace(/\D/g, '');
                    digits = digits.slice(0, 10);
                    this.value = "+91 " + digits;
                }
            });

            mobileField.addEventListener("keydown", function (e) {
                if (this.selectionStart <= 4 && this.selectionEnd === this.selectionStart && (e.key === "Backspace" || e.key === "Delete")) {
                    e.preventDefault();
                }
            });
        }
    });

});



// ===== INIT =====
loadCustomers();

// Listen for Disk Sync Completion
const refreshPending = () => {
    loadCustomers();
};
window.addEventListener('auraDataSynced', refreshPending);
if (window.auraSyncComplete) refreshPending();


// SEARCH BAR JS CODE HAI IMP
const searchBox = document.getElementById("searchExpand");
const toggle = document.getElementById("searchToggle");
const input = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");

// OPEN
toggle.addEventListener("click", () => {
    searchBox.classList.add("active");
    input.focus();
});

// CLOSE OUTSIDE
document.addEventListener("click", (e) => {
    if (!searchBox.contains(e.target)) {
        searchBox.classList.remove("active");
    }
});

// CLEAR
clearBtn.addEventListener("click", () => {
    input.value = "";
    filterTable();
    input.focus();
});

// ===== STATUS FILTER LOGIC (Reports Style) =====
const statusFilter = document.getElementById("onlyStatusFilter");
const searchInput = document.getElementById("searchInput");

window.currentCategoryFilter = "all";
const catTabs = document.querySelectorAll("#pendingCategoryTabs .cat-tab");
if (catTabs) {
    catTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            catTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            window.currentCategoryFilter = tab.dataset.category;
            filterTable();
        });
    });
}

function filterTable() {
    const searchEl = document.getElementById("searchInput");
    const statusEl = document.getElementById("onlyStatusFilter");
    const searchValue = searchEl ? searchEl.value.toLowerCase() : "";
    const statusValue = statusEl ? statusEl.value.toLowerCase() : "all";
    const catValue = window.currentCategoryFilter || "all";

    const rows = document.querySelectorAll("#customerTable tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        
        const workCell = row.querySelector("td:nth-child(5)");
        const workText = workCell ? workCell.innerText.toLowerCase() : "";
        
        const statusCell = row.querySelector("td:nth-child(7)");
        const statusText = statusCell ? statusCell.innerText.toLowerCase() : "";

        const matchSearch = text.includes(searchValue);
        const matchStatus = statusValue === "all" || statusText.includes(statusValue) || 
                           (statusValue === "paid" && statusText.includes("paid")) ||
                           (statusValue === "pending" && statusText.includes("pending"));

        let matchCat = false;
        if (catValue === "all") {
            matchCat = true;
        } else if (catValue === "Banking" && workText.includes("banking")) {
            matchCat = true;
        } else if (catValue === "Mobile/Util" && (workText.includes("recharge") || workText.includes("mobile"))) {
            matchCat = true;
        }

        const isVisible = matchSearch && matchStatus && matchCat;
        row.style.display = isVisible ? "" : "none";
        row.setAttribute("data-filtered", isVisible ? "false" : "true");
    });

    if (typeof window.refreshPagination === "function") {
        window.refreshPagination();
    }
}

if (statusFilter) statusFilter.addEventListener("change", filterTable);
if (searchInput) searchInput.addEventListener("input", filterTable);

// 🔥 FORCE INITIALIZE AURA SELECT (Reports Style)
if (window.initAuraSelects) {
    setTimeout(window.initAuraSelects, 100);
}

/* PENDING JS AMOUNT WALA CODE HAI JO TOTAL AMOUNT PENDING DIKHATA HAI REPORT HEADER ME */
function updatePendingTotal() {
    let total = 0;
    const list = JSON.parse(localStorage.getItem("pendingCustomers") || "[]");

    list.forEach(c => {
        if (c.status === "Pending") {
            total += (parseInt(c.charge) || 0);
        }
    });

    const totalEl = document.getElementById("totalPendingAmount");
    if (totalEl) {
        totalEl.innerText = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total);
        gsap.fromTo(totalEl, { scale: 1.2, color: "#f59e0b" }, { scale: 1, color: "inherit", duration: 0.5 });
    }
}

// ===== EDIT RECORD FUNCTIONS =====
function editCustomer(index) {
    const list = JSON.parse(localStorage.getItem("pendingCustomers") || "[]");
    const record = list[index];
    if (!record) return;

    document.getElementById("editCustomerIndex").value = index;

    // Convert DD-MM-YYYY to YYYY-MM-DD for input[type=date]
    let dateVal = "";
    if (record.date) {
        const parts = record.date.split("-");
        if (parts.length === 3) {
            dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    document.getElementById("editDate").value = dateVal;
    document.getElementById("editName").value = record.name || "";

    // Mobile number might have "+91 " prefix, strip it if we want raw input
    let mobileVal = record.mobile || "";
    if (mobileVal.startsWith("+91 ")) {
        mobileVal = mobileVal.substring(4);
    }
    document.getElementById("editMobile").value = mobileVal;
    document.getElementById("editWork").value = record.work || "";
    document.getElementById("editCharge").value = record.charge || "";
    document.getElementById("editStatus").value = record.status || "Pending";

    // Show modal
    const modal = document.getElementById("editModal");
    if (modal) modal.style.display = "flex";
}

function closeEditModal() {
    const modal = document.getElementById("editModal");
    if (modal) modal.style.display = "none";
}

function saveCustomerEdit() {
    const index = parseInt(document.getElementById("editCustomerIndex").value);
    const list = JSON.parse(localStorage.getItem("pendingCustomers") || "[]");
    const record = list[index];
    if (!record) return;

    const dateVal = document.getElementById("editDate").value;
    const rawName = document.getElementById("editName").value.trim();
    const mobileRaw = document.getElementById("editMobile").value.trim();
    const work = document.getElementById("editWork").value.trim();
    const charge = document.getElementById("editCharge").value.trim();
    const status = document.getElementById("editStatus").value;

    if (!dateVal || !rawName || !mobileRaw || !work || !charge) {
        AuraDialog.error("Please fill all fields", "Validation Error");
        return;
    }

    // Capitalize name
    const name = rawName
        .toLowerCase()
        .split(" ")
        .filter(w => w)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    // Format mobile
    let digits = mobileRaw.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith("91")) {
        digits = digits.slice(2);
    }
    digits = digits.slice(0, 10);
    if (digits.length !== 10) {
        AuraDialog.error("Enter valid 10 digit mobile number", "Invalid Mobile");
        return;
    }
    const mobile = "+91 " + digits;

    // Update record
    record.date = window.AuraDate ? window.AuraDate.toDDMMYYYY(dateVal) : dateVal;
    record.name = name;
    record.mobile = mobile;
    record.work = work;
    record.charge = charge;
    record.status = status;

    // 🔥 SYNC: Update main transactions database if txnId exists
    if (record.txnId) {
        let txns = JSON.parse(localStorage.getItem("transactions") || "[]");
        const tIdx = txns.findIndex(t => (t.transactionId || t.txnId).toString() === record.txnId.toString());
        if (tIdx >= 0) {
            txns[tIdx].date = record.date;
            txns[tIdx].customerName = name;
            txns[tIdx].mobileNumber = mobile;
            txns[tIdx].serviceType = work;
            txns[tIdx].charge = charge;
            txns[tIdx].status = status === "Paid" ? "Success" : "Pending";
            if (status === "Paid") {
                txns[tIdx].pendingCharge = "0";
                txns[tIdx].receivedCharge = charge;
            } else {
                txns[tIdx].pendingCharge = charge;
                txns[tIdx].receivedCharge = "0";
            }
            localStorage.setItem("transactions", JSON.stringify(txns));
        }
    }

    localStorage.setItem("pendingCustomers", JSON.stringify(list));
    closeEditModal();
    loadCustomers();

    if (window.parent && typeof window.parent.showToast === "function") {
        window.parent.showToast("Record Updated! 📝");
    } else if (typeof showToast === "function") {
        showToast("Record Updated! 📝");
    }
}

