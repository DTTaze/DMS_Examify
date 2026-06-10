-- ============================================================
-- FILE: 000_AlterSinhVienAddMatKhau.sql
-- THU TU CHAY: 1 / 13  (chay dau tien, truoc moi Migration khac)
-- MUC DICH: Them cot MATKHAU vao bang SINHVIEN
-- LY DO: Schema goc THITRACNGHIEM.sql khong co cot nay.
--        Tat ca SP lien quan (usp_SinhVien_Login, usp_SinhVien_Insert,
--        usp_SinhVien_Update, usp_SinhVien_Search, usp_SinhVien_GetByLop)
--        da bao gom MATKHAU nhung cot chua ton tai -> loi khi chay.
--        Cot NULL vi du lieu cu chua co mat khau.
-- PHAN DE TAI: 4.1 - Dang nhap (Sinh vien)
-- BAI GIANG: SQL1 - Kieu du lieu, ALTER TABLE
-- ============================================================
USE [THITRACNGHIEM]
GO

-- Kiểm tra trước khi thêm để tránh lỗi nếu đã có cột
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME  = 'SINHVIEN'
      AND COLUMN_NAME = 'MATKHAU'
)
BEGIN
    ALTER TABLE [dbo].[SINHVIEN]
    ADD [MATKHAU] NVARCHAR(128) NULL;

    PRINT N'OK: Đã thêm cột MATKHAU vào bảng SINHVIEN.';
END
ELSE
BEGIN
    PRINT N'SKIP: Cột MATKHAU đã tồn tại trong bảng SINHVIEN.';
END
GO
