// --- Global State ---
let newItems = [];
let updatedItems = [];
let deletedItems = [];
let undoHistoryStack = [];
let redoHistoryStack = [];
let selectedRow = null;

let currentPage = 1;
let rowsPerPage = 10;
let customModalBs = null;

// --- Lifecycle and Initialization ---
window.onload = () => {
    bindRows();

    // Event listeners for lecturer form inputs validation
    document.getElementById("txtMaGV").addEventListener("input", validateGiaoVienInputs);
    document.getElementById("txtHoGV").addEventListener("input", validateGiaoVienInputs);
    document.getElementById("txtTenGV").addEventListener("input", validateGiaoVienInputs);
    document.getElementById("txtSoDTLL").addEventListener("input", validateGiaoVienInputs);
    document.getElementById("txtDiaChiGV").addEventListener("input", validateGiaoVienInputs);
    
    // Live filter search for lecturers
    const txtSearchGV = document.getElementById("txtSearchGV");
    if (txtSearchGV) {
        txtSearchGV.addEventListener("input", triggerGiaoVienSearch);
    }

    validateGiaoVienInputs();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
    updateSTT();
};

// --- State and Undo/Redo Management ---
function pushState() {
    undoHistoryStack.push({
        html: document.getElementById("gvTable").innerHTML,
        newItems: JSON.parse(JSON.stringify(newItems)),
        updatedItems: JSON.parse(JSON.stringify(updatedItems)),
        deletedItems: JSON.parse(JSON.stringify(deletedItems))
    });
    redoHistoryStack = [];
    updateUndoRedoButtonStates();
}

function undoGV() {
    if (undoHistoryStack.length === 0) return;

    redoHistoryStack.push({
        html: document.getElementById("gvTable").innerHTML,
        newItems: JSON.parse(JSON.stringify(newItems)),
        updatedItems: JSON.parse(JSON.stringify(updatedItems)),
        deletedItems: JSON.parse(JSON.stringify(deletedItems))
    });

    const prev = undoHistoryStack.pop();
    document.getElementById("gvTable").innerHTML = prev.html;
    newItems = prev.newItems;
    updatedItems = prev.updatedItems;
    deletedItems = prev.deletedItems;

    bindRows();
    updateSTT();
    selectedRow = null;
    resetGiaoVienForm();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
}

function redoGV() {
    if (redoHistoryStack.length === 0) return;

    undoHistoryStack.push({
        html: document.getElementById("gvTable").innerHTML,
        newItems: JSON.parse(JSON.stringify(newItems)),
        updatedItems: JSON.parse(JSON.stringify(updatedItems)),
        deletedItems: JSON.parse(JSON.stringify(deletedItems))
    });

    const next = redoHistoryStack.pop();
    document.getElementById("gvTable").innerHTML = next.html;
    newItems = next.newItems;
    updatedItems = next.updatedItems;
    deletedItems = next.deletedItems;

    bindRows();
    updateSTT();
    selectedRow = null;
    resetGiaoVienForm();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
}

// --- Form and Input Utilities ---
function getGiaoVienForm() {
    return {
        MaGV: document.getElementById("txtMaGV").value.trim().toUpperCase(),
        Ho: document.getElementById("txtHoGV").value.trim(),
        Ten: document.getElementById("txtTenGV").value.trim(),
        SoDTLL: document.getElementById("txtSoDTLL").value.trim(),
        DiaChi: document.getElementById("txtDiaChiGV").value.trim()
    };
}

function fillGiaoVienForm(row) {
    document.getElementById("txtMaGV").value = row.dataset.magv;
    document.getElementById("txtHoGV").value = row.dataset.ho;
    document.getElementById("txtTenGV").value = row.dataset.ten;
    document.getElementById("txtSoDTLL").value = row.dataset.sdt || "";
    document.getElementById("txtDiaChiGV").value = row.dataset.diachi || "";
    document.getElementById("txtMaGV").disabled = true; // Primary Key cannot be changed
    validateGiaoVienInputs();
}

