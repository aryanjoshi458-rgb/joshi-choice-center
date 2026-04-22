// ===== LOAD DATA =====
function loadCustomers(){

let list = JSON.parse(localStorage.getItem("pendingCustomers") || "[]");

let html="";

list.forEach((c,i)=>{

let statusClass = c.status=="Paid" ? "paid":"pending";

html+=`

<tr data-id="${c.id}">  <!-- ✅ FIX: item → c -->

<td>${i+1}</td>
<td>${c.date}</td>
<td>${c.name}</td>
<td>${c.mobile}</td>
<td>${c.work}</td>
<td>₹${c.charge}</td>

<td>
<span class="status ${statusClass}">
${c.status}
</span>
</td>

<td>

<button class="btn btn-paid" onclick="markPaid(${i})">Paid</button>
<button class="btn btn-pending" onclick="markPending(${i})">Pending</button>
<button class="btn btn-delete" onclick="deleteCustomer(${i})">Delete</button>

</td>

</tr>

`;

});

document.getElementById("customerTable").innerHTML=html;

}



// ===== ADD CUSTOMER =====
function addCustomer(){

let date=document.getElementById("date").value;
let rawName=document.getElementById("name").value.trim();
let mobileRaw=document.getElementById("mobile").value;
let work=document.getElementById("work").value.trim();
let charge=document.getElementById("charge").value.trim();

if(!date || !rawName || !mobileRaw || !work || !charge){
    AuraDialog.error("Please fill all fields", "Validation Error");
    return;
}

if(window.AppLoader) window.AppLoader.show("Adding Payment Record...");

setTimeout(async () => {
    let name = rawName
    .toLowerCase()
    .split(" ")
    .filter(w=>w)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

    let digits = mobileRaw.replace(/\D/g,'');

    if(digits.startsWith("91")){
    digits = digits.slice(2);
    }

    digits = digits.slice(0,10);

    if(digits.length !== 10){
        if(window.AppLoader) window.AppLoader.hide();
        await AuraDialog.error("Enter valid 10 digit mobile number", "Invalid Mobile");
        return;
    }

    let mobile = "+91 " + digits;

    let list = JSON.parse(localStorage.getItem("pendingCustomers") || "[]");

    // ✅ FIX: ID ADD KIYA
    list.push({
    id: Date.now().toString(),   // 🔥 IMPORTANT
    date:date,
    name:name,
    mobile:mobile,
    work:work,
    charge:charge,
    status:"Pending"
    });

    localStorage.setItem("pendingCustomers",JSON.stringify(list));

    document.getElementById("name").value="";
    document.getElementById("mobile").value="+91 ";
    document.getElementById("work").value="";
    document.getElementById("charge").value="";

    loadCustomers();
    if(window.AppLoader) window.AppLoader.hide();
    
    // Log Notification
    if (window.parent && window.parent.createAppNotification) {
        window.parent.createAppNotification(
            "New Pending Payment",
            `Customer: ${name}, Service: ${work}, Amount: ₹${charge}`,
            "reminder"
        );
    }

    if(typeof showToast === "function") showToast("Record Added! 📝");
}, 600);
}



// ===== STATUS =====
function markPaid(i){
if(window.AppLoader) window.AppLoader.show("Updating Status...");
setTimeout(() => {
    let list = JSON.parse(localStorage.getItem("pendingCustomers"));
    list[i].status="Paid";
    localStorage.setItem("pendingCustomers",JSON.stringify(list));
    loadCustomers();
    if(window.AppLoader) window.AppLoader.hide();
    
    // Log Notification
    if (window.parent && window.parent.createAppNotification) {
        window.parent.createAppNotification(
            "Payment Received",
            `Customer: ${list[i].name} has paid ₹${list[i].charge}`,
            "transaction"
        );
    }

    if(typeof showToast === "function") showToast("Status: PAID! ✅");
}, 500);
}

function markPending(i){
if(window.AppLoader) window.AppLoader.show("Updating Status...");
setTimeout(() => {
    let list = JSON.parse(localStorage.getItem("pendingCustomers"));
    list[i].status="Pending";
    localStorage.setItem("pendingCustomers",JSON.stringify(list));
    loadCustomers();
    if(window.AppLoader) window.AppLoader.hide();
    if(typeof showToast === "function") showToast("Status: PENDING! ⏳");
}, 500);
}



// ===== DELETE =====
async function deleteCustomer(i){
    const confirmed = await AuraDialog.confirm("Are you sure you want to delete this payment record?", "Delete Confirmation", true);
    if(!confirmed) return;

    if(window.AppLoader) window.AppLoader.show("Deleting Record...");
    setTimeout(() => {
        let list = JSON.parse(localStorage.getItem("pendingCustomers"));
        list.splice(i,1);
        localStorage.setItem("pendingCustomers",JSON.stringify(list));
        loadCustomers();
        if(window.AppLoader) window.AppLoader.hide();
        if(typeof showToast === "function") showToast("Record Deleted! 🗑️");
    }, 500);
}



