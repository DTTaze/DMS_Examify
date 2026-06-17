USE [THITRACNGHIEM]
GO

IF COL_LENGTH('dbo.LOP', 'TrangThai') IS NULL
BEGIN
    ALTER TABLE dbo.LOP
    ADD TrangThai BIT NOT NULL
        CONSTRAINT DF_LOP_TrangThai DEFAULT (1);
END
GO

IF COL_LENGTH('dbo.SINHVIEN', 'TrangThai') IS NULL
BEGIN
    ALTER TABLE dbo.SINHVIEN
    ADD TrangThai BIT NOT NULL
        CONSTRAINT DF_SINHVIEN_TrangThai DEFAULT (1);
END
GO

IF OBJECT_ID('dbo.usp_SinhVien_Login', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_SinhVien_Login
GO

CREATE PROCEDURE dbo.usp_SinhVien_Login
    @MASV NVARCHAR(50),
    @PASSWORD NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.SINHVIEN WHERE MASV = @MASV)
    BEGIN
        RAISERROR(N'Tai khoan Sinh vien khong ton tai trong he thong!', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.SINHVIEN WHERE MASV = @MASV AND TrangThai = 0)
    BEGIN
        RAISERROR(N'Tai khoan Sinh vien da ngung su dung!', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.SINHVIEN WHERE MASV = @MASV AND MATKHAU = @PASSWORD AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Mat khau dang nhap khong chinh xac!', 16, 1);
        RETURN;
    END

    SELECT MASV, HO, TEN, MALOP
    FROM dbo.SINHVIEN
    WHERE MASV = @MASV
      AND MATKHAU = @PASSWORD
      AND TrangThai = 1;
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_Login TO [Sinhvien]
GO

IF OBJECT_ID('dbo.usp_SinhVien_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_SinhVien_GetAll
GO

CREATE PROCEDURE dbo.usp_SinhVien_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU
    FROM dbo.SINHVIEN
    WHERE TrangThai = 1;
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_GetAll TO [PGV]
GO
REVOKE EXECUTE ON dbo.usp_SinhVien_GetAll FROM [Giangvien]
GO

IF OBJECT_ID('dbo.usp_SinhVien_GetByLop', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_SinhVien_GetByLop
GO

CREATE PROCEDURE dbo.usp_SinhVien_GetByLop
    @MaLop NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU
    FROM dbo.SINHVIEN
    WHERE MALOP = @MaLop
      AND TrangThai = 1;
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_GetByLop TO [PGV]
GO
REVOKE EXECUTE ON dbo.usp_SinhVien_GetByLop FROM [Giangvien]
GO

IF OBJECT_ID('dbo.usp_SinhVien_Search', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_SinhVien_Search
GO

CREATE PROCEDURE dbo.usp_SinhVien_Search
    @Keyword NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU
    FROM dbo.SINHVIEN
    WHERE TrangThai = 1
      AND (
          @Keyword IS NULL
          OR @Keyword = N''
          OR MASV LIKE N'%' + @Keyword + N'%'
          OR HO LIKE N'%' + @Keyword + N'%'
          OR TEN LIKE N'%' + @Keyword + N'%'
          OR DIACHI LIKE N'%' + @Keyword + N'%'
          OR MALOP LIKE N'%' + @Keyword + N'%'
      )
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_Search TO [PGV]
GO
REVOKE EXECUTE ON dbo.usp_SinhVien_Search FROM [Giangvien]
GO

IF OBJECT_ID('dbo.usp_SinhVien_Insert', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_SinhVien_Insert
GO

CREATE PROCEDURE dbo.usp_SinhVien_Insert
    @MaSV NCHAR(8),
    @Ho NVARCHAR(40),
    @Ten NVARCHAR(10),
    @NgaySinh DATE,
    @DiaChi NVARCHAR(100),
    @MaLop NCHAR(8),
    @MatKhau NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.LOP WHERE MALOP = @MaLop AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Lop khong ton tai hoac da ngung su dung', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.SINHVIEN WHERE MASV = @MaSV)
    BEGIN
        UPDATE dbo.SINHVIEN
        SET HO = @Ho,
            TEN = @Ten,
            NGAYSINH = @NgaySinh,
            DIACHI = @DiaChi,
            MALOP = @MaLop,
            MATKHAU = @MatKhau,
            TrangThai = 1
        WHERE MASV = @MaSV
          AND TrangThai = 0;

        IF @@ROWCOUNT = 0
            RAISERROR(N'Ma sinh vien da ton tai', 16, 1);

        RETURN;
    END

    INSERT INTO dbo.SINHVIEN (MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU, TrangThai)
    VALUES (@MaSV, @Ho, @Ten, @NgaySinh, @DiaChi, @MaLop, @MatKhau, 1);
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_Insert TO [PGV]
GO
REVOKE EXECUTE ON dbo.usp_SinhVien_Insert FROM [Giangvien]
GO

IF OBJECT_ID('dbo.usp_SinhVien_Update', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_SinhVien_Update
GO

CREATE PROCEDURE dbo.usp_SinhVien_Update
    @MaSV NCHAR(8),
    @Ho NVARCHAR(40),
    @Ten NVARCHAR(10),
    @NgaySinh DATE,
    @DiaChi NVARCHAR(100),
    @MaLop NCHAR(8),
    @MatKhau NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.SINHVIEN WHERE MASV = @MaSV AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Khong tim thay sinh vien dang hoat dong', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.LOP WHERE MALOP = @MaLop AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Lop khong ton tai hoac da ngung su dung', 16, 1);
        RETURN;
    END

    UPDATE dbo.SINHVIEN
    SET HO = @Ho,
        TEN = @Ten,
        NGAYSINH = @NgaySinh,
        DIACHI = @DiaChi,
        MALOP = @MaLop,
        MATKHAU = @MatKhau
    WHERE MASV = @MaSV
      AND TrangThai = 1;
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_Update TO [PGV]
GO
REVOKE EXECUTE ON dbo.usp_SinhVien_Update FROM [Giangvien]
GO

IF OBJECT_ID('dbo.usp_SinhVien_Delete', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_SinhVien_Delete
GO

CREATE PROCEDURE dbo.usp_SinhVien_Delete
    @MaSV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.SINHVIEN WHERE MASV = @MaSV AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Khong tim thay sinh vien dang hoat dong', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.BANGDIEM WHERE MASV = @MaSV)
    BEGIN
        UPDATE dbo.SINHVIEN
        SET TrangThai = 0
        WHERE MASV = @MaSV;
        RETURN;
    END

    DELETE FROM dbo.SINHVIEN
    WHERE MASV = @MaSV;
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_Delete TO [PGV]
GO
REVOKE EXECUTE ON dbo.usp_SinhVien_Delete FROM [Giangvien]
GO

IF OBJECT_ID('dbo.usp_Lop_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Lop_GetAll
GO

CREATE PROCEDURE dbo.usp_Lop_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MALOP, TENLOP
    FROM dbo.LOP
    WHERE TrangThai = 1
    ORDER BY MALOP;
END
GO

GRANT EXECUTE ON dbo.usp_Lop_GetAll TO [PGV]
GO

IF OBJECT_ID('dbo.usp_Lop_Search', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Lop_Search
GO

CREATE PROCEDURE dbo.usp_Lop_Search
    @KEYWORD NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MALOP, TENLOP
    FROM dbo.LOP
    WHERE TrangThai = 1
      AND (
          @KEYWORD IS NULL
          OR @KEYWORD = N''
          OR MALOP LIKE N'%' + @KEYWORD + N'%'
          OR TENLOP LIKE N'%' + @KEYWORD + N'%'
      )
    ORDER BY MALOP
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_Lop_Search TO [PGV]
GO
REVOKE EXECUTE ON dbo.usp_Lop_Search FROM [Giangvien]
GO

IF OBJECT_ID('dbo.usp_Lop_Insert', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Lop_Insert
GO

CREATE PROCEDURE dbo.usp_Lop_Insert
    @MALOP NCHAR(8),
    @TENLOP NVARCHAR(40)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.LOP WHERE MALOP = @MALOP)
    BEGIN
        UPDATE dbo.LOP
        SET TENLOP = @TENLOP,
            TrangThai = 1
        WHERE MALOP = @MALOP
          AND TrangThai = 0;

        IF @@ROWCOUNT = 0
            RAISERROR(N'Ma lop da ton tai', 16, 1);

        RETURN;
    END

    INSERT INTO dbo.LOP (MALOP, TENLOP, TrangThai)
    VALUES (@MALOP, @TENLOP, 1);
END
GO

GRANT EXECUTE ON dbo.usp_Lop_Insert TO [PGV]
GO
REVOKE EXECUTE ON dbo.usp_Lop_Insert FROM [Giangvien]
GO

IF OBJECT_ID('dbo.usp_Lop_Update', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Lop_Update
GO

CREATE PROCEDURE dbo.usp_Lop_Update
    @MALOP NCHAR(8),
    @TENLOP NVARCHAR(40)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.LOP WHERE MALOP = @MALOP AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Khong tim thay lop dang hoat dong', 16, 1);
        RETURN;
    END

    UPDATE dbo.LOP
    SET TENLOP = @TENLOP
    WHERE MALOP = @MALOP
      AND TrangThai = 1;
END
GO

GRANT EXECUTE ON dbo.usp_Lop_Update TO [PGV]
GO
REVOKE EXECUTE ON dbo.usp_Lop_Update FROM [Giangvien]
GO

IF OBJECT_ID('dbo.usp_Lop_Delete', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Lop_Delete
GO

CREATE PROCEDURE dbo.usp_Lop_Delete
    @MALOP NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.LOP WHERE MALOP = @MALOP AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Khong tim thay lop dang hoat dong', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.SINHVIEN WHERE MALOP = @MALOP)
       OR EXISTS (SELECT 1 FROM dbo.GIAOVIEN_DANGKY WHERE MALOP = @MALOP)
    BEGIN
        UPDATE dbo.LOP
        SET TrangThai = 0
        WHERE MALOP = @MALOP;
        RETURN;
    END

    DELETE FROM dbo.LOP
    WHERE MALOP = @MALOP;
END
GO

GRANT EXECUTE ON dbo.usp_Lop_Delete TO [PGV]
GO
REVOKE EXECUTE ON dbo.usp_Lop_Delete FROM [Giangvien]
GO

IF OBJECT_ID('dbo.usp_LayDanhSachLop', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_LayDanhSachLop
GO

CREATE PROCEDURE dbo.usp_LayDanhSachLop
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MALOP, TENLOP
    FROM dbo.LOP
    WHERE TrangThai = 1
    ORDER BY MALOP ASC;
END
GO

GRANT EXECUTE ON dbo.usp_LayDanhSachLop TO [PGV]
GO
GRANT EXECUTE ON dbo.usp_LayDanhSachLop TO [Giangvien]
GO

PRINT N'OK: Da sua nghiep vu quan ly SinhVien/Lop: phan quyen, xoa mem, loc trang thai hoat dong.'
GO
