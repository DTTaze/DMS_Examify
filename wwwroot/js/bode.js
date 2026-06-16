// --- Global State ---
let newItems = [];
let updatedItems = [];
let deletedItems = [];
let undoHistoryStack = [];
let redoHistoryStack = [];
let selectedRow = null;
let tempIdCounter = -1;

let currentPage = 1;
let rowsPerPage = 10;
let customModalBs = null;

// --- Lifecycle and Initialization ---
window.onload = () => {
    bindRows();

    // Form inputs validation event listeners
    document.getElementById("selMaMH").addEventListener("change", validateQuestionInputs);
    document.getElementById("selTrinhDo").addEventListener("change", validateQuestionInputs);
    document.getElementById("txtNoiDung").addEventListener("input", validateQuestionInputs);
    document.getElementById("txtA").addEventListener("input", validateQuestionInputs);
    document.getElementById("txtB").addEventListener("input", validateQuestionInputs);
    document.getElementById("txtC").addEventListener("input", validateQuestionInputs);
    document.getElementById("txtD").addEventListener("input", validateQuestionInputs);
    document.getElementById("selDapAn").addEventListener("change", validateQuestionInputs);
    
    // Live filter search for questions
    const txtSearch = document.getElementById("txtSearch");
    if (txtSearch) {
        txtSearch.addEventListener("input", triggerQuestionSearch);
    }

    validateQuestionInputs();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
    updateSTT();
};

// --- State and Undo/Redo Management ---
function pushState() {
    undoHistoryStack.push({
        html: document.querySelector("#tbl tbody").innerHTML,
        newItems: JSON.parse(JSON.stringify(newItems)),
        updatedItems: JSON.parse(JSON.stringify(updatedItems)),
        deletedItems: JSON.parse(JSON.stringify(deletedItems))
    });
    redoHistoryStack = [];
    updateUndoRedoButtonStates();
}

function undoBD() {
    if (undoHistoryStack.length === 0) return;

    redoHistoryStack.push({
        html: document.querySelector("#tbl tbody").innerHTML,
        newItems: JSON.parse(JSON.stringify(newItems)),
        updatedItems: JSON.parse(JSON.stringify(updatedItems)),
        deletedItems: JSON.parse(JSON.stringify(deletedItems))
    });

    const prev = undoHistoryStack.pop();
    document.querySelector("#tbl tbody").innerHTML = prev.html;
    newItems = prev.newItems;
    updatedItems = prev.updatedItems;
    deletedItems = prev.deletedItems;

    bindRows();
    updateSTT();
    selectedRow = null;
    resetQuestionForm();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
}

function redoBD() {
    if (redoHistoryStack.length === 0) return;

    undoHistoryStack.push({
        html: document.querySelector("#tbl tbody").innerHTML,
        newItems: JSON.parse(JSON.stringify(newItems)),
        updatedItems: JSON.parse(JSON.stringify(updatedItems)),
        deletedItems: JSON.parse(JSON.stringify(deletedItems))
    });

    const next = redoHistoryStack.pop();
    document.querySelector("#tbl tbody").innerHTML = next.html;
    newItems = next.newItems;
    updatedItems = next.updatedItems;
    deletedItems = next.deletedItems;

    bindRows();
    updateSTT();
    selectedRow = null;
    resetQuestionForm();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
}

// --- Form and Input Utilities ---
function getQuestionForm() {
    return {
        MaMH: document.getElementById("selMaMH").value,
        TrinhDo: document.getElementById("selTrinhDo").value,
        NoiDung: document.getElementById("txtNoiDung").value.trim(),
        DapAnA: document.getElementById("txtA").value.trim(),
        DapAnB: document.getElementById("txtB").value.trim(),
        DapAnC: document.getElementById("txtC").value.trim(),
        DapAnD: document.getElementById("txtD").value.trim(),
        DapAn: document.getElementById("selDapAn").value
    };
}

