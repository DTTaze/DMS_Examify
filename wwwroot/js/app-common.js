(function (window) {
    "use strict";

    const DEFAULT_PAGE_SIZE = 10;
    const VI_LOCALE = "vi-VN";

    function byId(id) {
        return document.getElementById(id);
    }

    function query(selector, root = document) {
        return root.querySelector(selector);
    }

    function queryAll(selector, root = document) {
        return Array.from(root.querySelectorAll(selector));
    }

    function onReady(init) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
            return;
        }
        init();
    }

    function setDisabled(button, wrapper, disabled, reason = "") {
        if (!button) {
            return;
        }

        button.disabled = disabled;
        if (!wrapper) {
            return;
        }

        if (disabled && reason) {
            wrapper.title = reason;
        } else {
            wrapper.removeAttribute("title");
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function cloneJson(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function debounce(timer, callback, delay) {
        clearTimeout(timer);
        return setTimeout(callback, delay);
    }

    function normalizeHeader(value) {
        return String(value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .trim();
    }

    function readFirstExcelSheet(file, onSuccess, onError) {
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                onSuccess(XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }));
            } catch (error) {
                onError(error);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function showImportModal() {
        byId("importFile").value = "";
        byId("importFileFeedback").textContent = "";
        byId("importPreviewSection").style.display = "none";
        byId("btnConfirmImport").disabled = true;

        new bootstrap.Modal(byId("importModal")).show();
    }

    function showImportFileError(message) {
        byId("importFileFeedback").textContent = message;
        byId("importPreviewSection").style.display = "none";
        byId("btnConfirmImport").disabled = true;
    }

    const changeStateConfig = {
        new: { className: "row-change-new", label: "Thêm mới", badgeClass: "text-bg-success" },
        updated: { className: "row-change-updated", label: "Đã sửa", badgeClass: "text-bg-warning" },
        deleted: { className: "row-change-deleted", label: "Chờ xóa", badgeClass: "text-bg-danger" }
    };

    function setChangeState(element, state) {
        if (!element) {
            return;
        }

        Object.values(changeStateConfig).forEach(config => element.classList.remove(config.className));
        element.querySelectorAll(":scope .change-state-badge").forEach(badge => badge.remove());

        if (!state || !changeStateConfig[state]) {
            delete element.dataset.changeState;
            return;
        }

        const config = changeStateConfig[state];
        element.dataset.changeState = state;
        element.classList.add(config.className);

        const badge = document.createElement("span");
        badge.className = `change-state-badge badge ${config.badgeClass}`;
        badge.textContent = config.label;

        const target = getChangeBadgeTarget(element);
        target.appendChild(badge);
    }

    function getChangeBadgeTarget(element) {
        if (element.matches("tr")) {
            return element.cells[0] || element;
        }

        return element.querySelector(".change-state-slot")
            || element.querySelector(".fw-semibold")?.parentElement
            || element;
    }

    function isPendingDelete(element) {
        return element?.dataset?.changeState === "deleted";
    }

    function createPageItem(content, options = {}) {
        const item = document.createElement("li");
        item.className = `page-item ${options.active ? "active" : ""} ${options.disabled ? "disabled" : ""}`.trim();

        if (options.ellipsis) {
            item.innerHTML = `<span class="page-link border-0 bg-transparent text-secondary">...</span>`;
            return item;
        }

        const title = options.title ? ` title="${escapeHtml(options.title)}"` : "";
        item.innerHTML = `<button type="button" class="page-link shadow-none"${title} onclick="changePage(${options.page})">${content}</button>`;
        return item;
    }

    function getCompactPages(currentPage, totalPages) {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, "...", totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    }

    function renderPagination(config) {
        const visibleRows = queryAll(config.visibleRowSelector);
        const allRows = queryAll(config.allRowSelector ?? config.visibleRowSelector);
        const totalRows = visibleRows.length;
        const totalPages = Math.ceil(totalRows / config.rowsPerPage) || 1;
        const currentPage = Math.min(Math.max(config.currentPage, 1), totalPages);
        const startIndex = (currentPage - 1) * config.rowsPerPage;
        const endIndex = startIndex + config.rowsPerPage;

        let visibleCounter = 0;
        allRows.forEach(row => {
            if (row.classList.contains("search-hidden")) {
                row.classList.add("d-none");
                return;
            }

            row.classList.toggle("d-none", visibleCounter < startIndex || visibleCounter >= endIndex);
            visibleCounter++;
        });

        updatePaginationSummary(config.summaryId, totalRows, startIndex, endIndex);
        renderPaginationButtons(config.paginationId, currentPage, totalPages, config.compact);

        return currentPage;
    }

    function updatePaginationSummary(summaryId, totalRows, startIndex, endIndex) {
        const summary = byId(summaryId);
        if (!summary) {
            return;
        }

        const from = totalRows === 0 ? 0 : startIndex + 1;
        const to = Math.min(endIndex, totalRows);
        summary.textContent = `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRows} dòng`;
    }

    function renderPaginationButtons(paginationId, currentPage, totalPages, compact = false) {
        const pagination = byId(paginationId);
        if (!pagination) {
            return;
        }

        pagination.innerHTML = "";
        pagination.appendChild(createPageItem('<i class="bi bi-chevron-double-left"></i>', {
            page: 1,
            disabled: currentPage === 1,
            title: "Trang đầu"
        }));

        pagination.appendChild(createPageItem('<i class="bi bi-chevron-left"></i>', {
            page: currentPage - 1,
            disabled: currentPage === 1,
            title: "Trang trước"
        }));

        getPaginationPages(currentPage, totalPages, compact).forEach(page => {
            pagination.appendChild(page === "..."
                ? createPageItem("", { ellipsis: true, disabled: true })
                : createPageItem(page, { page, active: currentPage === page }));
        });

        pagination.appendChild(createPageItem('<i class="bi bi-chevron-right"></i>', {
            page: currentPage + 1,
            disabled: currentPage === totalPages,
            title: "Trang sau"
        }));

        pagination.appendChild(createPageItem('<i class="bi bi-chevron-double-right"></i>', {
            page: totalPages,
            disabled: currentPage === totalPages,
            title: "Trang cuối"
        }));
    }

    function getPaginationPages(currentPage, totalPages, compact) {
        return compact ? getCompactPages(currentPage, totalPages) : Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const modal = {
        instance: null,

        get() {
            if (this.instance === null) {
                this.instance = new bootstrap.Modal(byId("customModal"));
            }
            return this.instance;
        },

        alert(message, title = "Thông báo", callback = null) {
            configureModal({ message, title, confirmClass: "btn btn-primary btn-sm px-3", confirmText: "Đồng ý" });
            const bsModal = this.get();
            bindModalResult(bsModal, false, callback);
            bsModal.show();
        },

        confirm(message, onConfirm, title = "Xác nhận") {
            configureModal({
                message,
                title,
                iconClass: "bi fs-4 bi-question-circle-fill text-warning",
                showCancel: true,
                confirmClass: "btn btn-danger btn-sm px-3",
                confirmText: "Xác nhận"
            });
            const bsModal = this.get();
            bindModalResult(bsModal, true, onConfirm);
            bsModal.show();
        }
    };

    function configureModal(options) {
        byId("customModalTitle").textContent = options.title;
        byId("customModalMessage").innerHTML = options.message;

        const icon = byId("customModalIcon");
        icon.className = options.iconClass ?? getAlertIconClass(options.title);

        const cancel = byId("btnCustomModalCancel");
        cancel.style.display = options.showCancel ? "inline-block" : "none";
        cancel.textContent = "Hủy";

        const ok = byId("btnCustomModalOk");
        ok.className = options.confirmClass;
        ok.textContent = options.confirmText;
    }

    function getAlertIconClass(title) {
        const normalizedTitle = normalizeHeader(title);
        if (normalizedTitle.includes("loi")) {
            return "bi fs-4 bi-exclamation-octagon-fill text-danger";
        }
        if (normalizedTitle.includes("thanh cong") || normalizedTitle.includes("ok")) {
            return "bi fs-4 bi-check-circle-fill text-success";
        }
        return "bi fs-4 bi-info-circle-fill text-primary";
    }

    function bindModalResult(bsModal, confirmOnly, callback) {
        const modalElement = byId("customModal");
        const currentOk = byId("btnCustomModalOk");
        const newOk = currentOk.cloneNode(true);
        currentOk.parentNode.replaceChild(newOk, currentOk);

        let confirmed = false;
        newOk.onclick = () => {
            confirmed = true;
            bsModal.hide();
        };

        const onHidden = () => {
            modalElement.removeEventListener("hidden.bs.modal", onHidden);
            if ((!confirmOnly || confirmed) && callback) {
                callback();
            }
        };
        modalElement.addEventListener("hidden.bs.modal", onHidden);
    }

    window.AppCommon = {
        DEFAULT_PAGE_SIZE,
        VI_LOCALE,
        byId,
        query,
        queryAll,
        onReady,
        setDisabled,
        escapeHtml,
        cloneJson,
        debounce,
        normalizeHeader,
        readFirstExcelSheet,
        showImportModal,
        showImportFileError,
        setChangeState,
        isPendingDelete,
        renderPagination,
        modal
    };

    window.hienThongBao = (...args) => modal.alert(...args);
    window.hienXacNhan = (...args) => modal.confirm(...args);
    window.normalizeHeader = normalizeHeader;
    window.showImportFileError = showImportFileError;
})(window);
