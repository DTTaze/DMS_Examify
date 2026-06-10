-- ============================================================
-- FILE: S-04_SP_LayThongTinTaiKhoan.sql
-- THU TU CHAY: S-04 / S-12  (sau S-01, can Role PGV/Giangvien/Sinhvien)
-- MUC DICH: Tao SP_LayThongTinTaiKhoan - lay Username, HoTen, TenNhom
--           sau khi nguoi dung dang nhap thanh cong vao SQL Server
-- LY DO: Sau khi xac thuc password o tang SQL Server Authentication,
--        C# goi SP nay de biet nguoi dung thuoc nhom quyen nao
--        va lay Ho Ten de hien thi tren giao dien chinh.
-- PHAN DE TAI: 4.1 - Dang nhap (SV), 4.2 - Dang nhap (GV/PGV)
-- BAI GIANG: SQL5 - Stored Procedure, SQL7 - Bao mat (sys.database_principals)
--
-- !!! CHU Y !!!
-- Phien ban nay ghep HoTen theo cong thuc: (HO + ' ' + TEN)
-- LOI: Neu HO hoac TEN la NULL thi HOTEN se tra ve NULL
-- -> Da duoc fix trong: 005_AddHoTenFunctionAndUpdateSP.sql
--    (Dung udf_LayHoTen de xu ly NULL an toan)
-- ============================================================
USE [THITRACNGHIEM]
GO

CREATE PROCEDURE [dbo].[SP_LayThongTinTaiKhoan]
    @TENLOGIN NVARCHAR(50) -- Ten login SQL Server ma ung dung C# dung de ket noi
AS
BEGIN
    DECLARE @USERNAME NVARCHAR(50)
    DECLARE @TENNHOM  NVARCHAR(50)

    -- 1. Lay Ten User trong Database (chinh la MAGV) dua vao Ten Login
    SELECT @USERNAME = name
    FROM sys.database_principals
    WHERE sid = SUSER_SID(@TENLOGIN)

    -- 2. Lay Ten Nhom Quyen (Role) cua User nay (PGV, Giangvien, hoac Sinhvien)
    SELECT top 1 @TENNHOM = UserGroup.name
    FROM sys.database_role_members DRM
    JOIN sys.database_principals UserGroup ON DRM.role_principal_id = UserGroup.principal_id
    JOIN sys.database_principals Users     ON DRM.member_principal_id = Users.principal_id
    WHERE Users.name = @USERNAME

    -- 3. Tra ve ket qua tuy theo nhom quyen
    IF @TENNHOM = 'Sinhvien'
    BEGIN
        -- Neu la tai khoan chung cua sinh vien, chi tra ve Username va Nhom quyen.
        -- C# se tu dung MASV nhap tren Form de lay Ho Ten sau.
        SELECT
            @USERNAME AS USERNAME,
            ''         AS HOTEN,
            @TENNHOM   AS TENNHOM
    END
    ELSE
    BEGIN
        -- Neu la Giang vien hoac PGV, USERNAME chinh la MAGV.
        -- Join vao bang Giaovien de lay Ho Ten.
        -- LOI: (HO + ' ' + TEN) se NULL neu HO hoac TEN la NULL
        -- -> Da fix trong 005_AddHoTenFunctionAndUpdateSP.sql
        SELECT
            @USERNAME          AS USERNAME,
            (HO + ' ' + TEN)   AS HOTEN,
            @TENNHOM           AS TENNHOM
        FROM Giaovien
        WHERE MAGV = @USERNAME
    END
END
GO

PRINT N'OK: Da tao SP_LayThongTinTaiKhoan.';
GO
