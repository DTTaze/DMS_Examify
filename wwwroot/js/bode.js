let newItems = [];
let updatedItems = [];
let deletedItems = [];
let undoHistoryStack = [];
let redoHistoryStack = [];
let selectedRow = null;
let tempIdCounter = -1;

let currentPage = 1;
let rowsPerPage = 10;

AppCommon.onReady(() => {
    bindRows();

    ["selMaMH", "selTrinhDo", "txtNoiDung", "txtA", "txtB", "txtC", "txtD", "selDapAn"]
        .forEach(id => {
            const eventName = id.startsWith("sel") ? "change" : "input";
            AppCommon.byId(id).addEventListener(eventName, validateQuestionInputs);
        });

    const txtSearch = AppCommon.byId("txtSearch");
    if (txtSearch) {
        txtSearch.addEventListener("input", triggerQuestionSearch);
    }

    validateQuestionInputs();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
    updateSTT();
});

function pushState() {
    undoHistoryStack.push({
        html: document.querySelector("#tbl tbody").innerHTML,
        newItems: AppCommon.cloneJson(newItems),
        updatedItems: AppCommon.cloneJson(updatedItems),
        deletedItems: AppCommon.cloneJson(deletedItems)
    });
    redoHistoryStack = [];
    updateUndoRedoButtonStates();
}