function resetGiaoVienForm() {
    document.getElementById("txtMaGV").value = "";
    document.getElementById("txtHoGV").value = "";
    document.getElementById("txtTenGV").value = "";
    document.getElementById("txtSoDTLL").value = "";
    document.getElementById("txtDiaChiGV").value = "";
    document.getElementById("txtMaGV").disabled = false;
    selectedRow = null;

    document.querySelectorAll("#gvTable tr").forEach(x => x.classList.remove("table-active"));
    validateGiaoVienInputs();
}

function bindRows() {
    document.querySelectorAll("#gvTable tr").forEach(row => {
        row.onclick = () => {
            document.querySelectorAll("#gvTable tr").forEach(x => x.classList.remove("table-active"));
            row.classList.add("table-active");
            selectedRow = row;
            fillGiaoVienForm(row);
        };
    });
}

// --- CRUD Operations ---
function themGV() {
    const d = getGiaoVienForm();
    if (!d.MaGV || !d.Ho || !d.Ten) return;

    pushState();

    const row = document.getElementById("gvTable").insertRow();
    row.dataset.magv = d.MaGV;
    row.dataset.ho = d.Ho;
    row.dataset.ten = d.Ten;
    row.dataset.sdt = d.SoDTLL;
    row.dataset.diachi = d.DiaChi;

    row.innerHTML = `
        <td>${d.MaGV}</td>
        <td>${d.Ho}</td>
        <td>${d.Ten}</td>
        <td>${d.SoDTLL}</td>
        <td>${d.DiaChi}</td>
    `;

    newItems.push(d);

    bindRows();
    updateSTT();
    resetGiaoVienForm();
    updateSaveButtonState();
}

function hieuChinhGV() {
    if (!selectedRow) return;

    const d = getGiaoVienForm();
    const id = selectedRow.dataset.magv;

    pushState();

    selectedRow.innerHTML = `
        <td>${id}</td>
        <td>${d.Ho}</td>
        <td>${d.Ten}</td>
        <td>${d.SoDTLL}</td>
        <td>${d.DiaChi}</td>
    `;

    Object.assign(selectedRow.dataset, {
        ho: d.Ho,
        ten: d.Ten,
        sdt: d.SoDTLL,
        diachi: d.DiaChi
    });

    const newIdx = newItems.findIndex(x => x.MaGV === id);
    if (newIdx >= 0) {
        newItems[newIdx] = d;
    } else {
        updatedItems = updatedItems.filter(x => x.MaGV !== id);
        updatedItems.push(d);
    }

    bindRows();
    updateSTT();
    resetGiaoVienForm();
    updateSaveButtonState();
}

function xoaGV() {
    if (!selectedRow) return;

    const id = selectedRow.dataset.magv;
    const name = `${selectedRow.dataset.ho} ${selectedRow.dataset.ten}`;

    hienXacNhan(`Bạn có chắc chắn muốn xóa giáo viên <strong>"${id} - ${name}"</strong> không?`, () => {
        pushState();

        const newIdx = newItems.findIndex(x => x.MaGV === id);
        if (newIdx >= 0) {
            newItems = newItems.filter(x => x.MaGV !== id);
        } else {
            updatedItems = updatedItems.filter(x => x.MaGV !== id);
            if (!deletedItems.includes(id)) {
                deletedItems.push(id);
            }
        }

        selectedRow.remove();
        selectedRow = null;

        updateSTT();
        resetGiaoVienForm();
        updateSaveButtonState();
    });
}

