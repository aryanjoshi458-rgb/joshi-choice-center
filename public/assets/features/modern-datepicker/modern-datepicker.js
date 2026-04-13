/* 
  ===========================================
  PREMIUM MODERN DATE PICKER – GSAP ENHANCED
  ===========================================
*/

let picker = null;
let activeInput = null;
let viewMonth = new Date().getMonth();
let viewYear = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
    initializeModernDatePicker();
});

function initializeModernDatePicker() {
    // Find all date inputs
    document.querySelectorAll('input[type="date"]').forEach(input => {
        setupInput(input);
    });

    // Handle dynamically added inputs if any (optional, but good for robust JS)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.tagName === 'INPUT' && node.type === 'date') setupInput(node);
                    node.querySelectorAll('input[type="date"]').forEach(setupInput);
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Global close on click outside
    document.addEventListener("mousedown", e => {
        if (picker && !picker.contains(e.target) && !activeInput.contains(e.target)) {
            closePicker();
        }
    });

    // Close on escape key
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && picker) closePicker();
    });
}

function setupInput(input) {
    if (input.dataset.mdpInitialized) return;

    const originalValue = input.value; // Expecting YYYY-MM-DD from native
    input.type = "text";
    input.readOnly = true;
    input.classList.add("modern-date-input");
    input.placeholder = "Select Date";
    input.dataset.mdpInitialized = "true";

    // Set initial display value if existing
    if (originalValue) {
        const parts = originalValue.split("-");
        if (parts.length === 3) {
            input.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    } else {
        // Set today as default if empty and it's txnDate
        if(input.id === 'txnDate') {
            const now = new Date();
            input.value = formatDateToString(now);
        }
    }

    input.addEventListener("click", e => {
        e.stopPropagation();
        openPicker(input);
    });
}

function openPicker(input) {
    if (picker && activeInput === input) return;
    if (picker) closePicker();

    activeInput = input;

    // Parse current value or use today
    let currentVal = parseDateString(input.value) || new Date();
    viewMonth = currentVal.getMonth();
    viewYear = currentVal.getFullYear();

    picker = document.createElement("div");
    picker.className = "mdp-box";
    
    // Position
    const rect = input.getBoundingClientRect();
    const pickerHeight = 350; // Approx
    let top = rect.bottom + window.scrollY + 8;
    
    // Flip if not enough space below
    if (top + pickerHeight > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - pickerHeight - 8;
    }

    picker.style.top = top + "px";
    picker.style.left = rect.left + "px";

    document.body.appendChild(picker);

    // Initial GSAP Animation
    if (window.gsap) {
        gsap.fromTo(picker, 
            { opacity: 0, scale: 0.95, y: 10 }, 
            { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.7)" }
        );
    }

    render();
}

function closePicker() {
    if (!picker) return;
    
    const target = picker;
    picker = null;
    activeInput = null;

    if (window.gsap) {
        gsap.to(target, { 
            opacity: 0, 
            scale: 0.95, 
            y: 10, 
            duration: 0.2, 
            ease: "power2.in",
            onComplete: () => target.remove()
        });
    } else {
        target.remove();
    }
}

function render() {
    if (!picker) return;

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    const selectedDate = parseDateString(activeInput.value);

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    picker.innerHTML = `
        <div class="mdp-header">
            <div class="mdp-select-wrap">
                <select id="mdp-month">
                    ${months.map((m, i) => `<option value="${i}" ${i === viewMonth ? "selected" : ""}>${m}</option>`).join("")}
                </select>
                <select id="mdp-year">
                    ${Array.from({ length: 101 }, (_, i) => now.getFullYear() - 50 + i)
                        .map(y => `<option value="${y}" ${y === viewYear ? "selected" : ""}>${y}</option>`).join("")}
                </select>
            </div>
            <div class="mdp-nav-btns">
                <div class="mdp-nav" id="mdp-prev">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </div>
                <div class="mdp-nav" id="mdp-next">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            </div>
        </div>

        <div class="mdp-week">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>

        <div class="mdp-grid">
            ${Array(firstDay).fill(null).map(() => `<span class="mdp-day empty"></span>`).join("")}
            ${Array.from({ length: totalDays }, (_, i) => {
                const day = i + 1;
                const isToday = day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
                const isSelected = selectedDate && day === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();
                return `<span class="mdp-day ${isToday ? 'mdp-today' : ''} ${isSelected ? 'mdp-selected' : ''}" data-day="${day}">${day}</span>`;
            }).join("")}
        </div>

        <div class="mdp-footer">
            <button class="mdp-btn mdp-btn-clear" id="mdp-clear">Clear</button>
            <button class="mdp-btn mdp-btn-today" id="mdp-today">Today</button>
        </div>
    `;

    // Event Listeners
    picker.querySelector("#mdp-month").addEventListener("change", e => {
        viewMonth = parseInt(e.target.value);
        render();
    });

    picker.querySelector("#mdp-year").addEventListener("change", e => {
        viewYear = parseInt(e.target.value);
        render();
    });

    picker.querySelector("#mdp-prev").addEventListener("click", () => {
        viewMonth--;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        render();
    });

    picker.querySelector("#mdp-next").addEventListener("click", () => {
        viewMonth++;
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        render();
    });

    picker.querySelector("#mdp-today").addEventListener("click", () => {
        selectDate(new Date());
    });

    picker.querySelector("#mdp-clear").addEventListener("click", () => {
        activeInput.value = "";
        closePicker();
    });

    picker.querySelectorAll(".mdp-day:not(.empty)").forEach(dayEl => {
        dayEl.addEventListener("click", () => {
            const day = parseInt(dayEl.dataset.day);
            selectDate(new Date(viewYear, viewMonth, day));
        });
    });
}

function selectDate(date) {
    activeInput.value = formatDateToString(date);
    // Trigger change event for any listeners
    activeInput.dispatchEvent(new Event('change'));
    activeInput.dispatchEvent(new Event('input'));
    closePicker();
}

function formatDateToString(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

function parseDateString(str) {
    if (!str) return null;
    const parts = str.split("-");
    if (parts.length !== 3) return null;
    // Expecting DD-MM-YYYY
    return new Date(parts[2], parts[1] - 1, parts[0]);
}