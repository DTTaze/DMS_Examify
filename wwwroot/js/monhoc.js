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


AppCommon.onReady(() => {
    bindRowEventHandlers();

    AppCommon.byId("txtMaMH").addEventListener("input", handleSubjectCodeInput);
    AppCommon.byId("txtTenMH").addEventListener("input", validateFormInputs);
    AppCommon.byId("txtTim").addEventListener("input", triggerSearch);

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
    searchDebounceTimer = AppCommon.debounce(searchDebounceTimer, executeSearch, 300);
}

function executeSearch() {
    undoHistoryStack = [];
    redoHistoryStack = [];
    updateUndoRedoButtonStates();

    const keyword = document.getElementById("txtTim").value.trim();
    
    fetch(`/MonHoc/Search?keyword=${encodeURIComponent(keyword)}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("#tbl tbody");
            tbody.innerHTML = "";

            data.forEach((subject, index) => {
                const row = tbody.insertRow();
                row.dataset.id = subject.maMH;
                row.dataset.mamh = subject.maMH;
                row.dataset.tenmh = subject.tenMH;

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${subject.maMH}</td>
                    <td>${subject.tenMH}</td>
                    <td class="text-center">
                        <button type="button" class="btn btn-link text-warning p-0 me-2 btn-edit" title="Hiệu chỉnh">
                            <i class="bi bi-pencil-square fs-5"></i>
                        </button>
                        <button type="button" class="btn btn-link text-danger p-0 btn-delete" title="Xóa">
                            <i class="bi bi-trash fs-5"></i>
                        </button>
                    </td>
                `;
            });

            document.getElementById("lblCount").textContent = data.length;
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

    const row = document.querySelector("#tbl tbody").insertRow();
    row.dataset.id = newId;
    row.dataset.mamh = formValues.MaMH;
    row.dataset.tenmh = formValues.TenMH;

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
        hienThongBao("Vui lòng chọn môn học cần sửa trên danh sách.", "Thông báo");
        return;
    }

    const formValues = getFormValues();
    if (formValues.MaMH === "" || formValues.TenMH === "") {
        hienThongBao("Vui lòng nhập đầy đủ thông tin Mã và Tên môn học.", "Thông báo");
        return;
    }

    const subjectId = parseInt(selectedTableRow.dataset.id);

    pushState();

    selectedTableRow.innerHTML = `
        <td>${subjectId > 0 ? subjectId : "..."}</td>
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

    selectedTableRow.dataset.mamh = formValues.MaMH;
    selectedTableRow.dataset.tenmh = formValues.TenMH;

    if (subjectId < 0) {
        const itemIndex = pendingNewItems.findIndex(item => item.Id === subjectId);
        if (itemIndex >= 0) {
            pendingNewItems[itemIndex] = { Id: subjectId, ...formValues };
        }
        AppCommon.setChangeState(selectedTableRow, "new");
    } else {
        pendingUpdatedItems = pendingUpdatedItems.filter(item => item.MaMH !== formValues.MaMH);
        pendingUpdatedItems.push(formValues);
        AppCommon.setChangeState(selectedTableRow, "updated");
    }

    validateFormInputs();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
}

function deleteSubject() {
    let rowToDelete = selectedTableRow;
    if (rowToDelete === null) {
        const typedMaMH = txtMaMH.value.trim().toUpperCase();
        if (typedMaMH === "") {
            hienThongBao("Vui lòng nhập Mã môn học cần xóa.", "Thông báo");
            return;
        }
        
        const rows = document.querySelectorAll("#tbl tbody tr");
        for (const row of rows) {
            if (row.dataset.mamh.trim().toUpperCase() === typedMaMH) {
                rowToDelete = row;
                break;
            }
        }
    }

    if (rowToDelete === null) {
        hienThongBao("Không tìm thấy môn học cần xóa trên lưới danh sách.", "Lỗi");
        return;
    }

    const subjectId = parseInt(rowToDelete.dataset.id);
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
                hienThongBao(`Lỗi khi xóa môn <strong>${item.MaMH}</strong>: ${errorMsg}`, "Lỗi");
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
                hienThongBao(`Lỗi khi cập nhật môn <strong>${item.MaMH}</strong>: ${errorMsg}`, "Lỗi");
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
                hienThongBao(`Lỗi khi thêm môn <strong>${item.MaMH}</strong>: ${errorMsg}`, "Lỗi");
                return;
            }
        }

        hienThongBao("Lưu tất cả thay đổi thành công vào cơ sở dữ liệu!", "Thành công", () => {
            location.reload();
        });
    } catch (error) {
        hienThongBao(`Lỗi kết nối Server: ${error.message}`, "Lỗi");
    }
}

function undoLastAction() {
    if (undoHistoryStack.length === 0) {
        hienThongBao("Không có gì để hoàn tác (undo)!", "Thông báo");
        return;
    }

    redoHistoryStack.push({
        html: document.querySelector("#tbl tbody").innerHTML,
        newItems: AppCommon.cloneJson(pendingNewItems),
        updatedItems: AppCommon.cloneJson(pendingUpdatedItems),
        deletedItems: AppCommon.cloneJson(pendingDeletedItems)
    });

    const previousState = undoHistoryStack.pop();
    document.querySelector("#tbl tbody").innerHTML = previousState.html;
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
    document.querySelectorAll("#tbl tbody tr").forEach(row => {
        row.onclick = (event) => {
            if (AppCommon.isPendingDelete(row)) {
                return;
            }
            if (event.target.closest('.btn-edit') || event.target.closest('.btn-delete')) {
                return;
            }
            
            document.querySelectorAll("#tbl tbody tr")
                .forEach(r => r.classList.remove("table-active"));

            row.classList.add("table-active");
            selectedTableRow = row;
        };

        const editButton = row.querySelector('.btn-edit');
        if (editButton !== null) {
            editButton.onclick = (event) => {
                event.stopPropagation();
                if (AppCommon.isPendingDelete(row)) {
                    hienThongBao("Dòng này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
                    return;
                }
                
                document.querySelectorAll("#tbl tbody tr")
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
                    hienThongBao("Môn học này đã được đánh dấu chờ xóa.", "Thông báo");
                    return;
                }
                
                const subjectCode = row.dataset.mamh.trim();
                const subjectName = row.dataset.tenmh.trim();
                
                hienXacNhan(`Bạn có chắc chắn muốn xóa môn học <strong>"${subjectCode} - ${subjectName}"</strong> không?`, () => {
                    document.querySelectorAll("#tbl tbody tr")
                        .forEach(r => r.classList.remove("table-active"));
                    row.classList.add("table-active");
                    selectedTableRow = row;
                    
                    txtMaMH.value = subjectCode;
                    deleteSubject();
                }, "Xác nhận xóa");
            };
        }
    });
}

function fillFormWithRowData(row) {
    txtMaMH.value = row.dataset.mamh.trim();
    txtTenMH.value = row.dataset.tenmh.trim();
    txtMaMH.disabled = true;
    validateFormInputs();
}

function resetForm() {
    txtMaMH.value = "";
    txtTenMH.value = "";
    selectedTableRow = null;
    txtMaMH.disabled = false;
    
    txtMaMH.classList.remove("is-invalid");
    txtTenMH.classList.remove("is-invalid");
    document.getElementById("errMaMH").textContent = "";
    document.getElementById("errTenMH").textContent = "";
    
    validateFormInputs();
}

function validateFormInputs() {
    const subjectCode = txtMaMH.value.trim().toUpperCase();
    const subjectName = txtTenMH.value.trim();
    const isEditing = txtMaMH.disabled;
    
    document.getElementById("errMaMH").textContent = "";
    document.getElementById("errTenMH").textContent = "";
    txtMaMH.classList.remove("is-invalid");
    txtTenMH.classList.remove("is-invalid");

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

    const rows = document.querySelectorAll("#tbl tbody tr");
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
            document.getElementById("errMaMH").textContent = "Mã môn học này đã tồn tại trên danh sách tạm thời.";
            txtMaMH.classList.add("is-invalid");
            isLocalDuplicate = true;
            localDuplicateReasonMa = "Mã môn học bị trùng lặp trên lưới danh sách tạm thời.";
        }
        if (subjectName !== "" && existingTenMH === subjectName.toLowerCase()) {
            document.getElementById("errTenMH").textContent = "Tên môn học này đã tồn tại trên danh sách tạm thời.";
            txtTenMH.classList.add("is-invalid");
            isLocalDuplicate = true;
            localDuplicateReasonTen = "Tên môn học bị trùng lặp trên lưới danh sách tạm thời.";
        }
    }
    
    if (isLocalDuplicate) {
        let reasonThem = isEditing
            ? "Không thể thêm môn học mới khi đang ở chế độ hiệu chỉnh (Reset để thêm mới)."
            : (localDuplicateReasonMa || localDuplicateReasonTen);
            
        let reasonSua = (isEditing === false)
            ? "Vui lòng chọn một dòng môn học trên bảng để hiệu chỉnh."
            : localDuplicateReasonTen;
            
        updateActionButtonStates(true, reasonThem, true, reasonSua);
        return;
    }

    if (subjectCode === "" && subjectName === "") {
        let reasonThem = isEditing
            ? "Không thể thêm môn học mới khi đang ở chế độ hiệu chỉnh (Reset để thêm mới)."
            : "Vui lòng nhập Mã và Tên môn học để thêm.";
        
        let reasonSua = (isEditing === false)
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
        const checkUrl = `/MonHoc/CheckDuplicate?maMH=${encodeURIComponent(subjectCode)}&tenMH=${encodeURIComponent(subjectName)}&isEditing=${isEditing}`;
        
        fetch(checkUrl)
            .then(response => response.json())
            .then(duplicateStatus => {
                let dbDuplicate = false;
                let dbReasonMa = "";
                let dbReasonTen = "";
                
                if (isEditing === false && subjectCode !== "" && duplicateStatus.maMHDuplicate) {
                    if (duplicateStatus.maMHActive) {
                        dbDuplicate = true;
                        txtMaMH.classList.add("is-invalid");
                        document.getElementById("errMaMH").textContent = "Mã môn học này đã tồn tại trong CSDL.";
                        dbReasonMa = "Mã môn học đã tồn tại trong CSDL.";
                    } else {
                        txtMaMH.classList.add("is-invalid");
                        document.getElementById("errMaMH").textContent = "Mã môn học đã bị xóa mềm trước đó. Hệ thống sẽ tự khôi phục khi Ghi.";
                    }
                }
                
                if (subjectName !== "" && duplicateStatus.tenMHDuplicate && duplicateStatus.tenMHActive) {
                    dbDuplicate = true;
                    txtTenMH.classList.add("is-invalid");
                    document.getElementById("errTenMH").textContent = "Tên môn học này đã tồn tại trong CSDL.";
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
                    let reasonThem = isEditing ? "Không thể thêm môn học..." : "Vui lòng điền đủ hai ô.";
                    let reasonSua = isEditing ? "Tên không được để trống." : "Chọn một dòng để sửa.";
                    updateActionButtonStates(true, reasonThem, true, reasonSua);
                }
            });
    }, 250);
}

function updateActionButtonStates(disableThem, reasonThem, disableSua, reasonSua) {
    AppCommon.setDisabled(AppCommon.byId("btnThem"), AppCommon.byId("wrapThem"), disableThem, reasonThem);
    AppCommon.setDisabled(AppCommon.byId("btnSua"), AppCommon.byId("wrapSua"), disableSua, reasonSua);
}

function updateSaveButtonState() {
    const hasChanges = pendingNewItems.length > 0 || pendingUpdatedItems.length > 0 || pendingDeletedItems.length > 0;
    AppCommon.setDisabled(
        AppCommon.byId("btnGhi"),
        AppCommon.byId("wrapGhi"),
        !hasChanges,
        "Không có thay đổi nào cần ghi vào CSDL."
    );
}

function updateSTT() {
    const rows = document.querySelectorAll("#tbl tbody tr");
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
    const lblCount = document.getElementById("lblCount");
    if (lblCount) {
        lblCount.textContent = rows.length;
    }
    updatePagination();
}

function getFormValues() {
    return {
        MaMH: normalizeSubjectCode(txtMaMH.value),
        TenMH: txtTenMH.value.trim()
    };
}

function normalizeSubjectCode(value) {
    return String(value ?? "").trim().toUpperCase();
}

function pushState() {
    undoHistoryStack.push({
        html: document.querySelector("#tbl tbody").innerHTML,
        newItems: AppCommon.cloneJson(pendingNewItems),
        updatedItems: AppCommon.cloneJson(pendingUpdatedItems),
        deletedItems: AppCommon.cloneJson(pendingDeletedItems)
    });
    redoHistoryStack = [];
}




function updateUndoRedoButtonStates() {
    const btnUndo = document.getElementById("btnUndo");
    const btnRedo = document.getElementById("btnRedo");
    if (btnUndo) {
        if (undoHistoryStack.length > 0) {
            btnUndo.removeAttribute("disabled");
        } else {
            btnUndo.setAttribute("disabled", "true");
        }
    }
    if (btnRedo) {
        if (redoHistoryStack.length > 0) {
            btnRedo.removeAttribute("disabled");
        } else {
            btnRedo.setAttribute("disabled", "true");
        }
    }
}

function redoLastAction() {
    if (redoHistoryStack.length === 0) {
        hienThongBao("Không có gì để làm lại (redo)!", "Thông báo");
        return;
    }

    undoHistoryStack.push({
        html: document.querySelector("#tbl tbody").innerHTML,
        newItems: AppCommon.cloneJson(pendingNewItems),
        updatedItems: AppCommon.cloneJson(pendingUpdatedItems),
        deletedItems: AppCommon.cloneJson(pendingDeletedItems)
    });

    const nextState = redoHistoryStack.pop();
    document.querySelector("#tbl tbody").innerHTML = nextState.html;
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
    document.querySelectorAll("#tbl tbody tr").forEach(tr => {
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
        () => showImportFileError("Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file.")
    );
}

function validateExcelData(rawData) {
    const feedback = document.getElementById("importFileFeedback");
    const previewSection = document.getElementById("importPreviewSection");
    const tbody = document.querySelector("#tblImportPreview tbody");
    const confirmBtn = document.getElementById("btnConfirmImport");
    
    feedback.textContent = "";
    tbody.innerHTML = "";
    previewSection.style.display = "none";
    confirmBtn.setAttribute("disabled", "true");
    currentImportList = [];
    currentImportRows = [];

    const rows = rawData.filter(r => r.some(cell => cell.toString().trim() !== ""));
    if (rows.length === 0) {
        showImportFileError("File Excel khong co du lieu.");
        return;
    }

    const headerRow = rows[0];
    if (headerRow.length < 2) {
        showImportFileError("Cau truc cot khong hop le. File Excel phai co it nhat 2 cot: Ma mon hoc, Ten mon hoc.");
        return;
    }

    const normalizedHeaders = headerRow.map(header => normalizeHeader(header));
    const subjectCodeColumn = normalizedHeaders.findIndex(isSubjectCodeHeader);
    const subjectNameColumn = normalizedHeaders.findIndex(isSubjectNameHeader);

    if (subjectCodeColumn !== -1 && subjectCodeColumn !== 0) {
        showImportFileError("Cot Ma mon hoc phai dung o cot 1 (cot A) trong file Excel.");
        return;
    }

    if (subjectNameColumn !== -1 && subjectNameColumn !== 1) {
        showImportFileError("Cot Ten mon hoc phai dung o cot 2 (cot B) trong file Excel.");
        return;
    }

    if (subjectCodeColumn !== 0 || subjectNameColumn !== 1) {
        showImportFileError("Cau truc cot khong hop le. Cot 1 phai la Ma mon hoc, cot 2 phai la Ten mon hoc.");
        return;
    }

    const dataRows = rows.slice(1);
    if (dataRows.length === 0) {
        showImportFileError("Khong tim thay dong du lieu nao duoi hang tieu de.");
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
    let processedRows = currentImportRows.map(row => ({ ...row, error: "" }));
    let fileMaMHSet = new Set();
    let fileTenMHSet = new Set();

    const currentTableCodes = new Set();
    const currentTableNames = new Set();
    document.querySelectorAll("#tbl tbody tr").forEach(tr => {
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
            error = "Ma mon hoc trong";
        } else if (tenMH === "") {
            error = "Ten mon hoc trong";
        } else if (maMH.length > 5) {
            error = "Ma mon hoc toi da 5 ky tu";
        } else if (tenMH.length > 40) {
            error = "Ten mon hoc toi da 40 ky tu";
        } else {
            const codeUpper = maMH.toUpperCase();
            const nameLower = tenMH.toLowerCase();

            if (fileMaMHSet.has(codeUpper)) {
                error = "Trung Ma MH trong file";
            } else if (fileTenMHSet.has(nameLower)) {
                error = "Trung Ten MH trong file";
            } else if (currentTableCodes.has(codeUpper)) {
                error = "Trung Ma MH voi danh sach tren luoi";
            } else if (currentTableNames.has(nameLower)) {
                error = "Trung Ten MH voi danh sach tren luoi";
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
        if (!response.ok) throw new Error("Khong the kiem tra trung lap tu Server.");
        return response.json();
    })
    .then(dbResults => {
        dbResults.forEach(res => {
            const match = candidates[res.index];
            if (match) {
                if (res.codeDuplicate) {
                    match.error = "Trung Ma mon hoc trong CSDL";
                } else if (res.nameDuplicate) {
                    match.error = "Trung Ten mon hoc trong CSDL";
                }
            }
        });
        currentImportRows = processedRows;
        renderPreview(processedRows);
    })
    .catch(err => {
        showImportFileError("Loi ket noi Server: " + err.message);
    });
}
function renderPreview(processedRows) {
    const tbody = document.querySelector("#tblImportPreview tbody");
    const previewSection = document.getElementById("importPreviewSection");
    const confirmBtn = document.getElementById("btnConfirmImport");
    const summarySpan = document.getElementById("importSummary");

    tbody.innerHTML = "";
    previewSection.style.display = "block";
    
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
            statusBadge = `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Hop le</span>`;
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

    summarySpan.textContent = `Tong: ${processedRows.length} | Hop le: ${successCount} | Loi: ${errorCount}`;
    summarySpan.className = errorCount > 0 ? "badge bg-danger rounded-pill px-3 py-1.5" : "badge bg-success rounded-pill px-3 py-1.5";

    if (errorCount === 0 && successCount > 0) {
        confirmBtn.removeAttribute("disabled");
        currentImportList = processedRows.map(r => ({ MaMH: r.maMH, TenMH: r.tenMH }));
    } else {
        confirmBtn.setAttribute("disabled", "true");
        currentImportList = [];
    }
}

function bindImportPreviewInputs() {
    document.querySelectorAll("#tblImportPreview .import-edit-input").forEach(input => {
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

    const tbody = document.querySelector("#tbl tbody");
    
    currentImportList.forEach(item => {
        const newId = temporaryIdCounter;
        temporaryIdCounter = temporaryIdCounter - 1;

        pendingNewItems.push({ Id: newId, MaMH: item.MaMH, TenMH: item.TenMH });

        const row = tbody.insertRow();
        row.dataset.id = newId;
        row.dataset.mamh = item.MaMH;
        row.dataset.tenmh = item.TenMH;

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
    
    const importModalEl = document.getElementById('importModal');
    const modalBs = bootstrap.Modal.getInstance(importModalEl);
    if (modalBs) modalBs.hide();

    document.getElementById("importFile").value = "";
    document.getElementById("importPreviewSection").style.display = "none";

    hienThongBao(`Đã import thành công <strong>${currentImportList.length}</strong> môn học vào danh sách tạm thời. Vui lòng bấm <strong>Ghi</strong> để lưu thay đổi vào CSDL.`, "Thành công");

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

