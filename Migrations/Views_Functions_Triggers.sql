-- ============================================================
-- FILE: M02_Views_Functions_And_Triggers.sql
-- MUC DICH: Gom cac View, Function va Trigger cua he thong:
--   1. Function udf_LayHoTen (tu 005)
--   2. View vw_SinhVienTheoLop (tu 010)
--   3. View vw_BoDeCuaGiaoVien (tu 010)
--   4. Trigger trg_BODE_KiemTraTruocKhiXoa (tu 011)
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
LEFT JOIN [dbo].[GIAOVIEN] gv ON RTRIM(b.MAGV) = RTRIM(gv.MAGV);
GO

PRINT N'OK: Da tao View vw_BoDeCuaGiaoVien.';
GO

-- ------------------------------------------------------------
-- 4. Trigger trg_BODE_KiemTraTruocKhiXoa
--    Chan xoa cau hoi neu mon hoc do dang co lich thi tuong lai
-- ------------------------------------------------------------
CREATE OR ALTER TRIGGER [dbo].[trg_BODE_KiemTraTruocKhiXoa]
ON [dbo].[BODE]
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM deleted d
        JOIN [dbo].[GIAOVIEN_DANGKY] gdk ON RTRIM(d.MAMH) = RTRIM(gdk.MAMH)
        WHERE gdk.NGAYTHI >= GETDATE()
    )
    BEGIN
        RAISERROR(
            N'Khong the xoa! Cau hoi thuoc mon hoc dang co lich thi trong tuong lai. Hay huy lich thi truoc.',
            16, 1
        );
        RETURN;
    END

    DELETE FROM [dbo].[BODE]
    WHERE [CAUHOI] IN (SELECT [CAUHOI] FROM deleted);
END
GO

PRINT N'OK: Da tao Trigger trg_BODE_KiemTraTruocKhiXoa.';
GO
