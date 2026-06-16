// --- Global State ---
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
let customModalBs = null;

// --- Lifecycle and Initialization ---
window.onload = () => {
    bindLopRows();
    bindRows();

    // Event listeners for student form inputs validation
    document.getElementById("txtMaSV").addEventListener("input", validateStudentInputs);
    document.getElementById("txtHo").addEventListener("input", validateStudentInputs);
    document.getElementById("txtTen").addEventListener("input", validateStudentInputs);
    
    // Live filter search for students
    const txtSearchSV = document.getElementById("txtSearchSV");
    if (txtSearchSV) {
        txtSearchSV.addEventListener("input", triggerStudentSearch);
    }

    validateStudentInputs();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
};

// --- Class (Lop) Subform Management ---

function bindLopRows() {
    document.querySelectorAll("#lopList li").forEach(li => {
        li.onclick = () => chonLop(li);
    });
}

function pushStateLop() {
    historyLopUndo.push({
        html: document.getElementById("lopList").innerHTML,
        newLops: JSON.parse(JSON.stringify(newLops)),
        updatedLops: JSON.parse(JSON.stringify(updatedLops)),
        deletedLops: JSON.parse(JSON.stringify(deletedLops))
    });
    historyLopRedo = [];
}

function chonLop(el) {
    document.querySelectorAll("#lopList li").forEach(x => x.classList.remove("active"));
    el.classList.add("active");

    selectedLopRow = el;
    selectedLop = el.dataset.malop;

    document.getElementById("txtMaLop").value = el.dataset.malop;
    document.getElementById("txtTenLop").value = el.dataset.tenlop;
    document.getElementById("txtMaLop").disabled = true; // Cannot edit PK

    document.getElementById("currentLop").innerText = el.dataset.tenlop;

    // Reset student states
    newItems = [];
    updatedItems = [];
    deletedItems = [];
    undoHistoryStack = [];
    redoHistoryStack = [];
    selectedRow = null;
    resetStudentForm();

    // Enable Excel buttons
    document.getElementById("btnExport").removeAttribute("disabled");
    document.getElementById("btnImport").removeAttribute("disabled");

    loadSinhVien();
}

function themLop() {
    const ma = document.getElementById("txtMaLop").value.trim().toUpperCase();
    const ten = document.getElementById("txtTenLop").value.trim();

    if (!ma || !ten) {
        hienThongBao("Vui lòng nhập đầy đủ Mã và Tên lớp.", "Thông báo");
        return;
    }

    // Check duplicates locally
    const exists = [...document.querySelectorAll("#lopList li")].some(li => li.dataset.malop === ma);
    if (exists) {
        hienThongBao("Mã lớp này đã tồn tại trong danh sách.", "Thông báo");
        return;
    }

    pushStateLop();
    newLops.push({ MaLop: ma, TenLop: ten });

    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action";
    li.dataset.malop = ma;
    li.dataset.tenlop = ten;
    li.innerHTML = `<b>${ten}</b> - ${ma}`;
    li.onclick = () => chonLop(li);

    document.getElementById("lopList").appendChild(li);
    resetLopForm();
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
    selectedLopRow.innerHTML = `<b>${ten}</b> - ${oldMa}`;

    const newIndex = newLops.findIndex(x => x.MaLop === oldMa);
    if (newIndex >= 0) {
        newLops[newIndex].TenLop = ten;
    } else {
        updatedLops = updatedLops.filter(x => x.MaLop !== oldMa);
        updatedLops.push({ MaLop: oldMa, TenLop: ten });
    }

    document.getElementById("currentLop").innerText = ten;
}

function xoaLop() {
    if (!selectedLopRow) {
        hienThongBao("Vui lòng chọn lớp cần xóa.", "Thông báo");
        return;
    }

    const ma = selectedLopRow.dataset.malop;

    hienXacNhan(`Bạn có chắc chắn muốn xóa lớp <strong>"${ma}"</strong> và tất cả dữ liệu tạm thời đi kèm không?`, () => {
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

        selectedLopRow.remove();
        selectedLopRow = null;
        selectedLop = null;
        
        document.getElementById("currentLop").innerText = "Chưa chọn";
        document.getElementById("svTable").innerHTML = "";
        
        // Disable Excel buttons
        document.getElementById("btnExport").setAttribute("disabled", "true");
        document.getElementById("btnImport").setAttribute("disabled", "true");

        resetLopForm();
        updateSTT();
    });
}