function fillQuestionForm(row) {
    document.getElementById("txtCauHoi").value = row.dataset.id;
    document.getElementById("selMaMH").value = row.dataset.mamh;
    document.getElementById("selTrinhDo").value = row.dataset.trinhdo;
    document.getElementById("txtNoiDung").value = row.dataset.noidung;
    document.getElementById("txtA").value = row.dataset.a;
    document.getElementById("txtB").value = row.dataset.b;
    document.getElementById("txtC").value = row.dataset.c;
    document.getElementById("txtD").value = row.dataset.d;
    document.getElementById("selDapAn").value = row.dataset.dapan;
    validateQuestionInputs();
}

function resetQuestionForm() {
    document.getElementById("txtCauHoi").value = "";
    document.getElementById("txtNoiDung").value = "";
    document.getElementById("txtA").value = "";
    document.getElementById("txtB").value = "";
    document.getElementById("txtC").value = "";
    document.getElementById("txtD").value = "";
    // Retain drop downs select indexes
    selectedRow = null;

    document.querySelectorAll("#tbl tbody tr").forEach(x => x.classList.remove("table-active"));
    validateQuestionInputs();
}

function bindRows() {
    document.querySelectorAll("#tbl tbody tr").forEach(row => {
        row.onclick = () => {
            document.querySelectorAll("#tbl tbody tr").forEach(x => x.classList.remove("table-active"));
            row.classList.add("table-active");
            selectedRow = row;
            fillQuestionForm(row);
        };
    });
}

// --- CRUD Operations ---
function addQuestion() {
    const d = getQuestionForm();
    if (!d.NoiDung || !d.DapAnA || !d.DapAnB || !d.DapAnC || !d.DapAnD) return;

    pushState();

    const id = tempIdCounter--;
    const row = document.querySelector("#tbl tbody").insertRow();
    row.dataset.id = id;
    Object.assign(row.dataset, {
        mamh: d.MaMH,
        trinhdo: d.TrinhDo,
        noidung: d.NoiDung,
        a: d.DapAnA,
        b: d.DapAnB,
        c: d.DapAnC,
        d: d.DapAnD,
        dapan: d.DapAn
    });

    row.innerHTML = `
        <td>...</td>
        <td>${d.NoiDung}</td>
        <td>${d.MaMH}</td>
        <td>${d.TrinhDo}</td>
        <td>${d.DapAn}</td>
    `;

    newItems.push({ CauHoi: id, ...d });

    bindRows();
    updateSTT();
    resetQuestionForm();
    updateSaveButtonState();
}

function editQuestion() {
    if (!selectedRow) return;

    const d = getQuestionForm();
    const id = parseInt(selectedRow.dataset.id);

    pushState();

    selectedRow.innerHTML = `
        <td>${id > 0 ? id : "..."}</td>
        <td>${d.NoiDung}</td>
        <td>${d.MaMH}</td>
        <td>${d.TrinhDo}</td>
        <td>${d.DapAn}</td>
    `;

    Object.assign(selectedRow.dataset, {
        mamh: d.MaMH,
        trinhdo: d.TrinhDo,
        noidung: d.NoiDung,
        a: d.DapAnA,
        b: d.DapAnB,
        c: d.DapAnC,
        d: d.DapAnD,
        dapan: d.DapAn
    });

    if (id < 0) {
        const i = newItems.findIndex(x => x.CauHoi === id);
        if (i >= 0) newItems[i] = { CauHoi: id, ...d };
    } else {
        updatedItems = updatedItems.filter(x => x.CauHoi !== id);
        updatedItems.push({ CauHoi: id, ...d });
    }

    bindRows();
    updateSTT();
    resetQuestionForm();
    updateSaveButtonState();
}

function deleteQuestion() {
    if (!selectedRow) return;

    const id = parseInt(selectedRow.dataset.id);
    const maMH = selectedRow.dataset.mamh;

    hienXacNhan(`Bạn có chắc chắn muốn xóa câu hỏi số <strong>"${id > 0 ? id : 'tạm thời'}"</strong> không?`, () => {
        pushState();

        if (id < 0) {
            newItems = newItems.filter(x => x.CauHoi !== id);
        } else {
            updatedItems = updatedItems.filter(x => x.CauHoi !== id);
            if (!deletedItems.some(x => x.CauHoi === id)) {
                deletedItems.push({ CauHoi: id, MaMH: maMH });
            }
        }

        selectedRow.remove();
        selectedRow = null;

        updateSTT();
        resetQuestionForm();
        updateSaveButtonState();
    });
}

