-- ============================================================
-- FILE: 004_FixSearchSPs.sql
-- MỤC ĐÍCH: Thêm OPTION (RECOMPILE) vào tất cả Search SP còn lại
-- LÝ DO:  Tất cả Search SP dùng pattern:
--           WHERE @Keyword IS NULL OR @Keyword = '' OR col LIKE '%keyword%'
--         SQL Server cache execution plan lần đầu gọi. Nếu lần đầu @Keyword = NULL
--         (plan: Full Scan vì không có filter), lần sau @Keyword = 'SQL'
--         vẫn dùng plan Full Scan đó dù có thể dùng plan tốt hơn.
--         OPTION (RECOMPILE) buộc SQL Server tạo plan mới dựa trên giá trị thực tế.
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. usp_SinhVien_Search + OPTION RECOMPILE
--    Cũng cập nhật để SELECT bao gồm MATKHAU (sau khi cột đã được thêm).
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_Search
    @Keyword NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU
    FROM SINHVIEN
    WHERE @Keyword IS NULL OR @Keyword = ''
       OR MASV   LIKE '%' + @Keyword + '%'
       OR HO     LIKE '%' + @Keyword + '%'
       OR TEN    LIKE '%' + @Keyword + '%'
       OR DIACHI LIKE '%' + @Keyword + '%'
       OR MALOP  LIKE '%' + @Keyword + '%'
    OPTION (RECOMPILE);
END
GO

PRINT N'OK: usp_SinhVien_Search đã được cập nhật (thêm OPTION RECOMPILE, thêm MATKHAU).';
GO

-- ------------------------------------------------------------
-- 2. usp_GiaoVien_Search + OPTION RECOMPILE
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_GiaoVien_Search
    @Keyword NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MAGV, HO, TEN, SODTLL, DIACHI
    FROM GIAOVIEN
    WHERE @Keyword IS NULL OR @Keyword = ''
       OR MAGV   LIKE '%' + @Keyword + '%'
       OR HO     LIKE '%' + @Keyword + '%'
       OR TEN    LIKE '%' + @Keyword + '%'
       OR SODTLL LIKE '%' + @Keyword + '%'
       OR DIACHI LIKE '%' + @Keyword + '%'
    OPTION (RECOMPILE);
END
GO

PRINT N'OK: usp_GiaoVien_Search đã được cập nhật (thêm OPTION RECOMPILE).';
GO

-- ------------------------------------------------------------
-- 3. usp_MonHoc_Search + OPTION RECOMPILE
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_Search
    @Keyword NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MAMH, TENMH
    FROM MONHOC
    WHERE @Keyword IS NULL OR @Keyword = ''
       OR MAMH  LIKE '%' + @Keyword + '%'
       OR TENMH LIKE '%' + @Keyword + '%'
    OPTION (RECOMPILE);
END
GO

PRINT N'OK: usp_MonHoc_Search đã được cập nhật (thêm OPTION RECOMPILE).';
GO
