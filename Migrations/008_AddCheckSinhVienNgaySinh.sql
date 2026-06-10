-- ============================================================
-- FILE: 008_AddCheckSinhVienNgaySinh.sql
-- THU TU CHAY: 9 / 13  (sau 007, doc lap voi cac index)
-- MUC DICH: Them CHECK constraint cho SINHVIEN.NGAYSINH
-- LY DO: Schema goc khong co kiem tra ngay sinh hop ly.
--        Khong co CHECK -> co the nhap ngay sinh tuong lai hoac
--        gia tri vo nghia (vi du: 1800-01-01) ma he thong van chap nhan.
--        Phan 4.3 cho phep nhap sinh vien -> can bao ve tinh hop le du lieu.
-- PHAN DE TAI: 4.3 - Nhap sinh vien
-- BAI GIANG: SQL2 - Check Constraint
-- ============================================================
USE [THITRACNGHIEM]
GO

-- Kiem tra du lieu vi pham truoc khi them CHECK
PRINT N'--- Kiem tra du lieu NGAYSINH vi pham ---';
SELECT MASV, HO, TEN, NGAYSINH
FROM [dbo].[SINHVIEN]
WHERE NGAYSINH IS NOT NULL
  AND (NGAYSINH <= '1900-01-01' OR NGAYSINH >= GETDATE());
GO

-- Them CHECK constraint
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_NAME      = 'SINHVIEN'
      AND CONSTRAINT_NAME = 'CK_SINHVIEN_NGAYSINH'
      AND CONSTRAINT_TYPE = 'CHECK'
)
BEGIN
    -- Dam bao khong co du lieu vi pham truoc
    IF EXISTS (
        SELECT 1 FROM [dbo].[SINHVIEN]
        WHERE NGAYSINH IS NOT NULL
          AND (NGAYSINH <= '1900-01-01' OR NGAYSINH >= GETDATE())
    )
    BEGIN
        RAISERROR(
            N'SINHVIEN.NGAYSINH co du lieu vi pham. Hay cap nhat du lieu truoc khi chay lenh nay.',
            16, 1
        );
        RETURN;
    END

    ALTER TABLE [dbo].[SINHVIEN]
    ADD CONSTRAINT [CK_SINHVIEN_NGAYSINH]
        CHECK (
            [NGAYSINH] IS NULL
            OR ([NGAYSINH] > '1900-01-01' AND [NGAYSINH] < GETDATE())
        );

    PRINT N'OK: Da them CHECK constraint CK_SINHVIEN_NGAYSINH.';
END
ELSE
BEGIN
    PRINT N'SKIP: CK_SINHVIEN_NGAYSINH da ton tai.';
END
GO
