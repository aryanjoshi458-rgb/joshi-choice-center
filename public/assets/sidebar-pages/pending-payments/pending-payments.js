// ===== LOAD DATA =====
function loadCustomers() {
    let list = JSON.parse(localStorage.getItem("pendingCustomers") || "[]");
    let html = "";

    list.forEach((c, i) => {
        let statusClass = c.status == "Paid" ? "paid" : "pending";
        html += `
        <tr data-id="${c.id}" class="aura-table-row">
            <td><span class="aura-index">${i + 1}</span></td>
            <td style="font-weight: 600; opacity: 0.9;">${c.date}</td>
            <td style="font-weight: 700;">${c.name}</td>
            <td><span class="aura-mobile-tag">${c.mobile}</span></td>
            <td>${c.work}</td>
            <td style="font-weight: 700; color: var(--primary-color);">₹${c.charge}</td>
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

        if (digits.startsWith("91")) {
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
        list.push({
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
                `Customer: ${name}, Service: ${work}, Amount: ₹${charge}`,
                "reminder"
            );
        }

        if (typeof showToast === "function") showToast("Record Added! 📝");
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
                `Customer: ${record.name} has paid ₹${record.charge}`,
                "transaction"
            );
        }

        if (typeof showToast === "function") showToast("Status: PAID! ✅");
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
        if (typeof showToast === "function") showToast("Status: PENDING! ⏳");
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
        if (typeof showToast === "function") showToast("Record Deleted! 🗑️");
    }, 500);
}



// ===== LIVE INPUT CONTROL =====
document.addEventListener("DOMContentLoaded", function () {

    // NAME CAPITAL
    let nameField = document.getElementById("name");

    if (nameField) {
        nameField.addEventListener("input", function () {

            let words = this.value.toLowerCase().split(" ");

            this.value = words.map(w =>
                w ? w.charAt(0).toUpperCase() + w.slice(1) : ""
            ).join(" ");

        });
    }


    // MOBILE +91 FIX (SMART FOCUS)
    let mobileField = document.getElementById("mobile");

    if (mobileField) {
        // Reset initial value to empty
        mobileField.value = "";

        mobileField.addEventListener("focus", function () {
            if (this.value.trim() === "" || this.value === "+91") {
                this.value = "+91 ";
                this.dispatchEvent(new Event("input"));
            }
        });

        mobileField.addEventListener("blur", function () {
            if (this.value.trim() === "+91") {
                this.value = "";
                this.dispatchEvent(new Event("input"));
            }
        });

        mobileField.addEventListener("input", function () {
            let digits = this.value.replace(/\D/g, '');

            // If no digits and not focused, keep it empty
            if (digits.length === 0 && document.activeElement !== this) {
                this.value = "";
                return;
            }

            if (digits.startsWith("91")) {
                digits = digits.slice(2);
            }
            digits = digits.slice(0, 10);
            this.value = "+91 " + digits;
        });

        mobileField.addEventListener("keydown", function (e) {
            if (this.selectionStart <= 4 && (e.key === "Backspace" || e.key === "Delete")) {
                e.preventDefault();
            }
        });
    }

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

function filterTable() {
    const searchValue = searchInput ? searchInput.value.toLowerCase() : "";
    const statusValue = statusFilter ? statusFilter.value.toLowerCase() : "all";

    const rows = document.querySelectorAll("#customerTable tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        const statusCell = row.querySelector("td:nth-child(7)");
        const statusText = statusCell ? statusCell.innerText.toLowerCase() : "";

        const matchSearch = text.includes(searchValue);
        const matchStatus = statusValue === "all" || statusText.includes(statusValue) || 
                           (statusValue === "paid" && statusText.includes("paid")) ||
                           (statusValue === "pending" && statusText.includes("pending"));

        row.style.display = (matchSearch && matchStatus) ? "" : "none";
    });
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

