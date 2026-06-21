-- ============================================================
-- FILE: M02_Views_Functions_And_Triggers.sql
-- MUC DICH: Gom cac View, Function va Trigger cua he thong:
--   1. Function udf_LayHoTen (tu 005)
--   2. View vw_SinhVienTheoLop (tu 010)
--   3. View vw_BoDeCuaGiaoVien (tu 010)
--   4. View vw_GiaoVien_DanhSach
--   5. Trigger trg_BODE_KiemTraTruocKhiXoa (tu 011)
-- ============================================================
USE [THITRACNGHIEM]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ------------------------------------------------------------
-- 1. Function udf_LayHoTen
--    Ghep Ho va Ten cua hoc vien/giao vien voi ISNULL xu ly an toan
-- ------------------------------------------------------------
CREATE OR ALTER FUNCTION dbo.udf_LayHoTen(
    @Ho  NVARCHAR(50),
    @Ten NVARCHAR(10)
)
RETURNS NVARCHAR(62)
AS
BEGIN
    RETURN LTRIM(RTRIM(ISNULL(@Ho, N'') + N' ' + ISNULL(@Ten, N'')));
END
GO

PRINT N'OK: Đã tạo Function udf_LayHoTen.';
GO

-- ------------------------------------------------------------
-- 2. View vw_SinhVienTheoLop
--    Lay danh sach SV cua moi lop kem ten lop (subform 4.3)
-- ------------------------------------------------------------
CREATE OR ALTER VIEW [dbo].[vw_SinhVienTheoLop]
AS
SELECT
    lop.MALOP,
    lop.TENLOP,
    sv.MASV,
    dbo.udf_LayHoTen(sv.HO, sv.TEN) AS HOTEN,
    sv.HO,
    sv.TEN,
    sv.NGAYSINH,
    sv.DIACHI
FROM [dbo].[SINHVIEN] sv
JOIN [dbo].[LOP] lop ON sv.MALOP = lop.MALOP;
GO

PRINT N'OK: Da tao View vw_SinhVienTheoLop.';
GO

-- ------------------------------------------------------------
-- 3. View vw_BoDeCuaGiaoVien
--    Lay danh sach cau hoi kem ten GV va ten mon (4.5)
-- ------------------------------------------------------------
CREATE OR ALTER VIEW [dbo].[vw_BoDeCuaGiaoVien]
AS
SELECT
    b.CAUHOI,
    b.MAMH,
    mh.TENMH,
    b.TRINHDO,
    CASE b.TRINHDO
        WHEN 'A' THEN N'Dai hoc - Chuyen nganh'
        WHEN 'B' THEN N'Dai hoc - Khong chuyen'
        WHEN 'C' THEN N'Cao dang'
        ELSE b.TRINHDO
    END AS TenTrinhDo,
    b.NOIDUNG,
    b.A,
    b.B,
    b.C,
    b.D,
    b.DAP_AN,
    b.MAGV,
    dbo.udf_LayHoTen(gv.HO, gv.TEN) AS TenGV
FROM [dbo].[BODE] b
JOIN      [dbo].[MONHOC]   mh ON b.MAMH = mh.MAMH
LEFT JOIN [dbo].[GIAOVIEN] gv ON b.MAGV = gv.MAGV
WHERE b.TrangThai = 1;
GO

PRINT N'OK: Da tao View vw_BoDeCuaGiaoVien.';
GO

-- ------------------------------------------------------------
-- 4. View vw_GiaoVien_DanhSach
--    Projection dung chung cho man hinh quan ly giao vien
-- ------------------------------------------------------------
IF COL_LENGTH('dbo.GIAOVIEN', 'TrangThai') IS NULL
BEGIN
    ALTER TABLE dbo.GIAOVIEN
    ADD TrangThai BIT NOT NULL
        CONSTRAINT DF_GIAOVIEN_TrangThai DEFAULT (1);
END
GO

CREATE OR ALTER VIEW [dbo].[vw_GiaoVien_DanhSach]
AS
SELECT
    gv.MAGV,
    gv.HO,
    gv.TEN,
    gv.SODTLL,
    gv.DIACHI,
    dbo.udf_LayHoTen(gv.HO, gv.TEN) AS HOTEN
FROM [dbo].[GIAOVIEN] gv
WHERE gv.TrangThai = 1;
GO

PRINT N'OK: Da tao View vw_GiaoVien_DanhSach.';
GO

GRANT SELECT ON dbo.vw_GiaoVien_DanhSach TO [PGV];
GO

-- ------------------------------------------------------------
-- 5. Trigger trg_BODE_KiemTraTruocKhiXoa
--    Da bo: logic xoa mem/xoa cung duoc xu ly trong usp_BoDe_Delete
-- ------------------------------------------------------------
IF OBJECT_ID(N'dbo.trg_BODE_KiemTraTruocKhiXoa', N'TR') IS NOT NULL
BEGIN
    DROP TRIGGER dbo.trg_BODE_KiemTraTruocKhiXoa;
END
GO

PRINT N'OK: Da bo Trigger trg_BODE_KiemTraTruocKhiXoa.';
GO

-- ------------------------------------------------------------
-- 6. View vw_DanhSachLop
--    Lay danh sach cac lop co trong he thong (5.2)
-- ------------------------------------------------------------
CREATE OR ALTER VIEW dbo.vw_DanhSachLop
AS
    SELECT
        MALOP,
        TENLOP
    FROM LOP
    WHERE TrangThai = 1;
GO

GRANT SELECT ON dbo.vw_DanhSachLop TO [PGV];
GO
GRANT SELECT ON dbo.vw_DanhSachLop TO [Giangvien];
GO

PRINT N'OK: Da tao view vw_DanhSachLop'
GO

-- ------------------------------------------------------------
-- 7. View vw_DanhSachMonHoc
--    Lay danh sach cac mon hoc co trong he thong
-- ------------------------------------------------------------
CREATE OR ALTER VIEW dbo.vw_DanhSachMonHoc
AS
    SELECT
        MaMH,
        TenMH
    FROM MONHOC
    WHERE TrangThai = 1;
GO

GRANT SELECT ON dbo.vw_DanhSachMonHoc TO [PGV];
GO
GRANT SELECT ON dbo.vw_DanhSachMonHoc TO [Giangvien];
GO

PRINT N'OK: Da tao view vw_DanhSachMonHoc'
GO
