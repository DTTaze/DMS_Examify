(function (window, AppCommon) {
    "use strict";

    // State Variables
    let newItems = [];
    let updatedItems = [];
    let deletedItems = [];
    let undoHistoryStack = [];
    let redoHistoryStack = [];
    let selectedRow = null;

    let currentPage = 1;
    let rowsPerPage = 10;
    let teacherDebounceTimer = null;

    function hasTeacherDependencies(row) {
        return row?.dataset.hasDependencies === "true";
    }

    function getDeleteButtonHtml(hasDependencies) {
        const disabledAttr = hasDependencies ? "disabled" : "";
        const title = hasDependencies ? "Khong the xoa vi giao vien da co lien ket" : "Xoa";
        const textClass = hasDependencies ? "text-muted" : "text-danger";

        return `
            <button type="button" class="btn btn-link p-0 ${textClass} btn-delete" title="${title}" ${disabledAttr}>
                <i class="bi bi-trash-fill"></i>
            </button>`;
    }

    // DOM Elements Cache
    const dom = {
        txtMaGV: null,
        txtHoGV: null,
        txtTenGV: null,
        txtSoDTLL: null,
        txtDiaChiGV: null,
        errMaGV: null,
        errHoGV: null,
        errTenGV: null,
        errSoDTLL: null,
        errDiaChiGV: null,
        txtSearchGV: null,
        gvTable: null,
        lblCount: null,
        btnThemGV: null,
        btnSuaGV: null,
        wrapThemGV: null,
        wrapSuaGV: null,
        btnUndoGV: null,
        btnRedoGV: null,
        btnGhiGV: null,
        wrapGhiGV: null,
        importFile: null,
        importFileFeedback: null,
        importPreviewSection: null,
        tblImportPreview: null,
        btnConfirmImport: null,
        importSummary: null,
        lblPaginationSummary: null,
        ulPagination: null
    };

    AppCommon.onReady(() => {
        // Cache DOM elements
        dom.txtMaGV = AppCommon.byId("txtMaGV");
        dom.txtHoGV = AppCommon.byId("txtHoGV");
        dom.txtTenGV = AppCommon.byId("txtTenGV");
        dom.txtSoDTLL = AppCommon.byId("txtSoDTLL");
        dom.txtDiaChiGV = AppCommon.byId("txtDiaChiGV");
        dom.errMaGV = AppCommon.byId("errMaGV");
        dom.errHoGV = AppCommon.byId("errHoGV");
        dom.errTenGV = AppCommon.byId("errTenGV");
        dom.errSoDTLL = AppCommon.byId("errSoDTLL");
        dom.errDiaChiGV = AppCommon.byId("errDiaChiGV");
        dom.txtSearchGV = AppCommon.byId("txtSearchGV");
        dom.gvTable = AppCommon.byId("gvTable");
        dom.lblCount = AppCommon.byId("lblCount");
        dom.btnThemGV = AppCommon.byId("btnThemGV");
        dom.btnSuaGV = AppCommon.byId("btnSuaGV");
        dom.wrapThemGV = AppCommon.byId("wrapThemGV");
        dom.wrapSuaGV = AppCommon.byId("wrapSuaGV");
        dom.btnUndoGV = AppCommon.byId("btnUndoGV");
        dom.btnRedoGV = AppCommon.byId("btnRedoGV");
        dom.btnGhiGV = AppCommon.byId("btnGhiGV");
        dom.wrapGhiGV = AppCommon.byId("wrapGhiGV");
        dom.importFile = AppCommon.byId("importFile");
        dom.importFileFeedback = AppCommon.byId("importFileFeedback");
        dom.importPreviewSection = AppCommon.byId("importPreviewSection");
        dom.tblImportPreview = AppCommon.byId("tblImportPreview");
        dom.btnConfirmImport = AppCommon.byId("btnConfirmImport");
        dom.importSummary = AppCommon.byId("importSummary");
        dom.lblPaginationSummary = AppCommon.byId("lblPaginationSummary");
        dom.ulPagination = AppCommon.byId("ulPagination");

        // Event listeners
        ["txtMaGV", "txtHoGV", "txtTenGV", "txtSoDTLL", "txtDiaChiGV"]
            .forEach(id => {
                const element = AppCommon.byId(id);
                if (element) {
                    element.addEventListener("input", validateGiaoVienInputs);
                }
            });

        if (dom.txtSearchGV) {
            dom.txtSearchGV.addEventListener("input", triggerGiaoVienSearch);
        }

        bindRows();
        validateGiaoVienInputs();
        updateSaveButtonState();
        updateUndoRedoButtonStates();
        updateSTT();
    });

    function pushState() {
        undoHistoryStack.push({
            html: dom.gvTable.innerHTML,
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
            html: dom.gvTable.innerHTML,
            newItems: AppCommon.cloneJson(newItems),
            updatedItems: AppCommon.cloneJson(updatedItems),
            deletedItems: AppCommon.cloneJson(deletedItems)
        });

        const prev = undoHistoryStack.pop();
        dom.gvTable.innerHTML = prev.html;
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
            html: dom.gvTable.innerHTML,
            newItems: AppCommon.cloneJson(newItems),
            updatedItems: AppCommon.cloneJson(updatedItems),
            deletedItems: AppCommon.cloneJson(deletedItems)
        });

        const next = redoHistoryStack.pop();
        dom.gvTable.innerHTML = next.html;
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
            MaGV: dom.txtMaGV.value.trim().toUpperCase(),
            Ho: dom.txtHoGV.value.trim(),
            Ten: dom.txtTenGV.value.trim(),
            SoDTLL: dom.txtSoDTLL.value.trim(),
            DiaChi: dom.txtDiaChiGV.value.trim()
        };
    }

    function fillGiaoVienForm(row) {
        dom.txtMaGV.value = row.dataset.magv;
        dom.txtHoGV.value = row.dataset.ho;
        dom.txtTenGV.value = row.dataset.ten;
        dom.txtSoDTLL.value = row.dataset.sdt || "";
        dom.txtDiaChiGV.value = row.dataset.diachi || "";
        dom.txtMaGV.disabled = true;
        validateGiaoVienInputs();
    }

    function resetGiaoVienForm() {
        dom.txtMaGV.value = "";
        dom.txtHoGV.value = "";
        dom.txtTenGV.value = "";
        dom.txtSoDTLL.value = "";
        dom.txtDiaChiGV.value = "";
        dom.txtMaGV.disabled = false;
        selectedRow = null;

        const fields = ["txtMaGV", "txtHoGV", "txtTenGV", "txtSoDTLL", "txtDiaChiGV"];
        fields.forEach(f => dom[f]?.classList.remove("is-invalid"));
        
        const errors = ["errMaGV", "errHoGV", "errTenGV", "errSoDTLL", "errDiaChiGV"];
        errors.forEach(e => {
            const errorElement = dom[e] || AppCommon.byId(e);
            if (errorElement) errorElement.textContent = "";
        });

        dom.gvTable.querySelectorAll("tr").forEach(x => x.classList.remove("table-active"));
        validateGiaoVienInputs();
    }

    function bindRows() {
        dom.gvTable.querySelectorAll("tr").forEach(row => {
            const editBtn = row.querySelector(".btn-edit");
            if (editBtn) {
                editBtn.onclick = (event) => {
                    if (event) event.stopPropagation();
                    if (AppCommon.isPendingDelete(row)) {
                        window.hienThongBao("Dòng này đang chờ xóa. Dùng Undo nếu muốn hủy thao tác xóa.", "Thông báo");
                        return;
                    }
                    dom.gvTable.querySelectorAll("tr").forEach(x => x.classList.remove("table-active"));
                    row.classList.add("table-active");
                    selectedRow = row;
                    fillGiaoVienForm(row);
                    if (dom.txtHoGV) dom.txtHoGV.focus();
                };
            }

            const deleteBtn = row.querySelector(".btn-delete");
            if (deleteBtn) {
                deleteBtn.onclick = (event) => {
                    if (event) event.stopPropagation();
                    if (AppCommon.isPendingDelete(row)) {
                        window.hienThongBao("Giáo viên này đã được đánh dấu chờ xóa.", "Thông báo");
                        return;
                    }
                    dom.gvTable.querySelectorAll("tr").forEach(x => x.classList.remove("table-active"));
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

        const row = dom.gvTable.insertRow();
        row.dataset.magv = d.MaGV;
        row.dataset.ho = d.Ho;
        row.dataset.ten = d.Ten;
        row.dataset.sdt = d.SoDTLL;
        row.dataset.diachi = d.DiaChi;
        row.dataset.originalHo = "";
        row.dataset.originalTen = "";
        row.dataset.originalSdt = "";
        row.dataset.originalDiachi = "";
        row.dataset.id = d.MaGV;
        row.dataset.hasDependencies = "false";

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
                    ${getDeleteButtonHtml(false)}
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

        const oHo = selectedRow.dataset.originalHo !== undefined ? selectedRow.dataset.originalHo : selectedRow.dataset.ho;
        const oTen = selectedRow.dataset.originalTen !== undefined ? selectedRow.dataset.originalTen : selectedRow.dataset.ten;
        const oSdt = selectedRow.dataset.originalSdt !== undefined ? selectedRow.dataset.originalSdt : (selectedRow.dataset.sdt || "");
        const oDiaChi = selectedRow.dataset.originalDiachi !== undefined ? selectedRow.dataset.originalDiachi : (selectedRow.dataset.diachi || "");

        const newIdx = newItems.findIndex(x => x.MaGV === id);
        const isNew = newIdx >= 0;

        const isHoChanged = d.Ho !== oHo;
        const isTenChanged = d.Ten !== oTen;
        const isSdtChanged = d.SoDTLL !== oSdt;
        const isDiaChiChanged = d.DiaChi !== oDiaChi;

        selectedRow.innerHTML = `
            <td>${id}</td>
            <td class="${(!isNew && isHoChanged) ? 'cell-edited' : ''}">
                ${d.Ho}
                ${(!isNew && isHoChanged) ? `<div class="original-val text-muted small mt-1" style="font-size: 0.8rem;">(Gốc: <span class="text-decoration-line-through">${oHo}</span>)</div>` : ''}
            </td>
            <td class="${(!isNew && isTenChanged) ? 'cell-edited' : ''}">
                ${d.Ten}
                ${(!isNew && isTenChanged) ? `<div class="original-val text-muted small mt-1" style="font-size: 0.8rem;">(Gốc: <span class="text-decoration-line-through">${oTen}</span>)</div>` : ''}
            </td>
            <td class="${(!isNew && isSdtChanged) ? 'cell-edited' : ''}">
                ${d.SoDTLL}
                ${(!isNew && isSdtChanged) ? `<div class="original-val text-muted small mt-1" style="font-size: 0.8rem;">(Gốc: <span class="text-decoration-line-through">${oSdt}</span>)</div>` : ''}
            </td>
            <td class="${(!isNew && isDiaChiChanged) ? 'cell-edited' : ''}">
                ${d.DiaChi}
                ${(!isNew && isDiaChiChanged) ? `<div class="original-val text-muted small mt-1" style="font-size: 0.8rem;">(Gốc: <span class="text-decoration-line-through">${oDiaChi}</span>)</div>` : ''}
            </td>
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

        if (isNew) {
            newItems[newIdx] = d;
            AppCommon.setChangeState(selectedRow, "new");
        } else {
            updatedItems = updatedItems.filter(x => x.MaGV !== id);
            const hasChanges = isHoChanged || isTenChanged || isSdtChanged || isDiaChiChanged;
            if (hasChanges) {
                updatedItems.push(d);
                AppCommon.setChangeState(selectedRow, "updated");
            } else {
                AppCommon.setChangeState(selectedRow, null);
            }
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
        const newIdx = newItems.findIndex(x => x.MaGV === id);
        const isNew = newIdx >= 0;

        const performDeleteAction = (message) => {
            window.hienXacNhan(message, () => {
                pushState();

                if (isNew) {
                    newItems = newItems.filter(x => x.MaGV !== id);
                } else {
                    updatedItems = updatedItems.filter(x => x.MaGV !== id);
                    if (!deletedItems.includes(id)) {
                        deletedItems.push(id);
                    }
                }

                if (isNew) {
                    selectedRow.remove();
                } else {
                    AppCommon.setChangeState(selectedRow, "deleted");
                }
                selectedRow = null;

                updateSTT();
                resetGiaoVienForm();
                updateSaveButtonState();
            });
        };

        if (isNew) {
            performDeleteAction(`Bạn có chắc chắn muốn xóa giáo viên tạm thời <strong>"${id} - ${name}"</strong> không?`);
        } else {
            fetch(`/GiaoVien/CheckDelete?maGV=${encodeURIComponent(id)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.isSoftDelete) {
                        window.hienThongBao(`Khong the xoa giang vien <strong>"${id} - ${name}"</strong> vi da co du lieu lien ket.`, "Thong bao");
                        return;
                    }

                    const msg = data.isSoftDelete
                        ? `Giáo viên <strong>"${id} - ${name}"</strong> đã được liên kết trong hệ thống. Hệ thống sẽ <strong>XÓA MỀM</strong> (ngừng hoạt động) để bảo toàn lịch sử. Bạn có chắc chắn muốn xóa không?`
                        : `Giáo viên <strong>"${id} - ${name}"</strong> chưa có liên kết. Hệ thống sẽ <strong>XÓA CỨNG</strong> (xóa vĩnh viễn) khỏi cơ sở dữ liệu. Bạn có chắc chắn muốn xóa không?`;
                    performDeleteAction(msg);
                })
                .catch(err => {
                    console.error("Lỗi khi kiểm tra xóa giáo viên:", err);
                    performDeleteAction(`Bạn có chắc chắn muốn xóa giáo viên <strong>"${id} - ${name}"</strong> không?`);
                });
        }
    }

    async function ghiGV() {
        undoHistoryStack = [];
        redoHistoryStack = [];
        updateUndoRedoButtonStates();

        try {
            for (const ma of deletedItems) {
                const res = await fetch(`/GiaoVien/Delete?maGV=${ma}`, { method: "POST" });
                if (!res.ok) {
                    const err = await res.text();
                    window.hienThongBao(`Lỗi khi xóa giáo viên <strong>${ma}</strong>: ${err}`, "Lỗi");
                    return;
                }
            }
            for (const u of updatedItems) {
                const res = await fetch(`/GiaoVien/Update`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(u)
                });
                if (!res.ok) {
                    const err = await res.text();
                    window.hienThongBao(`Lỗi khi sửa giáo viên <strong>${u.MaGV}</strong>: ${err}`, "Lỗi");
                    return;
                }
            }
            for (const n of newItems) {
                const res = await fetch(`/GiaoVien/Insert`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(n)
                });
                if (!res.ok) {
                    const err = await res.text();
                    window.hienThongBao(`Lỗi khi thêm giáo viên <strong>${n.MaGV}</strong>: ${err}`, "Lỗi");
                    return;
                }
            }

            window.hienThongBao("Ghi danh sách giáo viên thành công!", "Thành công", () => {
                location.reload();
            });
        } catch (e) {
            window.hienThongBao("Lỗi kết nối khi lưu: " + e.message, "Lỗi");
        }
    }

    function triggerGiaoVienSearch() {
        teacherDebounceTimer = AppCommon.debounce(teacherDebounceTimer, executeGiaoVienSearch, 200);
    }

    function executeGiaoVienSearch() {
        const k = dom.txtSearchGV.value.toLowerCase().trim();
        const rows = dom.gvTable.querySelectorAll("tr");

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
        const isEditing = dom.txtMaGV.disabled;

        dom.errMaGV.textContent = "";
        dom.errHoGV.textContent = "";
        dom.errTenGV.textContent = "";
        dom.errSoDTLL.textContent = "";
        dom.errDiaChiGV.textContent = "";

        dom.txtMaGV.classList.remove("is-invalid");
        dom.txtHoGV.classList.remove("is-invalid");
        dom.txtTenGV.classList.remove("is-invalid");
        dom.txtSoDTLL.classList.remove("is-invalid");
        dom.txtDiaChiGV.classList.remove("is-invalid");

        if (isEditing && selectedRow) {
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

        let hasClientError = false;
        if (!d.MaGV) {
            hasClientError = true;
        } else if (d.MaGV.length > 8) {
            dom.errMaGV.textContent = "Mã giáo viên tối đa 8 ký tự.";
            dom.txtMaGV.classList.add("is-invalid");
            hasClientError = true;
        }
        if (!d.Ho) {
            hasClientError = true;
        } else if (d.Ho.length > 50) {
            dom.errHoGV.textContent = "Họ tối đa 50 ký tự.";
            dom.txtHoGV.classList.add("is-invalid");
            hasClientError = true;
        }
        if (!d.Ten) {
            hasClientError = true;
        } else if (d.Ten.length > 10) {
            dom.errTenGV.textContent = "Tên tối đa 10 ký tự.";
            dom.txtTenGV.classList.add("is-invalid");
            hasClientError = true;
        }
        if (d.SoDTLL) {
            const phoneRegex = /^(0[35789]\d{8}|02\d{9})$/;
            if (!phoneRegex.test(d.SoDTLL)) {
                dom.errSoDTLL.textContent = "Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09 với 10 chữ số, hoặc 02 với 11 chữ số).";
                dom.txtSoDTLL.classList.add("is-invalid");
                hasClientError = true;
            }
        }
        if (d.DiaChi && d.DiaChi.length > 40) {
            dom.errDiaChiGV.textContent = "Địa chỉ tối đa 40 ký tự.";
            dom.txtDiaChiGV.classList.add("is-invalid");
            hasClientError = true;
        }

        if (hasClientError) {
            const reasonThem = isEditing ? "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)" : "Thông tin giáo viên nhập không hợp lệ.";
            const reasonSua = isEditing ? "Thông tin giáo viên nhập không hợp lệ." : "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh";
            updateTeacherButtonStates(true, reasonThem, true, reasonSua);
            return;
        }
        if (!isEditing) {
            const exists = [...dom.gvTable.querySelectorAll("tr")]
                .some(r => !AppCommon.isPendingDelete(r) && r.dataset.magv === d.MaGV);
            if (exists) {
                dom.errMaGV.textContent = "Mã GV này đã trùng trong danh sách tạm thời.";
                dom.txtMaGV.classList.add("is-invalid");
                updateTeacherButtonStates(
                    true, "Mã GV bị trùng lặp trên danh sách tạm thời.",
                    true, "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh"
                );
                return;
            }
        }

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
                            dom.txtMaGV.classList.add("is-invalid");
                            dom.errMaGV.textContent = "Mã GV này đã tồn tại trong CSDL.";
                            updateTeacherButtonStates(
                                true, "Mã GV đã tồn tại trong CSDL.",
                                true, "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh"
                            );
                        } else {
                            updateTeacherButtonStates(false, "", true, "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh");
                        }
                    })
                    .catch(error => {
                        console.error("Lỗi kiểm tra trùng GV:", error);
                        updateTeacherButtonStates(false, "", true, "Vui lòng chọn giáo viên trên lưới để hiệu chỉnh");
                    });
            }, 250);
        } else {
            updateTeacherButtonStates(true, "Đang ở chế độ hiệu chỉnh (Reset để thêm mới)", false, "");
        }
    }

    function updateTeacherButtonStates(disableThem, reasonThem, disableSua, reasonSua) {
        AppCommon.setDisabled(dom.btnThemGV, dom.wrapThemGV, disableThem, reasonThem);
        AppCommon.setDisabled(dom.btnSuaGV, dom.wrapSuaGV, disableSua, reasonSua);
    }

    function updateSaveButtonState() {
        const hasChanges = newItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0;
        AppCommon.setDisabled(
            dom.btnGhiGV,
            dom.wrapGhiGV,
            !hasChanges,
            "Không có thay đổi nào cần lưu."
        );
    }

    function updateUndoRedoButtonStates() {
        if (dom.btnUndoGV) {
            dom.btnUndoGV.disabled = undoHistoryStack.length === 0;
        }
        if (dom.btnRedoGV) {
            dom.btnRedoGV.disabled = redoHistoryStack.length === 0;
        }
    }

    function updateSTT() {
        const rows = Array.from(dom.gvTable.querySelectorAll("tr:not(.search-hidden)"));
        if (dom.lblCount) {
            dom.lblCount.textContent = rows.length;
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
        
        dom.gvTable.querySelectorAll("tr").forEach(tr => {
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
    let currentImportRows = [];
    let importValidationTimer;

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
        if (headerRow.length < 5) {
            window.showImportFileError("Cấu trúc cột không hợp lệ. File Excel phải có 5 cột: Mã GV, Họ, Tên, Số ĐT, Địa chỉ.");
            return;
        }

        const col1 = AppCommon.normalizeHeader(headerRow[0]);
        const col2 = AppCommon.normalizeHeader(headerRow[1]);
        const col3 = AppCommon.normalizeHeader(headerRow[2]);
        const col4 = AppCommon.normalizeHeader(headerRow[3]);
        const col5 = AppCommon.normalizeHeader(headerRow[4]);

        const validCol1 = (col1 === "ma gv" || col1 === "magv");
        const validCol2 = (col2 === "ho");
        const validCol3 = (col3 === "ten");
        const validCol4 = (col4 === "so dt" || col4 === "sodt" || col4 === "so dt liên lac" || col4 === "sodtll");
        const validCol5 = (col5 === "dia chi" || col5 === "diachi");

        if (!validCol1 || !validCol2 || !validCol3 || !validCol4 || !validCol5) {
            window.showImportFileError("Cấu trúc cột không hợp lệ. Vui lòng tải file mẫu để kiểm tra thứ tự cột.");
            return;
        }

        const dataRows = rows.slice(1);
        if (dataRows.length === 0) {
            window.showImportFileError("Không tìm thấy dòng dữ liệu nào dưới hàng tiêu đề.");
            return;
        }

        currentImportRows = dataRows.map((row, idx) => {
            const maGV = row[0]?.toString().trim() ?? "";
            const ho = row[1]?.toString().trim() ?? "";
            const ten = row[2]?.toString().trim() ?? "";
            const soDTLL = row[3]?.toString().trim() ?? "";
            const diaChi = row[4]?.toString().trim() ?? "";
            const rowNum = idx + 2;

            return {
                index: idx,
                rowNum: rowNum,
                maGV: maGV,
                ho: ho,
                ten: ten,
                soDTLL: soDTLL,
                diaChi: diaChi,
                error: ""
            };
        });

        validateImportPreviewRows();
    }

    function validateImportPreviewRows() {
        const processedRows = currentImportRows.map(row => ({ ...row, error: "" }));

        const fileMaGVRows = new Map();
        const pendingMaGVs = new Set(newItems.map(x => x.MaGV.trim().toUpperCase()));
        const databaseMaGVs = new Set();
        dom.gvTable.querySelectorAll("tr").forEach(tr => {
            const magv = tr.dataset.magv;
            if (magv) {
                const magvUpper = magv.trim().toUpperCase();
                if (!pendingMaGVs.has(magvUpper)) {
                    databaseMaGVs.add(magvUpper);
                }
            }
        });

        processedRows.forEach(row => {
            const maGV = row.maGV?.trim().toUpperCase() ?? "";
            if (maGV !== "" && maGV.length <= 8) {
                const rowNumbers = fileMaGVRows.get(maGV) ?? [];
                rowNumbers.push(row.index + 1);
                fileMaGVRows.set(maGV, rowNumbers);
            }
        });

        processedRows.forEach(row => {
            let error = "";
            const maGV = row.maGV?.trim() ?? "";
            const ho = row.ho?.trim() ?? "";
            const ten = row.ten?.trim() ?? "";
            const soDTLL = row.soDTLL?.trim() ?? "";
            const diaChi = row.diaChi?.trim() ?? "";

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
            } else if (soDTLL !== "" && !/^(0[35789]\d{8}|02\d{9})$/.test(soDTLL)) {
                error = "Số ĐT không hợp lệ (10 số di động hoặc 11 số bàn)";
            } else if (diaChi.length > 40) {
                error = "Địa chỉ tối đa 40 ký tự";
            } else {
                const idUpper = maGV.toUpperCase();

                const duplicateCodeRows = fileMaGVRows.get(idUpper) ?? [];
                if (duplicateCodeRows.length > 1) {
                    const previewStt = row.index + 1;
                    const otherRows = duplicateCodeRows.filter(stt => stt !== previewStt).join(", ");
                    error = `STT ${previewStt} trùng mã GV với STT ${otherRows}`;
                } else if (pendingMaGVs.has(idUpper)) {
                    error = "Trùng mã GV với danh sách tạm thời";
                } else if (databaseMaGVs.has(idUpper)) {
                    error = "Trùng mã GV trong CSDL";
                }
            }

            row.maGV = maGV;
            row.ho = ho;
            row.ten = ten;
            row.soDTLL = soDTLL;
            row.diaChi = diaChi;
            row.error = error;
        });

        currentImportRows = processedRows;
        const candidates = processedRows.filter(r => r.error === "");

        if (candidates.length === 0) {
            renderPreview(processedRows);
            return;
        }

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
                const match = candidates.find(c => c.index === res.index);
                if (match) {
                    if (res.idDuplicateFile) {
                        match.error = `Trùng mã GV với STT ${res.idDuplicateFileWithRowIndex + 1} trong file`;
                    } else if (res.idDuplicateDB) {
                        match.error = "Trùng mã GV trong CSDL";
                    }
                }
            });
            renderPreview(processedRows);
        })
        .catch(err => {
            window.showImportFileError("Lỗi kết nối Server: " + err.message);
        });
    }

    function renderPreview(processedRows) {
        const tbody = dom.tblImportPreview.querySelector("tbody");

        const activeEl = document.activeElement;
        let activeIndex = null;
        let activeField = null;
        let selectionStart = null;
        let selectionEnd = null;
        if (activeEl && activeEl.classList.contains("import-edit-input")) {
            activeIndex = Number(activeEl.dataset.importIndex);
            activeField = activeEl.dataset.importField;
            selectionStart = activeEl.selectionStart;
            selectionEnd = activeEl.selectionEnd;
        }

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
                           class="form-control form-control-sm import-edit-input import-magv-input fw-semibold text-uppercase"
                           value="${AppCommon.escapeHtml(row.maGV)}"
                           maxlength="8"
                           data-import-index="${row.index}"
                           data-import-field="maGV" />
                </td>
                <td>
                    <input type="text"
                           class="form-control form-control-sm import-edit-input"
                           value="${AppCommon.escapeHtml(row.ho)}"
                           maxlength="50"
                           placeholder="Họ"
                           data-import-index="${row.index}"
                           data-import-field="ho" />
                </td>
                <td>
                    <input type="text"
                           class="form-control form-control-sm import-edit-input"
                           value="${AppCommon.escapeHtml(row.ten)}"
                           maxlength="10"
                           placeholder="Tên"
                           data-import-index="${row.index}"
                           data-import-field="ten" />
                </td>
                <td>
                    <input type="text"
                           class="form-control form-control-sm import-edit-input text-center"
                           value="${AppCommon.escapeHtml(row.soDTLL)}"
                           maxlength="15"
                           placeholder="Số ĐT"
                           data-import-index="${row.index}"
                           data-import-field="soDTLL" />
                </td>
                <td>
                    <input type="text"
                           class="form-control form-control-sm import-edit-input"
                           value="${AppCommon.escapeHtml(row.diaChi)}"
                           maxlength="40"
                           placeholder="Địa chỉ"
                           data-import-index="${row.index}"
                           data-import-field="diaChi" />
                </td>
                <td>${statusBadge}</td>
            `;
            tbody.appendChild(tr);
        });

        bindImportPreviewInputs();

        if (activeField !== null && activeIndex !== null) {
            const newActiveEl = tbody.querySelector(`.import-edit-input[data-import-index="${activeIndex}"][data-import-field="${activeField}"]`);
            if (newActiveEl) {
                newActiveEl.focus();
                try {
                    newActiveEl.setSelectionRange(selectionStart, selectionEnd);
                } catch (e) {}
            }
        }

        dom.importSummary.textContent = `Tổng: ${processedRows.length} | Hợp lệ: ${successCount} | Lỗi: ${errorCount}`;
        dom.importSummary.className = errorCount > 0 ? "badge bg-danger rounded-pill px-3 py-1.5" : "badge bg-success rounded-pill px-3 py-1.5";

        if (errorCount === 0 && successCount > 0) {
            dom.btnConfirmImport.removeAttribute("disabled");
            currentImportList = processedRows.map(r => ({
                MaGV: r.maGV,
                Ho: r.ho,
                Ten: r.ten,
                SoDTLL: r.soDTLL,
                DiaChi: r.diaChi
            }));
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

                if (!row) return;

                if (field === "maGV") {
                    target.value = target.value.trim().toUpperCase().slice(0, 8);
                    row.maGV = target.value;
                } else if (field === "ho") {
                    row.ho = target.value;
                } else if (field === "ten") {
                    row.ten = target.value;
                } else if (field === "soDTLL") {
                    row.soDTLL = target.value;
                } else if (field === "diaChi") {
                    row.diaChi = target.value;
                }

                clearTimeout(importValidationTimer);
                importValidationTimer = setTimeout(validateImportPreviewRows, 300);
            });
        });
    }

    function confirmImport() {
        if (currentImportList.length === 0) return;

        pushState();

        currentImportList.forEach(item => {
            const row = dom.gvTable.insertRow();
            row.dataset.magv = item.MaGV;
            row.dataset.ho = item.Ho;
            row.dataset.ten = item.Ten;
            row.dataset.sdt = item.SoDTLL;
            row.dataset.diachi = item.DiaChi;
            row.dataset.originalHo = "";
            row.dataset.originalTen = "";
            row.dataset.originalSdt = "";
            row.dataset.originalDiachi = "";
            row.dataset.id = item.MaGV;

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

        const importModalEl = AppCommon.byId('importModal');
        const modalBs = bootstrap.Modal.getInstance(importModalEl);
        if (modalBs) modalBs.hide();

        dom.importFile.value = "";
        dom.importPreviewSection.style.display = "none";

        window.hienThongBao(`Đã import thành công <strong>${currentImportList.length}</strong> giáo viên vào danh sách tạm thời. Vui lòng bấm <strong>Ghi</strong> để lưu thay đổi vào CSDL.`, "Thành công");

        updateSaveButtonState();
    }

    // Expose public API
    window.themGV = themGV;
    window.hieuChinhGV = hieuChinhGV;
    window.resetGiaoVienForm = resetGiaoVienForm;
    window.undoGV = undoGV;
    window.redoGV = redoGV;
    window.ghiGV = ghiGV;
    window.exportExcel = exportExcel;
    window.downloadTemplate = downloadTemplate;
    window.openImportModal = openImportModal;
    window.handleFileSelect = handleFileSelect;
    window.confirmImport = confirmImport;
    window.changePage = changePage;
    window.changePageSize = changePageSize;

})(window, window.AppCommon);
