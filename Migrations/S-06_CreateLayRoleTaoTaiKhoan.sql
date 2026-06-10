-- ============================================================
-- FILE: S-06_CreateLayRoleTaoTaiKhoan.sql
-- THU TU CHAY: S-06 / S-12  (sau S-01 PhanQuyen, Role phai ton tai truoc)
-- MUC DICH: Tao SP usp_LayDanhSachQuyen_TaoTaiKhoan
--           Lay danh sach cac Role co the chon khi PGV tao tai khoan GV
-- LY DO: Form Tao Tai Khoan (4.2) can hien thi ComboBox cho PGV chon Role.
--        SP nay tra ve ['PGV', 'Giangvien'] tu sys.database_principals,
--        dam bao luon dong bo voi cac Role thuc te trong DB.
-- PHAN DE TAI: 4.2 - Tao tai khoan (PGV tao GV)
-- BAI GIANG: SQL7 - Bao mat (sys.database_principals, Role)
-- ============================================================
USE [THITRACNGHIEM]
GO

CREATE PROCEDURE [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan]
AS
BEGIN
    SET NOCOUNT ON;

    -- Lay danh sach Role: chi lay PGV va Giangvien (khong lay Sinhvien
    -- vi PGV khong tao tai khoan cho Sinhvien qua form nay)
    SELECT
        name AS TenNhomQuyen
    FROM
        sys.database_principals
    WHERE
        type = 'R'
        AND name IN ('PGV', 'Giangvien')
    ORDER BY
        name;
END
GO

GRANT EXEC ON [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan] TO [PGV];
GO

PRINT N'OK: Da tao usp_LayDanhSachQuyen_TaoTaiKhoan.';
GO
