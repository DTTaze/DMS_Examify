let newItems = [];
let updatedItems = [];
let deletedItems = [];
let undoHistoryStack = [];
let redoHistoryStack = [];
let selectedRow = null;

let currentPage = 1;
let rowsPerPage = 10;
let teacherDebounceTimer = null;

AppCommon.onReady(() => {
    bindRows();

    ["txtMaGV", "txtHoGV", "txtTenGV", "txtSoDTLL", "txtDiaChiGV"]
        .forEach(id => AppCommon.byId(id).addEventListener("input", validateGiaoVienInputs));

    const txtSearchGV = AppCommon.byId("txtSearchGV");
    if (txtSearchGV) {
        txtSearchGV.addEventListener("input", triggerGiaoVienSearch);
    }

    validateGiaoVienInputs();
    updateSaveButtonState();
    updateUndoRedoButtonStates();
    updateSTT();
});

function pushState() {
    undoHistoryStack.push({
        html: document.getElementById("gvTable").innerHTML,
        newItems: AppCommon.cloneJson(newItems),
        updatedItems: AppCommon.cloneJson(updatedItems),
        deletedItems: AppCommon.cloneJson(deletedItems)
    });
    redoHistoryStack = [];
    updateUndoRedoButtonStates();
}

function undoGV() {
    if (undoHistoryStack.length === 0) return;

    redoHistoryStack.push({
        html: document.getElementById("gvTable").innerHTML,
        newItems: AppCommon.cloneJson(newItems),
        updatedItems: AppCommon.cloneJson(updatedItems),
        deletedItems: AppCommon.cloneJson(deletedItems)
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
        newItems: AppCommon.cloneJson(newItems),
        updatedItems: AppCommon.cloneJson(updatedItems),
        deletedItems: AppCommon.cloneJson(deletedItems)
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
    selectedRow = null;    const fields = ["txtMaGV", "txtHoGV", "txtTenGV", "txtSoDTLL", "txtDiaChiGV"];
    fields.forEach(f => document.getElementById(f).classList.remove("is-invalid"));
    
    const errors = ["errMaGV", "errHoGV", "errTenGV", "errSoDTLL", "errDiaChiGV"];
    errors.forEach(e => document.getElementById(e).textContent = "");

    document.querySelectorAll("#gvTable tr").forEach(x => x.classList.remove("table-active"));
    validateGiaoVienInputs();
}

function bindRows() {
    document.querySelectorAll("#gvTable tr").forEach(row => {
        const editBtn = row.querySelector(".btn-edit");
        if (editBtn) {
            editBtn.onclick = (event) => {
                if (event) event.stopPropagation();
                if (AppCommon.isPendingDelete(row)) {
                    hienThongBao("Dòng này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
                    return;
                }
                document.querySelectorAll("#gvTable tr").forEach(x => x.classList.remove("table-active"));
                row.classList.add("table-active");
                selectedRow = row;
                fillGiaoVienForm(row);
                const txtHo = document.getElementById("txtHoGV");
                if (txtHo) txtHo.focus();
            };
        }

        const deleteBtn = row.querySelector(".btn-delete");
        if (deleteBtn) {
            deleteBtn.onclick = (event) => {
                if (event) event.stopPropagation();
                if (AppCommon.isPendingDelete(row)) {
                    hienThongBao("Giáo viên này đã được đánh dấu chờ xóa.", "Thông báo");
                    return;
                }
                document.querySelectorAll("#gvTable tr").forEach(x => x.classList.remove("table-active"));
                row.classList.add("table-active");
                selectedRow = row;
                xoaGV();
            };
        }
    });
}

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
    AppCommon.setChangeState(row, "new");

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
        ho: d.Ho,
        ten: d.Ten,
        sdt: d.SoDTLL,
        diachi: d.DiaChi
    });

    const newIdx = newItems.findIndex(x => x.MaGV === id);
    if (newIdx >= 0) {
        newItems[newIdx] = d;
        AppCommon.setChangeState(selectedRow, "new");
    } else {
        updatedItems = updatedItems.filter(x => x.MaGV !== id);
        updatedItems.push(d);
        AppCommon.setChangeState(selectedRow, "updated");
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

        if (newIdx >= 0) {
            selectedRow.remove();
        } else {
            AppCommon.setChangeState(selectedRow, "deleted");
        }
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

    try {        for (const ma of deletedItems) {
            const res = await fetch(`/GiaoVien/Delete?maGV=${ma}`, { method: "POST" });
            if (!res.ok) {
                const err = await res.text();
                hienThongBao(`Lỗi khi xóa giáo viên <strong>${ma}</strong>: ${err}`, "Lỗi");
                return;
            }
        }        for (const u of updatedItems) {
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
        }        for (const n of newItems) {
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

let searchDebounceTimer = null;

function triggerGiaoVienSearch() {
    searchDebounceTimer = AppCommon.debounce(searchDebounceTimer, executeGiaoVienSearch, 200);
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

function validateGiaoVienInputs() {
    const d = getGiaoVienForm();
    const isEditing = document.getElementById("txtMaGV").disabled;

    const btnThemGV = document.getElementById("btnThemGV");
    const btnSuaGV = document.getElementById("btnSuaGV");

    const wrapThemGV = document.getElementById("wrapThemGV");
    const wrapSuaGV = document.getElementById("wrapSuaGV");

    const txtMaGV = document.getElementById("txtMaGV");
    const txtHoGV = document.getElementById("txtHoGV");
    const txtTenGV = document.getElementById("txtTenGV");
    const txtSoDTLL = document.getElementById("txtSoDTLL");
    const txtDiaChiGV = document.getElementById("txtDiaChiGV");

    const errMaGV = document.getElementById("errMaGV");
    const errHoGV = document.getElementById("errHoGV");
    const errTenGV = document.getElementById("errTenGV");
    const errSoDTLL = document.getElementById("errSoDTLL");
    const errDiaChiGV = document.getElementById("errDiaChiGV");    errMaGV.textContent = "";
    errHoGV.textContent = "";
    errTenGV.textContent = "";
    errSoDTLL.textContent = "";
    errDiaChiGV.textContent = "";

    txtMaGV.classList.remove("is-invalid");
    txtHoGV.classList.remove("is-invalid");
    txtTenGV.classList.remove("is-invalid");
    txtSoDTLL.classList.remove("is-invalid");
    txtDiaChiGV.classList.remove("is-invalid");    if (isEditing && selectedRow) {
        const hasChanges = (
            d.Ho !== (selectedRow.dataset.ho || "").trim() ||
            d.Ten !== (selectedRow.dataset.ten || "").trim() ||
            d.SoDTLL !== (selectedRow.dataset.sdt || "").trim() ||
            d.DiaChi !== (selectedRow.dataset.diachi || "").trim()
        );
        if (!hasChanges) {
            updateTeacherButtonStates(
                true, "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)",
                true, "Vui lòng thay đổi thông tin giáo viên trước khi lưu hiệu chỉnh."
            );
            return;
        }
    }

    let hasClientError = false;    if (!d.MaGV) {
        hasClientError = true;
    } else if (d.MaGV.length > 8) {
        errMaGV.textContent = "Mã giáo viên tối đa 8 ký tự.";
        txtMaGV.classList.add("is-invalid");
        hasClientError = true;
    }    if (!d.Ho) {
        hasClientError = true;
    } else if (d.Ho.length > 50) {
        errHoGV.textContent = "Họ tối đa 50 ký tự.";
        txtHoGV.classList.add("is-invalid");
        hasClientError = true;
    }    if (!d.Ten) {
        hasClientError = true;
    } else if (d.Ten.length > 10) {
        errTenGV.textContent = "Tên tối đa 10 ký tự.";
        txtTenGV.classList.add("is-invalid");
        hasClientError = true;
    }    if (d.SoDTLL && d.SoDTLL.length > 15) {
        errSoDTLL.textContent = "Số điện thoại tối đa 15 ký tự.";
        txtSoDTLL.classList.add("is-invalid");
        hasClientError = true;
    }    if (d.DiaChi && d.DiaChi.length > 40) {
        errDiaChiGV.textContent = "Địa chỉ tối đa 40 ký tự.";
        txtDiaChiGV.classList.add("is-invalid");
        hasClientError = true;
    }

    if (hasClientError) {
        let reasonThem = isEditing ? "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)" : "Thông tin giáo viên nhập không hợp lệ.";
        let reasonSua = isEditing ? "Thông tin giáo viên nhập không hợp lệ." : "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh";
        updateTeacherButtonStates(true, reasonThem, true, reasonSua);
        return;
    }    if (!isEditing) {
        const exists = [...document.querySelectorAll("#gvTable tr")]
            .some(r => !AppCommon.isPendingDelete(r) && r.dataset.magv === d.MaGV);
        if (exists) {
            errMaGV.textContent = "Mã GV này đã trùng trong danh sách tạm thời.";
            txtMaGV.classList.add("is-invalid");
            updateTeacherButtonStates(
                true, "Mã GV bị trùng lặp trên danh sách tạm thời.",
                true, "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh"
            );
            return;
        }
    }

    // Debounce CSDL duplicate validation for MaGV (only if adding)
    if (!isEditing) {
        clearTimeout(teacherDebounceTimer);
        updateTeacherButtonStates(
            true, "Đang kiểm tra trùng lặp từ cơ sở dữ liệu...",
            true, "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh"
        );

        teacherDebounceTimer = setTimeout(() => {
            const checkUrl = `/GiaoVien/CheckDuplicateForCreate?maGV=${encodeURIComponent(d.MaGV)}`;

            fetch(checkUrl)
                .then(res => {
                    if (!res.ok) throw new Error("Lỗi HTTP");
                    return res.json();
                })
                .then(status => {
                    if (status.maGVDuplicate) {
                        txtMaGV.classList.add("is-invalid");
                        errMaGV.textContent = "Mã GV này đã tồn tại trong CSDL.";
                        updateTeacherButtonStates(
                            true, "Mã GV đã tồn tại trong CSDL.",
                            true, "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh"
                        );
                    } else {                        updateTeacherButtonStates(false, "", true, "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh");
                    }
                })
                .catch(error => {
                    console.error("Lỗi kiểm tra trùng GV:", error);
                    updateTeacherButtonStates(false, "", true, "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh");
                });
        }, 250);
    } else {        updateTeacherButtonStates(true, "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)", false, "");
    }
}

function updateTeacherButtonStates(disableThem, reasonThem, disableSua, reasonSua) {
    AppCommon.setDisabled(AppCommon.byId("btnThemGV"), AppCommon.byId("wrapThemGV"), disableThem, reasonThem);
    AppCommon.setDisabled(AppCommon.byId("btnSuaGV"), AppCommon.byId("wrapSuaGV"), disableSua, reasonSua);
}

function updateSaveButtonState() {
    const hasChanges = newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0;
    AppCommon.setDisabled(
        AppCommon.byId("btnGhiGV"),
        AppCommon.byId("wrapGhiGV"),
        !hasChanges,
        "Không có thay đổi nào cần lưu."
    );
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

function updatePagination() {
    currentPage = AppCommon.renderPagination({
        visibleRowSelector: "#gvTable tr:not(.search-hidden)",
        allRowSelector: "#gvTable tr",
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
    const rows = [["Mã GV", "Họ", "Tên", "Số ĐT", "Địa chỉ"]];
    
    document.querySelectorAll("#gvTable tr").forEach(tr => {
        if (AppCommon.isPendingDelete(tr)) {
            return;
        }
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
        if (!AppCommon.isPendingDelete(tr) && tr.dataset.magv) {
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
    }    fetch('/GiaoVien/CheckImport', {
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
        AppCommon.setChangeState(row, "new");

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


