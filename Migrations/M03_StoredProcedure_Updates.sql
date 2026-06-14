-- ============================================================
-- FILE: M03_StoredProcedure_Updates.sql
-- MUC DICH: Gom tat ca cac stored procedure duoc sua doi hoac bo sung:
--   1. SP_LayThongTinTaiKhoan (tu 000, updated o 005)
--   2. usp_SinhVien_Login (tu 000)
--   3. Các SP CRUD của Bộ Đề (usp_BoDe_GetAll, usp_BoDe_Insert, usp_BoDe_Update, usp_BoDe_Search) (tu 002)
--   4. Các SP bổ sung (usp_GetCauHoiByGiangVien, usp_BoDe_GetLatestCauHoi, usp_Lop_Search) (tu 003)
--   5. Các SP Tìm Kiếm tối ưu RECOMPILE (usp_SinhVien_Search, usp_GiaoVien_Search, usp_MonHoc_Search) (tu 004)
--   6. SP Tìm Kiếm Nâng Cao usp_BoDe_TimKiemNangCao (tu 012)
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. SP_LayThongTinTaiKhoan
-- ------------------------------------------------------------
-- // TODO: Chuyển từ database_role_members và database_principals sang syslogins và sysusers
-- // TODO: Không cần trả về thông tin sinh viên vì sinh viên không sử dụng SP này. 
-- // TODO: Đặt tên theo cấu trúc usp_Table_HanhDong
CREATE OR ALTER PROCEDURE [dbo].[SP_LayThongTinTaiKhoan]
    @TENLOGIN NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @TENLOGIN IS NULL OR @TENLOGIN = ''
    BEGIN
        SET @TENLOGIN = SUSER_SNAME();
    END

    DECLARE @USERNAME NVARCHAR(50)
    DECLARE @TENNHOM  NVARCHAR(50)

    SELECT @USERNAME = name
    FROM sys.database_principals
    WHERE sid = SUSER_SID(@TENLOGIN)
    
    IF @USERNAME IS NULL
    BEGIN
        RAISERROR(N'Tài khoản đăng nhập chưa được ánh xạ (map) vào Database!', 16, 1);
        RETURN;
    END

    SELECT TOP 1 @TENNHOM = UserGroup.name
    FROM sys.database_role_members DRM
    JOIN sys.database_principals UserGroup ON DRM.role_principal_id = UserGroup.principal_id
    JOIN sys.database_principals Users     ON DRM.member_principal_id = Users.principal_id
    WHERE Users.name = @USERNAME
      AND UserGroup.name IN ('PGV', 'Giangvien', 'Sinhvien');

    IF @TENNHOM = 'Sinhvien'
    BEGIN
        SELECT
            @USERNAME AS USERNAME,
            N'Sinh Viên dùng chung' AS HOTEN,
            @TENNHOM   AS TENNHOM
    END
    ELSE
    BEGIN
        SELECT
            @USERNAME                         AS USERNAME,
            dbo.udf_LayHoTen(HO, TEN)         AS HOTEN,
            @TENNHOM                           AS TENNHOM
        FROM GIAOVIEN
        WHERE MAGV = @USERNAME
    END
END
GO

GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [PGV];
GO
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [Giangvien];
GO
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [Sinhvien];
GO

PRINT N'OK: SP_LayThongTinTaiKhoan đã được cập nhật.';
GO

-- ------------------------------------------------------------
-- 2. usp_SinhVien_Login
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_Login
    @MASV NVARCHAR(50),
    @PASSWORD NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV)
    BEGIN
        RAISERROR(N'Tài khoản Sinh viên không tồn tại trong hệ thống!', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV AND MATKHAU = @PASSWORD)
    BEGIN
        RAISERROR(N'Mật khẩu đăng nhập không chính xác!', 16, 1);
        RETURN;
    END

    SELECT MASV, HO, TEN, MALOP
    FROM SINHVIEN
    WHERE MASV = @MASV AND MATKHAU = @PASSWORD;
END
GO

GRANT EXECUTE ON [dbo].[usp_SinhVien_Login] TO [Sinhvien];
GO

PRINT N'OK: Da tao usp_SinhVien_Login.';
GO

-- ------------------------------------------------------------
-- 3. Các SP CRUD của Bộ Đề
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_BoDe_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM BODE
    ORDER BY CAUHOI;
END
GO

PRINT N'OK: usp_BoDe_GetAll đã được cập nhật.';
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Insert
    @MaMH    NVARCHAR(50),
    @TrinhDo NVARCHAR(10),
    @NoiDung NVARCHAR(MAX),
    @DapAnA  NVARCHAR(MAX),
    @DapAnB  NVARCHAR(MAX),
    @DapAnC  NVARCHAR(MAX),
    @DapAnD  NVARCHAR(MAX),
    @DapAn   NVARCHAR(10),
    @MaGV    NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO BODE (MAMH, TRINHDO, NOIDUNG, A, B, C, D, DAP_AN, MAGV)
    VALUES (@MaMH, @TrinhDo, @NoiDung, @DapAnA, @DapAnB, @DapAnC, @DapAnD, @DapAn, @MaGV);

    SELECT SCOPE_IDENTITY() AS CauHoi;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Insert TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_BoDe_Insert TO [Giangvien];
GO

