-- ============================================================
-- FILE: S-11_CreateLayDanhSachLop.sql
-- THU TU CHAY: S-11 / S-12  (sau S-01, can bang LOP ton tai)
-- MUC DICH: Tao SP usp_LayDanhSachLop - lay toan bo danh sach lop hoc
-- LY DO: SinhVienController va LopController can lay danh sach lop
--        de hien thi vao ComboBox/DataGrid tren cac form 4.3 (Nhap SV)
--        va form 4.6 (Dang ky thi - GV chon lop).
-- PHAN DE TAI: 4.3 - Nhap sinh vien, 4.6 - Dang ky thi
-- BAI GIANG: SQL5 - Stored Procedure (SELECT don gian)
-- ============================================================
USE [THITRACNGHIEM]
GO

CREATE PROCEDURE usp_LayDanhSachLop
AS
BEGIN
    SET NOCOUNT ON;

    -- Lay danh sach lop sap xep theo MALOP
    -- Chi lay MALOP, TENLOP (khong dung SELECT * de ro rang ve cac cot tra ve)
    SELECT
        MALOP,
        TENLOP
    FROM dbo.LOP
    ORDER BY MALOP ASC;
END
GO

GRANT EXECUTE ON dbo.usp_LayDanhSachLop TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_LayDanhSachLop TO [Giangvien];
GO

PRINT N'OK: Da tao usp_LayDanhSachLop.';
GO
