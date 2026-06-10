-- ============================================================
-- FILE: S-05_CreateTaoTaiKhoanSP.sql
-- THU TU CHAY: S-05 / S-12  (sau S-01 PhanQuyen, Role phai ton tai truoc)
-- MUC DICH: Tao SP_TAOTAIKHOAN - PGV tao tai khoan SQL Server cho Giao vien
-- LY DO: PGV can tao Login + User + gan Role cho GV moi.
--        Khong the lam thu cong qua SSMS moi lan, can SP de C# goi tu dong.
--        SP xu ly 3 truong hop loi: Login da ton tai, User da ton tai, loi he thong.
--        Tra ve ma loi: 0 = thanh cong, 1 = Login da ton tai, 2 = User da ton tai,
--        3 = loi he thong bat ngo.
-- PHAN DE TAI: 4.2 - Tao tai khoan (PGV tao GV)
-- BAI GIANG: SQL7 - Bao mat (sp_addlogin, sp_adduser, sp_addrolemember)
-- ============================================================
USE [THITRACNGHIEM]
GO

CREATE PROCEDURE [dbo].[SP_TAOTAIKHOAN]
    @LGNAME  VARCHAR(50),   -- Ten dang nhap (Login name)
    @PASS    VARCHAR(50),   -- Mat khau
    @USERNAME VARCHAR(50),  -- Ten User trong database (thuong chinh la Ma Giao Vien - MAGV)
    @ROLE    VARCHAR(50)    -- Ten nhom quyen ('PGV' hoac 'Giangvien')
AS
BEGIN
    -- 1. Kiem tra xem Login name da ton tai tren Server chua
    IF EXISTS (SELECT * FROM sys.server_principals WHERE name = @LGNAME)
        RETURN 1; -- Tra ve 1: Loi do Login name da ton tai

    -- 2. Kiem tra xem User (Ma Giao Vien) da duoc cap tai khoan trong Database chua
    IF EXISTS (SELECT * FROM sys.database_principals WHERE name = @USERNAME)
        RETURN 2; -- Tra ve 2: Loi do User nay da co tai khoan roi

    BEGIN TRY
        -- 3. Tao Login o muc Server
        EXEC sp_addlogin @loginame = @LGNAME, @passwd = @PASS;

        -- 4. Tao User o muc Database, lien ket voi Login vua tao
        EXEC sp_adduser @loginame = @LGNAME, @name_in_db = @USERNAME;

        -- 5. Gan User vao Role (Nhom quyen PGV hoac Giangvien)
        EXEC sp_addrolemember @rolename = @ROLE, @membername = @USERNAME;

        -- Neu moi thu suon se
        RETURN 0;
    END TRY
    BEGIN CATCH
        -- Xu ly neu co loi bat ngo xay ra trong qua trinh tao
        -- Xoa login neu bi loi giua chung de tranh rac he thong
        IF EXISTS (SELECT * FROM sys.server_principals WHERE name = @LGNAME)
            EXEC sp_droplogin @loginame = @LGNAME;

        RETURN 3; -- Tra ve 3: Loi he thong trong qua trinh thuc thi
    END CATCH
END
GO

PRINT N'OK: Da tao SP_TAOTAIKHOAN.';
GO
