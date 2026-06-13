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

ALTER PROCEDURE [dbo].[SP_LayThongTinTaiKhoan]
    @TENLOGIN NVARCHAR(50) = NULL -- Gán mặc định NULL để linh hoạt gọi từ C#
AS
BEGIN
    SET NOCOUNT ON;

    -- Tự động lấy tên Login hiện tại nếu Client không truyền vào
    IF @TENLOGIN IS NULL OR @TENLOGIN = ''
    BEGIN
        SET @TENLOGIN = SUSER_SNAME();
    END

    DECLARE @USERNAME NVARCHAR(50)
    DECLARE @TENNHOM  NVARCHAR(50)

    -- 1. Lấy Tên User trong Database dựa vào SID của Login
    SELECT @USERNAME = name
    FROM sys.database_principals
    WHERE sid = SUSER_SID(@TENLOGIN);

    -- Kiểm tra lỗi nếu Login chưa được map vào Database
    IF @USERNAME IS NULL
    BEGIN
        RAISERROR(N'Tài khoản đăng nhập chưa được ánh xạ (map) vào Database!', 16, 1);
        RETURN;
    END

    -- 2. Lấy Tên Nhóm Quyền (Role) của User (chỉ lấy các nhóm nghiệp vụ chính)
    SELECT TOP 1 @TENNHOM = UserGroup.name
    FROM sys.database_role_members DRM
    JOIN sys.database_principals UserGroup ON DRM.role_principal_id = UserGroup.principal_id
    JOIN sys.database_principals Users     ON DRM.member_principal_id = Users.principal_id
    WHERE Users.name = @USERNAME
      AND UserGroup.name IN ('PGV', 'Giangvien', 'Sinhvien');

    -- 3. Trả về kết quả tùy theo nhóm quyền
    IF @TENNHOM = 'Sinhvien'
    BEGIN
        -- Nếu là Sinh viên (dùng chung login sv), chỉ trả về tên login sv và nhóm quyền
        SELECT
            @USERNAME AS USERNAME,
            N'Sinh Viên dùng chung' AS HOTEN,
            @TENNHOM   AS TENNHOM
    END
    ELSE
    BEGIN
        -- Nếu là Giảng viên hoặc PGV, kết nối bảng GIAOVIEN lấy Họ Tên (sử dụng CONCAT an toàn)
        SELECT
            @USERNAME          AS USERNAME,
            LTRIM(RTRIM(CONCAT(HO, ' ', TEN))) AS HOTEN,
            @TENNHOM           AS TENNHOM
        FROM GIAOVIEN
        WHERE MAGV = @USERNAME;
    END
END
GO


PRINT N'OK: Da tao SP_LayThongTinTaiKhoan.';
GO
