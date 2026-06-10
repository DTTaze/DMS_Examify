-- ============================================================
-- FILE: 004_FixSearchSPs.sql
-- THU TU CHAY: 5 / 13  (sau 003, cap nhat cac SP da ton tai)
-- MUC DICH: Them OPTION (RECOMPILE) vao tat ca Search SP con lai
-- LY DO: Tat ca Search SP dung pattern:
--          WHERE @Keyword IS NULL OR @Keyword = '' OR col LIKE '%keyword%'
--        SQL Server cache execution plan lan dau goi. Neu lan dau @Keyword = NULL
--        (plan: Full Scan vi khong co filter), lan sau @Keyword = 'SQL'
--        van dung plan Full Scan do du co the dung plan tot hon.
--        OPTION (RECOMPILE) buoc SQL Server tao plan moi dua tren gia tri thuc te.
-- PHAN DE TAI: 4.3 - Nhap sinh vien, 4.5 - Nhap cau hoi thi
-- BAI GIANG: SQL5 - Stored Procedure (Parameter Sniffing, OPTION RECOMPILE)
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