async function saveAll() {
    undoHistoryStack = [];
    redoHistoryStack = [];
    updateUndoRedoButtonStates();

    try {
        // DELETE
        for (const d of deletedItems) {
            const res = await fetch(`/BoDe/Delete?cauHoi=${d.CauHoi}&maMH=${d.MaMH}`, { method: "POST" });
            if (!res.ok) {
                const err = await res.text();
                hienThongBao(`Lỗi khi xóa câu hỏi <strong>${d.CauHoi}</strong>: ${err}`, "Lỗi");
                return;
            }
        }

        // UPDATE
        for (const u of updatedItems) {
            const res = await fetch(`/BoDe/Update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(u)
            });
            if (!res.ok) {
                const err = await res.text();
                hienThongBao(`Lỗi khi sửa câu hỏi <strong>${u.CauHoi}</strong>: ${err}`, "Lỗi");
                return;
            }
        }

        // INSERT
        for (const n of newItems) {
            const res = await fetch(`/BoDe/Insert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(n)
            });
            if (!res.ok) {
                const err = await res.text();
                hienThongBao(`Lỗi khi thêm câu hỏi mới: ${err}`, "Lỗi");
                return;
            }
        }

        hienThongBao("Ghi danh mục câu hỏi thành công!", "Thành công", () => {
            location.reload();
        });
    } catch (e) {
        hienThongBao("Lỗi kết nối khi lưu: " + e.message, "Lỗi");
    }
}

// --- Local Filter Search ---
let searchDebounceTimer = null;

function triggerQuestionSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(executeQuestionSearch, 200);
}

