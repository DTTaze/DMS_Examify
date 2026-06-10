-- ============================================================
-- FILE: S-02_CreateCrudStoredProcedures.sql
-- THU TU CHAY: S-02 / S-12  (sau S-01 PhanQuyen, truoc S-08 IDENTITY Migration)
-- MUC DICH: Tao toan bo SP CRUD goc cho MonHoc, GiaoVien, SinhVien, BoDe, Lop
-- LY DO: Cung cap day du SP CRUD de C# goi. Cac SP nay la phien ban
--        KHOI TAO dau tien, duoc viet dua tren schema ban dau.
-- PHAN DE TAI: 4.3 - Nhap sinh vien, 4.4 - Quan ly GV, 4.5 - Nhap cau hoi
-- BAI GIANG: SQL5 - Stored Procedure (CRUD)
--
-- !!! CHU Y QUAN TRONG !!!
-- File nay chua CAC LOI DA BIET se duoc fix trong Migration sau:
--   1. usp_BoDe_*: Dung ten cot SAI (DapAnA, DapAnB... thay vi A, B...)
--      -> Da duoc fix trong: 002_FixBodeCrudSPs.sql
--   2. usp_BoDe_Insert: Co tham so @CauHoi INT nhung CAUHOI la IDENTITY
--      -> Da duoc fix trong: 002_FixBodeCrudSPs.sql
--   3. usp_SinhVien_*: Chua co cot MATKHAU trong schema goc
--      -> Da them cot trong: 000_AlterSinhVienAddMatKhau.sql
--   4. usp_BoDe_Search, usp_SinhVien_Search...: Thieu OPTION (RECOMPILE)
--      -> Da duoc fix trong: 004_FixSearchSPs.sql
-- Chay file nay truoc, sau do chay cac Migration 000-012 de fix loi.
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- Stored Procedures for MonHoc
-- ------------------------------------------------------------
CREATE PROCEDURE dbo.usp_MonHoc_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaMH, TenMH
    FROM MONHOC;
END
GO

CREATE PROCEDURE dbo.usp_MonHoc_Insert
    @MaMH NVARCHAR(50),
    @TenMH NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO MONHOC (MaMH, TenMH)
    VALUES (@MaMH, @TenMH);
END
GO

CREATE PROCEDURE dbo.usp_MonHoc_Update
    @MaMH NVARCHAR(50),
    @TenMH NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE MONHOC
    SET TenMH = @TenMH
    WHERE MaMH = @MaMH;
END
GO

CREATE PROCEDURE dbo.usp_MonHoc_Delete
    @MaMH NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM MONHOC WHERE MaMH = @MaMH;
END
GO

CREATE PROCEDURE dbo.usp_MonHoc_Search
    @Keyword NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaMH, TenMH
    FROM MONHOC
    WHERE @Keyword IS NULL OR @Keyword = ''
       OR MaMH LIKE '%' + @Keyword + '%'
       OR TenMH LIKE '%' + @Keyword + '%';
END
GO

-- ------------------------------------------------------------
-- Stored Procedures for GiaoVien
-- ------------------------------------------------------------
CREATE PROCEDURE dbo.usp_GiaoVien_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaGV, Ho, Ten, SoDTLL, DiaChi
    FROM GIAOVIEN;
END
GO

CREATE PROCEDURE dbo.usp_GiaoVien_Insert
    @MaGV NVARCHAR(50),
    @Ho NVARCHAR(100),
    @Ten NVARCHAR(100),
    @SoDTLL NVARCHAR(20),
    @DiaChi NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO GIAOVIEN (MaGV, Ho, Ten, SoDTLL, DiaChi)
    VALUES (@MaGV, @Ho, @Ten, @SoDTLL, @DiaChi);
END
GO

CREATE PROCEDURE dbo.usp_GiaoVien_Update
    @MaGV NVARCHAR(50),
    @Ho NVARCHAR(100),
    @Ten NVARCHAR(100),
    @SoDTLL NVARCHAR(20),
    @DiaChi NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE GIAOVIEN
    SET Ho = @Ho, Ten = @Ten, SoDTLL = @SoDTLL, DiaChi = @DiaChi
    WHERE MaGV = @MaGV;
