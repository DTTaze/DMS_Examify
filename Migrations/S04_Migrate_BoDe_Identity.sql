-- ============================================================
-- FILE: S04_Migrate_BoDe_Identity.sql
-- THU TU CHAY: S04 (sau S02 CRUD SPs, TRUOC 002_FixBodeCrudSPs)
-- MUC DICH: Chuyen cot CAUHOI tu kieu so nguyen thuong sang INT IDENTITY(1,1)
--           trong khi van giu lai du lieu cu
-- LY DO: Schema goc dinh nghia CAUHOI la INT thuong (tu nhap tay).
--        De tai va logic C# yeu cau CAUHOI la IDENTITY (tu tang) de:
--        1. Dam bao CAUHOI la duy nhat, khong bi trung khi nhieu GV them cung luc.
--        2. SP usp_BoDe_Insert (sau khi fix) tra ve SCOPE_IDENTITY() cho C#.
--        3. Loai bo @CauHoi ra khoi tham so cua SP Insert (khong the INSERT
--           vao cot IDENTITY tu code).
-- PHAN DE TAI: 4.5 - Nhap cau hoi thi
-- BAI GIANG: SQL1 - Kieu du lieu (IDENTITY), SQL5 - Transaction (BEGIN TRY/CATCH)
--
-- !!! CANH BAO QUAN TRONG !!!
-- Day la DESTRUCTIVE MIGRATION: xoa cot CAUHOI cu va tao lai.
-- - Chay trong Transaction: neu loi se tu dong ROLLBACK.
-- - Du lieu cu duoc giu lai qua cot trung gian CAUHOI_NEW.
-- - Chi chay 1 LAN duy nhat. Kiem tra truoc: SELECT COLUMNPROPERTY(
--   OBJECT_ID('BODE'), 'CAUHOI', 'IsIdentity') -- phai tra ve 0 moi chay.
-- ============================================================
USE [THITRACNGHIEM]
GO

BEGIN TRANSACTION;

BEGIN TRY
    -- Buoc 1: Them cot IDENTITY moi (CAUHOI_NEW) de giu du lieu
    ALTER TABLE BODE ADD CAUHOI_NEW INT IDENTITY(1, 1);

    -- Buoc 2: Xoa khoa chinh cu tren cot CAUHOI
    ALTER TABLE BODE
    DROP CONSTRAINT PK_BODE;

    -- Buoc 3: Xoa cot CAUHOI cu
    ALTER TABLE BODE
    DROP COLUMN CAUHOI;

    -- Buoc 4: Doi ten CAUHOI_NEW thanh CAUHOI
    EXEC sp_rename 'BODE.CAUHOI_NEW', 'CAUHOI', 'COLUMN';

    -- Buoc 5: Tao lai khoa chinh tren cot CAUHOI moi
    ALTER TABLE BODE ADD CONSTRAINT PK_BODE PRIMARY KEY (CAUHOI);

    COMMIT TRANSACTION;
    PRINT N'OK: Da chuyen BODE.CAUHOI sang INT IDENTITY(1,1) thanh cong.';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT N'LOI: ' + ERROR_MESSAGE();
END CATCH;
GO
