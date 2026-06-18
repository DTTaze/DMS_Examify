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
let classDebounceTimer = null;
let studentDebounceTimer = null;

AppCommon.onReady(() => {
    bindLopRows();
    bindRows();

    ["txtMaSV", "txtHo", "txtTen", "txtDiaChi", "txtMatKhau"]
        .forEach(id => AppCommon.byId(id).addEventListener("input", validateStudentInputs));
    AppCommon.byId("txtNgaySinh").addEventListener("input", validateStudentInputs);
    AppCommon.byId("txtNgaySinh").addEventListener("change", validateStudentInputs);

    ["txtMaLop", "txtTenLop"]
        .forEach(id => AppCommon.byId(id).addEventListener("input", validateClassInputs));

    const txtSearchSV = AppCommon.byId("txtSearchSV");
    if (txtSearchSV) {
        txtSearchSV.addEventListener("input", triggerStudentSearch);
    }

    validateClassInputs();
    validateStudentInputs();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
    updateUndoRedoLopButtonStates();
    updateSaveLopButtonState();
});


function locLop() {
    const keyword = document.getElementById("txtSearchLop").value.toLowerCase().trim();
    const items = document.querySelectorAll("#lopList li");
    const btnClear = document.getElementById("btnClearSearchLop");
    const emptyState = document.getElementById("lopEmptyState");

    if (keyword) {
        btnClear.classList.remove("d-none");
    } else {
        btnClear.classList.add("d-none");
    }

    let visibleCount = 0;
    items.forEach(li => {
        const ma = (li.dataset.malop || "").toLowerCase();
        const ten = (li.dataset.tenlop || "").toLowerCase();
        
        if (ma.includes(keyword) || ten.includes(keyword)) {
            li.classList.remove("d-none");
            visibleCount++;
        } else {
            li.classList.add("d-none");
        }
    });

    document.getElementById("lblLopCount").innerText = `Hiển thị ${visibleCount}/${items.length} lớp`;

    if (visibleCount === 0 && items.length > 0) {
        emptyState.classList.remove("d-none");
    } else {
        emptyState.classList.add("d-none");
    }
}

function clearSearchLop() {
    const input = document.getElementById("txtSearchLop");
    input.value = "";
    locLop();
    input.focus();
}

function bindLopRows() {
    document.querySelectorAll("#lopList li").forEach(li => {
        li.onclick = () => chonLop(li);
    });
}

function pushStateLop() {
    historyLopUndo.push({
        html: document.getElementById("lopList").innerHTML,
        newLops: AppCommon.cloneJson(newLops),
        updatedLops: AppCommon.cloneJson(updatedLops),
        deletedLops: AppCommon.cloneJson(deletedLops)
    });
    historyLopRedo = [];
    updateUndoRedoLopButtonStates();
}

function chonLop(el, callback) {
    if (AppCommon.isPendingDelete(el)) {
        hienThongBao("Lớp này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
        return;
    }

    if (el.classList.contains("active")) {
        if (callback) callback();
        return;
    }

    const hasStudentChanges = (newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0);
    if (hasStudentChanges) {
        hienXacNhan("Bạn có thay đổi chưa lưu ở danh sách sinh viên lớp hiện tại. Việc chuyển lớp sẽ làm mất các thay đổi này. Bạn có chắc chắn muốn tiếp tục?", () => {
            executeChonLop(el);
            if (callback) callback();
        });
    } else {
        executeChonLop(el);
        if (callback) callback();
    }
}

function executeChonLop(el) {
    document.querySelectorAll("#lopList li").forEach(x => x.classList.remove("active"));
    el.classList.add("active");

    selectedLopRow = el;
    selectedLop = el.dataset.malop;

    clearLopInputs();

    document.getElementById("currentLop").innerText = el.dataset.tenlop;    newItems = [];
    updatedItems = [];
    deletedItems = [];
    undoHistoryStack = [];
    redoHistoryStack = [];
    selectedRow = null;
    resetStudentForm();    document.getElementById("btnExport").removeAttribute("disabled");
    document.getElementById("btnImport").removeAttribute("disabled");

    loadSinhVien();
    validateClassInputs();
}

function themLop() {
    const ma = document.getElementById("txtMaLop").value.trim().toUpperCase();
    const ten = document.getElementById("txtTenLop").value.trim();

    if (!ma || !ten) {
        hienThongBao("Vui lòng nhập đầy đủ Mã và Tên lớp.", "Thông báo");
        return;
    }    const exists = [...document.querySelectorAll("#lopList li")].some(li => li.dataset.malop === ma);
    if (exists) {
        hienThongBao("Mã lớp này đã tồn tại trong danh sách.", "Thông báo");
        return;
    }

    pushStateLop();
    newLops.push({ MaLop: ma, TenLop: ten });

    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action border-light";
    li.dataset.malop = ma;
    li.dataset.tenlop = ten;
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

    document.getElementById("lopList").appendChild(li);
    resetLopForm();
    locLop();
    updateSaveLopButtonState();
}

function suaLop() {
    if (!selectedLopRow) {
        hienThongBao("Vui lòng chọn một lớp trong danh sách để hiệu chỉnh.", "Thông báo");
        return;
    }

    const oldMa = selectedLopRow.dataset.malop;
    const ten = document.getElementById("txtTenLop").value.trim();

    if (!ten) {
        hienThongBao("Tên lớp không được để trống.", "Thông báo");
        return;
    }

    pushStateLop();
    selectedLopRow.dataset.tenlop = ten;
    selectedLopRow.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <span class="fw-semibold text-dark">${ten}</span>
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
        updatedLops.push({ MaLop: oldMa, TenLop: ten });
        AppCommon.setChangeState(selectedLopRow, "updated");
    }

    document.getElementById("currentLop").innerText = ten;
    locLop();
    validateClassInputs();
    updateSaveLopButtonState();
}

