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
        name
END

Grant exec on [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan] to [PGV];