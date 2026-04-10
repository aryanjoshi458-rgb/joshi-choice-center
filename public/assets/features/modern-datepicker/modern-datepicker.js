/* ===== MODERN DATE PICKER – CURRENT DATE + SELECTABLE ===== */

let picker = null;
let activeInput = null;
let month = null;
let year = null;

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll('input[type="date"]').forEach(input => {

    // Get current date
    const now = new Date();
    const day = String(now.getDate()).padStart(2,"0");
    const mon = String(now.getMonth()+1).padStart(2,"0");
    const yr = now.getFullYear();

    // Set current date
    input.type = "text";
    input.value = `${day}-${mon}-${yr}`;
    input.readOnly = true;
    input.classList.add("modern-date-input");

    // Open picker
    input.addEventListener("click", e => {
      e.stopPropagation();
      openPicker(input);
    });
  });

  // Close picker outside click
  document.addEventListener("click", e => {
    if (picker && !picker.contains(e.target)) {
      closePicker();
    }
  });

});

function openPicker(input){

  closePicker();

  activeInput = input;

  const now = new Date();
  month = now.getMonth();
  year = now.getFullYear();

  picker = document.createElement("div");
  picker.className = "mdp-box";

  const r = input.getBoundingClientRect();
  picker.style.top = r.bottom + window.scrollY + 8 + "px";
  picker.style.left = r.left + "px";

  picker.addEventListener("click", e => e.stopPropagation());

  document.body.appendChild(picker);

  render();
}

function closePicker(){
  if (picker) picker.remove();
  picker = null;
  activeInput = null;
}

function render(){

  if (!picker) return;

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const currentYear = new Date().getFullYear();

  picker.innerHTML = `

    <div class="mdp-header">

      <select id="mdp-month">
        ${months.map((m,i)=>`
          <option value="${i}" ${i===month?"selected":""}>${m}</option>
        `).join("")}
      </select>

      <select id="mdp-year">
        ${Array.from({length: currentYear - 1999}, (_,i)=>2000+i)
          .map(y=>`
            <option value="${y}" ${y===year?"selected":""}>${y}</option>
          `).join("")}
      </select>

    </div>

    <div class="mdp-week">
      <span>Su</span><span>Mo</span><span>Tu</span>
      <span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
    </div>

    <div class="mdp-grid">

      ${Array(firstDay).fill("").map(()=>"<span></span>").join("")}

      ${Array.from({length: totalDays}, (_,i)=>`
        <span class="mdp-day">${i+1}</span>
      `).join("")}

    </div>
  `;

  // Month change
  picker.querySelector("#mdp-month").addEventListener("change", e => {
    month = parseInt(e.target.value);
    render();
  });

  // Year change
  picker.querySelector("#mdp-year").addEventListener("change", e => {
    year = parseInt(e.target.value);
    render();
  });

  // Date select
  picker.querySelectorAll(".mdp-day").forEach(day => {

    day.addEventListener("click", () => {

      activeInput.value =
        String(day.innerText).padStart(2,"0") + "-" +
        String(month + 1).padStart(2,"0") + "-" +
        year;

      closePicker();

    });

  });

}