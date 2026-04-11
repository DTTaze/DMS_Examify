CREATE PROCEDURE dbo.usp_GiangVien_Login
    @LoginName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        CASE
            WHEN EXISTS (
                SELECT 1
                FROM sys.server_role_members rm
                JOIN sys.server_principals r ON rm.role_principal_id = r.principal_id
                JOIN sys.server_principals m ON rm.member_principal_id = m.principal_id
                WHERE r.name = 'PGV'
                  AND m.name = @LoginName
            ) THEN 'PGV'
            ELSE 'Giangvien'
        END AS UserRole
    FROM sys.sql_logins
    WHERE name = @LoginName;
END
GO

CREATE PROCEDURE dbo.usp_SinhVien_Login
    @MASV NVARCHAR(50),
    @PASSWORD NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MASV, HO, TEN, MALOP
    FROM SINHVIEN
    WHERE MASV = @MASV
      AND MATKHAU = @PASSWORD;
END
GO

