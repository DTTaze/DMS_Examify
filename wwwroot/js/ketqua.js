(function () {
    'use strict';

    const appEl = document.getElementById('ketQuaApp');
    const role = appEl.dataset.role;

    if (role === 'Sinhvien') {
        initSinhVienPanel();
    }

    if (role === 'Giangvien' || role === 'PGV') {
        initGiangVienPanel();
    }

    initPanelNavigation();

    // ========================
    //  SINH VIÊN
    // ========================
    function initSinhVienPanel() {
        let allBaiThi = [];

        fetch('/KetQua/DanhSachBaiThi')
            .then(r => r.json())
            .then(resp => {
                document.getElementById('svLoading').style.display = 'none';
                if (!resp.success || !resp.data.length) {
                    document.getElementById('svEmpty').style.display = '';
                    return;
                }
                allBaiThi = resp.data;
                populateFiltersSV(allBaiThi);
                renderBaiThiSV(allBaiThi);
            })
            .catch(() => {
                document.getElementById('svLoading').innerHTML =
                    '<i class="bi bi-exclamation-circle me-1"></i>Không thể tải dữ liệu.';
            });

        function populateFiltersSV(data) {
            const monSet = new Map();
            data.forEach(d => monSet.set(d.maMH, d.tenMH));
            const sel = document.getElementById('filterMonHocSV');
            monSet.forEach((ten, ma) => {
                const opt = document.createElement('option');
                opt.value = ma;
                opt.textContent = ten;
                sel.appendChild(opt);
            });
        }

        function renderBaiThiSV(data) {
            const filterMon = document.getElementById('filterMonHocSV').value;
            const filterLan = document.getElementById('filterLanSV').value;
            const filterTD = document.getElementById('filterTrinhDoSV').value;

            const filtered = data.filter(d =>
                (!filterMon || d.maMH === filterMon) &&
                (!filterLan || d.lan === Number(filterLan)) &&
                (!filterTD || d.trinhDo === filterTD)
            );

            const tbody = document.getElementById('svTableBody');
            tbody.innerHTML = '';

            if (!filtered.length) {
                document.getElementById('svTableWrap').style.display = 'none';
                document.getElementById('svEmpty').style.display = '';
                return;
            }

            document.getElementById('svTableWrap').style.display = '';
            document.getElementById('svEmpty').style.display = 'none';

            filtered.forEach((d, i) => {
                const scoreClass = d.diem >= 5 ? 'bg-success' : 'bg-danger';
                const ngay = new Date(d.ngayThi).toLocaleDateString('vi-VN');
                tbody.innerHTML += `
                    <tr>
                        <td>${i + 1}</td>
                        <td><strong>${d.tenMH}</strong></td>
                        <td>${d.lan}</td>
                        <td><span class="badge badge-level-${d.trinhDo.toLowerCase()}">${d.trinhDo}</span></td>
                        <td>${d.soCauThi}</td>
                        <td>${ngay}</td>
                        <td><span class="badge ${scoreClass}" style="font-size:13px;">${d.diem.toFixed(1)}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary"
                                    onclick="xemChiTietSV('${d.maMH}', ${d.lan}, '${d.tenMH}')">
                                <i class="bi bi-eye me-1"></i>Chi tiết
                            </button>
                        </td>
                    </tr>`;
            });
        }

        document.getElementById('filterMonHocSV').addEventListener('change', () => renderBaiThiSV(allBaiThi));
        document.getElementById('filterLanSV').addEventListener('change', () => renderBaiThiSV(allBaiThi));
        document.getElementById('filterTrinhDoSV').addEventListener('change', () => renderBaiThiSV(allBaiThi));

        window.xemChiTietSV = function (mamh, lan, tenMH) {
            const hoTen = appEl.dataset.username;
            const maSV = appEl.dataset.userlogin;
            const baiThi = allBaiThi.find(d => d.maMH === mamh && d.lan === lan);

            showDetailPanel(`Chi tiết bài thi: ${tenMH} — Lần ${lan}`);
            document.getElementById('chiTietBaiPanel').style.display = '';

            fillInfoHeader({
                lop: baiThi ? baiThi.tenLop : '—',
                hoTen: hoTen,
                maSV: maSV,
                monThi: tenMH,
                ngayThi: baiThi ? new Date(baiThi.ngayThi).toLocaleDateString('vi-VN') : '—',
                lanThi: lan
            });

            loadChiTietBaiThi('', mamh, lan);
        };
    }

    // ========================
    //  GIẢNG VIÊN / PGV
    // ========================
    function initGiangVienPanel() {
        let allDeThi = [];
        let currentDeThi = null;

        fetch('/KetQua/DanhSachDeThi')
            .then(r => r.json())
            .then(resp => {
                document.getElementById('gvLoading').style.display = 'none';
                if (!resp.success || !resp.data.length) {
                    document.getElementById('gvEmpty').style.display = '';
                    return;
                }
                allDeThi = resp.data;
                populateFiltersGV(allDeThi);
                renderDeThiGV(allDeThi);
            })
            .catch(() => {
                document.getElementById('gvLoading').innerHTML =
                    '<i class="bi bi-exclamation-circle me-1"></i>Không thể tải dữ liệu.';
            });

        function populateFiltersGV(data) {
            const monSet = new Map();
            const lopSet = new Map();
            data.forEach(d => {
                monSet.set(d.maMH, d.tenMH);
                lopSet.set(d.maLop, d.tenLop);
            });

            const selMon = document.getElementById('filterMonHocGV');
            monSet.forEach((ten, ma) => {
                const opt = document.createElement('option');
                opt.value = ma;
                opt.textContent = ten;
                selMon.appendChild(opt);
            });

            const selLop = document.getElementById('filterLopGV');
            lopSet.forEach((ten, ma) => {
                const opt = document.createElement('option');
                opt.value = ma;
                opt.textContent = ten;
                selLop.appendChild(opt);
            });
        }

        function renderDeThiGV(data) {
            const filterMon = document.getElementById('filterMonHocGV').value;
            const filterLop = document.getElementById('filterLopGV').value;
            const filterLan = document.getElementById('filterLanGV').value;

            const filtered = data.filter(d =>
                (!filterMon || d.maMH === filterMon) &&
                (!filterLop || d.maLop === filterLop) &&
                (!filterLan || d.lan === Number(filterLan))
            );

            const tbody = document.getElementById('gvTableBody');
            tbody.innerHTML = '';

            if (!filtered.length) {
                document.getElementById('gvTableWrap').style.display = 'none';
                document.getElementById('gvEmpty').style.display = '';
                return;
            }

            document.getElementById('gvTableWrap').style.display = '';
            document.getElementById('gvEmpty').style.display = 'none';

            filtered.forEach((d, i) => {
                const ngay = new Date(d.ngayThi).toLocaleDateString('vi-VN');
                tbody.innerHTML += `
                    <tr>
                        <td>${i + 1}</td>
                        <td><strong>${d.tenMH}</strong></td>
                        <td>${d.tenLop}</td>
                        <td>${d.lan}</td>
                        <td><span class="badge badge-level-${d.trinhDo.toLowerCase()}">${d.trinhDo}</span></td>
                        <td>${d.soCauThi}</td>
                        <td>${d.thoiGian}</td>
                        <td>${ngay}</td>
                        <td><span class="badge bg-info">${d.soSVDaThi}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary"
                                    onclick="xemKetQuaDeThi('${d.maMH}', '${d.maLop}', ${d.lan}, '${d.tenMH}', '${d.tenLop}')">
                                <i class="bi bi-eye me-1"></i>Kết quả
                            </button>
                        </td>
                    </tr>`;
            });
        }

        document.getElementById('filterMonHocGV').addEventListener('change', () => renderDeThiGV(allDeThi));
        document.getElementById('filterLopGV').addEventListener('change', () => renderDeThiGV(allDeThi));
        document.getElementById('filterLanGV').addEventListener('change', () => renderDeThiGV(allDeThi));

        window.xemKetQuaDeThi = function (mamh, malop, lan, tenMH, tenLop) {
            currentDeThi = { mamh, malop, lan, tenMH, tenLop };
            showDetailPanel(`Kết quả: ${tenMH} — ${tenLop} — Lần ${lan}`);
            document.getElementById('ketQuaSVPanel').style.display = '';

            fetch(`/KetQua/KetQuaSVTheoDeThi?mamh=${encodeURIComponent(mamh)}&malop=${encodeURIComponent(malop)}&lan=${lan}`)
                .then(r => r.json())
                .then(resp => {
                    const tbody = document.getElementById('ketQuaSVBody');
                    tbody.innerHTML = '';

                    if (!resp.success || !resp.data.length) {
                        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Chưa có SV nào thi.</td></tr>';
                        return;
                    }

                    resp.data.forEach((sv, i) => {
                        const ngay = new Date(sv.ngayThi).toLocaleDateString('vi-VN');
                        const scoreClass = sv.diem >= 5 ? 'bg-success' : 'bg-danger';
                        tbody.innerHTML += `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${sv.maSV}</td>
                                <td>${sv.ho}</td>
                                <td><strong>${sv.ten}</strong></td>
                                <td>${ngay}</td>
                                <td><span class="badge ${scoreClass}" style="font-size:13px;">${sv.diem.toFixed(1)}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-secondary"
                                            onclick="xemChiTietSVByGV('${sv.maSV}', '${currentDeThi.mamh}', ${currentDeThi.lan}, '${sv.ho} ${sv.ten}', '${ngay}')">
                                        <i class="bi bi-eye me-1"></i>Chi tiết
                                    </button>
                                </td>
                            </tr>`;
                    });
                });
        };

        window.xemChiTietSVByGV = function (masv, mamh, lan, hoTen, ngayThi) {
            document.getElementById('chiTietBaiPanel').style.display = '';
            document.getElementById('detailTitle').textContent =
                `Chi tiết bài thi: ${hoTen} — ${currentDeThi.tenMH} — Lần ${lan}`;

            fillInfoHeader({
                lop: currentDeThi.tenLop,
                hoTen: hoTen,
                maSV: masv,
                monThi: currentDeThi.tenMH,
                ngayThi: ngayThi,
                lanThi: lan
            });

            loadChiTietBaiThi(masv, mamh, lan);
        };
    }

    // ========================
    //  SHARED: Chi tiết bài thi
    // ========================
    function loadChiTietBaiThi(masv, mamh, lan) {
        const svParam = masv ? `masv=${encodeURIComponent(masv)}&` : '';
        fetch(`/KetQua/ChiTietBaiThi?${svParam}mamh=${encodeURIComponent(mamh)}&lan=${lan}`)
            .then(r => r.json())
            .then(resp => {
                const tbody = document.getElementById('chiTietBody');
                tbody.innerHTML = '';

                if (!resp.success || !resp.data.length) {
                    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-3">Không có dữ liệu.</td></tr>';
                    document.getElementById('chiTietScore').textContent = '';
                    return;
                }

                let correct = 0;
                resp.data.forEach(q => {
                    const isCorrect = q.cauTraLoi && q.cauTraLoi.trim().toUpperCase() === q.dapAn.trim().toUpperCase();
                    if (isCorrect) correct++;
                    const rowClass = isCorrect ? '' : 'table-danger';
                    tbody.innerHTML += `
                        <tr class="${rowClass}">
                            <td>${q.stt}</td>
                            <td><strong>${q.cauHoi}</strong></td>
                            <td>${q.noiDung}</td>
                            <td style="font-size:12px;">${q.a}</td>
                            <td style="font-size:12px;">${q.b}</td>
                            <td style="font-size:12px;">${q.c}</td>
                            <td style="font-size:12px;">${q.d}</td>
                            <td class="text-center">
                                <span class="badge ${isCorrect ? 'bg-success' : 'bg-danger'}">${q.cauTraLoi || '—'}</span>
                            </td>
                            <td class="text-center">
                                <span class="badge bg-dark">${q.dapAn}</span>
                            </td>
                        </tr>`;
                });

                const total = resp.data.length;
                document.getElementById('chiTietScore').textContent =
                    `${correct} / ${total} câu đúng`;
            });
    }

    // ========================
    //  SHARED: Info header
    // ========================
    function fillInfoHeader(info) {
        document.getElementById('infoLop').textContent = info.lop || '—';
        document.getElementById('infoHoTen').textContent = info.hoTen || '—';
        document.getElementById('infoMaSV').textContent = info.maSV || '—';
        document.getElementById('infoMonThi').textContent = info.monThi || '—';
        document.getElementById('infoNgayThi').textContent = info.ngayThi || '—';
        document.getElementById('infoLanThi').textContent = info.lanThi || '—';
    }

    // ========================
    //  SHARED: Panel navigation
    // ========================
    function initPanelNavigation() {
        document.getElementById('btnBack').addEventListener('click', function () {
            document.getElementById('detailPanel').style.display = 'none';
            document.getElementById('ketQuaSVPanel').style.display = 'none';
            document.getElementById('chiTietBaiPanel').style.display = 'none';
            document.querySelectorAll('#ketQuaApp > div > .card').forEach(c => c.style.display = '');
        });
    }

    function showDetailPanel(title) {
        document.querySelectorAll('#ketQuaApp > div > .card').forEach(c => c.style.display = 'none');
        document.getElementById('detailPanel').style.display = '';
        document.getElementById('detailTitle').textContent = title;
        document.getElementById('ketQuaSVPanel').style.display = 'none';
        document.getElementById('chiTietBaiPanel').style.display = 'none';
    }
})();
