-- ============================================================
-- FILE: S-03_CreateLoginStoredProcedures.sql
-- THU TU CHAY: S-03 / S-12  (sau S-01 PhanQuyen, Role phai ton tai truoc)
-- MUC DICH: Tao SP dang nhap cho Sinh vien
--   2. usp_SinhVien_Login   -> Xac thuc MASV + MATKHAU
-- LY DO: C# LoginForm goi SP nay de xac thuc nguoi dung.
-- PHAN DE TAI: 4.1 - Dang nhap (Sinh vien)
-- BAI GIANG: SQL5 - Stored Procedure, SQL7 - Bao mat (sys.database_role_members)
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 2. usp_SinhVien_Login
--    Xac thuc MASV + MATKHAU, tra ve thong tin sinh vien neu dung.
--    Tra ve 0 dong neu sai mat khau hoac MASV khong ton tai.
-- ------------------------------------------------------------
ALTER PROCEDURE dbo.usp_SinhVien_Login
    @MASV NVARCHAR(50),
    @PASSWORD NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra tài khoản có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV)
    BEGIN
        RAISERROR(N'Tài khoản Sinh viên không tồn tại trong hệ thống!', 16, 1);
        RETURN;
    END

    -- 2. Kiểm tra mật khẩu có khớp không
    IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV AND MATKHAU = @PASSWORD)
    BEGIN
        RAISERROR(N'Mật khẩu đăng nhập không chính xác!', 16, 1);
        RETURN;
    END

    -- 3. Trả về thông tin sinh viên khi đăng nhập thành công
    SELECT MASV, HO, TEN, MALOP
    FROM SINHVIEN
    WHERE MASV = @MASV AND MATKHAU = @PASSWORD;
END
GO


PRINT N'OK: Da tao usp_SinhVien_Login.';
GO