PRINT N'OK: usp_BoDe_Insert đã được cập nhật.';
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Update
    @CauHoi  INT,
    @MaMH    NVARCHAR(50),
    @TrinhDo NVARCHAR(10),
    @NoiDung NVARCHAR(MAX),
    @DapAnA  NVARCHAR(MAX),
    @DapAnB  NVARCHAR(MAX),
    @DapAnC  NVARCHAR(MAX),
    @DapAnD  NVARCHAR(MAX),
    @DapAn   NVARCHAR(10),
    @MaGV    NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE BODE
    SET TRINHDO = @TrinhDo,
        NOIDUNG = @NoiDung,
        A       = @DapAnA,
        B       = @DapAnB,
        C       = @DapAnC,
        D       = @DapAnD,
        DAP_AN  = @DapAn,
        MAGV    = @MaGV
    WHERE CAUHOI = @CauHoi AND MAMH = @MaMH;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Update TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_BoDe_Update TO [Giangvien];
GO

PRINT N'OK: usp_BoDe_Update đã được cập nhật.';
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Search
    @Keyword NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM BODE
    WHERE @Keyword IS NULL OR @Keyword = ''
       OR MAMH    LIKE '%' + @Keyword + '%'
       OR NOIDUNG LIKE '%' + @Keyword + '%'
       OR MAGV    LIKE '%' + @Keyword + '%'
    ORDER BY CAUHOI
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Search TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_BoDe_Search TO [Giangvien];
GO

PRINT N'OK: usp_BoDe_Search đã được cập nhật.';
GO

-- ------------------------------------------------------------
-- 4. Các SP bổ sung
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_GetCauHoiByGiangVien
    @MAGV NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @IsGV BIT = 0;

    IF EXISTS (SELECT 1 FROM GIAOVIEN WHERE MAGV = @MAGV)
        SET @IsGV = 1;

    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM BODE
    WHERE @IsGV = 0
       OR MAGV = @MAGV
    ORDER BY CAUHOI;
END
GO

GRANT EXECUTE ON dbo.usp_GetCauHoiByGiangVien TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_GetCauHoiByGiangVien TO [Giangvien];
GO

PRINT N'OK: Đã tạo usp_GetCauHoiByGiangVien.';
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_GetLatestCauHoi
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ISNULL(MAX(CAUHOI), 0) AS LatestCauHoi
    FROM BODE;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_GetLatestCauHoi TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_BoDe_GetLatestCauHoi TO [Giangvien];
GO

PRINT N'OK: Đã tạo usp_BoDe_GetLatestCauHoi.';
GO

CREATE OR ALTER PROCEDURE dbo.usp_Lop_Search
    @KEYWORD NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MALOP, TENLOP
    FROM LOP
    WHERE @KEYWORD IS NULL OR @KEYWORD = ''
       OR MALOP  LIKE '%' + @KEYWORD + '%'
       OR TENLOP LIKE '%' + @KEYWORD + '%'
    ORDER BY MALOP
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_Lop_Search TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_Lop_Search TO [Giangvien];
GO

PRINT N'OK: Đã tạo usp_Lop_Search.';
GO

-- ------------------------------------------------------------
-- 5. Các SP Tìm Kiếm tối ưu RECOMPILE
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

GRANT EXECUTE ON dbo.usp_SinhVien_Search TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_SinhVien_Search TO [Giangvien];
GO

PRINT N'OK: usp_SinhVien_Search đã được cập nhật.';
GO

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

GRANT EXECUTE ON dbo.usp_GiaoVien_Search TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_GiaoVien_Search TO [Giangvien];
GO

PRINT N'OK: usp_GiaoVien_Search đã được cập nhật.';
GO

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

GRANT EXECUTE ON dbo.usp_MonHoc_Search TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_MonHoc_Search TO [Giangvien];
GO

PRINT N'OK: usp_MonHoc_Search đã được cập nhật.';
GO

-- ------------------------------------------------------------
-- 6. SP Tìm Kiếm Nâng Cao
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE [dbo].[usp_BoDe_TimKiemNangCao]
    @MAGV    NCHAR(8)      = NULL,
    @MAMH    NCHAR(5)      = NULL,
    @TRINHDO CHAR(1)       = NULL,
    @Keyword NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        b.CAUHOI,
        b.MAMH,
        mh.TENMH,
        b.TRINHDO,
        CASE b.TRINHDO
            WHEN 'A' THEN N'Dai hoc - Chuyen nganh'
            WHEN 'B' THEN N'Dai hoc - Khong chuyen'
            WHEN 'C' THEN N'Cao dang'
        END                                    AS TenTrinhDo,
        b.NOIDUNG,
        b.A,
        b.B,
        b.C,
        b.D,
        b.DAP_AN,
        b.MAGV,
        dbo.udf_LayHoTen(gv.HO, gv.TEN)       AS TenGV
    FROM [dbo].[BODE] b
    JOIN      [dbo].[MONHOC]   mh ON RTRIM(b.MAMH) = RTRIM(mh.MAMH)
    LEFT JOIN [dbo].[GIAOVIEN] gv ON RTRIM(b.MAGV) = RTRIM(gv.MAGV)
    WHERE
        (RTRIM(b.MAGV) = RTRIM(@MAGV) OR @MAGV IS NULL)
        AND (RTRIM(b.MAMH) = RTRIM(@MAMH) OR @MAMH IS NULL)
        AND (b.TRINHDO = @TRINHDO OR @TRINHDO IS NULL)
        AND (
            @Keyword IS NULL
            OR @Keyword = N''
            OR b.NOIDUNG LIKE N'%' + @Keyword + N'%'
        )
    ORDER BY b.MAMH ASC, b.TRINHDO ASC, b.CAUHOI ASC;
END
GO

GRANT EXECUTE ON [dbo].[usp_BoDe_TimKiemNangCao] TO [PGV];
GO
GRANT EXECUTE ON [dbo].[usp_BoDe_TimKiemNangCao] TO [Giangvien];
GO

PRINT N'OK: Da tao SP usp_BoDe_TimKiemNangCao.';
GO
