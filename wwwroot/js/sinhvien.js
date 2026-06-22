(function (window, AppCommon) {
    "use strict";

    // State Variables
    let selectedLop = null;
    let selectedLopRow = null;
    let selectedRow = null;

    let newItems = [];
    let updatedItems = [];
    let deletedItems = [];
    let undoHistoryStack = [];
    let redoHistoryStack = [];
    let temporaryIdCounter = -1;

    let newLops = [];
    let updatedLops = [];
    let deletedLops = [];
    let historyLopUndo = [];
    let historyLopRedo = [];

    let currentPage = 1;
    let rowsPerPage = 10;
    let currentLopPage = 1;
    let lopsPerPage = 5;
    let classDebounceTimer = null;
    let studentDebounceTimer = null;

    // DOM Elements Cache
    const dom = {
        txtMaLop: null,
        txtTenLop: null,
        errMaLop: null,
        errTenLop: null,
        btnThemLop: null,
        btnSuaLop: null,
        wrapThemLop: null,
        wrapSuaLop: null,
        btnUndoLop: null,
        btnRedoLop: null,
        btnGhiLop: null,
        wrapGhiLop: null,
        txtSearchLop: null,
        btnClearSearchLop: null,
        lopEmptyState: null,
        lopList: null,
        lblLopCount: null,
        ulLopPagination: null,
        selectLopPageSize: null,
        lblLopPaginationSummary: null,
        btnExport: null,
        btnImport: null,
        currentLop: null,
        txtSearchSV: null,
        txtMaSV: null,
        txtHo: null,
        txtTen: null,
        txtNgaySinh: null,
        txtDiaChi: null,
        txtMatKhau: null,
        errMaSV: null,
        errHo: null,
        errTen: null,
        errNgaySinh: null,
        errDiaChi: null,
        errMatKhau: null,
        btnThemSV: null,
        btnSuaSV: null,
        wrapThemSV: null,
        wrapSuaSV: null,
        btnUndoSV: null,
        btnRedoSV: null,
        btnGhiSV: null,
        wrapGhiSV: null,
        svTable: null,
        lblPaginationSummary: null,
        selectPageSize: null,
        ulPagination: null,
        importFile: null,
        importFileFeedback: null,
        importPreviewSection: null,
        tblImportPreview: null,
        btnConfirmImport: null,
        importSummary: null
    };

    AppCommon.onReady(() => {
        // Cache DOM elements
        dom.txtMaLop = AppCommon.byId("txtMaLop");
        dom.txtTenLop = AppCommon.byId("txtTenLop");
        dom.errMaLop = AppCommon.byId("errMaLop");
        dom.errTenLop = AppCommon.byId("errTenLop");
        dom.btnThemLop = AppCommon.byId("btnThemLop");
        dom.btnSuaLop = AppCommon.byId("btnSuaLop");
        dom.wrapThemLop = AppCommon.byId("wrapThemLop");
        dom.wrapSuaLop = AppCommon.byId("wrapSuaLop");
        dom.btnUndoLop = AppCommon.byId("btnUndoLop");
        dom.btnRedoLop = AppCommon.byId("btnRedoLop");
        dom.btnGhiLop = AppCommon.byId("btnGhiLop");
        dom.wrapGhiLop = AppCommon.byId("wrapGhiLop");
        dom.txtSearchLop = AppCommon.byId("txtSearchLop");
        dom.btnClearSearchLop = AppCommon.byId("btnClearSearchLop");
        dom.lopEmptyState = AppCommon.byId("lopEmptyState");
        dom.lopList = AppCommon.byId("lopList");
        dom.lblLopCount = AppCommon.byId("lblLopCount");
        dom.ulLopPagination = AppCommon.byId("ulLopPagination");
        dom.selectLopPageSize = AppCommon.byId("selectLopPageSize");
        dom.lblLopPaginationSummary = AppCommon.byId("lblLopPaginationSummary");
        dom.btnExport = AppCommon.byId("btnExport");
        dom.btnImport = AppCommon.byId("btnImport");
        dom.currentLop = AppCommon.byId("currentLop");
        dom.txtSearchSV = AppCommon.byId("txtSearchSV");
        dom.txtMaSV = AppCommon.byId("txtMaSV");
        dom.txtHo = AppCommon.byId("txtHo");
        dom.txtTen = AppCommon.byId("txtTen");
        dom.txtNgaySinh = AppCommon.byId("txtNgaySinh");
        dom.txtDiaChi = AppCommon.byId("txtDiaChi");
        dom.txtMatKhau = AppCommon.byId("txtMatKhau");
        dom.errMaSV = AppCommon.byId("errMaSV");
        dom.errHo = AppCommon.byId("errHo");
        dom.errTen = AppCommon.byId("errTen");
        dom.errNgaySinh = AppCommon.byId("errNgaySinh");
        dom.errDiaChi = AppCommon.byId("errDiaChi");
        dom.errMatKhau = AppCommon.byId("errMatKhau");
        dom.btnThemSV = AppCommon.byId("btnThemSV");
        dom.btnSuaSV = AppCommon.byId("btnSuaSV");
        dom.wrapThemSV = AppCommon.byId("wrapThemSV");
        dom.wrapSuaSV = AppCommon.byId("wrapSuaSV");
        dom.btnUndoSV = AppCommon.byId("btnUndoSV");
        dom.btnRedoSV = AppCommon.byId("btnRedoSV");
        dom.btnGhiSV = AppCommon.byId("btnGhiSV");
        dom.wrapGhiSV = AppCommon.byId("wrapGhiSV");
        dom.svTable = AppCommon.byId("svTable");
        dom.lblPaginationSummary = AppCommon.byId("lblPaginationSummary");
        dom.selectPageSize = AppCommon.byId("selectPageSize");
        dom.ulPagination = AppCommon.byId("ulPagination");
        dom.importFile = AppCommon.byId("importFile");
        dom.importFileFeedback = AppCommon.byId("importFileFeedback");
        dom.importPreviewSection = AppCommon.byId("importPreviewSection");
        dom.tblImportPreview = AppCommon.byId("tblImportPreview");
        dom.btnConfirmImport = AppCommon.byId("btnConfirmImport");
        dom.importSummary = AppCommon.byId("importSummary");

        // Event listeners
        ["txtMaSV", "txtHo", "txtTen", "txtDiaChi", "txtMatKhau"]
            .forEach(id => {
                const element = AppCommon.byId(id);
                if (element) element.addEventListener("input", validateStudentInputs);
            });
        
        if (dom.txtNgaySinh) {
            dom.txtNgaySinh.addEventListener("input", validateStudentInputs);
            dom.txtNgaySinh.addEventListener("change", validateStudentInputs);
        }

        ["txtMaLop", "txtTenLop"]
            .forEach(id => {
                const element = AppCommon.byId(id);
                if (element) element.addEventListener("input", validateClassInputs);
            });

        if (dom.txtSearchSV) {
            dom.txtSearchSV.addEventListener("input", triggerStudentSearch);
        }

        bindLopRows();
        updateLopPagination();
        bindRows();
        validateClassInputs();
        validateStudentInputs();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
        updateUndoRedoLopButtonStates();
        updateSaveLopButtonState();
    });

    function locLop() {
        const keyword = dom.txtSearchLop.value.toLowerCase().trim();
        const items = dom.lopList.querySelectorAll("li");
        
        if (keyword) {
            dom.btnClearSearchLop.classList.remove("d-none");
        } else {
            dom.btnClearSearchLop.classList.add("d-none");
        }

        let visibleCount = 0;
        items.forEach(li => {
            const ma = (li.dataset.malop || "").toLowerCase();
            const ten = (li.dataset.tenlop || "").toLowerCase();
            
            if (ma.includes(keyword) || ten.includes(keyword)) {
                li.classList.remove("search-hidden");
                visibleCount++;
            } else {
                li.classList.add("search-hidden");
            }
        });

        dom.lblLopCount.innerText = `Tìm thấy ${visibleCount}/${items.length} lớp`;

        if (visibleCount === 0 && items.length > 0) {
            dom.lopEmptyState.classList.remove("d-none");
        } else {
            dom.lopEmptyState.classList.add("d-none");
        }

        currentLopPage = 1;
        updateLopPagination();
    }

    function clearSearchLop() {
        dom.txtSearchLop.value = "";
        locLop();
        dom.txtSearchLop.focus();
    }

    function bindLopRows() {
        dom.lopList.querySelectorAll("li").forEach(li => {
            li.onclick = () => chonLop(li);
        });
    }

    function pushStateLop() {
        historyLopUndo.push({
            html: dom.lopList.innerHTML,
            newLops: AppCommon.cloneJson(newLops),
            updatedLops: AppCommon.cloneJson(updatedLops),
            deletedLops: AppCommon.cloneJson(deletedLops)
        });
        historyLopRedo = [];
        updateUndoRedoLopButtonStates();
    }

    function chonLop(el, callback) {
        if (AppCommon.isPendingDelete(el)) {
            window.hienThongBao("Lớp này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
            return;
        }

        if (el.classList.contains("active")) {
            if (callback) callback();
            return;
        }

        const hasStudentChanges = (newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0);
        if (hasStudentChanges) {
            window.hienXacNhan("Bạn có thay đổi chưa lưu ở danh sách sinh viên lớp hiện tại. Việc chuyển lớp sẽ làm mất các thay đổi này. Bạn có chắc chắn muốn tiếp tục?", () => {
                executeChonLop(el);
                if (callback) callback();
            });
        } else {
            executeChonLop(el);
            if (callback) callback();
        }
    }

    function executeChonLop(el) {
        dom.lopList.querySelectorAll("li").forEach(x => x.classList.remove("active"));
        el.classList.add("active");

        selectedLopRow = el;
        selectedLop = el.dataset.malop;

        clearLopInputs();

        dom.currentLop.innerText = el.dataset.tenlop;
        newItems = [];
        updatedItems = [];
        deletedItems = [];
        undoHistoryStack = [];
        redoHistoryStack = [];
        selectedRow = null;
        resetStudentForm();
        dom.btnExport.removeAttribute("disabled");
        dom.btnImport.removeAttribute("disabled");

        loadSinhVien();
        validateClassInputs();
    }

    function themLop() {
        const ma = dom.txtMaLop.value.trim().toUpperCase();
        const ten = dom.txtTenLop.value.trim();

        if (!ma || !ten) {
            window.hienThongBao("Vui lòng nhập đầy đủ Mã và Tên lớp.", "Thông báo");
            return;
        }
        const exists = [...dom.lopList.querySelectorAll("li")].some(li => li.dataset.malop === ma);
        if (exists) {
            window.hienThongBao("Mã lớp này đã tồn tại trong danh sách.", "Thông báo");
            return;
        }

        pushStateLop();
        newLops.push({ MaLop: ma, TenLop: ten });

        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action border-light";
        li.dataset.malop = ma;
        li.dataset.tenlop = ten;
        li.dataset.originalTenlop = "";
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="fw-semibold text-dark">${ten}</span>
                    <span class="badge bg-light text-secondary border border-light ms-2">${ma}</span>
                </div>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-link p-0 text-warning" onclick="editLopClick(event, this.closest('li'))" title="Sửa">
                        <i class="bi bi-pencil-fill fs-6"></i>
                    </button>
                    <button type="button" class="btn btn-link p-0 text-danger" onclick="deleteLopClick(event, this.closest('li'))" title="Xóa">
                        <i class="bi bi-trash-fill fs-6"></i>
                    </button>
                </div>
            </div>
        `;
        AppCommon.setChangeState(li, "new");
        li.onclick = () => chonLop(li);

        dom.lopList.appendChild(li);
        resetLopForm();
        locLop();
        updateSaveLopButtonState();
    }

    function suaLop() {
        if (!selectedLopRow) {
            window.hienThongBao("Vui lòng chọn một lớp trong danh sách để hiệu chỉnh.", "Thông báo");
            return;
        }

        const oldMa = selectedLopRow.dataset.malop;
        const ten = dom.txtTenLop.value.trim();

        if (!ten) {
            window.hienThongBao("Tên lớp không được để trống.", "Thông báo");
            return;
        }

        pushStateLop();
        const originalTenLop = selectedLopRow.dataset.originalTenlop !== undefined && selectedLopRow.dataset.originalTenlop !== null
            ? selectedLopRow.dataset.originalTenlop
            : selectedLopRow.dataset.tenlop;

        const isTenChanged = ten !== originalTenLop;
        selectedLopRow.dataset.tenlop = ten;
        
        selectedLopRow.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="fw-semibold text-dark">${ten}</span>
                    ${isTenChanged ? `<span class="original-val text-muted small ms-2" style="font-size: 0.8rem;">(Gốc: <span class="text-decoration-line-through">${originalTenLop}</span>)</span>` : ''}
                    <span class="badge bg-light text-secondary border border-light ms-2">${oldMa}</span>
                </div>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-link p-0 text-warning" onclick="editLopClick(event, this.closest('li'))" title="Sửa">
                        <i class="bi bi-pencil-fill fs-6"></i>
                    </button>
                    <button type="button" class="btn btn-link p-0 text-danger" onclick="deleteLopClick(event, this.closest('li'))" title="Xóa">
                        <i class="bi bi-trash-fill fs-6"></i>
                    </button>
                </div>
            </div>
        `;

        const newIndex = newLops.findIndex(x => x.MaLop === oldMa);
        if (newIndex >= 0) {
            newLops[newIndex].TenLop = ten;
            AppCommon.setChangeState(selectedLopRow, "new");
        } else {
            updatedLops = updatedLops.filter(x => x.MaLop !== oldMa);
            if (isTenChanged) {
                updatedLops.push({ MaLop: oldMa, TenLop: ten });
                AppCommon.setChangeState(selectedLopRow, "updated");
            } else {
                AppCommon.setChangeState(selectedLopRow, null);
            }
        }

        dom.currentLop.innerText = ten;
        locLop();
        validateClassInputs();
        updateSaveLopButtonState();
    }

    function xoaLop() {
        if (!selectedLopRow) {
            window.hienThongBao("Vui lòng chọn lớp cần xóa.", "Thông báo");
            return;
        }
        deleteLopClick(null, selectedLopRow);
    }

    function undoLop() {
        if (historyLopUndo.length === 0) return;

        historyLopRedo.push({
            html: dom.lopList.innerHTML,
            newLops: AppCommon.cloneJson(newLops),
            updatedLops: AppCommon.cloneJson(updatedLops),
            deletedLops: AppCommon.cloneJson(deletedLops)
        });

        const previousState = historyLopUndo.pop();
        dom.lopList.innerHTML = previousState.html;
        newLops = previousState.newLops;
        updatedLops = previousState.updatedLops;
        deletedLops = previousState.deletedLops;

        bindLopRows();
        selectedLopRow = null;
        selectedLop = null;
        dom.currentLop.innerText = "Chưa chọn";
        dom.svTable.innerHTML = "";
        resetLopForm();
        updateSTT();
        locLop();
        updateUndoRedoLopButtonStates();
        updateSaveLopButtonState();
    }

    function redoLop() {
        if (historyLopRedo.length === 0) return;

        historyLopUndo.push({
            html: dom.lopList.innerHTML,
            newLops: AppCommon.cloneJson(newLops),
            updatedLops: AppCommon.cloneJson(updatedLops),
            deletedLops: AppCommon.cloneJson(deletedLops)
        });

        const nextState = historyLopRedo.pop();
        dom.lopList.innerHTML = nextState.html;
        newLops = nextState.newLops;
        updatedLops = nextState.updatedLops;
        deletedLops = nextState.deletedLops;

        bindLopRows();
        selectedLopRow = null;
        selectedLop = null;
        dom.currentLop.innerText = "Chưa chọn";
        dom.svTable.innerHTML = "";
        resetLopForm();
        updateSTT();
        locLop();
        updateUndoRedoLopButtonStates();
        updateSaveLopButtonState();
    }

    async function ghiLop() {
        if (deletedLops.length === 0 && updatedLops.length === 0 && newLops.length === 0) {
            window.hienThongBao("Không có thay đổi nào về Lớp cần ghi.", "Thông báo");
            return;
        }

        historyLopUndo = [];
        historyLopRedo = [];
        updateUndoRedoLopButtonStates();
        updateSaveLopButtonState();

        try {
            for (const d of deletedLops) {
                const response = await fetch(`/LopSinhVien/DeleteClass?maLop=${d.MaLop}`, { method: "POST" });
                if (!response.ok) {
                    const err = await response.text();
                    window.hienThongBao(`Lỗi khi xóa lớp <strong>${d.MaLop}</strong>: ${err}`, "Lỗi");
                    return;
                }
            }

            for (const u of updatedLops) {
                const response = await fetch(`/LopSinhVien/UpdateClass`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(u)
                });
                if (!response.ok) {
                    const err = await response.text();
                    window.hienThongBao(`Lỗi khi sửa lớp <strong>${u.MaLop}</strong>: ${err}`, "Lỗi");
                    return;
                }
            }

            for (const n of newLops) {
                const response = await fetch(`/LopSinhVien/CreateClass`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(n)
                });
                if (!response.ok) {
                    const err = await response.text();
                    window.hienThongBao(`Lỗi khi thêm lớp <strong>${n.MaLop}</strong>: ${err}`, "Lỗi");
                    return;
                }
            }

            window.hienThongBao("Ghi danh mục Lớp thành công!", "Thành công", () => {
                newLops = [];
                updatedLops = [];
                deletedLops = [];
                location.reload();
            });
        } catch (e) {
            window.hienThongBao("Lỗi kết nối khi lưu Lớp: " + e.message, "Lỗi");
        }
    }

    function clickResetLop() {
        const hasStudentChanges = (newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0);
        const hasClassChanges = (newLops.length > 0 || updatedLops.length > 0 || deletedLops.length > 0);

        if (hasStudentChanges || hasClassChanges) {
            window.hienXacNhan("Bạn có thay đổi chưa lưu ở danh mục Lớp hoặc Sinh viên. Bạn có chắc chắn muốn Reset và hủy bỏ tất cả thay đổi?", () => {
                resetLopForm();
            });
        } else {
            resetLopForm();
        }
    }

    function clearLopInputs() {
        dom.txtMaLop.value = "";
        dom.txtTenLop.value = "";
        dom.txtMaLop.disabled = false;
        
        dom.txtMaLop.classList.remove("is-invalid");
        dom.txtTenLop.classList.remove("is-invalid");
        dom.errMaLop.textContent = "";
        dom.errTenLop.textContent = "";

        validateClassInputs();
    }

    function resetLopForm() {
        clearLopInputs();
        selectedLopRow = null;
        selectedLop = null;
        dom.lopList.querySelectorAll("li").forEach(x => x.classList.remove("active"));
        dom.currentLop.innerText = "Chưa chọn lớp";
        newItems = [];
        updatedItems = [];
        deletedItems = [];
        undoHistoryStack = [];
        redoHistoryStack = [];
        selectedRow = null;
        dom.svTable.innerHTML = "";
        resetStudentForm();
        dom.btnExport.setAttribute("disabled", "true");
        dom.btnImport.setAttribute("disabled", "true");
    }

    function validateClassInputs() {
        const maLop = dom.txtMaLop.value.trim().toUpperCase();
        const tenLop = dom.txtTenLop.value.trim();
        const isEditing = dom.txtMaLop.disabled;

        dom.errMaLop.textContent = "";
        dom.errTenLop.textContent = "";
        dom.txtMaLop.classList.remove("is-invalid");
        dom.txtTenLop.classList.remove("is-invalid");

        if (isEditing && selectedLopRow) {
            const originalTenLop = (selectedLopRow.dataset.tenlop || "").trim();
            if (tenLop === originalTenLop) {
                updateClassButtonStates(
                    true, "Đang ở chế độ hiệu chỉnh (Phục hồi để thêm mới)",
                    true, "Vui lòng thay đổi tên lớp trước khi lưu hiệu chỉnh."
                );
                return;
            }
        }

        let hasClientError = false;

        if (maLop === "") {
            hasClientError = true;
        } else if (maLop.length > 20) {
            dom.errMaLop.textContent = "Mã lớp tối đa 20 ký tự.";
            dom.txtMaLop.classList.add("is-invalid");
            hasClientError = true;
        }

        if (tenLop === "") {
            hasClientError = true;
        } else if (tenLop.length > 50) {
            dom.errTenLop.textContent = "Tên lớp tối đa 50 ký tự.";
            dom.txtTenLop.classList.add("is-invalid");
            hasClientError = true;
        }

        if (hasClientError) {
            const reasonThem = isEditing
                ? "Đang ở chế độ hiệu chỉnh (Phục hồi để thêm mới)"
                : "Vui lòng nhập Mã và Tên lớp để thêm.";
            const reasonSua = isEditing
                ? "Tên lớp không được để trống."
                : "Vui lòng chọn lớp trong danh sách để hiệu chỉnh";
            updateClassButtonStates(true, reasonThem, true, reasonSua);
            return;
        }
        let isLocalDuplicate = false;
        let localReasonMa = "";
        let localReasonTen = "";

        const listItems = dom.lopList.querySelectorAll("li");
        for (const li of listItems) {
            if (AppCommon.isPendingDelete(li)) {
                continue;
            }
            if (selectedLopRow !== null && li === selectedLopRow) {
                continue;
            }

            const existingMaLop = li.dataset.malop.trim().toUpperCase();
            const existingTenLop = li.dataset.tenlop.trim().toLowerCase();

            if (maLop !== "" && existingMaLop === maLop) {
                dom.errMaLop.textContent = "Mã lớp này đã tồn tại trên danh sách tạm thời.";
                dom.txtMaLop.classList.add("is-invalid");
                isLocalDuplicate = true;
                localReasonMa = "Mã lớp bị trùng lặp trên danh sách tạm thời.";
            }

            if (tenLop !== "" && existingTenLop === tenLop.toLowerCase()) {
                dom.errTenLop.textContent = "Tên lớp này đã tồn tại trên danh sách tạm thời.";
                dom.txtTenLop.classList.add("is-invalid");
                isLocalDuplicate = true;
                localReasonTen = "Tên lớp bị trùng lặp trên danh sách tạm thời.";
            }
        }

        if (isLocalDuplicate) {
            const reasonThem = isEditing
                ? "Đang ở chế độ hiệu chỉnh (Phục hồi để thêm mới)"
                : (localReasonMa || localReasonTen);
            const reasonSua = isEditing
                ? localReasonTen || "Tên lớp trùng lặp trên danh sách tạm thời."
                : "Vui lòng chọn lớp trong danh sách để hiệu chỉnh";
            updateClassButtonStates(true, reasonThem, true, reasonSua);
            return;
        }

        clearTimeout(classDebounceTimer);
        updateClassButtonStates(
            true, "Đang kiểm tra trùng lặp từ cơ sở dữ liệu...",
            true, "Đang kiểm tra trùng lặp từ cơ sở dữ liệu..."
        );

        classDebounceTimer = setTimeout(() => {
            const action = isEditing ? "CheckClassDuplicateForUpdate" : "CheckClassDuplicateForCreate";
            const checkUrl = `/LopSinhVien/${action}?maLop=${encodeURIComponent(maLop)}&tenLop=${encodeURIComponent(tenLop)}`;

            fetch(checkUrl)
                .then(res => {
                    if (!res.ok) throw new Error("Lỗi HTTP");
                    return res.json();
                })
                .then(status => {
                    let dbDuplicate = false;
                    let dbReasonMa = "";
                    let dbReasonTen = "";

                    if (!isEditing && maLop !== "" && status.maLopDuplicate) {
                        dbDuplicate = true;
                        dom.txtMaLop.classList.add("is-invalid");
                        dom.errMaLop.textContent = "Mã lớp này đã tồn tại trong CSDL.";
                        dbReasonMa = "Mã lớp đã tồn tại trong CSDL.";
                    }

                    if (tenLop !== "" && status.tenLopDuplicate) {
                        dbDuplicate = true;
                        dom.txtTenLop.classList.add("is-invalid");
                        dom.errTenLop.textContent = "Tên lớp này đã tồn tại trong CSDL.";
                        dbReasonTen = "Tên lớp đã tồn tại trong CSDL.";
                    }

                    let reasonThem = "";
                    if (isEditing) {
                        reasonThem = "Đang ở chế độ hiệu chỉnh (Phục hồi để thêm mới)";
                    } else if (dbDuplicate) {
                        reasonThem = dbReasonMa || dbReasonTen || "Trùng lặp trong CSDL.";
                    }

                    let reasonSua = "";
                    if (!isEditing) {
                        reasonSua = "Vui lòng chọn lớp trong danh sách để hiệu chỉnh";
                    } else if (dbDuplicate) {
                        reasonSua = dbReasonTen || "Tên lớp đã tồn tại trong CSDL.";
                    }

                    if (dbDuplicate) {
                        updateClassButtonStates(true, reasonThem, true, reasonSua);
                    } else {
                        if (isEditing) {
                            updateClassButtonStates(true, "Đang ở chế độ hiệu chỉnh (Phục hồi để thêm mới)", false, "");
                        } else {
                            updateClassButtonStates(false, "", true, "Vui lòng chọn lớp trong danh sách để hiệu chỉnh");
                        }
                    }
                })
                .catch(error => {
                    console.error("Lỗi kiểm tra CSDL:", error);
                    if (isEditing) {
                        updateClassButtonStates(true, "Đang ở chế độ hiệu chỉnh (Phục hồi để thêm mới)", false, "");
                    } else {
                        updateClassButtonStates(false, "", true, "Vui lòng chọn lớp trong danh sách để hiệu chỉnh");
                    }
                });
        }, 250);
    }

    function updateClassButtonStates(disableThem, reasonThem, disableSua, reasonSua) {
        AppCommon.setDisabled(dom.btnThemLop, dom.wrapThemLop, disableThem, reasonThem);
        AppCommon.setDisabled(dom.btnSuaLop, dom.wrapSuaLop, disableSua, reasonSua);
    }

    function pushState() {
        undoHistoryStack.push({
            html: dom.svTable.innerHTML,
            newItems: AppCommon.cloneJson(newItems),
            updatedItems: AppCommon.cloneJson(updatedItems),
            deletedItems: AppCommon.cloneJson(deletedItems)
        });
        redoHistoryStack = [];
    }

    function undoSV() {
        if (undoHistoryStack.length === 0) return;

        redoHistoryStack.push({
            html: dom.svTable.innerHTML,
            newItems: AppCommon.cloneJson(newItems),
            updatedItems: AppCommon.cloneJson(updatedItems),
            deletedItems: AppCommon.cloneJson(deletedItems)
        });

        const prev = undoHistoryStack.pop();
        dom.svTable.innerHTML = prev.html;
        newItems = prev.newItems;
        updatedItems = prev.updatedItems;
        deletedItems = prev.deletedItems;

        bindRows();
        updateSTT();
        selectedRow = null;
        resetStudentForm();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function redoSV() {
        if (redoHistoryStack.length === 0) return;

        undoHistoryStack.push({
            html: dom.svTable.innerHTML,
            newItems: AppCommon.cloneJson(newItems),
            updatedItems: AppCommon.cloneJson(updatedItems),
            deletedItems: AppCommon.cloneJson(deletedItems)
        });

        const next = redoHistoryStack.pop();
        dom.svTable.innerHTML = next.html;
        newItems = next.newItems;
        updatedItems = next.updatedItems;
        deletedItems = next.deletedItems;

        bindRows();
        updateSTT();
        selectedRow = null;
        resetStudentForm();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function getStudentForm() {
        return {
            MaSV: dom.txtMaSV.value.trim().toUpperCase(),
            Ho: dom.txtHo.value.trim(),
            Ten: dom.txtTen.value.trim(),
            NgaySinh: dom.txtNgaySinh.value,
            DiaChi: dom.txtDiaChi.value.trim(),
            MatKhau: dom.txtMatKhau.value,
            MaLop: selectedLop
        };
    }

    function fillStudentForm(row) {
        dom.txtMaSV.value = row.dataset.masv;
        dom.txtHo.value = row.dataset.ho;
        dom.txtTen.value = row.dataset.ten;
        dom.txtNgaySinh.value = row.dataset.ngaysinh;
        dom.txtDiaChi.value = row.dataset.diachi;
        dom.txtMatKhau.value = row.dataset.matkhau || "";
        dom.txtMaSV.disabled = true;
        validateStudentInputs();
    }

    function clearStudentInputs() {
        dom.txtMaSV.value = "";
        dom.txtHo.value = "";
        dom.txtTen.value = "";
        dom.txtNgaySinh.value = "";
        dom.txtDiaChi.value = "";
        dom.txtMatKhau.value = "";
        dom.txtMaSV.disabled = false;
        const fields = ["txtMaSV", "txtHo", "txtTen", "txtNgaySinh", "txtDiaChi", "txtMatKhau"];
        fields.forEach(f => dom[f]?.classList.remove("is-invalid"));
        
        const errors = ["errMaSV", "errHo", "errTen", "errNgaySinh", "errDiaChi", "errMatKhau"];
        errors.forEach(e => {
            const errEl = dom[e] || AppCommon.byId(e);
            if (errEl) errEl.textContent = "";
        });

        validateStudentInputs();
    }

    function resetStudentForm() {
        clearStudentInputs();
        selectedRow = null;
        dom.svTable.querySelectorAll("tr").forEach(x => x.classList.remove("table-active"));
    }

    function bindRows() {
        dom.svTable.querySelectorAll("tr").forEach(row => {
            row.onclick = () => {
                if (AppCommon.isPendingDelete(row)) {
                    return;
                }
                if (row.classList.contains("table-active")) return;
                dom.svTable.querySelectorAll("tr").forEach(x => x.classList.remove("table-active"));
                row.classList.add("table-active");
                selectedRow = row;
                clearStudentInputs();
            };
        });
    }

    async function loadSinhVien() {
        if (!selectedLop) return;

        try {
            const res = await fetch('/LopSinhVien/GetStudentsByClass?maLop=' + selectedLop);
            const data = await res.json();

            dom.svTable.innerHTML = "";

            data.forEach(sv => {
                const row = dom.svTable.insertRow();
                row.dataset.masv = sv.maSV;
                row.dataset.ho = sv.ho;
                row.dataset.ten = sv.ten;
                row.dataset.ngaysinh = sv.ngaySinh ? sv.ngaySinh.slice(0, 10) : "";
                row.dataset.diachi = sv.diaChi;
                row.dataset.matkhau = sv.matKhau || "";
                row.dataset.originalHo = sv.ho;
                row.dataset.originalTen = sv.ten;
                row.dataset.originalNgaysinh = sv.ngaySinh ? sv.ngaySinh.slice(0, 10) : "";
                row.dataset.originalDiachi = sv.diaChi;
                row.dataset.originalMatkhau = sv.matKhau || "";

                row.innerHTML = `
                    <td>${sv.maSV}</td>
                    <td>${sv.ho}</td>
                    <td>${sv.ten}</td>
                    <td>${sv.ngaySinh ? new Date(sv.ngaySinh).toLocaleDateString('vi-VN') : ""}</td>
                    <td>${sv.diaChi}</td>
                    <td class="text-center">
                        <div class="d-flex gap-2 justify-content-center">
                            <button type="button" class="btn btn-link p-0 text-warning" onclick="editSVClick(event, this.closest('tr'))" title="Sửa">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button type="button" class="btn btn-link p-0 text-danger" onclick="deleteSVClick(event, this.closest('tr'))" title="Xóa">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                    </td>
                `;
            });

            bindRows();
            currentPage = 1;
            updateSTT();
            updateSaveButtonState();
            updateUndoRedoButtonStates();
        } catch (err) {
            console.error("Lỗi khi tải sinh viên:", err);
        }
    }

    function themSV() {
        if (!selectedLop) {
            window.hienThongBao("Vui lòng chọn một lớp học trước.", "Thông báo");
            return;
        }

        const d = getStudentForm();
        if (!d.MaSV || !d.Ho || !d.Ten) return;

        pushState();

        const row = dom.svTable.insertRow();
        row.dataset.masv = d.MaSV;
        row.dataset.ho = d.Ho;
        row.dataset.ten = d.Ten;
        row.dataset.ngaysinh = d.NgaySinh;
        row.dataset.diachi = d.DiaChi;
        row.dataset.matkhau = d.MatKhau;
        row.dataset.originalHo = "";
        row.dataset.originalTen = "";
        row.dataset.originalNgaysinh = "";
        row.dataset.originalDiachi = "";
        row.dataset.originalMatkhau = "";

        row.innerHTML = `
            <td>${d.MaSV}</td>
            <td>${d.Ho}</td>
            <td>${d.Ten}</td>
            <td>${d.NgaySinh ? new Date(d.NgaySinh).toLocaleDateString('vi-VN') : ""}</td>
            <td>${d.DiaChi}</td>
            <td class="text-center">
                <div class="d-flex gap-2 justify-content-center">
                    <button type="button" class="btn btn-link p-0 text-warning" onclick="editSVClick(event, this.closest('tr'))" title="Sửa">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button type="button" class="btn btn-link p-0 text-danger" onclick="deleteSVClick(event, this.closest('tr'))" title="Xóa">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </td>
        `;
        AppCommon.setChangeState(row, "new");

        newItems.push(d);

        bindRows();
        updateSTT();
        resetStudentForm();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function suaSV() {
        if (!selectedRow) return;

        const d = getStudentForm();
        const id = selectedRow.dataset.masv;

        pushState();

        const oHo = selectedRow.dataset.originalHo !== undefined ? selectedRow.dataset.originalHo : selectedRow.dataset.ho;
        const oTen = selectedRow.dataset.originalTen !== undefined ? selectedRow.dataset.originalTen : selectedRow.dataset.ten;
        const oNgaySinh = selectedRow.dataset.originalNgaysinh !== undefined ? selectedRow.dataset.originalNgaysinh : selectedRow.dataset.ngaysinh;
        const oDiaChi = selectedRow.dataset.originalDiachi !== undefined ? selectedRow.dataset.originalDiachi : selectedRow.dataset.diachi;
        const oMatKhau = selectedRow.dataset.originalMatkhau !== undefined ? selectedRow.dataset.originalMatkhau : (selectedRow.dataset.matkhau || "");

        const newIdx = newItems.findIndex(x => x.MaSV === id);
        const isNew = newIdx >= 0;

        const isHoChanged = d.Ho !== oHo;
        const isTenChanged = d.Ten !== oTen;
        const isNgaySinhChanged = d.NgaySinh !== oNgaySinh;
        const isDiaChiChanged = d.DiaChi !== oDiaChi;
        const isMatKhauChanged = d.MatKhau !== oMatKhau;

        const nsFormatted = d.NgaySinh ? new Date(d.NgaySinh).toLocaleDateString('vi-VN') : "";
        const oNsFormatted = oNgaySinh ? new Date(oNgaySinh).toLocaleDateString('vi-VN') : "";

        selectedRow.innerHTML = `
            <td>${id}</td>
            <td class="${(!isNew && isHoChanged) ? 'cell-edited' : ''}">
                ${d.Ho}
                ${(!isNew && isHoChanged) ? `<div class="original-val text-muted small mt-1" style="font-size: 0.8rem;">(Gốc: <span class="text-decoration-line-through">${oHo}</span>)</div>` : ''}
            </td>
            <td class="${(!isNew && isTenChanged) ? 'cell-edited' : ''}">
                ${d.Ten}
                ${(!isNew && isTenChanged) ? `<div class="original-val text-muted small mt-1" style="font-size: 0.8rem;">(Gốc: <span class="text-decoration-line-through">${oTen}</span>)</div>` : ''}
            </td>
            <td class="${(!isNew && isNgaySinhChanged) ? 'cell-edited' : ''}">
                ${nsFormatted}
                ${(!isNew && isNgaySinhChanged) ? `<div class="original-val text-muted small mt-1" style="font-size: 0.8rem;">(Gốc: <span class="text-decoration-line-through">${oNsFormatted}</span>)</div>` : ''}
            </td>
            <td class="${(!isNew && isDiaChiChanged) ? 'cell-edited' : ''}">
                ${d.DiaChi}
                ${(!isNew && isDiaChiChanged) ? `<div class="original-val text-muted small mt-1" style="font-size: 0.8rem;">(Gốc: <span class="text-decoration-line-through">${oDiaChi}</span>)</div>` : ''}
            </td>
            <td class="text-center">
                <div class="d-flex gap-2 justify-content-center">
                    <button type="button" class="btn btn-link p-0 text-warning" onclick="editSVClick(event, this.closest('tr'))" title="Sửa">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button type="button" class="btn btn-link p-0 text-danger" onclick="deleteSVClick(event, this.closest('tr'))" title="Xóa">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </td>
        `;

        Object.assign(selectedRow.dataset, {
            ho: d.Ho,
            ten: d.Ten,
            ngaysinh: d.NgaySinh,
            diachi: d.DiaChi,
            matkhau: d.MatKhau
        });

        if (isNew) {
            newItems[newIdx] = d;
            AppCommon.setChangeState(selectedRow, "new");
        } else {
            updatedItems = updatedItems.filter(x => x.MaSV !== id);
            const hasChanges = isHoChanged || isTenChanged || isNgaySinhChanged || isDiaChiChanged || isMatKhauChanged;
            if (hasChanges) {
                updatedItems.push(d);
                AppCommon.setChangeState(selectedRow, "updated");
            } else {
                AppCommon.setChangeState(selectedRow, null);
            }
        }

        bindRows();
        updateSTT();
        resetStudentForm();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function xoaSV() {
        if (!selectedRow) return;
        deleteSVClick(null, selectedRow);
    }

    async function ghiSV() {
        undoHistoryStack = [];
        redoHistoryStack = [];
        updateUndoRedoButtonStates();

        try {
            for (const d of deletedItems) {
                const res = await fetch(`/LopSinhVien/DeleteStudent?maSV=${d.MaSV}`, { method: "POST" });
                if (!res.ok) {
                    const err = await res.text();
                    window.hienThongBao(`Lỗi khi xóa SV <strong>${d.MaSV}</strong>: ${err}`, "Lỗi");
                    return;
                }
            }

            for (const u of updatedItems) {
                const res = await fetch(`/LopSinhVien/UpdateStudent`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(u)
                });
                if (!res.ok) {
                    const err = await res.text();
                    window.hienThongBao(`Lỗi khi sửa SV <strong>${u.MaSV}</strong>: ${err}`, "Lỗi");
                    return;
                }
            }

            for (const n of newItems) {
                const res = await fetch(`/LopSinhVien/CreateStudent`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(n)
                });
                if (!res.ok) {
                    const err = await res.text();
                    window.hienThongBao(`Lỗi khi thêm SV <strong>${n.MaSV}</strong>: ${err}`, "Lỗi");
                    return;
                }
            }

            window.hienThongBao("Ghi danh sách sinh viên thành công!", "Thành công", () => {
                newItems = [];
                updatedItems = [];
                deletedItems = [];
                loadSinhVien();
            });
        } catch (e) {
            window.hienThongBao("Lỗi kết nối khi lưu: " + e.message, "Lỗi");
        }
    }

    function triggerStudentSearch() {
        searchDebounceTimer = AppCommon.debounce(searchDebounceTimer, executeStudentSearch, 200);
    }

    function executeStudentSearch() {
        const k = dom.txtSearchSV.value.toLowerCase().trim();
        const rows = dom.svTable.querySelectorAll("tr");

        rows.forEach(r => {
            const text = r.innerText.toLowerCase();
            if (text.includes(k)) {
                r.classList.remove("search-hidden");
            } else {
                r.classList.add("search-hidden");
            }
        });

        currentPage = 1;
        updatePagination();
    }

    function validateStudentInputs() {
        const d = getStudentForm();
        const isEditing = dom.txtMaSV.disabled;

        dom.errMaSV.textContent = "";
        dom.errHo.textContent = "";
        dom.errTen.textContent = "";
        dom.errNgaySinh.textContent = "";
        dom.errDiaChi.textContent = "";
        dom.errMatKhau.textContent = "";

        dom.txtMaSV.classList.remove("is-invalid");
        dom.txtHo.classList.remove("is-invalid");
        dom.txtTen.classList.remove("is-invalid");
        dom.txtNgaySinh.classList.remove("is-invalid");
        dom.txtDiaChi.classList.remove("is-invalid");
        dom.txtMatKhau.classList.remove("is-invalid");

        if (!selectedLop) {
            updateStudentButtonStates(
                true, "Vui lòng chọn lớp học trước.",
                true, "Vui lòng chọn lớp học trước."
            );
            return;
        }
        if (isEditing && selectedRow) {
            const hasChanges = (
                d.Ho !== (selectedRow.dataset.ho || "").trim() ||
                d.Ten !== (selectedRow.dataset.ten || "").trim() ||
                d.NgaySinh !== (selectedRow.dataset.ngaysinh || "") ||
                d.DiaChi !== (selectedRow.dataset.diachi || "").trim() ||
                d.MatKhau !== (selectedRow.dataset.matkhau || "")
            );
            if (!hasChanges) {
                updateStudentButtonStates(
                    true, "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)",
                    true, "Vui lòng thay đổi thông tin sinh viên trước khi lưu hiệu chỉnh."
                );
                return;
            }
        }

        let hasClientError = false;
        if (!d.MaSV) {
            hasClientError = true;
        } else if (d.MaSV.length > 8) {
            dom.errMaSV.textContent = "Mã sinh viên tối đa 8 ký tự.";
            dom.txtMaSV.classList.add("is-invalid");
            hasClientError = true;
        }
        if (!d.Ho) {
            hasClientError = true;
        } else if (d.Ho.length > 50) {
            dom.errHo.textContent = "Họ tối đa 50 ký tự.";
            dom.txtHo.classList.add("is-invalid");
            hasClientError = true;
        }
        if (!d.Ten) {
            hasClientError = true;
        } else if (d.Ten.length > 10) {
            dom.errTen.textContent = "Tên tối đa 10 ký tự.";
            dom.txtTen.classList.add("is-invalid");
            hasClientError = true;
        }
        if (!d.NgaySinh) {
            hasClientError = true;
        }
        if (!d.DiaChi) {
            hasClientError = true;
        } else if (d.DiaChi.length > 40) {
            dom.errDiaChi.textContent = "Địa chỉ tối đa 40 ký tự.";
            dom.txtDiaChi.classList.add("is-invalid");
            hasClientError = true;
        }
        if (!d.MatKhau) {
            hasClientError = true;
        } else if (d.MatKhau.length > 20) {
            dom.errMatKhau.textContent = "Mật khẩu tối đa 20 ký tự.";
            dom.txtMatKhau.classList.add("is-invalid");
            hasClientError = true;
        }

        if (hasClientError) {
            const reasonThem = isEditing ? "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)" : "Thông tin sinh viên nhập không hợp lệ.";
            const reasonSua = isEditing ? "Thông tin sinh viên nhập không hợp lệ." : "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh";
            updateStudentButtonStates(true, reasonThem, true, reasonSua);
            return;
        }
        if (!isEditing) {
            const exists = [...dom.svTable.querySelectorAll("tr")].some(r => r.dataset.masv === d.MaSV);
            if (exists) {
                dom.errMaSV.textContent = "Mã SV này đã trùng trong danh sách tạm thời.";
                dom.txtMaSV.classList.add("is-invalid");
                updateStudentButtonStates(
                    true, "Mã SV bị trùng lặp trên danh sách tạm thời.",
                    true, "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh"
                );
                return;
            }
        }

        if (!isEditing) {
            clearTimeout(studentDebounceTimer);
            updateStudentButtonStates(
                true, "Đang kiểm tra trùng lặp từ cơ sở dữ liệu...",
                true, "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh"
            );

            studentDebounceTimer = setTimeout(() => {
                const checkUrl = `/LopSinhVien/CheckStudentDuplicateForCreate?maSV=${encodeURIComponent(d.MaSV)}`;

                fetch(checkUrl)
                    .then(res => {
                        if (!res.ok) throw new Error("Lỗi HTTP");
                        return res.json();
                    })
                    .then(status => {
                        if (status.maSVDuplicate) {
                            dom.txtMaSV.classList.add("is-invalid");
                            dom.errMaSV.textContent = "Mã SV này đã tồn tại trong CSDL.";
                            updateStudentButtonStates(
                                true, "Mã SV đã tồn tại trong CSDL.",
                                true, "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh"
                            );
                        } else {
                            updateStudentButtonStates(false, "", true, "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh");
                        }
                    })
                    .catch(error => {
                        console.error("Lỗi kiểm tra trùng SV:", error);
                        updateStudentButtonStates(false, "", true, "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh");
                    });
            }, 250);
        } else {
            updateStudentButtonStates(true, "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)", false, "");
        }
    }

    function updateStudentButtonStates(disableThem, reasonThem, disableSua, reasonSua) {
        AppCommon.setDisabled(dom.btnThemSV, dom.wrapThemSV, disableThem, reasonThem);
        AppCommon.setDisabled(dom.btnSuaSV, dom.wrapSuaSV, disableSua, reasonSua);
    }

    function updateSaveButtonState() {
        const hasChanges = newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0;
        AppCommon.setDisabled(
            dom.btnGhiSV,
            dom.wrapGhiSV,
            !hasChanges,
            "Không có thay đổi nào cần lưu."
        );
    }

    function updateSaveLopButtonState() {
        const hasChanges = newLops.length > 0 || updatedLops.length > 0 || deletedLops.length > 0;
        AppCommon.setDisabled(
            dom.btnGhiLop,
            dom.wrapGhiLop,
            !hasChanges,
            "Không có thay đổi nào về Lớp cần ghi."
        );
    }

    function updateUndoRedoButtonStates() {
        if (dom.btnUndoSV) {
            dom.btnUndoSV.disabled = undoHistoryStack.length === 0;
        }
        if (dom.btnRedoSV) {
            dom.btnRedoSV.disabled = redoHistoryStack.length === 0;
        }
    }

    function updateUndoRedoLopButtonStates() {
        if (dom.btnUndoLop) {
            dom.btnUndoLop.disabled = historyLopUndo.length === 0;
        }
        if (dom.btnRedoLop) {
            dom.btnRedoLop.disabled = historyLopRedo.length === 0;
        }
    }

    function updateSTT() {
        const rows = Array.from(dom.svTable.querySelectorAll("tr:not(.search-hidden)"));
        const lblCount = AppCommon.byId("lblCount");
        if (lblCount) {
            lblCount.textContent = rows.length;
        }
        updatePagination();
    }

    function updatePagination() {
        currentPage = AppCommon.renderPagination({
            visibleRowSelector: "#svTable tr:not(.search-hidden)",
            allRowSelector: "#svTable tr",
            currentPage,
            rowsPerPage,
            summaryId: "lblPaginationSummary",
            paginationId: "ulPagination"
        });
    }

    function changePage(page) {
        currentPage = page;
        updatePagination();
    }

    function changePageSize(size) {
        rowsPerPage = parseInt(size, 10) || AppCommon.DEFAULT_PAGE_SIZE;
        currentPage = 1;
        updatePagination();
    }

    function updateLopPagination() {
        currentLopPage = AppCommon.renderPagination({
            visibleRowSelector: "#lopList li:not(.search-hidden)",
            allRowSelector: "#lopList li",
            currentPage: currentLopPage,
            rowsPerPage: lopsPerPage,
            summaryId: "lblLopPaginationSummary",
            paginationId: "ulLopPagination",
            compact: true,
            handler: "changeLopPage"
        });
    }

    function changeLopPage(page) {
        currentLopPage = page;
        updateLopPagination();
    }

    function changeLopPageSize(size) {
        lopsPerPage = parseInt(size, 10) || 5;
        currentLopPage = 1;
        updateLopPagination();
    }

    function exportExcel() {
        if (!selectedLop) return;
        const rows = [["Mã SV", "Họ", "Tên", "Ngày sinh", "Địa chỉ", "Mật khẩu"]];
        
        dom.svTable.querySelectorAll("tr").forEach(tr => {
            rows.push([
                tr.dataset.masv,
                tr.dataset.ho,
                tr.dataset.ten,
                tr.dataset.ngaysinh,
                tr.dataset.diachi,
                tr.dataset.matkhau
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SinhVien_" + selectedLop);
        XLSX.writeFile(wb, `SinhVien_${selectedLop}.xlsx`);
    }

    function downloadTemplate() {
        const rows = [
            ["Mã SV", "Họ", "Tên", "Ngày sinh", "Địa chỉ", "Mật khẩu"],
            ["SV001", "Nguyễn Văn", "An", "2005-04-15", "120 Lê Lợi, Đà Nẵng", "password123"],
            ["SV002", "Lê Thị", "Bình", "2005-09-20", "45 Nguyễn Văn Cừ, Huế", "pass456"]
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_SinhVien");
        XLSX.writeFile(wb, "Template_SinhVien.xlsx");
    }

    function openImportModal() {
        if (!selectedLop) {
            window.hienThongBao("Vui lòng chọn một lớp trước khi import.", "Thông báo");
            return;
        }

        AppCommon.showImportModal();
    }

    let currentImportList = [];

    function handleFileSelect(event) {
        AppCommon.readFirstExcelSheet(
            event.target.files[0],
            validateExcelData,
            () => window.showImportFileError("Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file.")
        );
    }

    function validateExcelData(rawData) {
        dom.importFileFeedback.textContent = "";
        dom.tblImportPreview.querySelector("tbody").innerHTML = "";
        dom.importPreviewSection.style.display = "none";
        dom.btnConfirmImport.setAttribute("disabled", "true");
        currentImportList = [];

        const rows = rawData.filter(r => r.some(cell => cell.toString().trim() !== ""));
        if (rows.length === 0) {
            window.showImportFileError("File Excel không có dữ liệu.");
            return;
        }

        const headerRow = rows[0];
        if (headerRow.length < 6) {
            window.showImportFileError("Cấu trúc cột không hợp lệ. File Excel phải có 6 cột: Mã SV, Họ, Tên, Ngày sinh, Địa chỉ, Mật khẩu.");
            return;
        }

        const col1 = AppCommon.normalizeHeader(headerRow[0]);
        const col2 = AppCommon.normalizeHeader(headerRow[1]);
        const col3 = AppCommon.normalizeHeader(headerRow[2]);
        const col4 = AppCommon.normalizeHeader(headerRow[3]);
        const col5 = AppCommon.normalizeHeader(headerRow[4]);
        const col6 = AppCommon.normalizeHeader(headerRow[5]);

        const validCol1 = (col1 === "ma sv" || col1 === "masv");
        const validCol2 = (col2 === "ho");
        const validCol3 = (col3 === "ten");
        const validCol4 = (col4 === "ngay sinh" || col4 === "ngaysinh");
        const validCol5 = (col5 === "dia chi" || col5 === "diachi");
        const validCol6 = (col6 === "mat khau" || col6 === "matkhau");

        if (!validCol1 || !validCol2 || !validCol3 || !validCol4 || !validCol5 || !validCol6) {
            window.showImportFileError("Cấu trúc cột không hợp lệ. Vui lòng tải file mẫu để kiểm tra thứ tự cột.");
            return;
        }

        const dataRows = rows.slice(1);
        if (dataRows.length === 0) {
            window.showImportFileError("Không tìm thấy dòng dữ liệu nào dưới hàng tiêu đề.");
            return;
        }

        const processedRows = [];
        const fileMaSVSet = new Set();

        const currentTableIds = new Set();
        dom.svTable.querySelectorAll("tr").forEach(tr => {
            if (tr.dataset.masv) {
                currentTableIds.add(tr.dataset.masv.trim().toUpperCase());
            }
        });

        dataRows.forEach((row, idx) => {
            const maSV = row[0]?.toString().trim() ?? "";
            const ho = row[1]?.toString().trim() ?? "";
            const ten = row[2]?.toString().trim() ?? "";
            let ngaySinh = row[3]?.toString().trim() ?? "";
            const diaChi = row[4]?.toString().trim() ?? "";
            const matKhau = row[5]?.toString().trim() ?? "";
            const rowNum = idx + 2;

            let error = "";

            if (maSV === "") {
                error = "Mã SV trống";
            } else if (ho === "") {
                error = "Họ trống";
            } else if (ten === "") {
                error = "Tên trống";
            } else if (maSV.length > 8) {
                error = "Mã SV tối đa 8 ký tự";
            } else if (ho.length > 50) {
                error = "Họ tối đa 50 ký tự";
            } else if (ten.length > 10) {
                error = "Tên tối đa 10 ký tự";
            } else if (diaChi.length > 40) {
                error = "Địa chỉ tối đa 40 ký tự";
            } else if (matKhau.length > 20) {
                error = "Mật khẩu tối đa 20 ký tự";
            } else {
                const idUpper = maSV.toUpperCase();

                if (ngaySinh !== "") {
                    if (!isNaN(ngaySinh)) {
                        const excelDate = new Date((parseInt(ngaySinh, 10) - 25569) * 86400 * 1000);
                        ngaySinh = excelDate.toISOString().slice(0, 10);
                    } else {
                        const d = new Date(ngaySinh);
                        if (isNaN(d.getTime())) {
                            error = "Ngày sinh sai định dạng (YYYY-MM-DD)";
                        } else {
                            ngaySinh = d.toISOString().slice(0, 10);
                        }
                    }
                }

                if (error === "") {
                    if (fileMaSVSet.has(idUpper)) {
                        error = "Trùng mã SV trong file";
                    } else if (currentTableIds.has(idUpper)) {
                        error = "Trùng mã SV trên lưới";
                    } else {
                        fileMaSVSet.add(idUpper);
                    }
                }
            }

            processedRows.push({
                index: idx,
                rowNum: rowNum,
                maSV: maSV,
                ho: ho,
                ten: ten,
                ngaySinh: ngaySinh,
                diaChi: diaChi,
                matKhau: matKhau,
                error: error
            });
        });

        const candidates = processedRows.filter(r => r.error === "");
        if (candidates.length === 0) {
            renderPreview(processedRows);
            return;
        }
        fetch('/LopSinhVien/CheckStudentImport', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(candidates.map(c => ({ MaSV: c.maSV })))
        })
        .then(res => {
            if (!res.ok) throw new Error("Không thể kiểm tra trùng lặp từ Server.");
            return res.json();
        })
        .then(dbResults => {
            dbResults.forEach(res => {
                const match = processedRows.find(p => p.index === res.index && p.error === "");
                if (match && res.idDuplicate) {
                    match.error = "Trùng mã SV trong CSDL";
                }
            });
            renderPreview(processedRows);
        })
        .catch(err => {
            window.showImportFileError("Lỗi kết nối Server: " + err.message);
        });
    }

    function renderPreview(processedRows) {
        const tbody = dom.tblImportPreview.querySelector("tbody");
        tbody.innerHTML = "";
        dom.importPreviewSection.style.display = "block";

        let errorCount = 0;
        let successCount = 0;

        processedRows.forEach((row, i) => {
            const tr = document.createElement("tr");
            const stt = i + 1;

            let statusBadge = "";
            if (row.error) {
                statusBadge = `<span class="badge bg-danger"><i class="bi bi-x-circle"></i> ${row.error}</span>`;
                tr.className = "table-danger";
                errorCount++;
            } else {
                statusBadge = `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Hợp lệ</span>`;
                successCount++;
            }

            tr.innerHTML = `
                <td class="text-center">${stt}</td>
                <td><strong>${row.maSV}</strong></td>
                <td>${row.ho} ${row.ten}</td>
                <td>${statusBadge}</td>
            `;
            tbody.appendChild(tr);
        });

        dom.importSummary.textContent = `Tổng: ${processedRows.length} | Hợp lệ: ${successCount} | Lỗi: ${errorCount}`;
        dom.importSummary.className = errorCount > 0 ? "badge bg-danger rounded-pill px-3 py-1.5" : "badge bg-success rounded-pill px-3 py-1.5";

        if (errorCount === 0 && successCount > 0) {
            dom.btnConfirmImport.removeAttribute("disabled");
            currentImportList = processedRows.map(r => ({
                MaSV: r.maSV,
                Ho: r.ho,
                Ten: r.ten,
                NgaySinh: r.ngaySinh,
                DiaChi: r.diaChi,
                MatKhau: r.matKhau
            }));
        } else {
            dom.btnConfirmImport.setAttribute("disabled", "true");
        }
    }

    function confirmImport() {
        if (currentImportList.length === 0) return;

        pushState();

        currentImportList.forEach(item => {
            const row = dom.svTable.insertRow();
            row.dataset.masv = item.MaSV;
            row.dataset.ho = item.Ho;
            row.dataset.ten = item.Ten;
            row.dataset.ngaysinh = item.NgaySinh;
            row.dataset.diachi = item.DiaChi;
            row.dataset.matkhau = item.MatKhau;

            row.innerHTML = `
                <td>${item.MaSV}</td>
                <td>${item.Ho}</td>
                <td>${item.Ten}</td>
                <td>${item.NgaySinh ? new Date(item.NgaySinh).toLocaleDateString('vi-VN') : ""}</td>
                <td>${item.DiaChi}</td>
                <td class="text-center">
                    <div class="d-flex gap-2 justify-content-center">
                        <button type="button" class="btn btn-link p-0 text-warning" onclick="editSVClick(event, this.closest('tr'))" title="Sửa">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button type="button" class="btn btn-link p-0 text-danger" onclick="deleteSVClick(event, this.closest('tr'))" title="Xóa">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </td>
            `;

            newItems.push({
                ...item,
                MaLop: selectedLop
            });
        });

        bindRows();
        updateSTT();

        const importModalEl = AppCommon.byId('importModal');
        const modalBs = bootstrap.Modal.getInstance(importModalEl);
        if (modalBs) modalBs.hide();

        dom.importFile.value = "";
        dom.importPreviewSection.style.display = "none";

        window.hienThongBao(`Đã import thành công <strong>${currentImportList.length}</strong> sinh viên vào danh sách tạm thời. Vui lòng bấm <strong>Ghi</strong> để lưu thay đổi vào CSDL.`, "Thành công");

        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    window.onbeforeunload = function(e) {
        const hasStudentChanges = (newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0);
        const hasClassChanges = (newLops.length > 0 || updatedLops.length > 0 || deletedLops.length > 0);
        if (hasStudentChanges || hasClassChanges) {
            const message = "Bạn có thay đổi chưa được ghi vào cơ sở dữ liệu. Bạn có chắc chắn muốn rời đi?";
            e.returnValue = message;
            return message;
        }
    };

    function editLopClick(event, li) {
        if (event) event.stopPropagation();
        if (AppCommon.isPendingDelete(li)) {
            window.hienThongBao("Lớp này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
            return;
        }
        chonLop(li, () => {
            dom.txtMaLop.value = li.dataset.malop;
            dom.txtTenLop.value = li.dataset.tenlop;
            dom.txtMaLop.disabled = true;
            validateClassInputs();
            dom.txtTenLop.focus();
        });
    }

    function deleteLopClick(event, li) {
        if (event) event.stopPropagation();
        if (AppCommon.isPendingDelete(li)) {
            window.hienThongBao("Lớp này đã được đánh dấu chờ xóa.", "Thông báo");
            return;
        }
        
        const ma = li.dataset.malop;
        const ten = li.dataset.tenlop;
        const newIndex = newLops.findIndex(x => x.MaLop === ma);
        const isNew = newIndex >= 0;

        const performDeleteLop = (message) => {
            window.hienXacNhan(message, () => {
                pushStateLop();

                if (isNew) {
                    newLops = newLops.filter(x => x.MaLop !== ma);
                } else {
                    updatedLops = updatedLops.filter(x => x.MaLop !== ma);
                    if (!deletedLops.some(x => x.MaLop === ma)) {
                        deletedLops.push({ MaLop: ma });
                    }
                }

                if (selectedLop === ma) {
                    selectedLopRow = null;
                    selectedLop = null;
                    dom.currentLop.innerText = "Chưa chọn";
                    dom.svTable.innerHTML = "";
                    dom.btnExport.setAttribute("disabled", "true");
                    dom.btnImport.setAttribute("disabled", "true");
                    
                    resetLopForm();
                }
                
                if (isNew) {
                    li.remove();
                } else {
                    AppCommon.setChangeState(li, "deleted");
                }
                updateSTT();
                locLop();
                updateSaveLopButtonState();
            });
        };

        if (isNew) {
            performDeleteLop(`Bạn có chắc chắn muốn xóa lớp học tạm thời <strong>"${ma} - ${ten}"</strong> không?`);
        } else {
            fetch(`/LopSinhVien/CheckDeleteClass?maLop=${encodeURIComponent(ma)}`)
                .then(res => res.json())
                .then(data => {
                    const msg = data.isSoftDelete
                        ? `Lớp học <strong>"${ma} - ${ten}"</strong> đã có dữ liệu liên kết (Sinh viên hoặc Đăng ký thi). Hệ thống sẽ <strong>XÓA MỀM</strong> (ngừng hoạt động) lớp học này. Bạn có chắc chắn muốn xóa không?`
                        : `Lớp học <strong>"${ma} - ${ten}"</strong> chưa có liên kết. Hệ thống sẽ <strong>XÓA CỨNG</strong> (xóa vĩnh viễn) khỏi cơ sở dữ liệu. Bạn có chắc chắn muốn xóa không?`;
                    performDeleteLop(msg);
                })
                .catch(err => {
                    console.error("Lỗi khi kiểm tra xóa lớp:", err);
                    performDeleteLop(`Bạn có chắc chắn muốn xóa lớp <strong>"${ma} - ${ten}"</strong> và tất cả dữ liệu tạm thời đi kèm không?`);
                });
        }
    }

    function editSVClick(event, tr) {
        if (event) event.stopPropagation();
        if (AppCommon.isPendingDelete(tr)) {
            window.hienThongBao("Dòng này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
            return;
        }
        
        dom.svTable.querySelectorAll("tr").forEach(x => x.classList.remove("table-active"));
        tr.classList.add("table-active");
        selectedRow = tr;
        
        fillStudentForm(tr);
        dom.txtHo.focus();
    }

    function deleteSVClick(event, tr) {
        if (event) event.stopPropagation();
        if (AppCommon.isPendingDelete(tr)) {
            window.hienThongBao("Sinh viên này đã được đánh dấu chờ xóa.", "Thông báo");
            return;
        }

        const id = tr.dataset.masv;
        const name = `${tr.dataset.ho} ${tr.dataset.ten}`;
        const newIdx = newItems.findIndex(x => x.MaSV === id);
        const isNew = newIdx >= 0;

        const performDeleteSV = (message) => {
            window.hienXacNhan(message, () => {
                pushState();

                if (isNew) {
                    newItems = newItems.filter(x => x.MaSV !== id);
                } else {
                    updatedItems = updatedItems.filter(x => x.MaSV !== id);
                    if (!deletedItems.some(x => x.MaSV === id)) {
                        deletedItems.push({ MaSV: id });
                    }
                }

                if (isNew) {
                    tr.remove();
                } else {
                    AppCommon.setChangeState(tr, "deleted");
                }
                if (selectedRow === tr) {
                    resetStudentForm();
                }
                updateSTT();

                updateSaveButtonState();
                updateUndoRedoButtonStates();
            });
        };

        if (isNew) {
            performDeleteSV(`Bạn có chắc chắn muốn xóa sinh viên tạm thời <strong>"${id} - ${name}"</strong> không?`);
        } else {
            fetch(`/LopSinhVien/CheckDeleteStudent?maSV=${encodeURIComponent(id)}`)
                .then(res => res.json())
                .then(data => {
                    const msg = data.isSoftDelete
                        ? `Sinh viên <strong>"${id} - ${name}"</strong> đã có lịch sử thi (Bảng điểm). Hệ thống sẽ <strong>XÓA MỀM</strong> (ngừng hoạt động) tài khoản sinh viên này. Bạn có chắc chắn muốn xóa không?`
                        : `Sinh viên <strong>"${id} - ${name}"</strong> chưa có lịch sử. Hệ thống sẽ <strong>XÓA CỨNG</strong> (xóa vĩnh viễn) khỏi cơ sở dữ liệu. Bạn có chắc chắn muốn xóa không?`;
                    performDeleteSV(msg);
                })
                .catch(err => {
                    console.error("Lỗi khi kiểm tra xóa sinh viên:", err);
                    performDeleteSV(`Bạn có chắc chắn muốn xóa sinh viên <strong>"${id} - ${name}"</strong> không?`);
                });
        }
    }

    // Expose public API
    window.themLop = themLop;
    window.suaLop = suaLop;
    window.clickResetLop = clickResetLop;
    window.undoLop = undoLop;
    window.redoLop = redoLop;
    window.ghiLop = ghiLop;
    window.locLop = locLop;
    window.clearSearchLop = clearSearchLop;
    window.changeLopPageSize = changeLopPageSize;
    window.exportExcel = exportExcel;
    window.openImportModal = openImportModal;
    window.themSV = themSV;
    window.suaSV = suaSV;
    window.resetStudentForm = resetStudentForm;
    window.undoSV = undoSV;
    window.redoSV = redoSV;
    window.ghiSV = ghiSV;
    window.changePageSize = changePageSize;
    window.downloadTemplate = downloadTemplate;
    window.handleFileSelect = handleFileSelect;
    window.confirmImport = confirmImport;
    window.chonLop = chonLop;
    window.editLopClick = editLopClick;
    window.deleteLopClick = deleteLopClick;
    window.editSVClick = editSVClick;
    window.deleteSVClick = deleteSVClick;
    window.changePage = changePage;
    window.changeLopPage = changeLopPage;

})(window, window.AppCommon);