// ===== LIVE INPUT CONTROL =====
document.addEventListener("DOMContentLoaded", function(){

// NAME CAPITAL
let nameField = document.getElementById("name");

if(nameField){
nameField.addEventListener("input", function(){

let words = this.value.toLowerCase().split(" ");

this.value = words.map(w => 
w ? w.charAt(0).toUpperCase() + w.slice(1) : ""
).join(" ");

});
}


// MOBILE +91 FIX (SMART FOCUS)
let mobileField = document.getElementById("mobile");

if(mobileField){
    // Reset initial value to empty
    mobileField.value = "";

    mobileField.addEventListener("focus", function(){
        if(this.value.trim() === "" || this.value === "+91"){
            this.value = "+91 ";
            this.dispatchEvent(new Event("input"));
        }
    });

    mobileField.addEventListener("blur", function(){
        if(this.value.trim() === "+91"){
            this.value = "";
            this.dispatchEvent(new Event("input"));
        }
    });

    mobileField.addEventListener("input", function(){
        let digits = this.value.replace(/\D/g,'');
        
        // If no digits and not focused, keep it empty
        if (digits.length === 0 && document.activeElement !== this) {
            this.value = "";
            return;
        }
        
        if(digits.startsWith("91")){
            digits = digits.slice(2);
        }
        digits = digits.slice(0,10);
        this.value = "+91 " + digits;
    });

    mobileField.addEventListener("keydown", function(e){
        if(this.selectionStart <= 4 && (e.key==="Backspace" || e.key==="Delete")){
            e.preventDefault();
        }
    });
}

});



// ===== INIT =====
loadCustomers();


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

// SEARCH LOGIC
function filterTable() {
  const value = input.value.toLowerCase();
  const rows = document.querySelectorAll("table tbody tr");

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(value) ? "" : "none";
  });
}

input.addEventListener("input", filterTable);


// ===== CREATE STATUS FILTER =====
const searchWrapper = document.querySelector(".search-wrapper");

const existing = document.getElementById("onlyStatusFilter");
if (!existing && searchWrapper) {
  const select = document.createElement("select");
  select.id = "onlyStatusFilter";

  select.innerHTML = `
    <option value="all">All</option>
    <option value="paid">Paid</option>
    <option value="pending">Pending</option>
  `;

  searchWrapper.appendChild(select);

  // ===== FILTER LOGIC =====
  const input = document.getElementById("searchInput");

  function filterTable() {
    const searchValue = input ? input.value.toLowerCase() : "";
    const statusValue = select.value;

    const rows = document.querySelectorAll("table tbody tr");

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      const statusCell = row.querySelector("td:nth-child(7)");
      const statusText = statusCell ? statusCell.innerText.toLowerCase() : "";

      const matchSearch = text.includes(searchValue);
      const matchStatus =
        statusValue === "all" || statusText.includes(statusValue);

      row.style.display = (matchSearch && matchStatus) ? "" : "none";
    });
  }

  select.addEventListener("change", filterTable);
}

/* PENDING JS AMOUNT WALA CODE HAI JO TOTAL AMOUNT PENDING DIKHATA HAI REPORT HEADER ME */
// ===== CREATE BOX (ON LOAD) =====
const container = document.getElementById("customSearchContainer");

if (container && !document.getElementById("pendingAmountBox")) {
  const box = document.createElement("div");
  box.id = "pendingAmountBox";
  box.innerHTML = "Pending: ₹0";

  container.appendChild(box);

  // ===== CALCULATION FUNCTION =====
  function updatePendingTotal() {
    let total = 0;

    const rows = document.querySelectorAll("table tbody tr");

    rows.forEach(row => {
      if (row.style.display === "none") return;

      const statusCell = row.querySelector("td:nth-child(7)");
      const chargeCell = row.querySelector("td:nth-child(6)");

      const status = statusCell ? statusCell.innerText.toLowerCase() : "";
      const chargeText = chargeCell ? chargeCell.innerText : "0";

      const amount = parseInt(chargeText.replace(/[^\d]/g, "")) || 0;

      if (status.includes("pending")) {
        total += amount;
      }
    });

    box.innerHTML = `Pending: ₹${total}`;
  }

  // Initial run
  updatePendingTotal();

  // Auto update on table changes
  const observer = new MutationObserver(updatePendingTotal);
  observer.observe(document.querySelector("table tbody"), {
    childList: true,
    subtree: true,
    attributes: true,
  });

  // Update on search/filter change
  document.addEventListener("input", updatePendingTotal);
  document.addEventListener("change", updatePendingTotal);
}

const newItem = {
  id: Date.now().toString(), // 🔥 MUST
  date,
  name,
  mobile,
  work,
  charge,
  status: "Pending"
};