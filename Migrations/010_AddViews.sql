-- ============================================================
-- FILE: 010_AddViews.sql
-- MUC DICH: Tao 2 View phuc vu phan 4.3 va 4.5
--   1. vw_SinhVienTheoLop  -> Danh sach SV kem ten lop (4.3 - subform)
--   2. vw_BoDeCuaGiaoVien  -> Danh sach cau hoi kem ten GV va ten mon (4.5)
-- LY DO: View giup tang tang trieu dac trung (abstraction):
--        - Tang ung dung C# chi can SELECT tu View thay vi viet JOIN phuc tap.
--        - Su dung udf_LayHoTen da co san de xu ly NULL an toan.
--        - Tuan thu nguyen tac: GV chi nen xem cau hoi kem day du thong tin.
-- PHAN DE TAI: 4.3 - Nhap sinh vien, 4.5 - Nhap cau hoi thi
-- BAI GIANG: SQL3 - Views
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. View vw_SinhVienTheoLop
--    Phuc vu subform o phan 4.3: hien thi danh sach SV cua moi lop.
--    C# dung: SELECT * FROM vw_SinhVienTheoLop WHERE MALOP = N'TH04   '
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
-- 2. View vw_BoDeCuaGiaoVien
--    Phuc vu phan 4.5: GV xem va quan ly cac cau hoi do minh soan.
--    LEFT JOIN GIAOVIEN de khong mat cau hoi neu MAGV NULL.
--    C# dung: SELECT * FROM vw_BoDeCuaGiaoVien WHERE MAGV = N'TH123   '
--             hoac loc them:  AND MAMH = N'CSDL '
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
