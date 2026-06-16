// --- Global State ---
let pendingNewItems = [];
let pendingUpdatedItems = [];
let pendingDeletedItems = [];
let selectedTableRow = null;
let undoHistoryStack = [];
let redoHistoryStack = [];
let temporaryIdCounter = -1;
let currentPage = 1;
let rowsPerPage = 10;

let customModalBs = null;
let debounceTimer = null;
let searchDebounceTimer = null;

// --- Lifecycle and Orchestration ---

window.onload = () => {
    bindRowEventHandlers();
    
    document.getElementById("txtMaMH").addEventListener("input", validateFormInputs);
    document.getElementById("txtTenMH").addEventListener("input", validateFormInputs);
    document.getElementById("txtTim").addEventListener("input", triggerSearch);
    
    validateFormInputs();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
    updatePagination();
};

// --- Event Handlers and Core Actions ---

function triggerSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(executeSearch, 300);
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
    } else {
        pendingUpdatedItems = pendingUpdatedItems.filter(item => item.MaMH !== formValues.MaMH);
        pendingUpdatedItems.push(formValues);
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

    rowToDelete.remove();
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
        newItems: JSON.parse(JSON.stringify(pendingNewItems)),
        updatedItems: JSON.parse(JSON.stringify(pendingUpdatedItems)),
        deletedItems: JSON.parse(JSON.stringify(pendingDeletedItems))
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

// --- Mid-level Routines and Helpers ---

function bindRowEventHandlers() {
    document.querySelectorAll("#tbl tbody tr").forEach(row => {
        row.onclick = (event) => {
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
    const addButton = document.getElementById("btnThem");
    const editButton = document.getElementById("btnSua");
    const addButtonWrapper = document.getElementById("wrapThem");
    const editButtonWrapper = document.getElementById("wrapSua");
    
    if (disableThem) {
        addButton.setAttribute("disabled", "true");
        addButtonWrapper.title = reasonThem || "";
    } else {
        addButton.removeAttribute("disabled");
        addButtonWrapper.removeAttribute("title");
    }
    
    if (disableSua) {
        editButton.setAttribute("disabled", "true");
        editButtonWrapper.title = reasonSua || "";
    } else {
        editButton.removeAttribute("disabled");
        editButtonWrapper.removeAttribute("title");
    }
}

function updateSaveButtonState() {
    const saveButton = document.getElementById("btnGhi");
    const saveButtonWrapper = document.getElementById("wrapGhi");
    const hasChanges = (pendingNewItems.length > 0 || pendingUpdatedItems.length > 0 || pendingDeletedItems.length > 0);
    
    if (hasChanges) {
        saveButton.removeAttribute("disabled");
        saveButtonWrapper.removeAttribute("title");
    } else {
        saveButton.setAttribute("disabled", "true");
        saveButtonWrapper.title = "Không có thay đổi nào cần ghi vào CSDL.";
    }
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
        MaMH: txtMaMH.value.trim(),
        TenMH: txtTenMH.value.trim()
    };
}

function pushState() {
    undoHistoryStack.push({
        html: document.querySelector("#tbl tbody").innerHTML,
        newItems: JSON.parse(JSON.stringify(pendingNewItems)),
        updatedItems: JSON.parse(JSON.stringify(pendingUpdatedItems)),
        deletedItems: JSON.parse(JSON.stringify(pendingDeletedItems))
    });
    redoHistoryStack = [];
}

// --- Custom Dialog System ---

function getCustomModal() {
    if (customModalBs === null) {
        customModalBs = new bootstrap.Modal(document.getElementById('customModal'));
    }
    return customModalBs;
}

function hienThongBao(message, title = "Thông báo", callback = null) {
    const modalEl = document.getElementById('customModal');
    const titleEl = document.getElementById('customModalTitle');
    const msgEl = document.getElementById('customModalMessage');
    const iconEl = document.getElementById('customModalIcon');
    const btnCancel = document.getElementById('btnCustomModalCancel');
    const btnOk = document.getElementById('btnCustomModalOk');

    titleEl.textContent = title;
    msgEl.innerHTML = message;
    
    iconEl.className = "bi fs-4";
    if (title.toLowerCase().includes("lỗi")) {
        iconEl.classList.add("bi-exclamation-octagon-fill", "text-danger");
    } else if (title.toLowerCase().includes("thành công") || title.toLowerCase().includes("ok")) {
        iconEl.classList.add("bi-check-circle-fill", "text-success");
    } else {
        iconEl.classList.add("bi-info-circle-fill", "text-primary");
    }

    btnCancel.style.display = "none";
    btnOk.className = "btn btn-primary btn-sm px-3";
    btnOk.textContent = "Đồng ý";
    
    const newBtnOk = btnOk.cloneNode(true);
    btnOk.parentNode.replaceChild(newBtnOk, btnOk);
    
    const bsModal = getCustomModal();
    
    newBtnOk.onclick = () => {
        bsModal.hide();
    };

    const onHidden = () => {
        modalEl.removeEventListener('hidden.bs.modal', onHidden);
        if (callback) {
            callback();
        }
    };
    modalEl.addEventListener('hidden.bs.modal', onHidden);

    bsModal.show();
}

function hienXacNhan(message, onConfirm, title = "Xác nhận") {
    const modalEl = document.getElementById('customModal');
    const titleEl = document.getElementById('customModalTitle');
    const msgEl = document.getElementById('customModalMessage');
    const iconEl = document.getElementById('customModalIcon');
    const btnCancel = document.getElementById('btnCustomModalCancel');
    const btnOk = document.getElementById('btnCustomModalOk');

    titleEl.textContent = title;
    msgEl.innerHTML = message;
    
    iconEl.className = "bi fs-4 bi-question-circle-fill text-warning";

    btnCancel.style.display = "inline-block";
    btnCancel.textContent = "Hủy";
    btnOk.className = "btn btn-danger btn-sm px-3";
    btnOk.textContent = "Xác nhận";
    
    const newBtnOk = btnOk.cloneNode(true);
    btnOk.parentNode.replaceChild(newBtnOk, btnOk);
    
    const bsModal = getCustomModal();
    
    let isConfirmed = false;
    newBtnOk.onclick = () => {
        isConfirmed = true;
        bsModal.hide();
    };

    const onHidden = () => {
        modalEl.removeEventListener('hidden.bs.modal', onHidden);
        if (isConfirmed && onConfirm) {
            onConfirm();
        }
    };
    modalEl.addEventListener('hidden.bs.modal', onHidden);

    bsModal.show();
}

// --- Excel Import/Export and Undo Helpers ---

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
        newItems: JSON.parse(JSON.stringify(pendingNewItems)),
        updatedItems: JSON.parse(JSON.stringify(pendingUpdatedItems)),
        deletedItems: JSON.parse(JSON.stringify(pendingDeletedItems))
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
    document.getElementById("importFile").value = "";
    document.getElementById("importFileFeedback").textContent = "";
    document.getElementById("importPreviewSection").style.display = "none";
    document.getElementById("btnConfirmImport").setAttribute("disabled", "true");
    
    const modalEl = document.getElementById('importModal');
    const modalBs = new bootstrap.Modal(modalEl);
    modalBs.show();
}

let currentImportList = [];

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            validateExcelData(rawData);
        } catch (err) {
            showImportFileError("Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file.");
            console.error(err);
        }
    };
    reader.readAsArrayBuffer(file);
}

