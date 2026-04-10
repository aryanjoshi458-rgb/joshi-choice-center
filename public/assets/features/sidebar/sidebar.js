document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("proSidebar");
    const toggleBtn = document.getElementById("sidebarToggle");

    if (!sidebar || !toggleBtn) return;

    // RESTORE SIMPLE TOGGLE LOGIC
    function refreshSidebarState() {
        const isOpen = sidebar.classList.contains("open");
        document.body.classList.toggle("sidebar-open", isOpen);
        localStorage.setItem("sidebarState", isOpen ? "open" : "closed");

        // Simple classic padding only
        if (isOpen) {
            document.body.style.paddingLeft = "270px";
        } else {
            document.body.style.paddingLeft = "0";
        }
    }

    // Toggle Click
    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("open");
        refreshSidebarState();
    });

    // Close on Outside Click
    document.addEventListener("click", (e) => {
        if (
            sidebar.classList.contains("open") &&
            !sidebar.contains(e.target) &&
            !toggleBtn.contains(e.target)
        ) {
            sidebar.classList.remove("open");
            refreshSidebarState();
        }
    });

/* ISSE 1 SECOND SIDEBAR CLOSE HOKE OPEN HOTA THA VO NAHI HOGA */
    // 1. Pehle animation disable karne wali class add karein
    document.body.classList.add('notransition');
    sidebar.classList.add('notransition');

    // 2. State restore karein
    const savedState = localStorage.getItem("sidebarState");
    if (savedState === "open") {
        sidebar.classList.add("open");
        refreshSidebarState();
    }

    // 3. Ek chote se delay ke baad animation wapas enable karein
    setTimeout(() => {
        document.body.classList.remove('notransition');
        sidebar.classList.remove('notransition');
    }, 100);
});