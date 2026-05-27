CREATE PROCEDURE [dbo].[SP_LayThongTinTaiKhoan]
    @TENLOGIN NVARCHAR(50) -- Tên login SQL Server mà ứng dụng C# dùng để kết nối
AS
BEGIN
    DECLARE @USERNAME NVARCHAR(50)
    DECLARE @TENNHOM NVARCHAR(50)

    -- 1. Lấy Tên User trong Database (chính là MAGV) dựa vào Tên Login
    SELECT @USERNAME = name 
    FROM sys.database_principals 
    WHERE sid = SUSER_SID(@TENLOGIN)

    -- 2. Lấy Tên Nhóm Quyền (Role) của User này (PGV, Giangvien, hoặc Sinhvien)
    SELECT top 1 @TENNHOM = UserGroup.name 
    FROM sys.database_role_members DRM
    JOIN sys.database_principals UserGroup ON DRM.role_principal_id = UserGroup.principal_id
    JOIN sys.database_principals Users ON DRM.member_principal_id = Users.principal_id
    WHERE Users.name = @USERNAME

    -- 3. Trả về kết quả tùy theo nhóm quyền
    IF @TENNHOM = 'Sinhvien'
    BEGIN
        -- Nếu là tài khoản chung của sinh viên, ta chỉ trả về Username và Nhóm quyền.
        -- C# sẽ tự dùng MASV nhập trên Form để lấy Họ Tên sau.
        SELECT 
            @USERNAME AS USERNAME, 
            '' AS HOTEN, 
            @TENNHOM AS TENNHOM
    END
    ELSE
    BEGIN
        -- Nếu là Giảng viên hoặc PGV, USERNAME chính là MAGV. 
        -- Ta join vào bảng Giaovien để lấy Họ Tên.
        SELECT 
            @USERNAME AS USERNAME, 
            (HO + ' ' + TEN) AS HOTEN, 
            @TENNHOM AS TENNHOM
        FROM Giaovien 
        WHERE MAGV = @USERNAME
    END
END