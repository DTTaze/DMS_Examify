-- ============================================================
-- FILE: 006_FixSinhVienDiaChi.sql
-- THU TU CHAY: 7 / 13  (sau 005, doc lap voi cac SP)
-- MUC DICH: Mo rong cot SINHVIEN.DIACHI tu NVARCHAR(50) len NVARCHAR(100)
-- LY DO: De tai quy dinh DIACHI la nVarchar(100), nhung schema goc
--        khai bao nVarChar(50) -- nho hon de tai, co the bi cat bot
--        dia chi dai khi GV nhap lieu (phan 4.3).
-- PHAN DE TAI: 4.3 - Nhap sinh vien
-- BAI GIANG: SQL1 - Kieu du lieu
-- ============================================================
USE [THITRACNGHIEM]
GO

IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME  = 'SINHVIEN'
      AND COLUMN_NAME = 'DIACHI'
      AND CHARACTER_MAXIMUM_LENGTH < 100
)
BEGIN
    ALTER TABLE [dbo].[SINHVIEN]
    ALTER COLUMN [DIACHI] NVARCHAR(100) NULL;

    PRINT N'OK: Da mo rong SINHVIEN.DIACHI len NVARCHAR(100).';
END
ELSE
BEGIN
    PRINT N'SKIP: SINHVIEN.DIACHI da >= 100 ky tu.';
END
GO