function xoaLop() {
    if (!selectedLopRow) {
        hienThongBao("Vui lòng chọn lớp cần xóa.", "Thông báo");
        return;
    }
    deleteLopClick(null, selectedLopRow);
}

function undoLop() {
    if (historyLopUndo.length === 0) return;

    historyLopRedo.push({
        html: document.getElementById("lopList").innerHTML,
        newLops: AppCommon.cloneJson(newLops),
        updatedLops: AppCommon.cloneJson(updatedLops),
        deletedLops: AppCommon.cloneJson(deletedLops)
    });

    const previousState = historyLopUndo.pop();
    document.getElementById("lopList").innerHTML = previousState.html;
    newLops = previousState.newLops;
    updatedLops = previousState.updatedLops;
    deletedLops = previousState.deletedLops;

    bindLopRows();
    selectedLopRow = null;
    selectedLop = null;
    document.getElementById("currentLop").innerText = "Chưa chọn";
    document.getElementById("svTable").innerHTML = "";
    resetLopForm();
    updateSTT();
    locLop();
    updateUndoRedoLopButtonStates();
    updateSaveLopButtonState();
}

function redoLop() {
    if (historyLopRedo.length === 0) return;

    historyLopUndo.push({
        html: document.getElementById("lopList").innerHTML,
        newLops: AppCommon.cloneJson(newLops),
        updatedLops: AppCommon.cloneJson(updatedLops),
        deletedLops: AppCommon.cloneJson(deletedLops)
    });

    const nextState = historyLopRedo.pop();
    document.getElementById("lopList").innerHTML = nextState.html;
    newLops = nextState.newLops;
    updatedLops = nextState.updatedLops;
    deletedLops = nextState.deletedLops;

    bindLopRows();
    selectedLopRow = null;
    selectedLop = null;
    document.getElementById("currentLop").innerText = "Chưa chọn";
    document.getElementById("svTable").innerHTML = "";
    resetLopForm();
    updateSTT();
    locLop();
    updateUndoRedoLopButtonStates();
    updateSaveLopButtonState();
}

async function ghiLop() {
    if (deletedLops.length === 0 && updatedLops.length === 0 && newLops.length === 0) {
        hienThongBao("Không có thay đổi nào về Lớp cần ghi.", "Thông báo");
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
                hienThongBao(`Lỗi khi xóa lớp <strong>${d.MaLop}</strong>: ${err}`, "Lỗi");
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
                hienThongBao(`Lỗi khi sửa lớp <strong>${u.MaLop}</strong>: ${err}`, "Lỗi");
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
                hienThongBao(`Lỗi khi thêm lớp <strong>${n.MaLop}</strong>: ${err}`, "Lỗi");
                return;
            }
        }

        hienThongBao("Ghi danh mục Lớp thành công!", "Thành công", () => {
            newLops = [];
            updatedLops = [];
            deletedLops = [];
            location.reload();
        });
    } catch (e) {
        hienThongBao("Lỗi kết nối khi lưu Lớp: " + e.message, "Lỗi");
    }
}

