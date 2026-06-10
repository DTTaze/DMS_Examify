-- ============================================================
-- FILE: 007_FixBodeMAGV_FK.sql
-- MUC DICH: Them Foreign Key BODE.MAGV -> GIAOVIEN(MAGV)
-- LY DO: De tai quy dinh MAGV trong BODE la "Foreign Key" nhung
--        schema goc khong co constraint nay. He qua: co the INSERT
--        cau hoi voi MAGV khong ton tai trong bang GIAOVIEN, vi pham
--        tinh toan ven du lieu (phan 4.5 - GV nhap cau hoi).
-- PHAN DE TAI: 4.5 - Nhap cau hoi thi
-- BAI GIANG: SQL2 - Rang buoc Foreign Key
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- Buoc 1: Kiem tra du lieu mo coi (MAGV co trong BODE nhung
--         khong co trong GIAOVIEN). Phai xu ly truoc khi them FK.
-- Chay query nay truoc, neu co ket qua thi UPDATE/DELETE du lieu do.
-- ------------------------------------------------------------
PRINT N'--- Kiem tra du lieu mo coi BODE.MAGV ---';
SELECT
    b.CAUHOI,
    b.MAMH,
    b.MAGV AS [MAGV_trong_BODE_khong_co_trong_GIAOVIEN]
FROM [dbo].[BODE] b
WHERE b.MAGV IS NOT NULL
  AND RTRIM(b.MAGV) NOT IN (
      SELECT RTRIM(MAGV) FROM [dbo].[GIAOVIEN]
  );
GO

-- ------------------------------------------------------------
-- Buoc 2: Them Foreign Key
-- CHU Y: Chi chay sau khi query buoc 1 tra ve 0 dong.
--        Neu co du lieu mo coi, dat NULL truoc: 
--        UPDATE BODE SET MAGV = NULL WHERE <dieu kien>
-- ------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_NAME      = 'BODE'
      AND CONSTRAINT_NAME = 'FK_BODE_GIAOVIEN'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
)
BEGIN
    ALTER TABLE [dbo].[BODE]
    ADD CONSTRAINT [FK_BODE_GIAOVIEN]
        FOREIGN KEY ([MAGV])
        REFERENCES [dbo].[GIAOVIEN] ([MAGV]);

    PRINT N'OK: Da them Foreign Key FK_BODE_GIAOVIEN (BODE.MAGV -> GIAOVIEN.MAGV).';
END
ELSE
BEGIN
    PRINT N'SKIP: FK_BODE_GIAOVIEN da ton tai.';
END
GO
