/* LANGUAGE MANAGER */
const LanguageManager = {
    currentLang: localStorage.getItem("appLanguage") || "en",

    init() {
        this.applyTranslations();
        // Watch for language changes from settings
        window.addEventListener('languageChanged', () => {
            this.currentLang = localStorage.getItem("appLanguage") || "en";
            this.applyTranslations();
        });
    },

    setLanguage(lang) {
        localStorage.setItem("appLanguage", lang);
        this.currentLang = lang;
        this.applyTranslations();
        // Dispatch event for other scripts
        window.dispatchEvent(new CustomEvent('languageChanged'));
    },

    applyTranslations() {
        const dict = window.i18n[this.currentLang];
        if (!dict) return;

        // Update elements with data-i18n attribute
        const elements = document.querySelectorAll("[data-i18n]");
        elements.forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) {
                // If it's an input with placeholder
                if (el.tagName === "INPUT" && el.placeholder) {
                    el.placeholder = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });
        
        // Update document title if needed
        const titleKey = `title-${document.title.split('|')[0].trim().toLowerCase().replace(/\s+/g, '-')}`;
        if (dict[titleKey]) {
            document.title = `${dict[titleKey]} | Joshi Choice Center`;
        }
    }
};

window.LanguageManager = LanguageManager;
document.addEventListener("DOMContentLoaded", () => {
    LanguageManager.init();
});
