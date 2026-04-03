CREATE PROCEDURE dbo.usp_GiangVien_Login
    @LoginName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1 1 AS IsValid
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
      AND Password = @PASSWORD;
END
GO