END
GO

CREATE PROCEDURE dbo.usp_GiaoVien_Delete
    @MaGV NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM GIAOVIEN WHERE MaGV = @MaGV;
END
GO

CREATE PROCEDURE dbo.usp_GiaoVien_Search
    @Keyword NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaGV, Ho, Ten, SoDTLL, DiaChi
    FROM GIAOVIEN
    WHERE @Keyword IS NULL OR @Keyword = ''
       OR MaGV LIKE '%' + @Keyword + '%'
       OR Ho LIKE '%' + @Keyword + '%'
       OR Ten LIKE '%' + @Keyword + '%'
       OR SoDTLL LIKE '%' + @Keyword + '%'
       OR DiaChi LIKE '%' + @Keyword + '%';
END
GO

-- ------------------------------------------------------------
-- Stored Procedures for SinhVien
-- (Luu y: cot MATKHAU duoc them qua 000_AlterSinhVienAddMatKhau.sql)
-- ------------------------------------------------------------
CREATE PROCEDURE dbo.usp_SinhVien_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaSV, Ho, Ten, NgaySinh, DiaChi, MaLop, MatKhau
    FROM SINHVIEN;
END
GO

CREATE PROCEDURE dbo.usp_SinhVien_GetByLop
    @MaLop NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaSV, Ho, Ten, NgaySinh, DiaChi, MaLop, MatKhau
    FROM SINHVIEN
    WHERE MaLop = @MaLop;
END
GO

CREATE PROCEDURE dbo.usp_SinhVien_Insert
    @MaSV NVARCHAR(50),
    @Ho NVARCHAR(100),
    @Ten NVARCHAR(100),
    @NgaySinh DATE,
    @DiaChi NVARCHAR(250),
    @MaLop NVARCHAR(50),
    @MatKhau NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO SINHVIEN (MaSV, Ho, Ten, NgaySinh, DiaChi, MaLop, MatKhau)
    VALUES (@MaSV, @Ho, @Ten, @NgaySinh, @DiaChi, @MaLop, @MatKhau);
END
GO

CREATE PROCEDURE dbo.usp_SinhVien_Update
    @MaSV NVARCHAR(50),
    @Ho NVARCHAR(100),
    @Ten NVARCHAR(100),
    @NgaySinh DATE,
    @DiaChi NVARCHAR(250),
    @MaLop NVARCHAR(50),
    @MatKhau NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE SINHVIEN
    SET Ho = @Ho, Ten = @Ten, NgaySinh = @NgaySinh, DiaChi = @DiaChi, MaLop = @MaLop, MatKhau = @MatKhau
    WHERE MaSV = @MaSV;
END
GO

CREATE PROCEDURE dbo.usp_SinhVien_Delete
    @MaSV NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM SINHVIEN WHERE MaSV = @MaSV;
END
GO

CREATE PROCEDURE dbo.usp_SinhVien_Search
    @Keyword NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaSV, Ho, Ten, NgaySinh, DiaChi, MaLop, MatKhau
    FROM SINHVIEN
    WHERE @Keyword IS NULL OR @Keyword = ''
       OR MaSV LIKE '%' + @Keyword + '%'
       OR Ho LIKE '%' + @Keyword + '%'
       OR Ten LIKE '%' + @Keyword + '%'
       OR DiaChi LIKE '%' + @Keyword + '%'
       OR MaLop LIKE '%' + @Keyword + '%';
END
GO

-- ------------------------------------------------------------
-- Stored Procedures for BoDe
-- !!! CANH BAO: Cac SP nay dung ten cot SAI. Da duoc fix trong 002_FixBodeCrudSPs.sql !!!
-- ------------------------------------------------------------
CREATE PROCEDURE dbo.usp_BoDe_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    -- LOI: Ten cot thuc te la A, B, C, D, DAP_AN (khong phai DapAnA, DapAnB...)
    SELECT CauHoi, MaMH, TrinhDo, NoiDung, DapAnA, DapAnB, DapAnC, DapAnD, DapAn, MaGV
    FROM BODE;