function clickResetLop() {
    const hasStudentChanges = (newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0);
    const hasClassChanges = (newLops.length > 0 || updatedLops.length > 0 || deletedLops.length > 0);

    if (hasStudentChanges || hasClassChanges) {
        hienXacNhan("Bạn có thay đổi chưa lưu ở danh mục Lớp hoặc Sinh viên. Bạn có chắc chắn muốn Reset và hủy bỏ tất cả thay đổi?", () => {
            resetLopForm();
        });
    } else {
        resetLopForm();
    }
}

function clearLopInputs() {
    document.getElementById("txtMaLop").value = "";
    document.getElementById("txtTenLop").value = "";
    document.getElementById("txtMaLop").disabled = false;
    
    document.getElementById("txtMaLop").classList.remove("is-invalid");
    document.getElementById("txtTenLop").classList.remove("is-invalid");
    document.getElementById("errMaLop").textContent = "";
    document.getElementById("errTenLop").textContent = "";

    validateClassInputs();
}

function resetLopForm() {
    clearLopInputs();    selectedLopRow = null;
    selectedLop = null;
    document.querySelectorAll("#lopList li").forEach(x => x.classList.remove("active"));    document.getElementById("currentLop").innerText = "Chưa chọn lớp";
    newItems = [];
    updatedItems = [];
    deletedItems = [];
    undoHistoryStack = [];
    redoHistoryStack = [];
    selectedRow = null;
    document.getElementById("svTable").innerHTML = "";
    resetStudentForm();    document.getElementById("btnExport").setAttribute("disabled", "true");
    document.getElementById("btnImport").setAttribute("disabled", "true");
}

function validateClassInputs() {
    const maLop = document.getElementById("txtMaLop").value.trim().toUpperCase();
    const tenLop = document.getElementById("txtTenLop").value.trim();
    const isEditing = document.getElementById("txtMaLop").disabled;

    const btnThemLop = document.getElementById("btnThemLop");
    const btnSuaLop = document.getElementById("btnSuaLop");

    const wrapThemLop = document.getElementById("wrapThemLop");
    const wrapSuaLop = document.getElementById("wrapSuaLop");

    const errMaLop = document.getElementById("errMaLop");
    const errTenLop = document.getElementById("errTenLop");

    const txtMaLop = document.getElementById("txtMaLop");
    const txtTenLop = document.getElementById("txtTenLop");    errMaLop.textContent = "";
    errTenLop.textContent = "";
    txtMaLop.classList.remove("is-invalid");
    txtTenLop.classList.remove("is-invalid");    if (isEditing && selectedLopRow) {
        const originalTenLop = (selectedLopRow.dataset.tenlop || "").trim();
        if (tenLop === originalTenLop) {
            updateClassButtonStates(
                true, "Đang ở chế độ hiệu chỉnh (Phục hồi để thêm mới)",
                true, "Vui lòng thay đổi tên lớp trước khi lưu hiệu chỉnh."
            );
            return;
        }
    }

    // Required/length client side validation
    let hasClientError = false;

    if (maLop === "") {
        hasClientError = true;
    } else if (maLop.length > 20) {
        errMaLop.textContent = "Mã lớp tối đa 20 ký tự.";
        txtMaLop.classList.add("is-invalid");
        hasClientError = true;
    }

    if (tenLop === "") {
        hasClientError = true;
    } else if (tenLop.length > 50) {
        errTenLop.textContent = "Tên lớp tối đa 50 ký tự.";
        txtTenLop.classList.add("is-invalid");
        hasClientError = true;
    }

    if (hasClientError) {
        let reasonThem = isEditing
            ? "Đang ở chế độ hiệu chỉnh (Phục hồi để thêm mới)"
            : "Vui lòng nhập Mã và Tên lớp để thêm.";
        let reasonSua = isEditing
            ? "Tên lớp không được để trống."
            : "Vui lòng chọn lớp trong danh sách để hiệu chỉnh";
        updateClassButtonStates(true, reasonThem, true, reasonSua);
        return;
    }    let isLocalDuplicate = false;
    let localReasonMa = "";
    let localReasonTen = "";

    const listItems = document.querySelectorAll("#lopList li");
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
            errMaLop.textContent = "Mã lớp này đã tồn tại trên danh sách tạm thời.";
            txtMaLop.classList.add("is-invalid");
            isLocalDuplicate = true;
            localReasonMa = "Mã lớp bị trùng lặp trên danh sách tạm thời.";
        }

        if (tenLop !== "" && existingTenLop === tenLop.toLowerCase()) {
            errTenLop.textContent = "Tên lớp này đã tồn tại trên danh sách tạm thời.";
            txtTenLop.classList.add("is-invalid");
            isLocalDuplicate = true;
            localReasonTen = "Tên lớp bị trùng lặp trên danh sách tạm thời.";
        }
    }

    if (isLocalDuplicate) {
        let reasonThem = isEditing
            ? "Đang ở chế độ hiệu chỉnh (Phục hồi để thêm mới)"
            : (localReasonMa || localReasonTen);
        let reasonSua = isEditing
            ? localReasonTen || "Tên lớp trùng lặp trên danh sách tạm thời."
            : "Vui lòng chọn lớp trong danh sách để hiệu chỉnh";
        updateClassButtonStates(true, reasonThem, true, reasonSua);
        return;
    }

    // Debounce CSDL validation
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
                    txtMaLop.classList.add("is-invalid");
                    errMaLop.textContent = "Mã lớp này đã tồn tại trong CSDL.";
                    dbReasonMa = "Mã lớp đã tồn tại trong CSDL.";
                }

                if (tenLop !== "" && status.tenLopDuplicate) {
                    dbDuplicate = true;
                    txtTenLop.classList.add("is-invalid");
                    errTenLop.textContent = "Tên lớp này đã tồn tại trong CSDL.";
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
                // Fallback to offline state
                if (isEditing) {
                    updateClassButtonStates(true, "Đang ở chế độ hiệu chỉnh (Phục hồi để thêm mới)", false, "");
                } else {
                    updateClassButtonStates(false, "", true, "Vui lòng chọn lớp trong danh sách để hiệu chỉnh");
                }
            });
    }, 250);
}

