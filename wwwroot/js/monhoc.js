(function (window, AppCommon) {
    "use strict";

    // State Variables
    let pendingNewItems = [];
    let pendingUpdatedItems = [];
    let pendingDeletedItems = [];
    let selectedTableRow = null;
    let undoHistoryStack = [];
    let redoHistoryStack = [];
    let temporaryIdCounter = -1;
    let currentPage = 1;
    let rowsPerPage = 10;

    let debounceTimer = null;
    let searchDebounceTimer = null;

    // DOM Elements Cache
    const dom = {
        txtMaMH: null,
        txtTenMH: null,
        txtTim: null,
        errMaMH: null,
        errTenMH: null,
        wrapThem: null,
        wrapSua: null,
        wrapGhi: null,
        btnThem: null,
        btnSua: null,
        btnGhi: null,
        btnUndo: null,
        btnRedo: null,
        lblCount: null,
        tbl: null,
        importFile: null,
        importFileFeedback: null,
        importPreviewSection: null,
        tblImportPreview: null,
        btnConfirmImport: null,
        importSummary: null,
        lblPaginationSummary: null,
        ulPagination: null,
        btnClearSearch: null,
        emptyState: null
    };

    AppCommon.onReady(() => {
        // Cache DOM elements
        dom.txtMaMH = AppCommon.byId("txtMaMH");
        dom.txtTenMH = AppCommon.byId("txtTenMH");
        dom.txtTim = AppCommon.byId("txtTim");
        dom.errMaMH = AppCommon.byId("errMaMH");
        dom.errTenMH = AppCommon.byId("errTenMH");
        dom.wrapThem = AppCommon.byId("wrapThem");
        dom.wrapSua = AppCommon.byId("wrapSua");
        dom.wrapGhi = AppCommon.byId("wrapGhi");
        dom.btnThem = AppCommon.byId("btnThem");
        dom.btnSua = AppCommon.byId("btnSua");
        dom.btnGhi = AppCommon.byId("btnGhi");
        dom.btnUndo = AppCommon.byId("btnUndo");
        dom.btnRedo = AppCommon.byId("btnRedo");
        dom.lblCount = AppCommon.byId("lblCount");
        dom.tbl = AppCommon.byId("tbl");
        dom.importFile = AppCommon.byId("importFile");
        dom.importFileFeedback = AppCommon.byId("importFileFeedback");
        dom.importPreviewSection = AppCommon.byId("importPreviewSection");
        dom.tblImportPreview = AppCommon.byId("tblImportPreview");
        dom.btnConfirmImport = AppCommon.byId("btnConfirmImport");
        dom.importSummary = AppCommon.byId("importSummary");
        dom.lblPaginationSummary = AppCommon.byId("lblPaginationSummary");
        dom.ulPagination = AppCommon.byId("ulPagination");
        dom.btnClearSearch = AppCommon.byId("btnClearSearch");
        dom.emptyState = AppCommon.byId("emptyState");

        // Event listeners
        dom.txtMaMH.addEventListener("input", handleSubjectCodeInput);
        dom.txtTenMH.addEventListener("input", validateFormInputs);
        dom.txtTim.addEventListener("input", triggerSearch);

        bindRowEventHandlers();
        validateFormInputs();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
        updatePagination();
    });

    function handleSubjectCodeInput(event) {
        forceUppercaseInput(event.target);
        validateFormInputs();
    }

    function forceUppercaseInput(input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const upperValue = normalizeSubjectCode(input.value);

        if (input.value !== upperValue) {
            input.value = upperValue;
            input.setSelectionRange(start, end);
        }
    }

    function triggerSearch() {
        if (dom.txtTim.value.trim() !== "") {
            dom.btnClearSearch.classList.remove("d-none");
        } else {
            dom.btnClearSearch.classList.add("d-none");
        }
        searchDebounceTimer = AppCommon.debounce(searchDebounceTimer, executeSearch, 300);
    }

    window.clearSearch = function() {
        dom.txtTim.value = "";
        triggerSearch();
        dom.txtTim.focus();
    };

    function executeSearch() {
        undoHistoryStack = [];
        redoHistoryStack = [];
        updateUndoRedoButtonStates();

        const keyword = dom.txtTim.value.trim();
        
        fetch(`/MonHoc/Search?keyword=${encodeURIComponent(keyword)}`)
            .then(response => response.json())
            .then(data => {
                const tbody = dom.tbl.querySelector("tbody");
                tbody.innerHTML = "";

                data.forEach((subject, index) => {
                    const row = tbody.insertRow();
                    row.dataset.id = subject.maMH;
                    row.dataset.mamh = subject.maMH;
                    row.dataset.tenmh = subject.tenMH;
                    row.dataset.originalTenmh = subject.tenMH;

                    const disableDel = subject.hasDependencies ? 'disabled style="pointer-events:none;"' : '';
                    const titleDel = subject.hasDependencies ? 'Không thể xóa vì đã có dữ liệu liên quan' : 'Xóa';
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${subject.maMH}</td>
                        <td>${subject.tenMH}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-link text-warning p-0 me-2 btn-edit" title="Hiệu chỉnh">
                                <i class="bi bi-pencil-square fs-5"></i>
                            </button>
                            <span class="d-inline-block" tabindex="0" title="${titleDel}">
                                <button type="button" class="btn btn-link text-danger p-0 btn-delete" ${disableDel}>
                                    <i class="bi bi-trash fs-5"></i>
                                </button>
                            </span>
                        </td>
                    `;
                });

                dom.lblCount.textContent = data.length;
                if (data.length === 0) {
                    dom.emptyState.classList.remove("d-none");
                    dom.tbl.classList.add("d-none");
                } else {
                    dom.emptyState.classList.add("d-none");
                    dom.tbl.classList.remove("d-none");
                }
                bindRowEventHandlers();
                currentPage = 1;
                updatePagination();
            })
            .catch(error => console.error("Lỗi tìm kiếm:", error));
    }

    function addSubject() {
        const formValues = getFormValues();
        if (formValues.MaMH === "" || formValues.TenMH === "") {
            return;
        }

        pushState();

        const newId = temporaryIdCounter;
        temporaryIdCounter = temporaryIdCounter - 1;

        pendingNewItems.push({ Id: newId, ...formValues });

        const row = dom.tbl.querySelector("tbody").insertRow();
        row.dataset.id = newId;
        row.dataset.mamh = formValues.MaMH;
        row.dataset.tenmh = formValues.TenMH;
        row.dataset.originalTenmh = "";

        row.innerHTML = `
            <td>...</td>
            <td>${formValues.MaMH}</td>
            <td>${formValues.TenMH}</td>
            <td class="text-center">
                <button type="button" class="btn btn-link text-warning p-0 me-2 btn-edit" title="Hiệu chỉnh">
                    <i class="bi bi-pencil-square fs-5"></i>
                </button>
                <button type="button" class="btn btn-link text-danger p-0 btn-delete" title="Xóa">
                    <i class="bi bi-trash fs-5"></i>
                </button>
            </td>
        `;
        AppCommon.setChangeState(row, "new");

        bindRowEventHandlers();
        updateSTT();
        resetForm();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function editSubject() {
        if (selectedTableRow === null) {
            window.hienThongBao("Vui lòng chọn môn học cần sửa trên danh sách.", "Thông báo");
            return;
        }

        const formValues = getFormValues();
        if (formValues.MaMH === "" || formValues.TenMH === "") {
            window.hienThongBao("Vui lòng nhập đầy đủ thông tin Mã và Tên môn học.", "Thông báo");
            return;
        }

        const subjectId = parseInt(selectedTableRow.dataset.id, 10);
        const isNew = !isNaN(subjectId) && subjectId < 0;

        pushState();

        const originalTenMH = selectedTableRow.dataset.originalTenmh !== undefined && selectedTableRow.dataset.originalTenmh !== null
            ? selectedTableRow.dataset.originalTenmh
            : selectedTableRow.dataset.tenmh;

        const isTenMHChanged = formValues.TenMH !== originalTenMH;

        const hasDependencies = selectedTableRow.querySelector('.btn-delete').disabled;
        const disableDel = hasDependencies ? 'disabled style="pointer-events:none;"' : '';
        const titleDel = hasDependencies ? 'Không thể xóa vì đã có dữ liệu liên quan' : 'Xóa';
        selectedTableRow.innerHTML = `
            <td>${isNew ? "..." : (selectedTableRow.dataset.id || "")}</td>
            <td>${formValues.MaMH}</td>
            <td class="${(!isNew && isTenMHChanged) ? 'cell-edited' : ''}">
                ${formValues.TenMH}
                ${(!isNew && isTenMHChanged) ? `<div class="original-val text-muted small mt-1" style="font-size: 0.8rem;">(Gốc: <span class="text-decoration-line-through">${originalTenMH}</span>)</div>` : ''}
            </td>
            <td class="text-center">
                <button type="button" class="btn btn-link text-warning p-0 me-2 btn-edit" title="Hiệu chỉnh">
                    <i class="bi bi-pencil-square fs-5"></i>
                </button>
                <span class="d-inline-block" tabindex="0" title="${titleDel}">
                    <button type="button" class="btn btn-link text-danger p-0 btn-delete" ${disableDel}>
                        <i class="bi bi-trash fs-5"></i>
                    </button>
                </span>
            </td>
        `;

        selectedTableRow.dataset.mamh = formValues.MaMH;
        selectedTableRow.dataset.tenmh = formValues.TenMH;

        if (isNew) {
            const itemIndex = pendingNewItems.findIndex(item => item.Id === subjectId);
            if (itemIndex >= 0) {
                pendingNewItems[itemIndex] = { Id: subjectId, ...formValues };
            }
            AppCommon.setChangeState(selectedTableRow, "new");
        } else {
            pendingUpdatedItems = pendingUpdatedItems.filter(item => item.MaMH !== formValues.MaMH);
            if (isTenMHChanged) {
                pendingUpdatedItems.push(formValues);
                AppCommon.setChangeState(selectedTableRow, "updated");
            } else {
                AppCommon.setChangeState(selectedTableRow, null);
            }
        }

        bindRowEventHandlers();
        updateSTT();
        validateFormInputs();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function deleteSubject() {
        let rowToDelete = selectedTableRow;
        if (rowToDelete === null) {
            const typedMaMH = dom.txtMaMH.value.trim().toUpperCase();
            if (typedMaMH === "") {
                window.hienThongBao("Vui lòng nhập Mã môn học cần xóa.", "Thông báo");
                return;
            }
            
            const rows = dom.tbl.querySelectorAll("tbody tr");
            for (const row of rows) {
                if (row.dataset.mamh.trim().toUpperCase() === typedMaMH) {
                    rowToDelete = row;
                    break;
                }
            }
        }

        if (rowToDelete === null) {
            window.hienThongBao("Không tìm thấy môn học cần xóa trên lưới danh sách.", "Lỗi");
            return;
        }

        const subjectId = parseInt(rowToDelete.dataset.id, 10);
        const subjectCode = rowToDelete.dataset.mamh;

        pushState();

        if (subjectId < 0) {
            pendingNewItems = pendingNewItems.filter(item => item.Id !== subjectId);
        } else {
            pendingUpdatedItems = pendingUpdatedItems.filter(item => item.MaMH !== subjectCode);

            const isAlreadyDeleted = pendingDeletedItems.some(item => item.MaMH === subjectCode);
            if (isAlreadyDeleted === false) {
                pendingDeletedItems.push({ MaMH: subjectCode });
            }
        }

        if (subjectId < 0) {
            rowToDelete.remove();
        } else {
            AppCommon.setChangeState(rowToDelete, "deleted");
        }

        if (selectedTableRow === rowToDelete) {
            selectedTableRow = null;
        }
        
        updateSTT();
        resetForm();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    async function saveChangesToDb() {
        undoHistoryStack = [];
        redoHistoryStack = [];
        updateUndoRedoButtonStates();
        try {
            for (const item of pendingDeletedItems) {
                const response = await fetch(`/MonHoc/Delete?maMH=${item.MaMH}`, { method: "POST" });
                if (response.ok === false) {
                    const errorMsg = await response.text();
                    window.hienThongBao(`Lỗi khi xóa môn <strong>${item.MaMH}</strong>: ${errorMsg}`, "Lỗi");
                    return;
                }
            }

            for (const item of pendingUpdatedItems) {
                const response = await fetch(`/MonHoc/Update`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item)
                });
                if (response.ok === false) {
                    const errorMsg = await response.text();
                    window.hienThongBao(`Lỗi khi cập nhật môn <strong>${item.MaMH}</strong>: ${errorMsg}`, "Lỗi");
                    return;
                }
            }

            for (const item of pendingNewItems) {
                const response = await fetch(`/MonHoc/Insert`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item)
                });
                if (response.ok === false) {
                    const errorMsg = await response.text();
                    window.hienThongBao(`Lỗi khi thêm môn <strong>${item.MaMH}</strong>: ${errorMsg}`, "Lỗi");
                    return;
                }
            }

            window.hienThongBao("Lưu tất cả thay đổi thành công vào cơ sở dữ liệu!", "Thành công", () => {
                location.reload();
            });
        } catch (error) {
            window.hienThongBao(`Lỗi kết nối Server: ${error.message}`, "Lỗi");
        }
    }

    function undoLastAction() {
        if (undoHistoryStack.length === 0) {
            window.hienThongBao("Không có gì để hoàn tác (undo)!", "Thông báo");
            return;
        }

        redoHistoryStack.push({
            html: dom.tbl.querySelector("tbody").innerHTML,
            newItems: AppCommon.cloneJson(pendingNewItems),
            updatedItems: AppCommon.cloneJson(pendingUpdatedItems),
            deletedItems: AppCommon.cloneJson(pendingDeletedItems)
        });

        const previousState = undoHistoryStack.pop();
        dom.tbl.querySelector("tbody").innerHTML = previousState.html;
        pendingNewItems = previousState.newItems;
        pendingUpdatedItems = previousState.updatedItems;
        pendingDeletedItems = previousState.deletedItems;

        bindRowEventHandlers();
        updateSTT();
        selectedTableRow = null;
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function bindRowEventHandlers() {
        dom.tbl.querySelectorAll("tbody tr").forEach(row => {
            row.onclick = (event) => {
                if (AppCommon.isPendingDelete(row)) {
                    return;
                }
                if (event.target.closest('.btn-edit') || event.target.closest('.btn-delete')) {
                    return;
                }
                
                dom.tbl.querySelectorAll("tbody tr")
                    .forEach(r => r.classList.remove("table-active"));

                row.classList.add("table-active");
                selectedTableRow = row;
            };

            const editButton = row.querySelector('.btn-edit');
            if (editButton !== null) {
                editButton.onclick = (event) => {
                    event.stopPropagation();
                    if (AppCommon.isPendingDelete(row)) {
                        window.hienThongBao("Dòng này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
                        return;
                    }
                    
                    dom.tbl.querySelectorAll("tbody tr")
                        .forEach(r => r.classList.remove("table-active"));
                    row.classList.add("table-active");
                    selectedTableRow = row;
                    fillFormWithRowData(row);
                };
            }

            const deleteButton = row.querySelector('.btn-delete');
            if (deleteButton !== null) {
                deleteButton.onclick = (event) => {
                    event.stopPropagation();
                    if (AppCommon.isPendingDelete(row)) {
                        window.hienThongBao("Môn học này đã được đánh dấu chờ xóa.", "Thông báo");
                        return;
                    }
                    
                    const subjectCode = row.dataset.mamh.trim();
                    const subjectName = row.dataset.tenmh.trim();
                    const subjectId = parseInt(row.dataset.id, 10);
                    const isNew = !isNaN(subjectId) && subjectId < 0;

                    const performDeleteAction = (message) => {
                        window.hienXacNhan(message, () => {
                            dom.tbl.querySelectorAll("tbody tr")
                                .forEach(r => r.classList.remove("table-active"));
                            row.classList.add("table-active");
                            selectedTableRow = row;
                            
                            dom.txtMaMH.value = subjectCode;
                            deleteSubject();
                        }, "Xác nhận xóa");
                    };

                    if (isNew) {
                        performDeleteAction(`Bạn có chắc chắn muốn xóa môn học tạm thời <strong>"${subjectCode} - ${subjectName}"</strong> không?`);
                    } else {
                        performDeleteAction(`Bạn có chắc chắn muốn xóa vĩnh viễn môn học <strong>"${subjectCode} - ${subjectName}"</strong> không?`);
                    }
                };
            }
        });
    }

    function fillFormWithRowData(row) {
        dom.txtMaMH.value = row.dataset.mamh.trim();
        dom.txtTenMH.value = row.dataset.tenmh.trim();
        dom.txtMaMH.disabled = true;
        validateFormInputs();
    }

    function resetForm() {
        dom.txtMaMH.value = "";
        dom.txtTenMH.value = "";
        selectedTableRow = null;
        dom.txtMaMH.disabled = false;
        
        dom.txtMaMH.classList.remove("is-invalid");
        dom.txtTenMH.classList.remove("is-invalid");
        dom.errMaMH.textContent = "";
        dom.errTenMH.textContent = "";
        
        validateFormInputs();
    }

    function validateFormInputs() {
        const subjectCode = dom.txtMaMH.value.trim().toUpperCase();
        const subjectName = dom.txtTenMH.value.trim();
        const isEditing = dom.txtMaMH.disabled;
        
        dom.errMaMH.textContent = "";
        dom.errTenMH.textContent = "";
        dom.txtMaMH.classList.remove("is-invalid");
        dom.txtTenMH.classList.remove("is-invalid");

        if (isEditing && selectedTableRow !== null) {
            const originalTenMH = selectedTableRow.dataset.tenmh.trim();
            if (subjectName === originalTenMH) {
                updateActionButtonStates(
                    true, "Không thể thêm môn học mới khi đang ở chế độ hiệu chỉnh (Reset để thêm mới).",
                    true, "Vui lòng thay đổi tên môn học trước khi lưu hiệu chỉnh."
                );
                return;
            }
        }

        let isLocalDuplicate = false;
        let localDuplicateReasonMa = "";
        let localDuplicateReasonTen = "";

        const rows = dom.tbl.querySelectorAll("tbody tr");
        for (const row of rows) {
            if (selectedTableRow !== null && row === selectedTableRow) {
                continue;
            }
            
            const existingMaMH = row.dataset.mamh.trim().toUpperCase();
            const existingTenMH = row.dataset.tenmh.trim().toLowerCase();

            if (AppCommon.isPendingDelete(row)) {
                continue;
            }
            
            if (subjectCode !== "" && existingMaMH === subjectCode) {
                dom.errMaMH.textContent = "Mã môn học này đã tồn tại trên danh sách tạm thời.";
                dom.txtMaMH.classList.add("is-invalid");
                isLocalDuplicate = true;
                localDuplicateReasonMa = "Mã môn học bị trùng lặp trên lưới danh sách tạm thời.";
            }
            if (subjectName !== "" && existingTenMH === subjectName.toLowerCase()) {
                dom.errTenMH.textContent = "Tên môn học này đã tồn tại trên danh sách tạm thời.";
                dom.txtTenMH.classList.add("is-invalid");
                isLocalDuplicate = true;
                localDuplicateReasonTen = "Tên môn học bị trùng lặp trên lưới danh sách tạm thời.";
            }
        }
        
        if (isLocalDuplicate) {
            const reasonThem = isEditing
                ? "Không thể thêm môn học mới khi đang ở chế độ hiệu chỉnh (Reset để thêm mới)."
                : (localDuplicateReasonMa || localDuplicateReasonTen);
                
            const reasonSua = (isEditing === false)
                ? "Vui lòng chọn một dòng môn học trên bảng để hiệu chỉnh."
                : localDuplicateReasonTen;
                
            updateActionButtonStates(true, reasonThem, true, reasonSua);
            return;
        }

        if (subjectCode === "" && subjectName === "") {
            const reasonThem = isEditing
                ? "Không thể thêm môn học mới khi đang ở chế độ hiệu chỉnh (Reset để thêm mới)."
                : "Vui lòng nhập Mã và Tên môn học để thêm.";
            
            const reasonSua = (isEditing === false)
                ? "Vui lòng chọn một dòng môn học trên bảng để hiệu chỉnh."
                : "Tên môn học không được để trống.";
                
            updateActionButtonStates(true, reasonThem, true, reasonSua);
            return;
        }

        clearTimeout(debounceTimer);
        updateActionButtonStates(
            true, "Đang kiểm tra trùng lặp từ cơ sở dữ liệu...",
            true, "Đang kiểm tra trùng lặp từ cơ sở dữ liệu..."
        );
        
        debounceTimer = setTimeout(() => {
            const checkUrl = isEditing
                ? `/MonHoc/CheckDuplicateForUpdate?maMH=${encodeURIComponent(subjectCode)}&tenMH=${encodeURIComponent(subjectName)}`
                : `/MonHoc/CheckDuplicateForCreate?maMH=${encodeURIComponent(subjectCode)}&tenMH=${encodeURIComponent(subjectName)}`;
            
            fetch(checkUrl)
                .then(response => response.json())
                .then(duplicateStatus => {
                    let dbDuplicate = false;
                    let dbReasonMa = "";
                    let dbReasonTen = "";
                    
                    if (isEditing === false && subjectCode !== "" && duplicateStatus.maMHDuplicate) {
                        if (duplicateStatus.maMHActive) {
                            dbDuplicate = true;
                            dom.txtMaMH.classList.add("is-invalid");
                            dom.errMaMH.textContent = "Mã môn học này đã tồn tại trong CSDL.";
                            dbReasonMa = "Mã môn học đã tồn tại trong CSDL.";
                        } else {
                            dom.txtMaMH.classList.add("is-invalid");
                            dom.errMaMH.textContent = "Mã môn học đã bị xóa mềm trước đó. Hệ thống sẽ tự khôi phục khi Ghi.";
                        }
                    }
                    
                    if (subjectName !== "" && duplicateStatus.tenMHDuplicate && duplicateStatus.tenMHActive) {
                        dbDuplicate = true;
                        dom.txtTenMH.classList.add("is-invalid");
                        dom.errTenMH.textContent = "Tên môn học này đã tồn tại trong CSDL.";
                        dbReasonTen = "Tên môn học đã tồn tại trong CSDL.";
                    }
                    
                    const isFormComplete = (subjectCode !== "" && subjectName !== "");
                    
                    let reasonThem = "";
                    if (isEditing) {
                        reasonThem = "Không thể thêm môn học mới khi đang ở chế độ hiệu chỉnh (Reset để thêm mới).";
                    } else if (dbDuplicate) {
                        reasonThem = dbReasonMa || dbReasonTen || "Thông tin nhập bị trùng lặp trong CSDL.";
                    } else if (isFormComplete === false) {
                        reasonThem = "Vui lòng nhập đầy đủ thông tin ở cả hai ô để thực hiện Thêm.";
                    }
                    
                    let reasonSua = "";
                    if (isEditing === false) {
                        reasonSua = "Vui lòng chọn một dòng môn học trên bảng để hiệu chỉnh.";
                    } else if (dbDuplicate) {
                        reasonSua = dbReasonTen || "Tên môn học nhập bị trùng lặp trong CSDL.";
                    } else if (isFormComplete === false) {
                        reasonSua = "Tên môn học không được để trống.";
                    }
                    
                    if (dbDuplicate || isFormComplete === false) {
                        updateActionButtonStates(true, reasonThem, true, reasonSua);
                    } else {
                        if (isEditing) {
                            updateActionButtonStates(true, "Không thể thêm môn học mới khi đang ở chế độ hiệu chỉnh (Reset để thêm mới).", false, "");
                        } else {
                            updateActionButtonStates(false, "", true, "Vui lòng chọn một dòng môn học trên bảng để hiệu chỉnh.");
                        }
                    }
                })
                .catch(error => {
                    console.error("Lỗi kiểm tra trùng từ server:", error);
                    const isFormComplete = (subjectCode !== "" && subjectName !== "");
                    if (isFormComplete) {
                        if (isEditing) {
                            updateActionButtonStates(true, "Không thể thêm môn học mới khi đang ở chế độ hiệu chỉnh (Reset để thêm mới).", false, "");
                        } else {
                            updateActionButtonStates(false, "", true, "Vui lòng chọn một dòng môn học trên bảng để hiệu chỉnh.");
                        }
                    } else {
                        const reasonThem = isEditing ? "Không thể thêm môn học..." : "Vui lòng điền đủ hai ô.";
                        const reasonSua = isEditing ? "Tên không được để trống." : "Chọn một dòng để sửa.";
                        updateActionButtonStates(true, reasonThem, true, reasonSua);
                    }
                });
        }, 250);
    }

    function updateActionButtonStates(disableThem, reasonThem, disableSua, reasonSua) {
        AppCommon.setDisabled(AppCommon.byId("btnThem"), dom.wrapThem, disableThem, reasonThem);
        AppCommon.setDisabled(AppCommon.byId("btnSua"), dom.wrapSua, disableSua, reasonSua);
    }

    function updateSaveButtonState() {
        const hasChanges = pendingNewItems.length > 0 || pendingUpdatedItems.length > 0 || pendingDeletedItems.length > 0;
        AppCommon.setDisabled(
            dom.btnGhi,
            dom.wrapGhi,
            !hasChanges,
            "Không có thay đổi nào cần ghi vào CSDL."
        );
    }

    function updateSTT() {
        const rows = dom.tbl.querySelectorAll("tbody tr");
        rows.forEach((row, index) => {
            const badge = row.cells[0].querySelector(".change-state-badge");
            row.cells[0].innerHTML = index + 1;
            if (badge) {
                row.cells[0].appendChild(badge);
            }
        });
        if (dom.lblCount) {
            dom.lblCount.textContent = rows.length;
        }
        updatePagination();
    }

    function getFormValues() {
        return {
            MaMH: normalizeSubjectCode(dom.txtMaMH.value),
            TenMH: dom.txtTenMH.value.trim()
        };
    }

    function normalizeSubjectCode(value) {
        return String(value ?? "").trim().toUpperCase();
    }

    function pushState() {
        undoHistoryStack.push({
            html: dom.tbl.querySelector("tbody").innerHTML,
            newItems: AppCommon.cloneJson(pendingNewItems),
            updatedItems: AppCommon.cloneJson(pendingUpdatedItems),
            deletedItems: AppCommon.cloneJson(pendingDeletedItems)
        });
        redoHistoryStack = [];
    }

    function updateUndoRedoButtonStates() {
        if (dom.btnUndo) {
            if (undoHistoryStack.length > 0) {
                dom.btnUndo.removeAttribute("disabled");
            } else {
                dom.btnUndo.setAttribute("disabled", "true");
            }
        }
        if (dom.btnRedo) {
            if (redoHistoryStack.length > 0) {
                dom.btnRedo.removeAttribute("disabled");
            } else {
                dom.btnRedo.setAttribute("disabled", "true");
            }
        }
    }

    function redoLastAction() {
        if (redoHistoryStack.length === 0) {
            window.hienThongBao("Không có gì để làm lại (redo)!", "Thông báo");
            return;
        }

        undoHistoryStack.push({
            html: dom.tbl.querySelector("tbody").innerHTML,
            newItems: AppCommon.cloneJson(pendingNewItems),
            updatedItems: AppCommon.cloneJson(pendingUpdatedItems),
            deletedItems: AppCommon.cloneJson(pendingDeletedItems)
        });

        const nextState = redoHistoryStack.pop();
        dom.tbl.querySelector("tbody").innerHTML = nextState.html;
        pendingNewItems = nextState.newItems;
        pendingUpdatedItems = nextState.updatedItems;
        pendingDeletedItems = nextState.deletedItems;

        bindRowEventHandlers();
        updateSTT();
        selectedTableRow = null;
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function exportExcel() {
        const rows = [["Mã môn học", "Tên môn học"]];
        dom.tbl.querySelectorAll("tbody tr").forEach(tr => {
            if (AppCommon.isPendingDelete(tr)) {
                return;
            }
            const mamh = tr.dataset.mamh;
            const tenmh = tr.dataset.tenmh;
            if (mamh && tenmh) {
                rows.push([mamh.trim(), tenmh.trim()]);
            }
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 15 },
            { wch: 30 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Danh sách môn học");
        XLSX.writeFile(wb, "DanhSachMonHoc.xlsx");
    }

    function downloadTemplate() {
        const headers = [["Mã môn học", "Tên môn học"]];
        const sampleData = [
            ["CS101", "Tin học cơ sở"],
            ["MA102", "Toán cao cấp A2"],
            ["PH101", "Vật lý đại cương"]
        ];
        const worksheetData = headers.concat(sampleData);
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        
        ws['!cols'] = [
            { wch: 15 },
            { wch: 30 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_MonHoc");
        XLSX.writeFile(wb, "Template_MonHoc.xlsx");
    }

    function openImportModal() {
        AppCommon.showImportModal();
    }

    let currentImportList = [];
    let currentImportRows = [];
    let importValidationTimer = null;

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
        currentImportRows = [];

        const rows = rawData.filter(r => r.some(cell => cell.toString().trim() !== ""));
        if (rows.length === 0) {
            window.showImportFileError("File Excel không có dữ liệu.");
            return;
        }

        const headerRow = rows[0];
        if (headerRow.length < 2) {
            window.showImportFileError("Cấu trúc cột không hợp lệ. File Excel phải có ít nhất 2 cột: Mã môn học, Tên môn học.");
            return;
        }

        const normalizedHeaders = headerRow.map(header => AppCommon.normalizeHeader(header));
        const subjectCodeColumn = normalizedHeaders.findIndex(isSubjectCodeHeader);
        const subjectNameColumn = normalizedHeaders.findIndex(isSubjectNameHeader);

        if (subjectCodeColumn !== -1 && subjectCodeColumn !== 0) {
            window.showImportFileError("Cột Mã môn học phải đứng ở cột 1 (cột A) trong file Excel.");
            return;
        }

        if (subjectNameColumn !== -1 && subjectNameColumn !== 1) {
            window.showImportFileError("Cột Tên môn học phải đứng ở cột 2 (cột B) trong file Excel.");
            return;
        }

        if (subjectCodeColumn !== 0 || subjectNameColumn !== 1) {
            window.showImportFileError("Cấu trúc cột không hợp lệ. Cột 1 phải là Mã môn học, cột 2 phải là Tên môn học.");
            return;
        }

        const dataRows = rows.slice(1);
        if (dataRows.length === 0) {
            window.showImportFileError("Không tìm thấy dòng dữ liệu nào dưới hàng tiêu đề.");
            return;
        }

        currentImportRows = dataRows.map((row, idx) => ({
            index: idx,
            rowNum: idx + 2,
            maMH: normalizeSubjectCode(row[0]),
            tenMH: row[1]?.toString().trim() ?? "",
            error: ""
        }));

        validateImportPreviewRows();
    }

    function isSubjectCodeHeader(header) {
        return header === "ma mon hoc" || header === "ma mh" || header === "mamh";
    }

    function isSubjectNameHeader(header) {
        return header === "ten mon hoc" || header === "ten mh" || header === "tenmh";
    }

    function validateImportPreviewRows() {
        const processedRows = currentImportRows.map(row => ({ ...row, error: "" }));
        const fileMaMHSet = new Set();
        const fileTenMHSet = new Set();

        const currentTableCodes = new Set();
        const currentTableNames = new Set();
        dom.tbl.querySelectorAll("tbody tr").forEach(tr => {
            const mamh = tr.dataset.mamh;
            const tenmh = tr.dataset.tenmh;
            if (mamh) currentTableCodes.add(mamh.trim().toUpperCase());
            if (tenmh) currentTableNames.add(tenmh.trim().toLowerCase());
        });

        processedRows.forEach(row => {
            const maMH = normalizeSubjectCode(row.maMH);
            const tenMH = row.tenMH.trim();
            let error = "";
            
            if (maMH === "") {
                error = "Mã môn học trống";
            } else if (tenMH === "") {
                error = "Tên môn học trống";
            } else if (maMH.length > 5) {
                error = "Mã môn học tối đa 5 ký tự";
            } else if (tenMH.length > 40) {
                error = "Tên môn học tối đa 40 ký tự";
            } else {
                const codeUpper = maMH.toUpperCase();
                const nameLower = tenMH.toLowerCase();

                if (fileMaMHSet.has(codeUpper)) {
                    error = "Trùng Mã MH trong file";
                } else if (fileTenMHSet.has(nameLower)) {
                    error = "Trùng Tên MH trong file";
                } else if (currentTableCodes.has(codeUpper)) {
                    error = "Trùng Mã MH với danh sách trên lưới";
                } else if (currentTableNames.has(nameLower)) {
                    error = "Trùng Tên MH với danh sách trên lưới";
                } else {
                    fileMaMHSet.add(codeUpper);
                    fileTenMHSet.add(nameLower);
                }
            }

            row.maMH = maMH;
            row.tenMH = tenMH;
            row.error = error;
        });

        currentImportRows = processedRows;
        const candidates = processedRows.filter(r => r.error === "");
        
        if (candidates.length === 0) {
            renderPreview(processedRows);
            return;
        }

        fetch('/MonHoc/CheckImport', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(candidates.map(c => ({ MaMH: c.maMH, TenMH: c.tenMH })))
        })
        .then(response => {
            if (!response.ok) throw new Error("Không thể kiểm tra trùng lặp từ Server.");
            return response.json();
        })
        .then(dbResults => {
            dbResults.forEach(res => {
                const match = candidates[res.index];
                if (match) {
                    if (res.codeDuplicate) {
                        match.error = "Trùng Mã môn học trong CSDL";
                    } else if (res.nameDuplicate) {
                        match.error = "Trùng Tên môn học trong CSDL";
                    }
                }
            });
            currentImportRows = processedRows;
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
                statusBadge = `<span class="badge bg-danger"><i class="bi bi-x-circle"></i> ${AppCommon.escapeHtml(row.error)}</span>`;
                tr.className = "table-danger";
                errorCount++;
            } else {
                statusBadge = `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Hợp lệ</span>`;
                successCount++;
            }

            tr.innerHTML = `
                <td class="text-center">${stt}</td>
                <td>
                    <input type="text"
                           class="form-control form-control-sm import-edit-input import-code-input"
                           value="${AppCommon.escapeHtml(row.maMH)}"
                           maxlength="5"
                           data-import-index="${row.index}"
                           data-import-field="maMH" />
                </td>
                <td>
                    <input type="text"
                           class="form-control form-control-sm import-edit-input"
                           value="${AppCommon.escapeHtml(row.tenMH)}"
                           maxlength="40"
                           data-import-index="${row.index}"
                           data-import-field="tenMH" />
                </td>
                <td>${statusBadge}</td>
            `;
            tbody.appendChild(tr);
        });

        bindImportPreviewInputs();

        dom.importSummary.textContent = `Tổng: ${processedRows.length} | Hợp lệ: ${successCount} | Lỗi: ${errorCount}`;
        dom.importSummary.className = errorCount > 0 ? "badge bg-danger rounded-pill px-3 py-1.5" : "badge bg-success rounded-pill px-3 py-1.5";

        if (errorCount === 0 && successCount > 0) {
            dom.btnConfirmImport.removeAttribute("disabled");
            currentImportList = processedRows.map(r => ({ MaMH: r.maMH, TenMH: r.tenMH }));
        } else {
            dom.btnConfirmImport.setAttribute("disabled", "true");
            currentImportList = [];
        }
    }

    function bindImportPreviewInputs() {
        dom.tblImportPreview.querySelectorAll(".import-edit-input").forEach(input => {
            input.addEventListener("input", event => {
                const target = event.target;
                const rowIndex = Number(target.dataset.importIndex);
                const field = target.dataset.importField;
                const row = currentImportRows.find(item => item.index === rowIndex);

                if (!row) {
                    return;
                }

                if (field === "maMH") {
                    forceUppercaseInput(target);
                    row.maMH = normalizeSubjectCode(target.value);
                } else {
                    row.tenMH = target.value.trim();
                }

                clearTimeout(importValidationTimer);
                importValidationTimer = setTimeout(validateImportPreviewRows, 300);
            });
        });
    }

    function confirmImport() {
        if (currentImportList.length === 0) return;

        pushState();

        const tbody = dom.tbl.querySelector("tbody");
        
        currentImportList.forEach(item => {
            const newId = temporaryIdCounter;
            temporaryIdCounter = temporaryIdCounter - 1;

            pendingNewItems.push({ Id: newId, MaMH: item.MaMH, TenMH: item.TenMH });

            const row = tbody.insertRow();
            row.dataset.id = newId;
            row.dataset.mamh = item.MaMH;
            row.dataset.tenmh = item.TenMH;
            row.dataset.originalTenmh = "";

            row.innerHTML = `
                <td>...</td>
                <td>${item.MaMH}</td>
                <td>${item.TenMH}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-link text-warning p-0 me-2 btn-edit" title="Hiệu chỉnh">
                        <i class="bi bi-pencil-square fs-5"></i>
                    </button>
                    <button type="button" class="btn btn-link text-danger p-0 btn-delete" title="Xóa">
                        <i class="bi bi-trash fs-5"></i>
                    </button>
                </td>
            `;
            AppCommon.setChangeState(row, "new");
        });

        bindRowEventHandlers();
        updateSTT();
        
        const importModalEl = AppCommon.byId('importModal');
        const modalBs = bootstrap.Modal.getInstance(importModalEl);
        if (modalBs) modalBs.hide();

        dom.importFile.value = "";
        dom.importPreviewSection.style.display = "none";

        window.hienThongBao(`Đã import thành công <strong>${currentImportList.length}</strong> môn học vào danh sách tạm thời. Vui lòng bấm <strong>Ghi</strong> để lưu thay đổi vào CSDL.`, "Thành công");

        updateSaveButtonState();
        updateUndoRedoButtonStates();
    }

    function updatePagination() {
        currentPage = AppCommon.renderPagination({
            visibleRowSelector: "#tbl tbody tr",
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



    // Expose public API
    window.addSubject = addSubject;
    window.editSubject = editSubject;
    window.deleteSubject = deleteSubject;
    window.saveChangesToDb = saveChangesToDb;
    window.undoLastAction = undoLastAction;
    window.redoLastAction = redoLastAction;
    window.resetForm = resetForm;
    window.exportExcel = exportExcel;
    window.downloadTemplate = downloadTemplate;
    window.openImportModal = openImportModal;
    window.handleFileSelect = handleFileSelect;
    window.confirmImport = confirmImport;
    window.changePage = changePage;
    window.changePageSize = changePageSize;
    window.changePageSize = changePageSize;

})(window, window.AppCommon);
