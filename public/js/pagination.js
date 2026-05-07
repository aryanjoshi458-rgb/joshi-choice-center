// ===============================
// MODERN TABLE PAGINATION (CIRCULAR NUMERIC DESIGN)
// ===============================

(function initPagination() {
    const rowsPerPage = 5;
    let currentPage = 1;

    function setupPagination() {
        const table = document.querySelector("table");
        if (!table) return;

        const tbody = table.querySelector("tbody");
        if (!tbody) return;

        const allRows = Array.from(tbody.querySelectorAll("tr"));
        const visibleRows = allRows.filter(r => {
            if (r.innerText.includes("No Reports Found") || r.classList.contains("no-data-row")) return false;
            return r.getAttribute("data-filtered") !== "true";
        });

        document.getElementById("modernPager")?.remove();
        if (visibleRows.length === 0) return;

        const totalPages = Math.ceil(visibleRows.length / rowsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        // ---------- STYLE (Circular & Premium) ----------
        if (!document.getElementById("modern-pagination-style")) {
            const style = document.createElement("style");
            style.id = "modern-pagination-style";
            style.innerHTML = `
                .pagination-wrap {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin: 30px 0;
                    padding: 12px 24px;
                    background: var(--card-bg, rgba(15, 23, 42, 0.6));
                    backdrop-filter: blur(20px);
                    border-radius: 100px;
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    width: fit-content;
                    margin-left: auto;
                    margin-right: auto;
                }
                .pg-section-label {
                    color: var(--text-muted, rgba(255, 255, 255, 0.4));
                    font-weight: 800;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-right: 15px;
                    padding-right: 15px;
                    border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                }
                .pg-circles {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                .pg-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--hover-bg, rgba(255, 255, 255, 0.05));
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                    color: var(--text-muted, rgba(255, 255, 255, 0.6));
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .pg-circle:hover {
                    background: var(--primary-color);
                    color: white;
                    transform: translateY(-2px);
                    border-color: transparent;
                }
                .pg-circle.active {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    border-color: rgba(99, 102, 241, 0.4);
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
                    transform: scale(1.1);
                }
                .pg-nav-btn {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: var(--hover-bg, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    color: var(--text-muted, rgba(255, 255, 255, 0.4));
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .pg-nav-btn:hover:not(.disabled) {
                    background: var(--primary-color);
                    color: white;
                    border-color: transparent;
                }
                .pg-nav-btn.disabled {
                    opacity: 0.2;
                    cursor: not-allowed;
                }
                .pg-dots {
                    color: var(--text-muted);
                    font-weight: 800;
                    padding: 0 5px;
                }
            `;
            document.head.appendChild(style);
        }

        // ---------- UI ----------
        const pager = document.createElement("div");
        pager.id = "modernPager";
        pager.className = "pagination-wrap";

        let circlesHtml = "";
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            circlesHtml += `<div class="pg-circle" data-page="1">1</div>`;
            if (startPage > 2) circlesHtml += `<div class="pg-dots">...</div>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            circlesHtml += `<div class="pg-circle ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</div>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) circlesHtml += `<div class="pg-dots">...</div>`;
            circlesHtml += `<div class="pg-circle" data-page="${totalPages}">${totalPages}</div>`;
        }

        pager.innerHTML = `
            <div class="pg-section-label">Reports</div>
            <div class="pg-nav-btn ${currentPage === 1 ? 'disabled' : ''}" id="pgPrev">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </div>
            <div class="pg-circles">${circlesHtml}</div>
            <div class="pg-nav-btn ${currentPage === totalPages ? 'disabled' : ''}" id="pgNext">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
        `;

        const target = table.closest('.reports-table-wrap') || table.parentElement;
        target.appendChild(pager);

        function renderPage(page) {
            currentPage = page;
            allRows.forEach(r => r.style.display = "none");

            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;

            visibleRows.slice(start, end).forEach(row => {
                row.style.display = "";
            });

            // Update Circles
            document.querySelectorAll(".pg-circle").forEach(c => {
                c.classList.toggle("active", parseInt(c.dataset.page) === currentPage);
            });

            // Update Nav Buttons
            document.getElementById("pgPrev").classList.toggle("disabled", currentPage === 1);
            document.getElementById("pgNext").classList.toggle("disabled", currentPage === totalPages);
        }

        // Events
        document.querySelectorAll(".pg-circle").forEach(circle => {
            circle.onclick = () => renderPage(parseInt(circle.dataset.page));
        });

        document.getElementById("pgPrev").onclick = () => {
            if (currentPage > 1) renderPage(currentPage - 1);
        };

        document.getElementById("pgNext").onclick = () => {
            if (currentPage < totalPages) renderPage(currentPage + 1);
        };

        renderPage(currentPage);
    }

    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(setupPagination, 500);
    });

    window.refreshPagination = function () {
        setupPagination();
    };
})();