function undoBD() {
    if (undoHistoryStack.length === 0) return;

    redoHistoryStack.push({
        html: document.querySelector("#tbl tbody").innerHTML,
        newItems: AppCommon.cloneJson(newItems),
        updatedItems: AppCommon.cloneJson(updatedItems),
        deletedItems: AppCommon.cloneJson(deletedItems)
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
        newItems: AppCommon.cloneJson(newItems),
        updatedItems: AppCommon.cloneJson(updatedItems),
        deletedItems: AppCommon.cloneJson(deletedItems)
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

function normalizeQuestionValue(value) {
    return (value ?? "").toString().trim();
}

function hasQuestionFormChanges(row, formData) {
    if (!row) return false;

    return normalizeQuestionValue(formData.MaMH) !== normalizeQuestionValue(row.dataset.mamh)
        || normalizeQuestionValue(formData.TrinhDo) !== normalizeQuestionValue(row.dataset.trinhdo)
        || normalizeQuestionValue(formData.NoiDung) !== normalizeQuestionValue(row.dataset.noidung)
        || normalizeQuestionValue(formData.DapAnA) !== normalizeQuestionValue(row.dataset.a)
        || normalizeQuestionValue(formData.DapAnB) !== normalizeQuestionValue(row.dataset.b)
        || normalizeQuestionValue(formData.DapAnC) !== normalizeQuestionValue(row.dataset.c)
        || normalizeQuestionValue(formData.DapAnD) !== normalizeQuestionValue(row.dataset.d)
        || normalizeQuestionValue(formData.DapAn) !== normalizeQuestionValue(row.dataset.dapan);
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

function clearQuestionFormFields() {
    document.getElementById("txtCauHoi").value = "";
    document.getElementById("txtNoiDung").value = "";
    document.getElementById("txtA").value = "";
    document.getElementById("txtB").value = "";
    document.getElementById("txtC").value = "";
    document.getElementById("txtD").value = "";
}

function resetQuestionForm() {
    clearQuestionFormFields();
    // Retain drop downs select indexes
    selectedRow = null;

    document.querySelectorAll("#tbl tbody tr").forEach(x => x.classList.remove("table-active"));
    validateQuestionInputs();
}

function bindRows() {
    document.querySelectorAll("#tbl tbody tr").forEach(row => {
        row.onclick = (event) => {
            if (event && (event.target.closest('.btn-edit') || event.target.closest('.btn-delete'))) {
                return;
            }
            if (selectedRow) {
                return;
            }
            document.querySelectorAll("#tbl tbody tr").forEach(x => x.classList.remove("table-active"));
            row.classList.add("table-active");
            selectedRow = null;
            validateQuestionInputs();
        };

        const editBtn = row.querySelector(".btn-edit");
        if (editBtn) {
            editBtn.onclick = (event) => {
                if (event) event.stopPropagation();
                document.querySelectorAll("#tbl tbody tr").forEach(x => x.classList.remove("table-active"));
                row.classList.add("table-active");
                selectedRow = row;
                fillQuestionForm(row);
                const txtNoiDung = document.getElementById("txtNoiDung");
                if (txtNoiDung) txtNoiDung.focus();
            };
        }

        const deleteBtn = row.querySelector(".btn-delete");
        if (deleteBtn) {
            deleteBtn.onclick = (event) => {
                if (event) event.stopPropagation();
                document.querySelectorAll("#tbl tbody tr").forEach(x => x.classList.remove("table-active"));
                row.classList.add("table-active");
                selectedRow = row;
                deleteQuestion();
            };
        }
    });
}

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
        <td class="text-truncate" style="max-width: 250px;">${d.NoiDung}</td>
        <td>${d.MaMH}</td>
        <td>${d.TrinhDo}</td>
        <td class="text-center"><span class="badge bg-secondary">${d.DapAn}</span></td>
        <td class="text-center">
            <div class="d-flex gap-2 justify-content-center">
                <button type="button" class="btn btn-link p-0 text-warning btn-edit" title="Sửa">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button type="button" class="btn btn-link p-0 text-danger btn-delete" title="Xóa">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </div>
        </td>
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
        <td class="text-truncate" style="max-width: 250px;">${d.NoiDung}</td>
        <td>${d.MaMH}</td>
        <td>${d.TrinhDo}</td>
        <td class="text-center"><span class="badge bg-secondary">${d.DapAn}</span></td>
        <td class="text-center">
            <div class="d-flex gap-2 justify-content-center">
                <button type="button" class="btn btn-link p-0 text-warning btn-edit" title="Sửa">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button type="button" class="btn btn-link p-0 text-danger btn-delete" title="Xóa">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </div>
        </td>
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

    try {        for (const d of deletedItems) {
            const res = await fetch(`/BoDe/Delete?cauHoi=${d.CauHoi}&maMH=${d.MaMH}`, { method: "POST" });
            if (!res.ok) {
                const err = await res.text();
                hienThongBao(`Lỗi khi xóa câu hỏi <strong>${d.CauHoi}</strong>: ${err}`, "Lỗi");
                return;
            }
        }        for (const u of updatedItems) {
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
        }        for (const n of newItems) {
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

let searchDebounceTimer = null;

function triggerQuestionSearch() {
    searchDebounceTimer = AppCommon.debounce(searchDebounceTimer, executeQuestionSearch, 200);
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

function validateQuestionInputs() {
    const d = getQuestionForm();
    const isEditing = selectedRow !== null;

    const btnThem = document.getElementById("btnThem");
    const btnSua = document.getElementById("btnSua");

    const wrapThem = document.getElementById("wrapThem");
    const wrapSua = document.getElementById("wrapSua");

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
            if (hasQuestionFormChanges(selectedRow, d)) {
                btnSua.removeAttribute("disabled");
                wrapSua.removeAttribute("title");
            } else {
                btnSua.setAttribute("disabled", "true");
                wrapSua.title = "Chưa có thay đổi nào so với câu hỏi gốc.";
            }
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
    checkDuplicateQuestions();
}

function updateSaveButtonState() {
    const hasChanges = newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0;
    AppCommon.setDisabled(
        AppCommon.byId("btnGhi"),
        AppCommon.byId("wrapGhi"),
        !hasChanges,
        "Không có thay đổi nào cần lưu."
    );
}

function updateUndoRedoButtonStates() {
    const btnUndo = document.getElementById("btnUndo");
    const btnRedo = document.getElementById("btnRedo");
    const wrapUndo = document.getElementById("wrapUndo");
    const wrapRedo = document.getElementById("wrapRedo");

    if (btnUndo) {
        const canUndo = undoHistoryStack.length > 0;
        const undoTitle = canUndo ? "Hoàn tác thao tác thay đổi gần nhất." : "Chưa có thao tác nào để hoàn tác.";
        btnUndo.disabled = !canUndo;
        btnUndo.title = undoTitle;
        if (wrapUndo) wrapUndo.title = undoTitle;
    }
    if (btnRedo) {
        const canRedo = redoHistoryStack.length > 0;
        const redoTitle = canRedo ? "Làm lại thao tác vừa hoàn tác." : "Chưa có thao tác nào để làm lại.";
        btnRedo.disabled = !canRedo;
        btnRedo.title = redoTitle;
        if (wrapRedo) wrapRedo.title = redoTitle;
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

function updatePagination() {
    currentPage = AppCommon.renderPagination({
        visibleRowSelector: "#tbl tbody tr:not(.search-hidden)",
        allRowSelector: "#tbl tbody tr",
        currentPage,
        rowsPerPage,
        summaryId: "lblPaginationSummary",
        paginationId: "ulPagination",
        compact: true
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
    fetch('/BoDe/CheckImport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidates.map(c => ({
            MaMH: c.maMH,
            TrinhDo: c.trinhDo,
            NoiDung: c.noiDung,
            DapAnA: c.dapAnA,
            DapAnB: c.dapAnB,
            DapAnC: c.dapAnC,
            DapAnD: c.dapAnD,
            DapAn: c.dapAn
        })))
    })
    .then(res => {
        if (!res.ok) throw new Error("Không thể kiểm tra môn học từ Server.");
        return res.json();
    })
    .then(dbResults => {
        dbResults.forEach((res, resultIndex) => {
            const match = candidates[resultIndex];
            if (match && !res.subjectExists) {
                match.error = `Môn học "${match.maMH}" không tồn tại`;
            } else if (match && res.hasDuplicate) {
                match.error = res.duplicateMessage || "Câu hỏi đã tồn tại trong ngân hàng đề";
            }
        });

        // Check similarity for all candidate rows
        const existingRows = Array.from(document.querySelectorAll("#tbl tbody tr"));
        
        processedRows.forEach((row, i) => {
            if (row.error) return;

            // 1. Compare with existing database questions
            for (let j = 0; j < existingRows.length; j++) {
                const exNoiDung = existingRows[j].dataset.noidung || "";
                const exId = existingRows[j].dataset.id;
                const similarity = SimilarityEngine.calculateSimilarity(row.noiDung, exNoiDung);
                if (similarity >= 0.8) {
                    row.error = `Trùng câu hỏi ${exId > 0 ? exId : 'tạm thời'} (${Math.round(similarity * 100)}%)`;
                    return;
                }
            }

            // 2. Compare with other successfully validated rows in this excel import list (before this index)
            for (let k = 0; k < i; k++) {
                const prevRow = processedRows[k];
                if (prevRow.error) continue;
                
                const similarity = SimilarityEngine.calculateSimilarity(row.noiDung, prevRow.noiDung);
                if (similarity >= 0.8) {
                    row.error = `Trùng với dòng ${prevRow.rowNum} trong file (${Math.round(similarity * 100)}%)`;
                    return;
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
            <td class="text-truncate" style="max-width: 250px;">${item.NoiDung}</td>
            <td>${item.MaMH}</td>
            <td>${item.TrinhDo}</td>
            <td class="text-center"><span class="badge bg-secondary">${item.DapAn}</span></td>
            <td class="text-center">
                <div class="d-flex gap-2 justify-content-center">
                    <button type="button" class="btn btn-link p-0 text-warning btn-edit" title="Sửa">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button type="button" class="btn btn-link p-0 text-danger btn-delete" title="Xóa">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </td>
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


const SimilarityEngine = {
    stripDiacritics(str) {
        if (!str) return "";
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    },

    tokenize(str, removeTone = false) {
        if (!str) return [];
        let normalized = str.toLowerCase();
        if (removeTone) {
            normalized = this.stripDiacritics(normalized);
        }
        normalized = normalized
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        return normalized.split(" ").filter(t => t.length > 0);
    },

    cosine(str1, str2, removeTone = false) {
        const tokens1 = this.tokenize(str1, removeTone);
        const tokens2 = this.tokenize(str2, removeTone);
        if (tokens1.length === 0 || tokens2.length === 0) return 0;

        const freqMap1 = {};
        const freqMap2 = {};
        const allTokens = new Set([...tokens1, ...tokens2]);

        tokens1.forEach(t => freqMap1[t] = (freqMap1[t] || 0) + 1);
        tokens2.forEach(t => freqMap2[t] = (freqMap2[t] || 0) + 1);

        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;

        allTokens.forEach(t => {
            const v1 = freqMap1[t] || 0;
            const v2 = freqMap2[t] || 0;
            dotProduct += v1 * v2;
            mag1 += v1 * v1;
            mag2 += v2 * v2;
        });

        if (mag1 === 0 || mag2 === 0) return 0;
        return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
    },

    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        const simTone = this.cosine(str1, str2, false);
        const simNoTone = this.cosine(str1, str2, true);
        return Math.max(simTone, simNoTone);
    }
};

function checkDuplicateQuestions() {
    const inputVal = document.getElementById("txtNoiDung").value.trim();
    const warningPanel = document.getElementById("duplicateWarningPanel");
    const warningList = document.getElementById("duplicateWarningList");
    const warningCount = document.getElementById("duplicateWarningCount");

    if (!warningPanel || !warningList || !warningCount) return;

    if (inputVal.length < 5) {
        warningPanel.style.display = "none";
        warningList.innerHTML = "";
        return;
    }

    const currentId = selectedRow ? parseInt(selectedRow.dataset.id) : null;
    const duplicates = [];

    const rows = Array.from(document.querySelectorAll("#tbl tbody tr"));
    rows.forEach(r => {
        const id = parseInt(r.dataset.id);
        if (currentId !== null && id === currentId) {
            return;
        }

        const noiDung = r.dataset.noidung || "";
        if (!noiDung) return;

        const similarity = SimilarityEngine.calculateSimilarity(inputVal, noiDung);
        if (similarity >= 0.7) {
            duplicates.push({
                id: id,
                noiDung: noiDung,
                similarity: similarity
            });
        }
    });

    duplicates.sort((a, b) => b.similarity - a.similarity);

    if (duplicates.length === 0) {
        warningPanel.style.display = "none";
        warningList.innerHTML = "";
        return;
    }

    warningCount.textContent = `${duplicates.length} trùng`;
    warningList.innerHTML = "";

    duplicates.slice(0, 5).forEach(dup => {
        const percentage = Math.round(dup.similarity * 100);
        let badgeClass = "bg-warning text-dark";
        let badgeText = "Trùng vừa";

        if (percentage >= 85) {
            badgeClass = "bg-danger text-white";
            badgeText = "Trùng rất cao";
        } else if (percentage >= 70) {
            badgeClass = "bg-orange text-white";
            badgeText = "Trùng cao";
        }

        const item = document.createElement("div");
        item.className = "duplicate-item p-2 border-bottom border-light rounded d-flex justify-content-between align-items-center bg-white shadow-sm";
        item.onclick = () => navigateToQuestionRow(dup.id);
        
        const badgeStyle = percentage >= 70 && percentage < 85 ? 'style="background-color: #fd7e14; color: white;"' : '';

        item.innerHTML = `
            <div class="text-start pe-2" style="max-width: 78%;">
                <div class="small fw-semibold text-primary">Câu ${dup.id > 0 ? dup.id : 'tạm thời'}</div>
                <div class="small text-truncate text-secondary" style="max-width: 100%;" title="${dup.noiDung.replace(/"/g, '&quot;')}">${dup.noiDung}</div>
            </div>
            <div class="text-end">
                <span class="badge ${badgeClass} rounded-pill" ${badgeStyle} style="font-size: 0.7rem;">${percentage}% - ${badgeText}</span>
            </div>
        `;
        warningList.appendChild(item);
    });

    warningPanel.style.display = "block";
}

function navigateToQuestionRow(targetId) {
    const rows = Array.from(document.querySelectorAll("#tbl tbody tr:not(.search-hidden)"));
    const idx = rows.findIndex(r => parseInt(r.dataset.id) === parseInt(targetId));
    if (idx >= 0) {
        const page = Math.floor(idx / rowsPerPage) + 1;
        currentPage = page;
        updatePagination();

        const targetRow = rows[idx];
        document.querySelectorAll("#tbl tbody tr").forEach(x => x.classList.remove("table-active"));
        targetRow.classList.add("table-active");
        selectedRow = targetRow;
        fillQuestionForm(targetRow);

        targetRow.classList.remove("row-highlight-pulse");
        void targetRow.offsetWidth;
        targetRow.classList.add("row-highlight-pulse");

        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        const txtSearch = document.getElementById("txtSearch");
        if (txtSearch && txtSearch.value) {
            txtSearch.value = "";
            executeQuestionSearch();
            navigateToQuestionRow(targetId);
        }
    }
}
