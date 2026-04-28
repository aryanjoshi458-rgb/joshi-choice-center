/**
 * AuraSelect - Premium Dropdown Replacement with Icons (Calendar Version)
 */

class AuraSelect {
    constructor(selectElement) {
        this.select = selectElement;
        this.container = null;
        this.trigger = null;
        this.dropdown = null;
        this.isOpen = false;

        if (!this.select) return;

        this.init();
    }

    init() {
        this.select.style.display = 'none';
        this.select.classList.add('aura-select-native');

        this.container = document.createElement('div');
        this.container.className = 'aura-select-container';
        if (this.select.id) this.container.id = 'aura-select-' + this.select.id;

        const styles = window.getComputedStyle(this.select);
        this.container.style.marginLeft = this.select.style.marginLeft || styles.marginLeft;
        this.container.style.marginTop = this.select.style.marginTop || styles.marginTop;

        this.trigger = document.createElement('div');
        this.trigger.className = 'aura-select-trigger';

        const selectedOption = this.select.options[this.select.selectedIndex];
        this.trigger.innerHTML = `
            <span class="current-value">${selectedOption ? selectedOption.text : 'Select...'}</span>
            <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        `;

        this.dropdown = document.createElement('div');
        this.dropdown.className = 'aura-select-dropdown';

        const optionsList = document.createElement('div');
        optionsList.className = 'aura-select-options';

        this.updateOptions(optionsList);

        this.dropdown.appendChild(optionsList);
        this.container.appendChild(this.trigger);
        this.container.appendChild(this.dropdown);

        this.select.parentNode.insertBefore(this.container, this.select.nextSibling);

        this.bindEvents();
    }

    updateOptions(optionsList) {
        optionsList.innerHTML = '';
        Array.from(this.select.options).forEach((opt, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'aura-select-option';
            if (opt.selected) optionDiv.classList.add('selected');

            // Re-adding icons (Calendar version)
            let icon = '';
            if (this.select.id === 'monthFilter') {
                if (opt.value === '') icon = '<span class="month-icon">📅</span>';
                else icon = '<span class="month-icon">🗓️</span>';
            } else if (this.select.id === 'reportStatusFilter' || this.select.id === 'onlyStatusFilter') {
                if (opt.value === 'all') icon = '<span class="month-icon">📋</span>';
                else if (opt.value === 'success' || opt.value === 'paid') icon = '<span class="month-icon">✅</span>';
                else if (opt.value === 'pending') icon = '<span class="month-icon">⏳</span>';
                else if (opt.value === 'failed') icon = '<span class="month-icon">❌</span>';
            }

            optionDiv.innerHTML = `${icon} ${opt.text}`;
            optionDiv.dataset.value = opt.value;
            optionDiv.style.animationDelay = `${index * 0.03}s`;

            optionDiv.addEventListener('click', () => {
                this.select.value = opt.value;
                this.trigger.querySelector('.current-value').textContent = opt.text;
                this.container.querySelectorAll('.aura-select-option').forEach(el => el.classList.remove('selected'));
                optionDiv.classList.add('selected');
                this.select.dispatchEvent(new Event('change'));
                this.close();
            });

            optionsList.appendChild(optionDiv);
        });
    }

    bindEvents() {
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target)) {
                this.close();
            }
        });

        this.select.addEventListener('change', () => {
            const selectedOption = this.select.options[this.select.selectedIndex];
            if (selectedOption) {
                this.trigger.querySelector('.current-value').textContent = selectedOption.text;
                this.container.querySelectorAll('.aura-select-option').forEach(el => {
                    el.classList.toggle('selected', el.dataset.value === this.select.value);
                });
            }
        });
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        document.querySelectorAll('.aura-select-container.open').forEach(el => {
            if (el !== this.container) el.classList.remove('open');
        });
        this.container.classList.add('open');
        this.isOpen = true;
    }

    close() {
        this.container.classList.remove('open');
        this.isOpen = false;
    }
}

// Auto-initialize
window.initAuraSelects = function () {
    const monthFilter = document.getElementById('monthFilter');
    const statusFilter = document.getElementById('reportStatusFilter');

    if (monthFilter && !monthFilter.dataset.auraInit) {
        new AuraSelect(monthFilter);
        monthFilter.dataset.auraInit = "true";
    }
    if (statusFilter && !statusFilter.dataset.auraInit) {
        new AuraSelect(statusFilter);
        statusFilter.dataset.auraInit = "true";
    }

    const onlyStatusFilter = document.getElementById('onlyStatusFilter');
    if (onlyStatusFilter && !onlyStatusFilter.dataset.auraInit) {
        new AuraSelect(onlyStatusFilter);
        onlyStatusFilter.dataset.auraInit = "true";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(window.initAuraSelects, 200);
});
