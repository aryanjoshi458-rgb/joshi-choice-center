// ===============================
// MODERN TABLE PAGINATION (PREMIUM & PERSISTENT)
// ===============================

(function initPagination() {
    const rowsPerPage = 5;
    let currentPage = 1;

    function setupPagination() {
        const table = document.querySelector("table");
        if (!table) return;

        const tbody = table.querySelector("tbody");
        if (!tbody) return;

        // Get all rows but only those that are "visible" from other filters
        // Note: Some filters might set display="none"
        // We first need to know which rows ARE visible to paginate them.
        const allRows = Array.from(tbody.querySelectorAll("tr"));
        
        // Rows that are NOT hidden by search/filter logic
        const visibleRows = allRows.filter(r => {
            // If it's the "No Reports Found" row, don't paginate
            if (r.innerText.includes("No Reports Found")) return false;
            // Otherwise check if it's currently hidden by another script
            return r.getAttribute("data-filtered") !== "true" && r.style.display !== "none";
        });

        // Remove old pager if exists
        document.getElementById("modernPager")?.remove();

        const totalPages = Math.ceil(visibleRows.length / rowsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        // ---------- STYLE (Premium Glassmorphism) ----------
        if (!document.getElementById("modern-pagination-style")) {
            const style = document.createElement("style");
            style.id = "modern-pagination-style";
            style.innerHTML = `
                .pagination-wrap {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin: 25px 0;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    user-select: none;
                    width: fit-content;
                    margin-left: auto;
                    margin-right: auto;
                }
                .pg-btn {
                    min-width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .pg-btn:hover:not(.disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                    filter: brightness(1.1);
                }
                .pg-btn:active:not(.disabled) {
                    transform: scale(0.95);
                }
                .pg-btn.disabled {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.3);
                    cursor: not-allowed;
                    box-shadow: none;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .pg-info {
                    font-weight: 500;
                    font-size: 14px;
                    color: var(--text-color, #444);
                    background: rgba(255, 255, 255, 0.1);
                    padding: 8px 16px;
                    border-radius: 10px;
                    min-width: 120px;
                    text-align: center;
                }
                [data-theme="dark"] .pg-info {
                    color: #efeff1;
                }
                .pg-page-num {
                    color: #8b5cf6;
                    font-weight: 700;
                    margin: 0 4px;
                }
            `;
            document.head.appendChild(style);
        }

        // ---------- UI ----------
        const pager = document.createElement("div");
        pager.id = "modernPager";
        pager.className = "pagination-wrap";
        pager.innerHTML = `
            <button class="pg-btn ${currentPage === 1 ? 'disabled' : ''}" id="pgPrev" title="Previous Page">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="pg-info" id="pgInfo">
                Page <span class="pg-page-num">${currentPage}</span> of <span class="pg-page-num">${totalPages}</span>
            </div>
            <button class="pg-btn ${currentPage === totalPages ? 'disabled' : ''}" id="pgNext" title="Next Page">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        `;
        
        // Append after the table wrapper or table
        const target = table.closest('.reports-table-wrap') || table.parentElement;
        target.appendChild(pager);

        const prevBtn = document.getElementById("pgPrev");
        const nextBtn = document.getElementById("pgNext");

        function renderPage(page) {
            // Hide all rows first
            allRows.forEach(r => r.style.display = "none");

            // Only show the specific rows for this page from the "visibleRows" pool
            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            
            visibleRows.slice(start, end).forEach(row => {
                row.style.display = "";
            });

            // Update UI
            const info = document.getElementById("pgInfo");
            if (info) {
                info.innerHTML = `Page <span class="pg-page-num">${currentPage}</span> of <span class="pg-page-num">${totalPages}</span>`;
            }
            prevBtn.classList.toggle("disabled", currentPage === 1);
            nextBtn.classList.toggle("disabled", currentPage === totalPages);
        }

        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
            }
        };

        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPage(currentPage);
            }
        };

        renderPage(currentPage);
    }

    // Initial load
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(setupPagination, 500); // Give other scripts time to load data
    });

    // Public hook → call this after ANY search / filter / add / delete
    window.refreshPagination = function() {
        // We don't reset currentPage unless necessary (e.g. if current page becomes empty)
        setupPagination();
    };
})();