END
GO

CREATE PROCEDURE dbo.usp_BoDe_Insert
    @CauHoi INT,       -- LOI: CAUHOI la IDENTITY, khong the INSERT gia tri nay
    @MaMH NVARCHAR(50),
    @TrinhDo NVARCHAR(10),
    @NoiDung NVARCHAR(MAX),
    @DapAnA NVARCHAR(MAX),
    @DapAnB NVARCHAR(MAX),
    @DapAnC NVARCHAR(MAX),
    @DapAnD NVARCHAR(MAX),
    @DapAn NVARCHAR(10),
    @MaGV NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO BODE (CauHoi, MaMH, TrinhDo, NoiDung, DapAnA, DapAnB, DapAnC, DapAnD, DapAn, MaGV)
    VALUES (@CauHoi, @MaMH, @TrinhDo, @NoiDung, @DapAnA, @DapAnB, @DapAnC, @DapAnD, @DapAn, @MaGV);
END
GO

CREATE PROCEDURE dbo.usp_BoDe_Update
    @CauHoi INT,
    @MaMH NVARCHAR(50),
    @TrinhDo NVARCHAR(10),
    @NoiDung NVARCHAR(MAX),
    @DapAnA NVARCHAR(MAX),
    @DapAnB NVARCHAR(MAX),
    @DapAnC NVARCHAR(MAX),
    @DapAnD NVARCHAR(MAX),
    @DapAn NVARCHAR(10),
    @MaGV NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE BODE
    SET TrinhDo = @TrinhDo,
        NoiDung = @NoiDung,
        DapAnA = @DapAnA,
        DapAnB = @DapAnB,
        DapAnC = @DapAnC,
        DapAnD = @DapAnD,
        DapAn = @DapAn,
        MaGV = @MaGV
    WHERE CauHoi = @CauHoi AND MaMH = @MaMH;
END
GO

CREATE PROCEDURE dbo.usp_BoDe_Delete
    @CauHoi INT,
    @MaMH NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM BODE WHERE CauHoi = @CauHoi AND MaMH = @MaMH;
END
GO

CREATE PROCEDURE dbo.usp_BoDe_Search
    @Keyword NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CauHoi, MaMH, TrinhDo, NoiDung, DapAnA, DapAnB, DapAnC, DapAnD, DapAn, MaGV
    FROM BODE
    WHERE @Keyword IS NULL OR @Keyword = ''
       OR MaMH LIKE '%' + @Keyword + '%'
       OR NoiDung LIKE '%' + @Keyword + '%'
       OR MaGV LIKE '%' + @Keyword + '%';
END
GO

-- ------------------------------------------------------------
-- Stored Procedures for Lop
-- ------------------------------------------------------------
CREATE PROCEDURE usp_Lop_Insert
    @MALOP NCHAR(15),
    @TENLOP NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP)
    BEGIN
        RAISERROR(N'Ma lop da ton tai', 16, 1);
        RETURN;
    END

    INSERT INTO LOP(MALOP, TENLOP)
    VALUES(@MALOP, @TENLOP);
END
GO

CREATE PROCEDURE usp_Lop_Update
    @MALOP NCHAR(15),
    @TENLOP NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP)
    BEGIN
        RAISERROR(N'Khong tim thay lop', 16, 1);
        RETURN;
    END

    UPDATE LOP
    SET TENLOP = @TENLOP
    WHERE MALOP = @MALOP;
END
GO

CREATE PROCEDURE usp_Lop_Delete
    @MALOP NCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP)
    BEGIN
        RAISERROR(N'Khong tim thay lop', 16, 1);
        RETURN;
    END

    DELETE FROM LOP
    WHERE MALOP = @MALOP;
END
GO

CREATE PROCEDURE usp_Lop_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MALOP,
        TENLOP
    FROM LOP
    ORDER BY MALOP;
END
GO

PRINT N'OK: Da tao toan bo SP CRUD (MonHoc, GiaoVien, SinhVien, BoDe, Lop).';
GO
