-- ============================================================
-- FILE: 005_AddHoTenFunctionAndUpdateSP.sql
-- THU TU CHAY: 6 / 13  (sau 004, Function nay duoc dung boi 010, 012)
-- MUC DICH:
--   1. Tao Function udf_LayHoTen(@Ho, @Ten) -> NVARCHAR(62)
--   2. Cap nhat SP_LayThongTinTaiKhoan dung Function thay vi ghep thu cong
-- LY DO:
--   SP_LayThongTinTaiKhoan hien dang dung (HO + ' ' + TEN) inline.
--   Van de: Neu HO hoac TEN la NULL, ket qua la NULL toan bo trong SQL Server
--   vi NULL + bat ky = NULL. Vi du: NULL + ' ' + 'HUNG' = NULL.
--   Function voi ISNULL xu ly an toan truong hop nay.
--   Dong thoi tai su dung logic o cac SP khac neu can sau nay.
-- PHAN DE TAI: 4.2 - Dang nhap (Giao vien / PGV)
-- BAI GIANG: SQL4 - User-defined Function (Scalar Function)
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. Tạo Function udf_LayHoTen
-- ------------------------------------------------------------
CREATE OR ALTER FUNCTION dbo.udf_LayHoTen(
    @Ho  NVARCHAR(50),
    @Ten NVARCHAR(10)
)
RETURNS NVARCHAR(62)
AS
BEGIN
    -- ISNULL: nếu @Ho hoặc @Ten là NULL thì dùng chuỗi rỗng thay vì NULL
    -- LTRIM(RTRIM(...)): cắt khoảng trắng đầu/cuối
    -- Kết quả: 'LE VAN HUNG', 'NGUYEN ANH' (không bị lỗi khi NULL)
    RETURN LTRIM(RTRIM(ISNULL(@Ho, N'') + N' ' + ISNULL(@Ten, N'')));
END
GO

PRINT N'OK: Đã tạo Function udf_LayHoTen.';
GO

-- ------------------------------------------------------------
-- 2. Cập nhật SP_LayThongTinTaiKhoan — dùng udf_LayHoTen
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE [dbo].[SP_LayThongTinTaiKhoan]
    @TENLOGIN NVARCHAR(50) -- Tên login SQL Server mà ứng dụng C# dùng để kết nối
AS
BEGIN
    DECLARE @USERNAME NVARCHAR(50)
    DECLARE @TENNHOM  NVARCHAR(50)

    -- 1. Lấy Tên User trong Database (chính là MAGV) dựa vào Tên Login
    SELECT @USERNAME = name
    FROM sys.database_principals
    WHERE sid = SUSER_SID(@TENLOGIN)

    -- 2. Lấy Tên Nhóm Quyền (Role) của User này (PGV, Giangvien, hoặc Sinhvien)
    SELECT TOP 1 @TENNHOM = UserGroup.name
    FROM sys.database_role_members DRM
    JOIN sys.database_principals UserGroup ON DRM.role_principal_id = UserGroup.principal_id
    JOIN sys.database_principals Users     ON DRM.member_principal_id = Users.principal_id
    WHERE Users.name = @USERNAME

    -- 3. Trả về kết quả tùy theo nhóm quyền
    IF @TENNHOM = 'Sinhvien'
    BEGIN
        -- Tài khoản chung của sinh viên: chỉ trả Username và Nhóm quyền
        -- C# sẽ dùng MASV nhập trên Form để lấy Họ Tên riêng
        SELECT
            @USERNAME AS USERNAME,
            ''         AS HOTEN,
            @TENNHOM   AS TENNHOM
    END
    ELSE
    BEGIN
        -- GV hoặc PGV: USERNAME chính là MAGV, join vào GIAOVIEN để lấy Họ Tên
        -- Dùng udf_LayHoTen thay vì (HO + ' ' + TEN) để xử lý NULL an toàn
        SELECT
            @USERNAME                         AS USERNAME,
            dbo.udf_LayHoTen(HO, TEN)         AS HOTEN,
            @TENNHOM                           AS TENNHOM
        FROM GIAOVIEN
        WHERE MAGV = @USERNAME
    END
END
GO

PRINT N'OK: SP_LayThongTinTaiKhoan đã được cập nhật (dùng udf_LayHoTen).';
GO
