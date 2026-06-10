-- ============================================================
-- FILE: S-03_CreateLoginStoredProcedures.sql
-- THU TU CHAY: S-03 / S-12  (sau S-01 PhanQuyen, Role phai ton tai truoc)
-- MUC DICH: Tao 2 SP dang nhap cho Giang vien va Sinh vien
--   1. usp_GiangVien_Login  -> Kiem tra role PGV hay Giangvien
--   2. usp_SinhVien_Login   -> Xac thuc MASV + MATKHAU
-- LY DO: C# LoginForm goi hai SP nay de xac thuc nguoi dung
--        va lay ten nhom quyen (Role) dung de phan luong giao dien.
-- PHAN DE TAI: 4.1 - Dang nhap (Sinh vien), 4.2 - Dang nhap (Giao vien)
-- BAI GIANG: SQL5 - Stored Procedure, SQL7 - Bao mat (sys.database_role_members)
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. usp_GiangVien_Login
--    Kiem tra LoginName co thuoc Role PGV hay Giangvien.
--    C# goi sau khi xac thuc password voi SQL Server Authentication.
--    Tra ve: 'PGV' hoac 'Giangvien'
-- ------------------------------------------------------------
CREATE PROCEDURE dbo.usp_GiangVien_Login
    @LoginName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        CASE
            WHEN EXISTS (
                SELECT 1
                FROM sys.database_role_members rm
                JOIN sys.database_principals r
                    ON rm.role_principal_id = r.principal_id
                JOIN sys.database_principals m
                    ON rm.member_principal_id = m.principal_id
                WHERE r.name = 'PGV'
                  AND m.name = @LoginName
            ) THEN 'PGV'
            ELSE 'Giangvien'
        END AS UserRole
    FROM sys.database_principals
    WHERE name = @LoginName;
END
GO

PRINT N'OK: Da tao usp_GiangVien_Login.';
GO

-- ------------------------------------------------------------
-- 2. usp_SinhVien_Login
--    Xac thuc MASV + MATKHAU, tra ve thong tin sinh vien neu dung.
--    Tra ve 0 dong neu sai mat khau hoac MASV khong ton tai.
-- ------------------------------------------------------------
CREATE PROCEDURE dbo.usp_SinhVien_Login
    @MASV NVARCHAR(50),
    @PASSWORD NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MASV, HO, TEN, MALOP
    FROM SINHVIEN
    WHERE MASV = @MASV
      AND MATKHAU = @PASSWORD;
END
GO

PRINT N'OK: Da tao usp_SinhVien_Login.';
GO