function showImportFileError(msg) {
    document.getElementById("importFileFeedback").textContent = msg;
    document.getElementById("importPreviewSection").style.display = "none";
    document.getElementById("btnConfirmImport").setAttribute("disabled", "true");
}

function normalizeHeader(val) {
    if (!val) return "";
    return val.toString().toLowerCase().trim()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d");
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

    // Filter empty rows
    const rows = rawData.filter(r => r.some(cell => cell.toString().trim() !== ""));
    if (rows.length === 0) {
        showImportFileError("File Excel không có dữ liệu.");
        return;
    }

    // Validate headers
    const headerRow = rows[0];
    if (headerRow.length < 2) {
        showImportFileError("Cấu trúc cột không hợp lệ. File Excel phải có ít nhất 2 cột: Mã môn học, Tên môn học.");
        return;
    }

    const col1 = normalizeHeader(headerRow[0]);
    const col2 = normalizeHeader(headerRow[1]);
    
    const validCol1 = (col1 === "ma mon hoc" || col1 === "ma mh" || col1 === "mamh");
    const validCol2 = (col2 === "ten mon hoc" || col2 === "ten mh" || col2 === "tenmh");

    if (!validCol1 || !validCol2) {
        showImportFileError("Cấu trúc cột không hợp lệ. Cột 1 phải là 'Mã môn học', Cột 2 phải là 'Tên môn học'.");
        return;
    }

    const dataRows = rows.slice(1);
    if (dataRows.length === 0) {
        showImportFileError("Không tìm thấy dòng dữ liệu nào dưới hàng tiêu đề.");
        return;
    }

    let processedRows = [];
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

    dataRows.forEach((row, idx) => {
        const maMH = row[0]?.toString().trim() ?? "";
        const tenMH = row[1]?.toString().trim() ?? "";
        const rowNum = idx + 2;

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

        processedRows.push({
            index: idx,
            rowNum: rowNum,
            maMH: maMH,
            tenMH: tenMH,
            error: error
        });
    });

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
            const match = processedRows.find(p => p.index === res.index && p.error === "");
            if (match) {
                if (res.codeDuplicate) {
                    match.error = "Trùng Mã môn học trong CSDL";
                } else if (res.nameDuplicate) {
                    match.error = "Trùng Tên môn học trong CSDL";
                }
            }
        });
        renderPreview(processedRows);
    })
    .catch(err => {
        showImportFileError("Lỗi kết nối Server: " + err.message);
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
            statusBadge = `<span class="badge bg-danger"><i class="bi bi-x-circle"></i> ${row.error}</span>`;
            tr.className = "table-danger";
            errorCount++;
        } else {
            statusBadge = `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Hợp lệ</span>`;
            successCount++;
        }

        tr.innerHTML = `
            <td class="text-center">${stt}</td>
            <td><strong>${row.maMH}</strong></td>
            <td>${row.tenMH}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });

    summarySpan.textContent = `Tổng: ${processedRows.length} | Hợp lệ: ${successCount} | Lỗi: ${errorCount}`;
    summarySpan.className = errorCount > 0 ? "badge bg-danger rounded-pill px-3 py-1.5" : "badge bg-success rounded-pill px-3 py-1.5";

    if (errorCount === 0 && successCount > 0) {
        confirmBtn.removeAttribute("disabled");
        currentImportList = processedRows.map(r => ({ MaMH: r.maMH, TenMH: r.tenMH }));
    } else {
        confirmBtn.setAttribute("disabled", "true");
    }
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
    const rows = Array.from(document.querySelectorAll("#tbl tbody tr"));
    const totalRows = rows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;

    rows.forEach((row, index) => {
        if (index >= startIdx && index < endIdx) {
            row.classList.remove("d-none");
        } else {
            row.classList.add("d-none");
        }
    });

    const summarySpan = document.getElementById("lblPaginationSummary");
    if (summarySpan) {
        const from = totalRows === 0 ? 0 : startIdx + 1;
        const to = Math.min(endIdx, totalRows);
        summarySpan.textContent = `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRows} dòng`;
    }

    const ulPagination = document.getElementById("ulPagination");
    if (ulPagination) {
        ulPagination.innerHTML = "";

        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<button type="button" class="page-link shadow-none" onclick="changePage(${currentPage - 1})"><i class="bi bi-chevron-left"></i></button>`;
        ulPagination.appendChild(prevLi);

        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement("li");
            pageLi.className = `page-item ${currentPage === i ? 'active' : ''}`;
            pageLi.innerHTML = `<button type="button" class="page-link shadow-none" onclick="changePage(${i})">${i}</button>`;
            ulPagination.appendChild(pageLi);
        }

        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<button type="button" class="page-link shadow-none" onclick="changePage(${currentPage + 1})"><i class="bi bi-chevron-right"></i></button>`;
        ulPagination.appendChild(nextLi);
    }
}

function changePage(page) {
    currentPage = page;
    updatePagination();
}

function changePageSize(size) {
    rowsPerPage = parseInt(size) || 10;
    currentPage = 1;
    updatePagination();
}
