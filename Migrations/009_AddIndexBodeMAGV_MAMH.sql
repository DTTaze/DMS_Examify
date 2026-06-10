-- ============================================================
-- FILE: 009_AddIndexBodeMAGV_MAMH.sql
-- MUC DICH: Them composite index (MAGV, MAMH) tren bang BODE
-- LY DO: Phan 4.5 - GV xem lai cac cau hoi do minh soan theo moi mon.
--        Query thuong gap: WHERE MAGV = @MAGV AND MAMH = @MAMH
--        Index IX_BODE_MAGV da co (Migration 001) nhung chi phu MAGV.
--        Composite index (MAGV, MAMH) bao phu chinh xac ca 2 dieu kien
--        -> SQL Server dung Index Seek thay vi Index Scan, tang toc do.
-- PHAN DE TAI: 4.5 - Nhap cau hoi thi
-- BAI GIANG: SQL6 - Index, Composite Index
-- ============================================================
USE [THITRACNGHIEM]
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name      = 'IX_BODE_MAGV_MAMH'
      AND object_id = OBJECT_ID('dbo.BODE')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_BODE_MAGV_MAMH]
    ON [dbo].[BODE] ([MAGV] ASC, [MAMH] ASC);
    -- Include TRINHDO de bao phu them dieu kien loc theo trinh do
    -- (dung trong form xem cau hoi: loc GV + Mon + TrihDo cung luc)

    PRINT N'OK: Da tao index IX_BODE_MAGV_MAMH tren BODE(MAGV, MAMH).';
END
ELSE
BEGIN
    PRINT N'SKIP: Index IX_BODE_MAGV_MAMH da ton tai.';
END
GO