function updateClassButtonStates(disableThem, reasonThem, disableSua, reasonSua) {
    AppCommon.setDisabled(AppCommon.byId("btnThemLop"), AppCommon.byId("wrapThemLop"), disableThem, reasonThem);
    AppCommon.setDisabled(AppCommon.byId("btnSuaLop"), AppCommon.byId("wrapSuaLop"), disableSua, reasonSua);
}


function pushState() {
    undoHistoryStack.push({
        html: document.getElementById("svTable").innerHTML,
        newItems: AppCommon.cloneJson(newItems),
        updatedItems: AppCommon.cloneJson(updatedItems),
        deletedItems: AppCommon.cloneJson(deletedItems)
    });
    redoHistoryStack = [];
}

function undoSV() {
    if (undoHistoryStack.length === 0) return;

    redoHistoryStack.push({
        html: document.getElementById("svTable").innerHTML,
        newItems: AppCommon.cloneJson(newItems),
        updatedItems: AppCommon.cloneJson(updatedItems),
        deletedItems: AppCommon.cloneJson(deletedItems)
    });

    const prev = undoHistoryStack.pop();
    document.getElementById("svTable").innerHTML = prev.html;
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
        html: document.getElementById("svTable").innerHTML,
        newItems: AppCommon.cloneJson(newItems),
        updatedItems: AppCommon.cloneJson(updatedItems),
        deletedItems: AppCommon.cloneJson(deletedItems)
    });

    const next = redoHistoryStack.pop();
    document.getElementById("svTable").innerHTML = next.html;
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
        MaSV: document.getElementById("txtMaSV").value.trim().toUpperCase(),
        Ho: document.getElementById("txtHo").value.trim(),
        Ten: document.getElementById("txtTen").value.trim(),
        NgaySinh: document.getElementById("txtNgaySinh").value,
        DiaChi: document.getElementById("txtDiaChi").value.trim(),
        MatKhau: document.getElementById("txtMatKhau").value,
        MaLop: selectedLop
    };
}

function fillStudentForm(row) {
    document.getElementById("txtMaSV").value = row.dataset.masv;
    document.getElementById("txtHo").value = row.dataset.ho;
    document.getElementById("txtTen").value = row.dataset.ten;
    document.getElementById("txtNgaySinh").value = row.dataset.ngaysinh;
    document.getElementById("txtDiaChi").value = row.dataset.diachi;
    document.getElementById("txtMatKhau").value = row.dataset.matkhau || "";
    document.getElementById("txtMaSV").disabled = true;
    validateStudentInputs();
}

