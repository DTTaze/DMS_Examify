-- ============================================================
-- FILE: 000_AlterSinhVienAddMatKhau.sql
-- MỤC ĐÍCH: Thêm cột MATKHAU vào bảng SINHVIEN
-- LÝ DO: Schema gốc THITRACNGHIEM.sql không có cột này.
--        Tất cả SP liên quan (usp_SinhVien_Login, usp_SinhVien_Insert,
--        usp_SinhVien_Update, usp_SinhVien_Search, usp_SinhVien_GetByLop)
--        đã bao gồm MATKHAU nhưng cột chưa tồn tại → lỗi khi chạy.
--        Cột NULL vì dữ liệu cũ chưa có mật khẩu.
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
