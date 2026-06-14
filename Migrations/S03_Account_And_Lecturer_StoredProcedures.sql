-- ============================================================
-- FILE: S03_Account_And_Lecturer_StoredProcedures.sql
-- THU TU CHAY: S03 (sau S01 PhanQuyen, Role phai ton tai truoc)
-- MUC DICH: Gom cac SP quan ly tai khoan va thong tin Giang vien:
--   1. SP_TAOTAIKHOAN
--   2. usp_LayDanhSachQuyen_TaoTaiKhoan
--   3. usp_LayThongTinGiaoVienTheoMa
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. SP_TAOTAIKHOAN
--    PGV tao tai khoan SQL Server cho Giao vien (Login + User + Role)
-- ------------------------------------------------------------
CREATE PROCEDURE [dbo].[SP_TAOTAIKHOAN]
    @LGNAME  VARCHAR(50),   -- Ten dang nhap (Login name)
    @PASS    VARCHAR(50),   -- Mat khau
    @USERNAME VARCHAR(50),  -- Ten User trong database (Ma Giao Vien)
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

        RETURN 0; -- Thanh cong
    END TRY
    BEGIN CATCH
        -- Xoa login neu bi loi giua chung de tranh rac he thong
        IF EXISTS (SELECT * FROM sys.server_principals WHERE name = @LGNAME)
            EXEC sp_droplogin @loginame = @LGNAME;

        RETURN 3; -- Loi he thong bat ngo
    END CATCH
END
GO

GRANT EXECUTE ON [dbo].[SP_TAOTAIKHOAN] TO [PGV];
GO

PRINT N'OK: Da tao SP_TAOTAIKHOAN.';
GO

-- ------------------------------------------------------------
-- 2. usp_LayDanhSachQuyen_TaoTaiKhoan
--    Lay danh sach cac Role co the chon khi PGV tao tai khoan GV
-- ------------------------------------------------------------
CREATE PROCEDURE [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        name AS TenNhomQuyen
    FROM
        sys.database_principals
    WHERE
        type = 'R'
        AND name IN ('PGV', 'Giangvien')
    ORDER BY
        name;
END
GO

GRANT EXECUTE ON [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan] TO [PGV];
GO

PRINT N'OK: Da tao usp_LayDanhSachQuyen_TaoTaiKhoan.';
GO

-- ------------------------------------------------------------
-- 3. usp_LayThongTinGiaoVienTheoMa
--    Lay thong tin chi tiet cua 1 Giao vien theo MAGV
-- ------------------------------------------------------------
CREATE PROCEDURE [dbo].[usp_LayThongTinGiaoVienTheoMa]
    @MAGV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MAGV,
        HO,
        TEN,
        SODTLL,
        DIACHI
    FROM Giaovien
    WHERE MAGV = @MAGV;
END
GO

GRANT EXECUTE ON dbo.usp_LayThongTinGiaoVienTheoMa TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_LayThongTinGiaoVienTheoMa TO [Giangvien];
GO

PRINT N'OK: Da tao usp_LayThongTinGiaoVienTheoMa.';
GO