function clearStudentInputs() {
    document.getElementById("txtMaSV").value = "";
    document.getElementById("txtHo").value = "";
    document.getElementById("txtTen").value = "";
    document.getElementById("txtNgaySinh").value = "";
    document.getElementById("txtDiaChi").value = "";
    document.getElementById("txtMatKhau").value = "";
    document.getElementById("txtMaSV").disabled = false;    const fields = ["txtMaSV", "txtHo", "txtTen", "txtNgaySinh", "txtDiaChi", "txtMatKhau"];
    fields.forEach(f => document.getElementById(f).classList.remove("is-invalid"));
    
    const errors = ["errMaSV", "errHo", "errTen", "errNgaySinh", "errDiaChi", "errMatKhau"];
    errors.forEach(e => document.getElementById(e).textContent = "");

    validateStudentInputs();
}

function resetStudentForm() {
    clearStudentInputs();
    selectedRow = null;
    document.querySelectorAll("#svTable tr").forEach(x => x.classList.remove("table-active"));
}

function bindRows() {
    document.querySelectorAll("#svTable tr").forEach(row => {
        row.onclick = () => {
            if (AppCommon.isPendingDelete(row)) {
                return;
            }
            if (row.classList.contains("table-active")) return;
            document.querySelectorAll("#svTable tr").forEach(x => x.classList.remove("table-active"));
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

        const tbody = document.getElementById("svTable");
        tbody.innerHTML = "";

        data.forEach(sv => {
            const row = tbody.insertRow();
            row.dataset.masv = sv.maSV;
            row.dataset.ho = sv.ho;
            row.dataset.ten = sv.ten;
            row.dataset.ngaysinh = sv.ngaySinh ? sv.ngaySinh.slice(0, 10) : "";
            row.dataset.diachi = sv.diaChi;
            row.dataset.matkhau = sv.matKhau || "";

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
        hienThongBao("Vui lòng chọn một lớp học trước.", "Thông báo");
        return;
    }

    const d = getStudentForm();
    if (!d.MaSV || !d.Ho || !d.Ten) return;

    pushState();

    const row = document.getElementById("svTable").insertRow();
    row.dataset.masv = d.MaSV;
    row.dataset.ho = d.Ho;
    row.dataset.ten = d.Ten;
    row.dataset.ngaysinh = d.NgaySinh;
    row.dataset.diachi = d.DiaChi;
    row.dataset.matkhau = d.MatKhau;

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

    selectedRow.innerHTML = `
        <td>${id}</td>
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

    Object.assign(selectedRow.dataset, {
        ho: d.Ho,
        ten: d.Ten,
        ngaysinh: d.NgaySinh,
        diachi: d.DiaChi,
        matkhau: d.MatKhau
    });

    // If it's a newly added student (local-only)
    const newIdx = newItems.findIndex(x => x.MaSV === id);
    if (newIdx >= 0) {
        newItems[newIdx] = d;
        AppCommon.setChangeState(selectedRow, "new");
    } else {
        updatedItems = updatedItems.filter(x => x.MaSV !== id);
        updatedItems.push(d);
        AppCommon.setChangeState(selectedRow, "updated");
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
                hienThongBao(`Lỗi khi xóa SV <strong>${d.MaSV}</strong>: ${err}`, "Lỗi");
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
                hienThongBao(`Lỗi khi sửa SV <strong>${u.MaSV}</strong>: ${err}`, "Lỗi");
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
                hienThongBao(`Lỗi khi thêm SV <strong>${n.MaSV}</strong>: ${err}`, "Lỗi");
                return;
            }
        }

        hienThongBao("Ghi danh sách sinh viên thành công!", "Thành công", () => {
            newItems = [];
            updatedItems = [];
            deletedItems = [];
            loadSinhVien();
        });
    } catch (e) {
        hienThongBao("Lỗi kết nối khi lưu: " + e.message, "Lỗi");
    }
}

let searchDebounceTimer = null;

function triggerStudentSearch() {
    searchDebounceTimer = AppCommon.debounce(searchDebounceTimer, executeStudentSearch, 200);
}

function executeStudentSearch() {
    const k = document.getElementById("txtSearchSV").value.toLowerCase().trim();
    const rows = document.querySelectorAll("#svTable tr");

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
    const isEditing = document.getElementById("txtMaSV").disabled;

    const btnThemSV = document.getElementById("btnThemSV");
    const btnSuaSV = document.getElementById("btnSuaSV");

    const wrapThemSV = document.getElementById("wrapThemSV");
    const wrapSuaSV = document.getElementById("wrapSuaSV");

    const txtMaSV = document.getElementById("txtMaSV");
    const txtHo = document.getElementById("txtHo");
    const txtTen = document.getElementById("txtTen");
    const txtNgaySinh = document.getElementById("txtNgaySinh");
    const txtDiaChi = document.getElementById("txtDiaChi");
    const txtMatKhau = document.getElementById("txtMatKhau");

    const errMaSV = document.getElementById("errMaSV");
    const errHo = document.getElementById("errHo");
    const errTen = document.getElementById("errTen");
    const errNgaySinh = document.getElementById("errNgaySinh");
    const errDiaChi = document.getElementById("errDiaChi");
    const errMatKhau = document.getElementById("errMatKhau");

    // Reset old validation errors and styling
    errMaSV.textContent = "";
    errHo.textContent = "";
    errTen.textContent = "";
    errNgaySinh.textContent = "";
    errDiaChi.textContent = "";
    errMatKhau.textContent = "";

    txtMaSV.classList.remove("is-invalid");
    txtHo.classList.remove("is-invalid");
    txtTen.classList.remove("is-invalid");
    txtNgaySinh.classList.remove("is-invalid");
    txtDiaChi.classList.remove("is-invalid");
    txtMatKhau.classList.remove("is-invalid");

    // Check class selected first
    if (!selectedLop) {
        updateStudentButtonStates(
            true, "Vui lòng chọn lớp học trước.",
            true, "Vui lòng chọn lớp học trước."
        );
        return;
    }    if (isEditing && selectedRow) {
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

    let hasClientError = false;    if (!d.MaSV) {
        hasClientError = true;
    } else if (d.MaSV.length > 8) {
        errMaSV.textContent = "Mã sinh viên tối đa 8 ký tự.";
        txtMaSV.classList.add("is-invalid");
        hasClientError = true;
    }    if (!d.Ho) {
        hasClientError = true;
    } else if (d.Ho.length > 50) {
        errHo.textContent = "Họ tối đa 50 ký tự.";
        txtHo.classList.add("is-invalid");
        hasClientError = true;
    }    if (!d.Ten) {
        hasClientError = true;
    } else if (d.Ten.length > 10) {
        errTen.textContent = "Tên tối đa 10 ký tự.";
        txtTen.classList.add("is-invalid");
        hasClientError = true;
    }    if (!d.NgaySinh) {
        hasClientError = true;
    }    if (!d.DiaChi) {
        hasClientError = true;
    } else if (d.DiaChi.length > 40) {
        errDiaChi.textContent = "Địa chỉ tối đa 40 ký tự.";
        txtDiaChi.classList.add("is-invalid");
        hasClientError = true;
    }    if (!d.MatKhau) {
        hasClientError = true;
    } else if (d.MatKhau.length > 20) {
        errMatKhau.textContent = "Mật khẩu tối đa 20 ký tự.";
        txtMatKhau.classList.add("is-invalid");
        hasClientError = true;
    }

    if (hasClientError) {
        let reasonThem = isEditing ? "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)" : "Thông tin sinh viên nhập không hợp lệ.";
        let reasonSua = isEditing ? "Thông tin sinh viên nhập không hợp lệ." : "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh";
        updateStudentButtonStates(true, reasonThem, true, reasonSua);
        return;
    }    if (!isEditing) {
        const exists = [...document.querySelectorAll("#svTable tr")].some(r => r.dataset.masv === d.MaSV);
        if (exists) {
            errMaSV.textContent = "Mã SV này đã trùng trong danh sách tạm thời.";
            txtMaSV.classList.add("is-invalid");
            updateStudentButtonStates(
                true, "Mã SV bị trùng lặp trên danh sách tạm thời.",
                true, "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh"
            );
            return;
        }
    }

    // Debounce CSDL duplicate validation for MaSV (only if adding)
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
                        txtMaSV.classList.add("is-invalid");
                        errMaSV.textContent = "Mã SV này đã tồn tại trong CSDL.";
                        updateStudentButtonStates(
                            true, "Mã SV đã tồn tại trong CSDL.",
                            true, "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh"
                        );
                    } else {                        updateStudentButtonStates(false, "", true, "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh");
                    }
                })
                .catch(error => {
                    console.error("Lỗi kiểm tra trùng SV:", error);
                    updateStudentButtonStates(false, "", true, "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh");
                });
        }, 250);
    } else {        updateStudentButtonStates(true, "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)", false, "");
    }
}

function updateStudentButtonStates(disableThem, reasonThem, disableSua, reasonSua) {
    AppCommon.setDisabled(AppCommon.byId("btnThemSV"), AppCommon.byId("wrapThemSV"), disableThem, reasonThem);
    AppCommon.setDisabled(AppCommon.byId("btnSuaSV"), AppCommon.byId("wrapSuaSV"), disableSua, reasonSua);
}

function updateSaveButtonState() {
    const hasChanges = newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0;
    AppCommon.setDisabled(
        AppCommon.byId("btnGhiSV"),
        AppCommon.byId("wrapGhiSV"),
        !hasChanges,
        "Không có thay đổi nào cần lưu."
    );
}

function updateSaveLopButtonState() {
    const hasChanges = newLops.length > 0 || updatedLops.length > 0 || deletedLops.length > 0;
    AppCommon.setDisabled(
        AppCommon.byId("btnGhiLop"),
        AppCommon.byId("wrapGhiLop"),
        !hasChanges,
        "Không có thay đổi nào về Lớp cần ghi."
    );
}

function updateUndoRedoButtonStates() {
    const btnUndo = document.getElementById("btnUndoSV");
    const btnRedo = document.getElementById("btnRedoSV");
    if (btnUndo) {
        btnUndo.disabled = undoHistoryStack.length === 0;
    }
    if (btnRedo) {
        btnRedo.disabled = redoHistoryStack.length === 0;
    }
}

function updateUndoRedoLopButtonStates() {
    const btnUndoLop = document.getElementById("btnUndoLop");
    const btnRedoLop = document.getElementById("btnRedoLop");
    if (btnUndoLop) {
        btnUndoLop.disabled = historyLopUndo.length === 0;
    }
    if (btnRedoLop) {
        btnRedoLop.disabled = historyLopRedo.length === 0;
    }
}

function updateSTT() {
    // We only update STT on non-hidden elements (respecting search filters)
    const rows = Array.from(document.querySelectorAll("#svTable tr:not(.search-hidden)"));
    const lblCount = document.getElementById("lblCount");
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


function exportExcel() {
    if (!selectedLop) return;
    const rows = [["Mã SV", "Họ", "Tên", "Ngày sinh", "Địa chỉ", "Mật khẩu"]];
    
    document.querySelectorAll("#svTable tr").forEach(tr => {
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
        hienThongBao("Vui lòng chọn một lớp trước khi import.", "Thông báo");
        return;
    }

    AppCommon.showImportModal();
}

let currentImportList = [];

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

    const rows = rawData.filter(r => r.some(cell => cell.toString().trim() !== ""));
    if (rows.length === 0) {
        showImportFileError("File Excel không có dữ liệu.");
        return;
    }

    const headerRow = rows[0];
    if (headerRow.length < 6) {
        showImportFileError("Cấu trúc cột không hợp lệ. File Excel phải có 6 cột: Mã SV, Họ, Tên, Ngày sinh, Địa chỉ, Mật khẩu.");
        return;
    }

    const col1 = normalizeHeader(headerRow[0]);
    const col2 = normalizeHeader(headerRow[1]);
    const col3 = normalizeHeader(headerRow[2]);
    const col4 = normalizeHeader(headerRow[3]);
    const col5 = normalizeHeader(headerRow[4]);
    const col6 = normalizeHeader(headerRow[5]);

    const validCol1 = (col1 === "ma sv" || col1 === "masv");
    const validCol2 = (col2 === "ho");
    const validCol3 = (col3 === "ten");
    const validCol4 = (col4 === "ngay sinh" || col4 === "ngaysinh");
    const validCol5 = (col5 === "dia chi" || col5 === "diachi");
    const validCol6 = (col6 === "mat khau" || col6 === "matkhau");

    if (!validCol1 || !validCol2 || !validCol3 || !validCol4 || !validCol5 || !validCol6) {
        showImportFileError("Cấu trúc cột không hợp lệ. Vui lòng tải file mẫu để kiểm tra thứ tự cột.");
        return;
    }

    const dataRows = rows.slice(1);
    if (dataRows.length === 0) {
        showImportFileError("Không tìm thấy dòng dữ liệu nào dưới hàng tiêu đề.");
        return;
    }

    let processedRows = [];
    let fileMaSVSet = new Set();

    const currentTableIds = new Set();
    document.querySelectorAll("#svTable tr").forEach(tr => {
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

            // Validate date format (YYYY-MM-DD)
            if (ngaySinh !== "") {
                // If it is an Excel serial number date
                if (!isNaN(ngaySinh)) {
                    const excelDate = new Date((parseInt(ngaySinh) - 25569) * 86400 * 1000);
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
    }    fetch('/LopSinhVien/CheckStudentImport', {
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
            <td><strong>${row.maSV}</strong></td>
            <td>${row.ho} ${row.ten}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });

    summarySpan.textContent = `Tổng: ${processedRows.length} | Hợp lệ: ${successCount} | Lỗi: ${errorCount}`;
    summarySpan.className = errorCount > 0 ? "badge bg-danger rounded-pill px-3 py-1.5" : "badge bg-success rounded-pill px-3 py-1.5";

    if (errorCount === 0 && successCount > 0) {
        confirmBtn.removeAttribute("disabled");
        currentImportList = processedRows.map(r => ({
            MaSV: r.maSV,
            Ho: r.ho,
            Ten: r.ten,
            NgaySinh: r.ngaySinh,
            DiaChi: r.diaChi,
            MatKhau: r.matKhau
        }));
    } else {
        confirmBtn.setAttribute("disabled", "true");
    }
}

function confirmImport() {
    if (currentImportList.length === 0) return;

    pushState();

    const tbody = document.getElementById("svTable");

    currentImportList.forEach(item => {
        const row = tbody.insertRow();
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

    const importModalEl = document.getElementById('importModal');
    const modalBs = bootstrap.Modal.getInstance(importModalEl);
    if (modalBs) modalBs.hide();

    document.getElementById("importFile").value = "";
    document.getElementById("importPreviewSection").style.display = "none";

    hienThongBao(`Đã import thành công <strong>${currentImportList.length}</strong> sinh viên vào danh sách tạm thời. Vui lòng bấm <strong>Ghi</strong> để lưu thay đổi vào CSDL.`, "Thành công");

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
        hienThongBao("Lớp này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
        return;
    }
    chonLop(li, () => {
        document.getElementById("txtMaLop").value = li.dataset.malop;
        document.getElementById("txtTenLop").value = li.dataset.tenlop;
        document.getElementById("txtMaLop").disabled = true; // Cannot edit PK
        validateClassInputs();
        document.getElementById("txtTenLop").focus();
    });
}

function deleteLopClick(event, li) {
    if (event) event.stopPropagation();
    if (AppCommon.isPendingDelete(li)) {
        hienThongBao("Lớp này đã được đánh dấu chờ xóa.", "Thông báo");
        return;
    }
    
    const ma = li.dataset.malop;
    const ten = li.dataset.tenlop;
    
    hienXacNhan(`Bạn có chắc chắn muốn xóa lớp <strong>"${ma} - ${ten}"</strong> và tất cả dữ liệu tạm thời đi kèm không?`, () => {
        pushStateLop();

        const newIndex = newLops.findIndex(x => x.MaLop === ma);
        if (newIndex >= 0) {
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
            document.getElementById("currentLop").innerText = "Chưa chọn";
            document.getElementById("svTable").innerHTML = "";            document.getElementById("btnExport").setAttribute("disabled", "true");
            document.getElementById("btnImport").setAttribute("disabled", "true");
            
            resetLopForm();
        }
        
        if (newIndex >= 0) {
            li.remove();
        } else {
            AppCommon.setChangeState(li, "deleted");
        }
        updateSTT();
        locLop();
        updateSaveLopButtonState();
    });
}

function editSVClick(event, tr) {
    if (event) event.stopPropagation();
    if (AppCommon.isPendingDelete(tr)) {
        hienThongBao("Dòng này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
        return;
    }
    
    document.querySelectorAll("#svTable tr").forEach(x => x.classList.remove("table-active"));
    tr.classList.add("table-active");
    selectedRow = tr;
    
    fillStudentForm(tr);
    document.getElementById("txtHo").focus();
}

function deleteSVClick(event, tr) {
    if (event) event.stopPropagation();
    if (AppCommon.isPendingDelete(tr)) {
        hienThongBao("Sinh viên này đã được đánh dấu chờ xóa.", "Thông báo");
        return;
    }

    const id = tr.dataset.masv;
    const name = `${tr.dataset.ho} ${tr.dataset.ten}`;

    hienXacNhan(`Bạn có chắc chắn muốn xóa sinh viên <strong>"${id} - ${name}"</strong> không?`, () => {
        pushState();

        const newIdx = newItems.findIndex(x => x.MaSV === id);
        if (newIdx >= 0) {
            newItems = newItems.filter(x => x.MaSV !== id);
        } else {
            updatedItems = updatedItems.filter(x => x.MaSV !== id);
            if (!deletedItems.some(x => x.MaSV === id)) {
                deletedItems.push({ MaSV: id });
            }
        }

        if (newIdx >= 0) {
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
}
