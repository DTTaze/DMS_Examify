// --- Global State ---
let pendingNewItems = [];
let pendingUpdatedItems = [];
let pendingDeletedItems = [];
let selectedTableRow = null;
let undoHistoryStack = [];
let temporaryIdCounter = -1;

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
};

// --- Event Handlers and Core Actions ---

function triggerSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(executeSearch, 300);
}

function executeSearch() {
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
    resetForm();
    updateSaveButtonState();
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
}

async function saveChangesToDb() {
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

    const previousState = undoHistoryStack.pop();
    document.querySelector("#tbl tbody").innerHTML = previousState.html;
    pendingNewItems = previousState.newItems;
    pendingUpdatedItems = previousState.updatedItems;
    pendingDeletedItems = previousState.deletedItems;

    bindRowEventHandlers();
    selectedTableRow = null;
    updateSaveButtonState();
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