function executeQuestionSearch() {
    const k = document.getElementById("txtSearch").value.toLowerCase().trim();
    const rows = document.querySelectorAll("#tbl tbody tr");

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
function validateQuestionInputs() {
    const d = getQuestionForm();
    const isEditing = selectedRow !== null;

    const btnThem = document.getElementById("btnThem");
    const btnSua = document.getElementById("btnSua");
    const btnXoa = document.getElementById("btnXoa");

    const wrapThem = document.getElementById("wrapThem");
    const wrapSua = document.getElementById("wrapSua");
    const wrapXoa = document.getElementById("wrapXoa");

    let valid = true;
    let message = "";

    if (!d.MaMH) {
        valid = false;
        message = "Vui lòng chọn môn học.";
    } else if (!d.TrinhDo) {
        valid = false;
        message = "Vui lòng chọn trình độ (A, B, C).";
    } else if (!d.NoiDung) {
        valid = false;
        message = "Nội dung câu hỏi không được trống.";
    } else if (!d.DapAnA || !d.DapAnB || !d.DapAnC || !d.DapAnD) {
        valid = false;
        message = "Phương án trả lời A, B, C, D không được rỗng.";
    } else if (d.DapAnA.length > 200 || d.DapAnB.length > 200 || d.DapAnC.length > 200 || d.DapAnD.length > 200) {
        valid = false;
        message = "Các phương án trả lời tối đa 200 ký tự.";
    } else if (!d.DapAn) {
        valid = false;
        message = "Vui lòng chọn đáp án đúng.";
    }

    if (valid) {
        if (isEditing) {
            btnThem.setAttribute("disabled", "true");
            wrapThem.title = "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)";
            btnSua.removeAttribute("disabled");
            wrapSua.removeAttribute("title");
        } else {
            btnThem.removeAttribute("disabled");
            wrapThem.removeAttribute("title");
            btnSua.setAttribute("disabled", "true");
            wrapSua.title = "Vui lòng chọn câu hỏi trên lưới để hiệu chỉnh";
        }
    } else {
        btnThem.setAttribute("disabled", "true");
        btnSua.setAttribute("disabled", "true");
        wrapThem.title = message;
        wrapSua.title = message;
    }

    if (selectedRow) {
        btnXoa.removeAttribute("disabled");
        wrapXoa.removeAttribute("title");
    } else {
        btnXoa.setAttribute("disabled", "true");
        wrapXoa.title = "Vui lòng chọn câu hỏi cần xóa";
    }
}

function updateSaveButtonState() {
    const btnGhi = document.getElementById("btnGhi");
    const wrapGhi = document.getElementById("wrapGhi");
    const hasChanges = (newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0);

    if (hasChanges) {
        btnGhi.removeAttribute("disabled");
        wrapGhi.removeAttribute("title");
    } else {
        btnGhi.setAttribute("disabled", "true");
        wrapGhi.title = "Không có thay đổi nào cần lưu.";
    }
}

function updateUndoRedoButtonStates() {
    const btnUndo = document.getElementById("btnUndo");
    const btnRedo = document.getElementById("btnRedo");
    if (btnUndo) {
        btnUndo.disabled = undoHistoryStack.length === 0;
    }
    if (btnRedo) {
        btnRedo.disabled = redoHistoryStack.length === 0;
    }
}

function updateSTT() {
    const rows = Array.from(document.querySelectorAll("#tbl tbody tr:not(.search-hidden)"));
    const lblCount = document.getElementById("lblCount");
    if (lblCount) {
        lblCount.textContent = rows.length;
    }
    updatePagination();
}

// --- Pagination Operations ---
function updatePagination() {
    const rows = Array.from(document.querySelectorAll("#tbl tbody tr:not(.search-hidden)"));
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

    const allRows = Array.from(document.querySelectorAll("#tbl tbody tr"));
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

        // First button
        const firstLi = document.createElement("li");
        firstLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        firstLi.innerHTML = `<button type="button" class="page-link shadow-none" onclick="changePage(1)" title="Trang đầu"><i class="bi bi-chevron-double-left"></i></button>`;
        ulPagination.appendChild(firstLi);

        // Prev button
        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<button type="button" class="page-link shadow-none" onclick="changePage(${currentPage - 1})" title="Trang trước"><i class="bi bi-chevron-left"></i></button>`;
        ulPagination.appendChild(prevLi);

        // Page numbers and ellipsis
        let pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage <= 4) {
                pages.push(2, 3, 4, 5);
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push("...");
                pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
                pages.push(totalPages);
            } else {
                pages.push("...");
                pages.push(currentPage - 1, currentPage, currentPage + 1);
                pages.push("...");
                pages.push(totalPages);
            }
        }

        pages.forEach(p => {
            const pageLi = document.createElement("li");
            if (p === "...") {
                pageLi.className = "page-item disabled";
                pageLi.innerHTML = `<span class="page-link border-0 bg-transparent text-secondary">...</span>`;
            } else {
                pageLi.className = `page-item ${currentPage === p ? 'active' : ''}`;
                pageLi.innerHTML = `<button type="button" class="page-link shadow-none" onclick="changePage(${p})">${p}</button>`;
            }
            ulPagination.appendChild(pageLi);
        });

        // Next button
        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<button type="button" class="page-link shadow-none" onclick="changePage(${currentPage + 1})" title="Trang sau"><i class="bi bi-chevron-right"></i></button>`;
        ulPagination.appendChild(nextLi);

        // Last button
        const lastLi = document.createElement("li");
        lastLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        lastLi.innerHTML = `<button type="button" class="page-link shadow-none" onclick="changePage(${totalPages})" title="Trang cuối"><i class="bi bi-chevron-double-right"></i></button>`;
        ulPagination.appendChild(lastLi);
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
    const rows = [["Mã môn học", "Trình độ", "Nội dung", "Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D", "Đáp án đúng"]];
    
    document.querySelectorAll("#tbl tbody tr").forEach(tr => {
        rows.push([
            tr.dataset.mamh,
            tr.dataset.trinhdo,
            tr.dataset.noidung,
            tr.dataset.a,
            tr.dataset.b,
            tr.dataset.c,
            tr.dataset.d,
            tr.dataset.dapan
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BoDe");
    XLSX.writeFile(wb, "DanhSach_CauHoi.xlsx");
}

function downloadTemplate() {
    const rows = [
        ["Mã môn học", "Trình độ", "Nội dung", "Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D", "Đáp án đúng"],
        ["CSDL", "A", "Hệ quản trị CSDL nào sau đây là mã nguồn mở?", "SQL Server", "Oracle", "MySQL", "DB2", "C"],
        ["CSDL", "B", "Thuộc tính nào dùng để chỉ định khóa chính trong bảng?", "PRIMARY KEY", "FOREIGN KEY", "UNIQUE", "CHECK", "A"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_BoDe");
    XLSX.writeFile(wb, "Template_BoDe.xlsx");
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
    if (headerRow.length < 8) {
        showImportFileError("Cấu trúc cột không hợp lệ. File Excel phải có 8 cột: Mã môn học, Trình độ, Nội dung, Đáp án A, Đáp án B, Đáp án C, Đáp án D, Đáp án đúng.");
        return;
    }

    const col1 = normalizeHeader(headerRow[0]);
    const col2 = normalizeHeader(headerRow[1]);
    const col3 = normalizeHeader(headerRow[2]);
    const col4 = normalizeHeader(headerRow[3]);
    const col5 = normalizeHeader(headerRow[4]);
    const col6 = normalizeHeader(headerRow[5]);
    const col7 = normalizeHeader(headerRow[6]);
    const col8 = normalizeHeader(headerRow[7]);

    const validCol1 = (col1 === "ma mon hoc" || col1 === "mamonhoc" || col1 === "mamh");
    const validCol2 = (col2 === "trinh do" || col2 === "trinhdo");
    const validCol3 = (col3 === "noi dung" || col3 === "noidung");
    const validCol4 = (col4 === "dap an a" || col4 === "dapana" || col4 === "a");
    const validCol5 = (col5 === "dap an b" || col5 === "dapanb" || col5 === "b");
    const validCol6 = (col6 === "dap an c" || col6 === "dapanc" || col6 === "c");
    const validCol7 = (col7 === "dap an d" || col7 === "dapand" || col7 === "d");
    const validCol8 = (col8 === "dap an dung" || col8 === "dapandung" || col8 === "dap an" || col8 === "dapan");

    if (!validCol1 || !validCol2 || !validCol3 || !validCol4 || !validCol5 || !validCol6 || !validCol7 || !validCol8) {
        showImportFileError("Cấu trúc cột không hợp lệ. Vui lòng tải file mẫu để kiểm tra thứ tự cột.");
        return;
    }

    const dataRows = rows.slice(1);
    if (dataRows.length === 0) {
        showImportFileError("Không tìm thấy dòng dữ liệu nào dưới hàng tiêu đề.");
        return;
    }

    let processedRows = [];

    dataRows.forEach((row, idx) => {
        const maMH = row[0]?.toString().trim().toUpperCase() ?? "";
        const trinhDo = row[1]?.toString().trim().toUpperCase() ?? "";
        const noiDung = row[2]?.toString().trim() ?? "";
        const dapAnA = row[3]?.toString().trim() ?? "";
        const dapAnB = row[4]?.toString().trim() ?? "";
        const dapAnC = row[5]?.toString().trim() ?? "";
        const dapAnD = row[6]?.toString().trim() ?? "";
        const dapAn = row[7]?.toString().trim().toUpperCase() ?? "";
        const rowNum = idx + 2;

        let error = "";

        if (maMH === "") {
            error = "Mã môn học trống";
        } else if (trinhDo === "") {
            error = "Trình độ trống";
        } else if (trinhDo !== "A" && trinhDo !== "B" && trinhDo !== "C") {
            error = "Trình độ phải là A, B, hoặc C";
        } else if (noiDung === "") {
            error = "Nội dung trống";
        } else if (dapAnA === "" || dapAnB === "" || dapAnC === "" || dapAnD === "") {
            error = "Thiếu phương án trả lời";
        } else if (dapAnA.length > 200 || dapAnB.length > 200 || dapAnC.length > 200 || dapAnD.length > 200) {
            error = "Phương án tối đa 200 ký tự";
        } else if (dapAn === "") {
            error = "Đáp án đúng trống";
        } else if (dapAn !== "A" && dapAn !== "B" && dapAn !== "C" && dapAn !== "D") {
            error = "Đáp án đúng phải là A, B, C, hoặc D";
        }

        processedRows.push({
            index: idx,
            rowNum: rowNum,
            maMH: maMH,
            trinhDo: trinhDo,
            noiDung: noiDung,
            dapAnA: dapAnA,
            dapAnB: dapAnB,
            dapAnC: dapAnC,
            dapAnD: dapAnD,
            dapAn: dapAn,
            error: error
        });
    });

    const candidates = processedRows.filter(r => r.error === "");
    if (candidates.length === 0) {
        renderPreview(processedRows);
        return;
    }

    // Call server API check (verifies if the subject exists in the database)
    fetch('/BoDe/CheckImport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidates.map(c => ({ MaMH: c.maMH })))
    })
    .then(res => {
        if (!res.ok) throw new Error("Không thể kiểm tra môn học từ Server.");
        return res.json();
    })
    .then(dbResults => {
        dbResults.forEach(res => {
            const match = processedRows.find(p => p.index === res.index && p.error === "");
            if (match && !res.subjectExists) {
                match.error = `Môn học "${match.maMH}" không tồn tại`;
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
            <td><strong>${row.maMH} (Lvl ${row.trinhDo})</strong></td>
            <td class="text-truncate" style="max-width: 250px;">${row.noiDung}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });

    summarySpan.textContent = `Tổng: ${processedRows.length} | Hợp lệ: ${successCount} | Lỗi: ${errorCount}`;
    summarySpan.className = errorCount > 0 ? "badge bg-danger rounded-pill px-3 py-1.5" : "badge bg-success rounded-pill px-3 py-1.5";

    if (errorCount === 0 && successCount > 0) {
        confirmBtn.removeAttribute("disabled");
        currentImportList = processedRows.map(r => ({
            MaMH: r.maMH,
            TrinhDo: r.trinhDo,
            NoiDung: r.noiDung,
            DapAnA: r.dapAnA,
            DapAnB: r.dapAnB,
            DapAnC: r.dapAnC,
            DapAnD: r.dapAnD,
            DapAn: r.dapAn
        }));
    } else {
        confirmBtn.setAttribute("disabled", "true");
    }
}

function confirmImport() {
    if (currentImportList.length === 0) return;

    pushState();

    const tbody = document.querySelector("#tbl tbody");

    currentImportList.forEach(item => {
        const id = tempIdCounter--;
        const row = tbody.insertRow();
        row.dataset.id = id;
        Object.assign(row.dataset, {
            mamh: item.MaMH,
            trinhdo: item.TrinhDo,
            noidung: item.NoiDung,
            a: item.DapAnA,
            b: item.DapAnB,
            c: item.DapAnC,
            d: item.DapAnD,
            dapan: item.DapAn
        });

        row.innerHTML = `
            <td>...</td>
            <td>${item.NoiDung}</td>
            <td>${item.MaMH}</td>
            <td>${item.TrinhDo}</td>
            <td>${item.DapAn}</td>
        `;

        newItems.push({ CauHoi: id, ...item });
    });

    bindRows();
    updateSTT();

    const importModalEl = document.getElementById('importModal');
    const modalBs = bootstrap.Modal.getInstance(importModalEl);
    if (modalBs) modalBs.hide();

    document.getElementById("importFile").value = "";
    document.getElementById("importPreviewSection").style.display = "none";

    hienThongBao(`Đã import thành công <strong>${currentImportList.length}</strong> câu hỏi vào danh sách tạm thời. Vui lòng bấm <strong>Ghi</strong> để lưu thay đổi vào CSDL.`, "Thành công");

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