async function ghiGV() {
    undoHistoryStack = [];
    redoHistoryStack = [];
    updateUndoRedoButtonStates();

    try {
        // DELETE
        for (const ma of deletedItems) {
            const res = await fetch(`/GiaoVien/Delete?maGV=${ma}`, { method: "POST" });
            if (!res.ok) {
                const err = await res.text();
                hienThongBao(`Lỗi khi xóa giáo viên <strong>${ma}</strong>: ${err}`, "Lỗi");
                return;
            }
        }

        // UPDATE
        for (const u of updatedItems) {
            const res = await fetch(`/GiaoVien/Update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(u)
            });
            if (!res.ok) {
                const err = await res.text();
                hienThongBao(`Lỗi khi sửa giáo viên <strong>${u.MaGV}</strong>: ${err}`, "Lỗi");
                return;
            }
        }

        // INSERT
        for (const n of newItems) {
            const res = await fetch(`/GiaoVien/Insert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(n)
            });
            if (!res.ok) {
                const err = await res.text();
                hienThongBao(`Lỗi khi thêm giáo viên <strong>${n.MaGV}</strong>: ${err}`, "Lỗi");
                return;
            }
        }

        hienThongBao("Ghi danh sách giáo viên thành công!", "Thành công", () => {
            location.reload();
        });
    } catch (e) {
        hienThongBao("Lỗi kết nối khi lưu: " + e.message, "Lỗi");
    }
}

// --- Local Filter Search ---
let searchDebounceTimer = null;

function triggerGiaoVienSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(executeGiaoVienSearch, 200);
}