function undoLop() {
    if (historyLopUndo.length === 0) {
        hienThongBao("Không có gì để hoàn tác Lớp!", "Thông báo");
        return;
    }

    historyLopRedo.push({
        html: document.getElementById("lopList").innerHTML,
        newLops: JSON.parse(JSON.stringify(newLops)),
        updatedLops: JSON.parse(JSON.stringify(updatedLops)),
        deletedLops: JSON.parse(JSON.stringify(deletedLops))
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
}

async function ghiLop() {
    if (deletedLops.length === 0 && updatedLops.length === 0 && newLops.length === 0) {
        hienThongBao("Không có thay đổi nào về Lớp cần ghi.", "Thông báo");
        return;
    }

    try {
        for (const d of deletedLops) {
            const response = await fetch(`/SinhVien/DeleteLop?maLop=${d.MaLop}`, { method: "POST" });
            if (!response.ok) {
                const err = await response.text();
                hienThongBao(`Lỗi khi xóa lớp <strong>${d.MaLop}</strong>: ${err}`, "Lỗi");
                return;
            }
        }

        for (const u of updatedLops) {
            const response = await fetch(`/SinhVien/UpdateLop`, {
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
            const response = await fetch(`/SinhVien/InsertLop`, {
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
            location.reload();
        });
    } catch (e) {
        hienThongBao("Lỗi kết nối khi lưu Lớp: " + e.message, "Lỗi");
    }
}

function resetLopForm() {
    document.getElementById("txtMaLop").value = "";
    document.getElementById("txtTenLop").value = "";
    document.getElementById("txtMaLop").disabled = false;
}

// --- Student (SinhVien) Subform Management ---

function pushState() {
    undoHistoryStack.push({
        html: document.getElementById("svTable").innerHTML,
        newItems: JSON.parse(JSON.stringify(newItems)),
        updatedItems: JSON.parse(JSON.stringify(updatedItems)),
        deletedItems: JSON.parse(JSON.stringify(deletedItems))
    });
    redoHistoryStack = [];
}

function undoSV() {
    if (undoHistoryStack.length === 0) return;

    redoHistoryStack.push({
        html: document.getElementById("svTable").innerHTML,
        newItems: JSON.parse(JSON.stringify(newItems)),
        updatedItems: JSON.parse(JSON.stringify(updatedItems)),
        deletedItems: JSON.parse(JSON.stringify(deletedItems))
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
        newItems: JSON.parse(JSON.stringify(newItems)),
        updatedItems: JSON.parse(JSON.stringify(updatedItems)),
        deletedItems: JSON.parse(JSON.stringify(deletedItems))
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

function resetStudentForm() {
    document.getElementById("txtMaSV").value = "";
    document.getElementById("txtHo").value = "";
    document.getElementById("txtTen").value = "";
    document.getElementById("txtNgaySinh").value = "";
    document.getElementById("txtDiaChi").value = "";
    document.getElementById("txtMatKhau").value = "";
    document.getElementById("txtMaSV").disabled = false;
    selectedRow = null;

    document.querySelectorAll("#svTable tr").forEach(x => x.classList.remove("table-active"));
    validateStudentInputs();
}

function bindRows() {
    document.querySelectorAll("#svTable tr").forEach(row => {
        row.onclick = () => {
            document.querySelectorAll("#svTable tr").forEach(x => x.classList.remove("table-active"));
            row.classList.add("table-active");
            selectedRow = row;
            fillStudentForm(row);
        };
    });
}

async function loadSinhVien() {
    if (!selectedLop) return;

    try {
        const res = await fetch('/SinhVien/GetByLop?maLop=' + selectedLop);
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
    `;

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
    } else {
        updatedItems = updatedItems.filter(x => x.MaSV !== id);
        updatedItems.push(d);
    }

    bindRows();
    updateSTT();
    resetStudentForm();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
}

function xoaSV() {
    if (!selectedRow) return;

    const id = selectedRow.dataset.masv;

    hienXacNhan(`Bạn có chắc chắn muốn xóa sinh viên <strong>"${id} - ${selectedRow.dataset.ho} ${selectedRow.dataset.ten}"</strong> không?`, () => {
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

        selectedRow.remove();
        selectedRow = null;

        updateSTT();
        resetStudentForm();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
    });
}

async function ghiSV() {
    undoHistoryStack = [];
    redoHistoryStack = [];
    updateUndoRedoButtonStates();

    try {
        for (const d of deletedItems) {
            const res = await fetch(`/SinhVien/Delete?maSV=${d.MaSV}`, { method: "POST" });
            if (!res.ok) {
                const err = await res.text();
                hienThongBao(`Lỗi khi xóa SV <strong>${d.MaSV}</strong>: ${err}`, "Lỗi");
                return;
            }
        }

        for (const u of updatedItems) {
            const res = await fetch(`/SinhVien/Update`, {
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
            const res = await fetch(`/SinhVien/Insert`, {
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
            loadSinhVien();
        });
    } catch (e) {
        hienThongBao("Lỗi kết nối khi lưu: " + e.message, "Lỗi");
    }
}

// --- Local Filter Search ---
let searchDebounceTimer = null;

function triggerStudentSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(executeStudentSearch, 200);
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

// --- Validation Routines ---

function validateStudentInputs() {
    const d = getStudentForm();
    const isEditing = document.getElementById("txtMaSV").disabled;

    const btnThemSV = document.getElementById("btnThemSV");
    const btnSuaSV = document.getElementById("btnSuaSV");
    const btnXoaSV = document.getElementById("btnXoaSV");

    const wrapThemSV = document.getElementById("wrapThemSV");
    const wrapSuaSV = document.getElementById("wrapSuaSV");
    const wrapXoaSV = document.getElementById("wrapXoaSV");

    let valid = true;
    let message = "";

    if (!selectedLop) {
        valid = false;
        message = "Vui lòng chọn lớp học trước.";
    } else if (!d.MaSV) {
        valid = false;
        message = "Mã sinh viên không được rỗng.";
    } else if (d.MaSV.length > 8) {
        valid = false;
        message = "Mã sinh viên tối đa 8 ký tự.";
    } else if (!d.Ho) {
        valid = false;
        message = "Họ sinh viên không được rỗng.";
    } else if (d.Ho.length > 50) {
        valid = false;
        message = "Họ tối đa 50 ký tự.";
    } else if (!d.Ten) {
        valid = false;
        message = "Tên sinh viên không được rỗng.";
    } else if (d.Ten.length > 10) {
        valid = false;
        message = "Tên tối đa 10 ký tự.";
    } else if (d.DiaChi && d.DiaChi.length > 40) {
        valid = false;
        message = "Địa chỉ tối đa 40 ký tự.";
    } else if (d.MatKhau && d.MatKhau.length > 20) {
        valid = false;
        message = "Mật khẩu tối đa 20 ký tự.";
    }

    // Check code duplicates locally
    if (!isEditing && valid) {
        const exists = [...document.querySelectorAll("#svTable tr")].some(r => r.dataset.masv === d.MaSV);
        if (exists) {
            valid = false;
            message = "Mã SV này đã trùng trong danh sách.";
        }
    }

    if (valid) {
        if (isEditing) {
            btnThemSV.setAttribute("disabled", "true");
            wrapThemSV.title = "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)";
            btnSuaSV.removeAttribute("disabled");
            wrapSuaSV.removeAttribute("title");
        } else {
            btnThemSV.removeAttribute("disabled");
            wrapThemSV.removeAttribute("title");
            btnSuaSV.setAttribute("disabled", "true");
            wrapSuaSV.title = "Vui lòng chọn sinh viên trên lưới để hiệu chỉnh";
        }
    } else {
        btnThemSV.setAttribute("disabled", "true");
        btnSuaSV.setAttribute("disabled", "true");
        wrapThemSV.title = message;
        wrapSuaSV.title = message;
    }

    if (selectedRow) {
        btnXoaSV.removeAttribute("disabled");
        wrapXoaSV.removeAttribute("title");
    } else {
        btnXoaSV.setAttribute("disabled", "true");
        wrapXoaSV.title = "Vui lòng chọn sinh viên cần xóa";
    }
}

function updateSaveButtonState() {
    const btnGhiSV = document.getElementById("btnGhiSV");
    const wrapGhiSV = document.getElementById("wrapGhiSV");
    const hasChanges = (newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0);

    if (hasChanges) {
        btnGhiSV.removeAttribute("disabled");
        wrapGhiSV.removeAttribute("title");
    } else {
        btnGhiSV.setAttribute("disabled", "true");
        wrapGhiSV.title = "Không có thay đổi nào cần lưu.";
    }
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

function updateSTT() {
    // We only update STT on non-hidden elements (respecting search filters)
    const rows = Array.from(document.querySelectorAll("#svTable tr:not(.search-hidden)"));
    const lblCount = document.getElementById("lblCount");
    if (lblCount) {
        lblCount.textContent = rows.length;
    }
    updatePagination();
}

// --- Pagination Operations ---
function updatePagination() {
    const rows = Array.from(document.querySelectorAll("#svTable tr:not(.search-hidden)"));
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

    // Apply class to toggle view
    const allRows = Array.from(document.querySelectorAll("#svTable tr"));
    let visibleCounter = 0;

    allRows.forEach(row => {
        if (row.classList.contains("search-hidden")) {
            row.classList.add("d-none");
            return;
        }

        if (visibleCounter >= startIdx && visibleCounter < endIdx) {
            row.classList.remove("d-none");
        } else {
            row.classList.add("d-none");
        }
        visibleCounter++;
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

// --- Excel Import/Export and Dialog Systems ---

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
    }

    // Call server API batch check
    fetch('/SinhVien/CheckImport', {
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

// --- Custom Modal Dialog System ---
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
        if (callback) callback();
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
        if (isConfirmed && onConfirm) onConfirm();
    };
    modalEl.addEventListener('hidden.bs.modal', onHidden);

    bsModal.show();
}
