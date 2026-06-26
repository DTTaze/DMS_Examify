(function (window, AppCommon) {
    "use strict";

    let pendingNewItems = [];
    let pendingUpdatedItems = [];
    let pendingDeletedItems = [];
    let undoHistoryStack = [];
    let redoHistoryStack = [];
    let selectedTableRow = null;
    let temporaryIdCounter = -1;
    let currentPage = 1;
    let rowsPerPage = 10;

    const dom = {
        selGiaoVien: null,
        selLop: null,
        selMonHoc: null,
        selTrinhDo: null,
        selLanThi: null,
        txtSoCau: null,
        txtNgayThi: null,
        txtThoiGian: null,
        txtSearch: null,
        lblSoCau: null,
        lblCount: null,
        lblPaginationSummary: null,
        btnThem: null,
        btnSua: null,
        btnXoa: null,
        btnGhi: null,
        btnUndo: null,
        btnRedo: null,
        wrapThem: null,
        wrapSua: null,
        wrapGhi: null,
        tbl: null,
        emptyState: null
    };

    AppCommon.onReady(() => {
        cacheDom();
        bindEvents();
        setTodayAsMinExamDate();
        loadSoCauHoi();
        updateActionButtonStates();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
        updateRowsAfterChange();
    });

    function cacheDom() {
        dom.selGiaoVien = AppCommon.byId("selGiaoVien");
        dom.selLop = AppCommon.byId("selLop");
        dom.selMonHoc = AppCommon.byId("selMonHoc");
        dom.selTrinhDo = AppCommon.byId("selTrinhDoDK");
        dom.selLanThi = AppCommon.byId("selLanThi");
        dom.txtSoCau = AppCommon.byId("txtSoCau");
        dom.txtNgayThi = AppCommon.byId("txtNgayThiDK");
        dom.txtThoiGian = AppCommon.byId("txtThoiGian");
        dom.txtSearch = AppCommon.byId("txtSearchDangKy");
        dom.lblSoCau = AppCommon.byId("lblSoCau");
        dom.lblCount = AppCommon.byId("lblDangKyCount");
        dom.lblPaginationSummary = AppCommon.byId("lblPaginationSummary");
        dom.btnThem = AppCommon.byId("btnDangKy");
        dom.btnSua = AppCommon.byId("btnSuaDK");
        dom.btnXoa = AppCommon.byId("btnXoaDK");
        dom.btnGhi = AppCommon.byId("btnGhiDK");
        dom.btnUndo = AppCommon.byId("btnUndoDK");
        dom.btnRedo = AppCommon.byId("btnRedoDK");
        dom.wrapThem = AppCommon.byId("wrapThemDK");
        dom.wrapSua = AppCommon.byId("wrapSuaDK");
        dom.wrapGhi = AppCommon.byId("wrapGhiDK");
        dom.tbl = AppCommon.byId("tblDangKy");
        dom.emptyState = AppCommon.byId("dangKyEmptyState");
    }

    function bindEvents() {
        [dom.selMonHoc, dom.selTrinhDo].forEach(element => {
            if (element) element.addEventListener("change", loadSoCauHoi);
        });

        [dom.selGiaoVien, dom.selLop, dom.selMonHoc, dom.selTrinhDo, dom.selLanThi, dom.txtSoCau, dom.txtNgayThi, dom.txtThoiGian].forEach(element => {
            if (element) element.addEventListener("input", updateActionButtonStates);
            if (element) element.addEventListener("change", updateActionButtonStates);
        });

        [dom.txtSoCau, dom.txtThoiGian].forEach(input => {
            if (input) {
                input.addEventListener("change", () => {
                    const min = parseInt(input.min, 10);
                    const max = parseInt(input.max, 10);
                    const val = parseInt(input.value, 10);
                    if (!isNaN(val)) {
                        if (!isNaN(min) && val < min) input.value = min;
                        if (!isNaN(max) && val > max) input.value = max;
                    }
                    updateActionButtonStates();
                });
            }
        });

        if (dom.txtSearch) {
            dom.txtSearch.addEventListener("input", () => {
                currentPage = 1;
                updateRowsAfterChange();
            });
        }

        bindRowEventHandlers();
    }

    function setTodayAsMinExamDate() {
        if (!dom.txtNgayThi) return;
        dom.txtNgayThi.min = getTodayIsoDate();
    }

    function loadSoCauHoi() {
        const maMH = getValue(dom.selMonHoc);
        const trinhDo = getValue(dom.selTrinhDo);

        if (!maMH || !trinhDo) {
            dom.lblSoCau.textContent = "0";
            return;
        }

        fetch(`/DangKyThi/GetSoCauHoi?maMH=${encodeURIComponent(maMH)}&trinhDo=${encodeURIComponent(trinhDo)}`)
            .then(response => response.json())
            .then(result => {
                dom.lblSoCau.textContent = result.success ? result.soCau : "0";
            })
            .catch(() => {
                dom.lblSoCau.textContent = "0";
            });
    }

    function addDangKy() {
        const formValues = getFormValues();
        if (!validateFormValues(formValues)) return;
        if (hasDuplicateKey(formValues)) {
            window.hienThongBao("Lịch thi này đã có trong danh sách.", "Thông báo");
            return;
        }

        pushState();

        const newId = temporaryIdCounter;
        temporaryIdCounter -= 1;
        const item = { Id: newId, ...formValues };
        pendingNewItems.push(item);

        const row = createDangKyRow(item);
        dom.tbl.querySelector("tbody").appendChild(row);
        AppCommon.setChangeState(row, "new");

        selectedTableRow = null;
        resetDangKyForm();
        updateRowsAfterChange();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function editDangKy() {
        if (!selectedTableRow) {
            window.hienThongBao("Vui lòng chọn lịch thi cần sửa trên danh sách.", "Thông báo");
            return;
        }

        const formValues = getFormValues();
        if (!validateFormValues(formValues)) return;

        pushState();

        const rowId = selectedTableRow.dataset.id;
        const isNew = Number(rowId) < 0;
        const originalData = getOriginalData(selectedTableRow);
        const changed = hasChanged(formValues, originalData);

        updateDangKyRow(selectedTableRow, { Id: rowId, ...formValues });

        if (isNew) {
            pendingNewItems = pendingNewItems.map(item => String(item.Id) === String(rowId) ? { Id: Number(rowId), ...formValues } : item);
            AppCommon.setChangeState(selectedTableRow, "new");
        } else {
            const key = getRowKey(selectedTableRow);
            pendingUpdatedItems = pendingUpdatedItems.filter(item => getItemKey(item) !== key);
            if (changed) {
                pendingUpdatedItems.push(formValues);
                AppCommon.setChangeState(selectedTableRow, "updated");
            } else {
                AppCommon.setChangeState(selectedTableRow, null);
            }
        }

        bindRowEventHandlers();
        updateRowsAfterChange();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function deleteDangKy(row) {
        const targetRow = row || selectedTableRow;
        if (!targetRow) {
            window.hienThongBao("Vui lòng chọn lịch thi cần xóa trên danh sách.", "Thông báo");
            return;
        }

        const title = targetRow.dataset.title || getRowKey(targetRow);
        window.hienXacNhan(`Bạn có chắc chắn muốn xóa cứng lịch thi <strong>${AppCommon.escapeHtml(title)}</strong> không?`, () => {
            pushState();

            const rowId = Number(targetRow.dataset.id);
            const key = getRowKey(targetRow);

            if (rowId < 0) {
                pendingNewItems = pendingNewItems.filter(item => Number(item.Id) !== rowId);
                targetRow.remove();
            } else {
                pendingUpdatedItems = pendingUpdatedItems.filter(item => getItemKey(item) !== key);
                if (!pendingDeletedItems.some(item => getItemKey(item) === key)) {
                    pendingDeletedItems.push(getDeleteModel(targetRow));
                }
                AppCommon.setChangeState(targetRow, "deleted");
            }

            if (selectedTableRow === targetRow) {
                selectedTableRow = null;
                resetDangKyForm();
            } else {
                updateRowsAfterChange();
                updateSaveButtonState();
                updateUndoRedoButtonStates();
            }
        }, "Xác nhận xóa");
    }

    async function saveDangKyChanges() {
        if (!hasPendingChanges()) return;

        try {
            for (const item of pendingDeletedItems) {
                const result = await postJson("/DangKyThi/Xoa", item);
                if (!result.success) {
                    window.hienThongBao(`Lỗi khi xóa lịch thi: ${AppCommon.escapeHtml(result.message)}`, "Lỗi");
                    return;
                }
            }

            for (const item of pendingUpdatedItems) {
                const result = await postJson("/DangKyThi/CapNhat", item);
                if (!result.success) {
                    window.hienThongBao(`Lỗi khi cập nhật lịch thi: ${AppCommon.escapeHtml(result.message)}`, "Lỗi");
                    return;
                }
            }

            for (const item of pendingNewItems) {
                const result = await postJson("/DangKyThi/DangKy", item);
                if (!result.success) {
                    window.hienThongBao(`Lỗi khi thêm lịch thi: ${AppCommon.escapeHtml(result.message)}`, "Lỗi");
                    return;
                }
            }

            window.hienThongBao("Lưu tất cả thay đổi đăng ký thi thành công!", "Thành công", () => {
                location.reload();
            });
        } catch (error) {
            window.hienThongBao(`Lỗi kết nối Server: ${AppCommon.escapeHtml(error.message)}`, "Lỗi");
        }
    }

    function undoDangKy() {
        if (undoHistoryStack.length === 0) {
            window.hienThongBao("Không có thao tác nào để hoàn tác.", "Thông báo");
            return;
        }

        redoHistoryStack.push(getCurrentState());
        restoreState(undoHistoryStack.pop());
    }

    function redoDangKy() {
        if (redoHistoryStack.length === 0) {
            window.hienThongBao("Không có thao tác nào để làm lại.", "Thông báo");
            return;
        }

        undoHistoryStack.push(getCurrentState());
        restoreState(redoHistoryStack.pop());
    }

    function resetDangKyForm() {
        selectedTableRow = null;
        dom.tbl.querySelectorAll("tbody tr").forEach(row => row.classList.remove("table-active"));

        if (dom.selGiaoVien) dom.selGiaoVien.selectedIndex = 0;
        dom.selLop.selectedIndex = 0;
        dom.selMonHoc.selectedIndex = 0;
        dom.selTrinhDo.selectedIndex = 0;
        dom.selLanThi.value = "1";
        dom.txtSoCau.value = "20";
        dom.txtNgayThi.value = "";
        dom.txtThoiGian.value = "45";

        setKeyInputsDisabled(false);
        loadSoCauHoi();
        updateActionButtonStates();
    }

    function fillFormWithRow(row) {
        if (row.dataset.dathi === "true" || AppCommon.isPendingDelete(row)) return;

        selectedTableRow = row;
        dom.tbl.querySelectorAll("tbody tr").forEach(item => item.classList.remove("table-active"));
        row.classList.add("table-active");

        if (dom.selGiaoVien) dom.selGiaoVien.value = row.dataset.magv;
        dom.selLop.value = row.dataset.malop;
        dom.selMonHoc.value = row.dataset.mamh;
        dom.selTrinhDo.value = row.dataset.trinhdo;
        dom.selLanThi.value = row.dataset.lan;
        dom.txtSoCau.value = row.dataset.socau;
        dom.txtNgayThi.value = row.dataset.ngaythi;
        dom.txtThoiGian.value = row.dataset.thoigian;

        setKeyInputsDisabled(true);
        loadSoCauHoi();
        updateActionButtonStates();
    }

    function bindRowEventHandlers() {
        dom.tbl.querySelectorAll("tbody tr").forEach(row => {
            // Remove click behavior on the row itself

            const editButton = row.querySelector(".btn-edit");
            if (editButton) {
                editButton.onclick = event => {
                    event.stopPropagation();
                    if (row.dataset.dathi === "true") {
                        window.hienThongBao("Lịch thi này đã có bài thi, không thể chỉnh sửa.", "Thông báo");
                        return;
                    }
                    if (AppCommon.isPendingDelete(row)) {
                        window.hienThongBao("Dòng này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
                        return;
                    }
                    fillFormWithRow(row);
                };
            }

            const deleteButton = row.querySelector(".btn-delete");
            if (deleteButton) {
                deleteButton.onclick = event => {
                    event.stopPropagation();
                    if (row.dataset.dathi === "true") {
                        window.hienThongBao("Lịch thi này đã có bài thi, không thể xóa.", "Thông báo");
                        return;
                    }
                    if (AppCommon.isPendingDelete(row)) {
                        window.hienThongBao("Lịch thi này đã được đánh dấu chờ xóa.", "Thông báo");
                        return;
                    }
                    deleteDangKy(row);
                };
            }
        });
    }

    function createDangKyRow(item) {
        const row = document.createElement("tr");
        updateDangKyRow(row, item);
        return row;
    }

    function updateDangKyRow(row, item) {
        const maGV = normalize(item.MaGV);
        const maLop = normalize(item.MaLop);
        const maMH = normalize(item.MaMH);
        const trinhDo = normalize(item.TrinhDo);
        const lan = Number(item.Lan);
        const soCau = Number(item.SoCauThi);
        const thoiGian = Number(item.ThoiGian);
        const ngayThi = normalize(item.NgayThi);
        const isPGV = Boolean(dom.selGiaoVien);
        const giaoVienText = getSelectedText(dom.selGiaoVien, maGV);
        const lopText = getSelectedText(dom.selLop, maLop);
        const monHocText = getSelectedText(dom.selMonHoc, maMH);
        const trinhDoText = getSelectedText(dom.selTrinhDo, trinhDo);
        const title = `${maLop} - ${monHocText} - lần ${lan}`;

        row.dataset.id = item.Id ?? getItemKey(item);
        row.dataset.magv = maGV;
        row.dataset.malop = maLop;
        row.dataset.mamh = maMH;
        row.dataset.trinhdo = trinhDo;
        row.dataset.lan = String(lan);
        row.dataset.socau = String(soCau);
        row.dataset.ngaythi = ngayThi;
        row.dataset.thoigian = String(thoiGian);
        row.dataset.dathi = "false";
        row.dataset.title = title;
        ensureOriginalData(row);

        row.innerHTML = `
            ${isPGV ? `<td>${AppCommon.escapeHtml(giaoVienText)}</td>` : ""}
            <td><strong>${AppCommon.escapeHtml(maLop)}</strong> <small class="text-muted">${AppCommon.escapeHtml(stripCodePrefix(lopText, maLop))}</small></td>
            <td>${AppCommon.escapeHtml(stripCodePrefix(monHocText, maMH))}</td>
            <td><span class="badge ${getLevelBadgeClass(trinhDo)}">${AppCommon.escapeHtml(trinhDoText || trinhDo)}</span></td>
            <td>${lan}</td>
            <td>${soCau}</td>
            <td>${formatDateDisplay(ngayThi)}</td>
            <td>${thoiGian}</td>
            <td><span class="badge bg-success rounded-pill">Chưa thi</span></td>
            <td class="text-center">
                <button type="button" class="btn btn-link text-warning p-0 me-2 btn-edit" title="Hiệu chỉnh">
                    <i class="bi bi-pencil-square fs-5"></i>
                </button>
                <button type="button" class="btn btn-link text-danger p-0 btn-delete" title="Xóa cứng">
                    <i class="bi bi-trash fs-5"></i>
                </button>
            </td>
        `;
    }

    function ensureOriginalData(row) {
        row.dataset.originalMagv ??= row.dataset.magv;
        row.dataset.originalMalop ??= row.dataset.malop;
        row.dataset.originalMamh ??= row.dataset.mamh;
        row.dataset.originalTrinhdo ??= row.dataset.trinhdo;
        row.dataset.originalLan ??= row.dataset.lan;
        row.dataset.originalSocau ??= row.dataset.socau;
        row.dataset.originalNgaythi ??= row.dataset.ngaythi;
        row.dataset.originalThoigian ??= row.dataset.thoigian;
    }

    function getOriginalData(row) {
        return {
            MaGV: row.dataset.originalMagv || row.dataset.magv,
            MaLop: row.dataset.originalMalop || row.dataset.malop,
            MaMH: row.dataset.originalMamh || row.dataset.mamh,
            TrinhDo: row.dataset.originalTrinhdo || row.dataset.trinhdo,
            Lan: Number(row.dataset.originalLan || row.dataset.lan),
            SoCauThi: Number(row.dataset.originalSocau || row.dataset.socau),
            NgayThi: row.dataset.originalNgaythi || row.dataset.ngaythi,
            ThoiGian: Number(row.dataset.originalThoigian || row.dataset.thoigian)
        };
    }

    function getFormValues() {
        return {
            MaGV: dom.selGiaoVien ? getValue(dom.selGiaoVien) : null,
            MaLop: getValue(dom.selLop),
            MaMH: getValue(dom.selMonHoc),
            TrinhDo: getValue(dom.selTrinhDo),
            Lan: Number(getValue(dom.selLanThi)),
            SoCauThi: Number(dom.txtSoCau.value),
            NgayThi: dom.txtNgayThi.value,
            ThoiGian: Number(dom.txtThoiGian.value)
        };
    }

    function hasRegisteredFirstTime(maLop, maMH) {
        const normLop = normalize(maLop);
        const normMH = normalize(maMH);
        if (!normLop || !normMH) return false;
        return AppCommon.queryAll("tbody tr", dom.tbl).some(row => {
            if (AppCommon.isPendingDelete(row)) return false;
            return normalize(row.dataset.malop) === normLop &&
                   normalize(row.dataset.mamh) === normMH &&
                   Number(row.dataset.lan) === 1;
        });
    }

    function validateFormValues(values) {
        if (dom.selGiaoVien && !values.MaGV) {
            window.hienThongBao("Vui lòng chọn giáo viên.", "Thông báo");
            return false;
        }
        if (!values.MaLop || !values.MaMH || !values.TrinhDo) {
            window.hienThongBao("Vui lòng chọn đầy đủ lớp, môn học và trình độ.", "Thông báo");
            return false;
        }
        if (Number(values.Lan) === 2 && !hasRegisteredFirstTime(values.MaLop, values.MaMH)) {
            window.hienThongBao("Không thể đăng ký thi lần 2 nếu chưa đăng ký thi lần 1.", "Thông báo");
            return false;
        }
        if (!values.NgayThi) {
            window.hienThongBao("Vui lòng chọn ngày thi.", "Thông báo");
            return false;
        }
        if (values.NgayThi < getTodayIsoDate() && !selectedTableRow) {
            window.hienThongBao("Ngày thi không được ở trong quá khứ.", "Thông báo");
            return false;
        }
        if (!Number.isInteger(values.SoCauThi) || values.SoCauThi < 10 || values.SoCauThi > 100) {
            window.hienThongBao("Số câu thi phải từ 10 đến 100.", "Thông báo");
            return false;
        }
        if (!Number.isInteger(values.ThoiGian) || values.ThoiGian < 5 || values.ThoiGian > 60) {
            window.hienThongBao("Thời gian thi phải từ 5 đến 60 phút.", "Thông báo");
            return false;
        }
        return true;
    }

    function hasDuplicateKey(values) {
        const key = getItemKey(values);
        return AppCommon.queryAll("tbody tr", dom.tbl).some(row => {
            if (AppCommon.isPendingDelete(row)) return false;
            if (selectedTableRow && row === selectedTableRow) return false;
            return getRowKey(row) === key;
        });
    }

    function hasChanged(values, original) {
        const hasTeacherChanged = dom.selGiaoVien
            ? normalize(values.MaGV) !== normalize(original.MaGV)
            : false;

        return hasTeacherChanged
            || normalize(values.TrinhDo) !== normalize(original.TrinhDo)
            || Number(values.SoCauThi) !== Number(original.SoCauThi)
            || normalize(values.NgayThi) !== normalize(original.NgayThi)
            || Number(values.ThoiGian) !== Number(original.ThoiGian);
    }

    function updateActionButtonStates() {
        const formValues = getFormValues();
        const hasRequiredTeacher = !dom.selGiaoVien || Boolean(formValues.MaGV);
        const isComplete = Boolean(hasRequiredTeacher && formValues.MaLop && formValues.MaMH && formValues.TrinhDo && formValues.NgayThi && formValues.SoCauThi >= 10 && formValues.SoCauThi <= 100 && formValues.ThoiGian >= 5 && formValues.ThoiGian <= 60);
        
        let disableThem = !isComplete || Boolean(selectedTableRow);
        let reasonThem = selectedTableRow ? "Reset để thêm lịch thi mới." : "Vui lòng nhập đủ thông tin.";

        if (!disableThem && Number(formValues.Lan) === 2) {
            if (!hasRegisteredFirstTime(formValues.MaLop, formValues.MaMH)) {
                disableThem = true;
                reasonThem = "Không thể đăng ký thi lần 2 nếu chưa đăng ký thi lần 1.";
            }
        } else if (!selectedTableRow && isComplete === false) {
            const isBasicInfoEntered = Boolean(hasRequiredTeacher && formValues.MaLop && formValues.MaMH && formValues.TrinhDo && formValues.NgayThi);
            if (isBasicInfoEntered) {
                if (formValues.SoCauThi < 10 || formValues.SoCauThi > 100) {
                    reasonThem = "Số câu thi phải từ 10 đến 100.";
                } else if (formValues.ThoiGian < 5 || formValues.ThoiGian > 60) {
                    reasonThem = "Thời gian thi phải từ 5 đến 60 phút.";
                }
            }
        }

        let disableSua = !isComplete || !selectedTableRow;
        let reasonSua = !selectedTableRow ? "Vui lòng chọn một lịch thi chưa thi để sửa." : "Vui lòng nhập đủ thông tin.";

        if (selectedTableRow && isComplete === false) {
            if (formValues.SoCauThi < 10 || formValues.SoCauThi > 100) {
                reasonSua = "Số câu thi phải từ 10 đến 100.";
            } else if (formValues.ThoiGian < 5 || formValues.ThoiGian > 60) {
                reasonSua = "Thời gian thi phải từ 5 đến 60 phút.";
            }
        }

        AppCommon.setDisabled(dom.btnThem, dom.wrapThem, disableThem, reasonThem);
        AppCommon.setDisabled(dom.btnSua, dom.wrapSua, disableSua, reasonSua);
        if (dom.btnXoa) {
            dom.btnXoa.disabled = !selectedTableRow;
        }
    }

    function updateSaveButtonState() {
        AppCommon.setDisabled(dom.btnGhi, dom.wrapGhi, !hasPendingChanges(), "Không có thay đổi nào cần ghi vào CSDL.");
    }

    function updateUndoRedoButtonStates() {
        if (dom.btnUndo) dom.btnUndo.disabled = undoHistoryStack.length === 0;
        if (dom.btnRedo) dom.btnRedo.disabled = redoHistoryStack.length === 0;
    }

    function updateRowsAfterChange() {
        applySearchFilter();
        updateCount();
        updatePagination();
        bindRowEventHandlers();
    }

    function applySearchFilter() {
        const keyword = normalize(dom.txtSearch?.value).toLowerCase();
        AppCommon.queryAll("tbody tr", dom.tbl).forEach(row => {
            const isMatch = !keyword || row.textContent.toLowerCase().includes(keyword);
            row.classList.toggle("search-hidden", !isMatch);
        });
    }

    function updateCount() {
        const visibleRows = AppCommon.queryAll("tbody tr:not(.search-hidden)", dom.tbl).length;
        const totalRows = AppCommon.queryAll("tbody tr", dom.tbl).length;
        dom.lblCount.textContent = `${visibleRows} lịch`;
        if (dom.emptyState) dom.emptyState.classList.toggle("d-none", visibleRows !== 0);
        if (dom.lblPaginationSummary && totalRows === 0) {
            dom.lblPaginationSummary.textContent = "Hiển thị từ 0 đến 0 trong tổng số 0 dòng";
        }
    }

    function updatePagination() {
        currentPage = AppCommon.renderPagination({
            visibleRowSelector: "#tblDangKy tbody tr:not(.search-hidden)",
            allRowSelector: "#tblDangKy tbody tr",
            currentPage,
            rowsPerPage,
            summaryId: "lblPaginationSummary",
            paginationId: "ulPagination",
            handler: "changeDangKyPage"
        });
    }

    function changeDangKyPage(page) {
        currentPage = page;
        updatePagination();
    }

    function changeDangKyPageSize(size) {
        rowsPerPage = Number(size) || AppCommon.DEFAULT_PAGE_SIZE;
        currentPage = 1;
        updatePagination();
    }

    function pushState() {
        undoHistoryStack.push(getCurrentState());
        redoHistoryStack = [];
    }

    function getCurrentState() {
        return {
            html: dom.tbl.querySelector("tbody").innerHTML,
            newItems: AppCommon.cloneJson(pendingNewItems),
            updatedItems: AppCommon.cloneJson(pendingUpdatedItems),
            deletedItems: AppCommon.cloneJson(pendingDeletedItems)
        };
    }

    function restoreState(state) {
        dom.tbl.querySelector("tbody").innerHTML = state.html;
        pendingNewItems = state.newItems;
        pendingUpdatedItems = state.updatedItems;
        pendingDeletedItems = state.deletedItems;
        selectedTableRow = null;
        setKeyInputsDisabled(false);
        bindRowEventHandlers();
        updateRowsAfterChange();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
        updateActionButtonStates();
    }

    async function postJson(url, data) {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return response.json();
    }

    function getDeleteModel(row) {
        return {
            MaMH: row.dataset.mamh,
            MaLop: row.dataset.malop,
            Lan: Number(row.dataset.lan)
        };
    }

    function getRowKey(row) {
        return [row.dataset.malop, row.dataset.mamh, row.dataset.lan].map(normalize).join("|");
    }

    function getItemKey(item) {
        return [item.MaLop, item.MaMH, item.Lan].map(normalize).join("|");
    }

    function hasPendingChanges() {
        return pendingNewItems.length > 0 || pendingUpdatedItems.length > 0 || pendingDeletedItems.length > 0;
    }

    function setKeyInputsDisabled(disabled) {
        dom.selLop.disabled = disabled;
        dom.selMonHoc.disabled = disabled;
        dom.selLanThi.disabled = disabled;
    }

    function getLevelBadgeClass(level) {
        if (level === "A") return "badge-level-a";
        if (level === "B") return "badge-level-b";
        return "badge-level-c";
    }

    function formatDateDisplay(value) {
        if (!value) return "";
        const [year, month, day] = value.split("-");
        return `${day}/${month}/${year}`;
    }

    function getTodayIsoDate() {
        return new Date().toISOString().split("T")[0];
    }

    function getValue(element) {
        return normalize(element?.value);
    }

    function normalize(value) {
        return String(value ?? "").trim();
    }

    function getSelectedText(select, value) {
        if (!select) return "";
        const option = Array.from(select.options).find(item => item.value === value);
        return option ? option.text.trim() : value;
    }

    function stripCodePrefix(text, code) {
        const value = normalize(text);
        const prefix = `${code} - `;
        return value.startsWith(prefix) ? value.slice(prefix.length) : value;
    }

    window.addDangKy = addDangKy;
    window.editDangKy = editDangKy;
    window.deleteDangKy = deleteDangKy;
    window.saveDangKyChanges = saveDangKyChanges;
    window.undoDangKy = undoDangKy;
    window.redoDangKy = redoDangKy;
    window.resetDangKyForm = resetDangKyForm;
    window.changeDangKyPage = changeDangKyPage;
    window.changeDangKyPageSize = changeDangKyPageSize;
})(window, window.AppCommon);