function executeGiaoVienSearch() {
    const k = document.getElementById("txtSearchGV").value.toLowerCase().trim();
    const rows = document.querySelectorAll("#gvTable tr");

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
function validateGiaoVienInputs() {
    const d = getGiaoVienForm();
    const isEditing = document.getElementById("txtMaGV").disabled;

    const btnThemGV = document.getElementById("btnThemGV");
    const btnSuaGV = document.getElementById("btnSuaGV");
    const btnXoaGV = document.getElementById("btnXoaGV");

    const wrapThemGV = document.getElementById("wrapThemGV");
    const wrapSuaGV = document.getElementById("wrapSuaGV");
    const wrapXoaGV = document.getElementById("wrapXoaGV");

    let valid = true;
    let message = "";

    if (!d.MaGV) {
        valid = false;
        message = "Mã giáo viên không được rỗng.";
    } else if (d.MaGV.length > 8) {
        valid = false;
        message = "Mã giáo viên tối đa 8 ký tự.";
    } else if (!d.Ho) {
        valid = false;
        message = "Họ giáo viên không được rỗng.";
    } else if (d.Ho.length > 50) {
        valid = false;
        message = "Họ tối đa 50 ký tự.";
    } else if (!d.Ten) {
        valid = false;
        message = "Tên giáo viên không được rỗng.";
    } else if (d.Ten.length > 10) {
        valid = false;
        message = "Tên tối đa 10 ký tự.";
    } else if (d.SoDTLL && d.SoDTLL.length > 15) {
        valid = false;
        message = "Số điện thoại tối đa 15 ký tự.";
    } else if (d.DiaChi && d.DiaChi.length > 40) {
        valid = false;
        message = "Địa chỉ tối đa 40 ký tự.";
    }

    // Check PK duplicate locally
    if (!isEditing && valid) {
        const exists = [...document.querySelectorAll("#gvTable tr")].some(r => r.dataset.magv === d.MaGV);
        if (exists) {
            valid = false;
            message = "Mã GV này đã trùng trong danh sách.";
        }
    }

    if (valid) {
        if (isEditing) {
            btnThemGV.setAttribute("disabled", "true");
            wrapThemGV.title = "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)";
            btnSuaGV.removeAttribute("disabled");
            wrapSuaGV.removeAttribute("title");
        } else {
            btnThemGV.removeAttribute("disabled");
            wrapThemGV.removeAttribute("title");
            btnSuaGV.setAttribute("disabled", "true");
            wrapSuaGV.title = "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh";
        }
    } else {
        btnThemGV.setAttribute("disabled", "true");
        btnSuaGV.setAttribute("disabled", "true");
        wrapThemGV.title = message;
        wrapSuaGV.title = message;
    }

    if (selectedRow) {
        btnXoaGV.removeAttribute("disabled");
        wrapXoaGV.removeAttribute("title");
    } else {
        btnXoaGV.setAttribute("disabled", "true");
        wrapXoaGV.title = "Vui lòng chọn giáo viên cần xóa";
    }
}

function updateSaveButtonState() {
    const btnGhiGV = document.getElementById("btnGhiGV");
    const wrapGhiGV = document.getElementById("wrapGhiGV");
    const hasChanges = (newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0);

    if (hasChanges) {
        btnGhiGV.removeAttribute("disabled");
        wrapGhiGV.removeAttribute("title");
    } else {
        btnGhiGV.setAttribute("disabled", "true");
        wrapGhiGV.title = "Không có thay đổi nào cần lưu.";
    }
}

function updateUndoRedoButtonStates() {
    const btnUndo = document.getElementById("btnUndoGV");
    const btnRedo = document.getElementById("btnRedoGV");
    if (btnUndo) {
        btnUndo.disabled = undoHistoryStack.length === 0;
    }
    if (btnRedo) {
        btnRedo.disabled = redoHistoryStack.length === 0;
    }
}

function updateSTT() {
    const rows = Array.from(document.querySelectorAll("#gvTable tr:not(.search-hidden)"));
    const lblCount = document.getElementById("lblCount");
    if (lblCount) {
        lblCount.textContent = rows.length;
    }
    updatePagination();
}

// --- Pagination Operations ---
function updatePagination() {
    const rows = Array.from(document.querySelectorAll("#gvTable tr:not(.search-hidden)"));
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

    const allRows = Array.from(document.querySelectorAll("#gvTable tr"));
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

// --- Excel Export/Import Systems ---
function exportExcel() {
    const rows = [["Mã GV", "Họ", "Tên", "Số ĐT", "Địa chỉ"]];
    
    document.querySelectorAll("#gvTable tr").forEach(tr => {
        rows.push([
            tr.dataset.magv,
            tr.dataset.ho,
            tr.dataset.ten,
            tr.dataset.sdt,
            tr.dataset.diachi
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 30 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GiaoVien");
    XLSX.writeFile(wb, "DanhSach_GiaoVien.xlsx");
}

function downloadTemplate() {
    const rows = [
        ["Mã GV", "Họ", "Tên", "Số ĐT", "Địa chỉ"],
        ["GV001", "Trần Văn", "Thế", "0901234567", "96 Hoàng Diệu, Đà Nẵng"],
        ["GV002", "Nguyễn Thị", "Thảo", "0912345678", "214 Điện Biên Phủ, Đà Nẵng"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 30 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_GiaoVien");
    XLSX.writeFile(wb, "Template_GiaoVien.xlsx");
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

    const rows = rawData.filter(r => r.some(cell => cell.toString().trim() !== ""));
    if (rows.length === 0) {
        showImportFileError("File Excel không có dữ liệu.");
        return;
    }

    const headerRow = rows[0];
    if (headerRow.length < 5) {
        showImportFileError("Cấu trúc cột không hợp lệ. File Excel phải có 5 cột: Mã GV, Họ, Tên, Số ĐT, Địa chỉ.");
        return;
    }

    const col1 = normalizeHeader(headerRow[0]);
    const col2 = normalizeHeader(headerRow[1]);
    const col3 = normalizeHeader(headerRow[2]);
    const col4 = normalizeHeader(headerRow[3]);
    const col5 = normalizeHeader(headerRow[4]);

    const validCol1 = (col1 === "ma gv" || col1 === "magv");
    const validCol2 = (col2 === "ho");
    const validCol3 = (col3 === "ten");
    const validCol4 = (col4 === "so dt" || col4 === "sodt" || col4 === "so dt liên lac" || col4 === "sodtll");
    const validCol5 = (col5 === "dia chi" || col5 === "diachi");

    if (!validCol1 || !validCol2 || !validCol3 || !validCol4 || !validCol5) {
        showImportFileError("Cấu trúc cột không hợp lệ. Vui lòng tải file mẫu để kiểm tra thứ tự cột.");
        return;
    }

    const dataRows = rows.slice(1);
    if (dataRows.length === 0) {
        showImportFileError("Không tìm thấy dòng dữ liệu nào dưới hàng tiêu đề.");
        return;
    }

    let processedRows = [];
    let fileMaGVSet = new Set();

    const currentTableIds = new Set();
    document.querySelectorAll("#gvTable tr").forEach(tr => {
        if (tr.dataset.magv) {
            currentTableIds.add(tr.dataset.magv.trim().toUpperCase());
        }
    });

    dataRows.forEach((row, idx) => {
        const maGV = row[0]?.toString().trim() ?? "";
        const ho = row[1]?.toString().trim() ?? "";
        const ten = row[2]?.toString().trim() ?? "";
        const soDTLL = row[3]?.toString().trim() ?? "";
        const diaChi = row[4]?.toString().trim() ?? "";
        const rowNum = idx + 2;

        let error = "";

        if (maGV === "") {
            error = "Mã GV trống";
        } else if (ho === "") {
            error = "Họ trống";
        } else if (ten === "") {
            error = "Tên trống";
        } else if (maGV.length > 8) {
            error = "Mã GV tối đa 8 ký tự";
        } else if (ho.length > 50) {
            error = "Họ tối đa 50 ký tự";
        } else if (ten.length > 10) {
            error = "Tên tối đa 10 ký tự";
        } else if (soDTLL.length > 15) {
            error = "Số ĐT tối đa 15 ký tự";
        } else if (diaChi.length > 40) {
            error = "Địa chỉ tối đa 40 ký tự";
        } else {
            const idUpper = maGV.toUpperCase();

            if (fileMaGVSet.has(idUpper)) {
                error = "Trùng mã GV trong file";
            } else if (currentTableIds.has(idUpper)) {
                error = "Trùng mã GV trên lưới";
            } else {
                fileMaGVSet.add(idUpper);
            }
        }

        processedRows.push({
            index: idx,
            rowNum: rowNum,
            maGV: maGV,
            ho: ho,
            ten: ten,
            soDTLL: soDTLL,
            diaChi: diaChi,
            error: error
        });
    });

    const candidates = processedRows.filter(r => r.error === "");
    if (candidates.length === 0) {
        renderPreview(processedRows);
        return;
    }

    // Call server API check
    fetch('/GiaoVien/CheckImport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidates.map(c => ({ MaGV: c.maGV })))
    })
    .then(res => {
        if (!res.ok) throw new Error("Không thể kiểm tra trùng lặp từ Server.");
        return res.json();
    })
    .then(dbResults => {
        dbResults.forEach(res => {
            const match = processedRows.find(p => p.index === res.index && p.error === "");
            if (match && res.idDuplicate) {
                match.error = "Trùng mã GV trong CSDL";
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
            <td><strong>${row.maGV}</strong></td>
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
            MaGV: r.maGV,
            Ho: r.ho,
            Ten: r.ten,
            SoDTLL: r.soDTLL,
            DiaChi: r.diaChi
        }));
    } else {
        confirmBtn.setAttribute("disabled", "true");
    }
}

function confirmImport() {
    if (currentImportList.length === 0) return;

    pushState();

    const tbody = document.getElementById("gvTable");

    currentImportList.forEach(item => {
        const row = tbody.insertRow();
        row.dataset.magv = item.MaGV;
        row.dataset.ho = item.Ho;
        row.dataset.ten = item.Ten;
        row.dataset.sdt = item.SoDTLL;
        row.dataset.diachi = item.DiaChi;

        row.innerHTML = `
            <td>${item.MaGV}</td>
            <td>${item.Ho}</td>
            <td>${item.Ten}</td>
            <td>${item.SoDTLL}</td>
            <td>${item.DiaChi}</td>
        `;

        newItems.push(item);
    });

    bindRows();
    updateSTT();

    const importModalEl = document.getElementById('importModal');
    const modalBs = bootstrap.Modal.getInstance(importModalEl);
    if (modalBs) modalBs.hide();

    document.getElementById("importFile").value = "";
    document.getElementById("importPreviewSection").style.display = "none";

    hienThongBao(`Đã import thành công <strong>${currentImportList.length}</strong> giáo viên vào danh sách tạm thời. Vui lòng bấm <strong>Ghi</strong> để lưu thay đổi vào CSDL.`, "Thành công");

    updateSaveButtonState();
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
