-- ============================================================
-- FILE: M03_StoredProcedure_Updates.sql
-- MUC DICH: Gom tat ca cac stored procedure duoc sua doi hoac bo sung:
--   1. usp_TaiKhoan_LayThongTin (tu 000, updated o 005)
--   2. usp_SinhVien_Login (tu 000)
--   3. Các SP CRUD của Bộ Đề (usp_BoDe_GetAll, usp_BoDe_Insert, usp_BoDe_Update, usp_BoDe_Search) (tu 002)
--   4. Các SP bổ sung (usp_GetCauHoiByGiangVien, usp_BoDe_GetLatestCauHoi, usp_Lop_Search) (tu 003)
--   5. Các SP Tìm Kiếm tối ưu RECOMPILE (usp_SinhVien_Search, usp_GiaoVien_Search, usp_MonHoc_Search) (tu 004)
--   6. SP Tìm Kiếm Nâng Cao usp_BoDe_TimKiemNangCao (tu 012)
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. usp_TaiKhoan_LayThongTin
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE [dbo].[usp_TaiKhoan_LayThongTin]
    @LOGINNAME NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @USERNAME NVARCHAR(50);
    DECLARE @UID      INT;
    DECLARE @SID      VARBINARY(85);
    DECLARE @ROLENAME  NVARCHAR(50);

    -- Bước 1: Lấy SID từ master.dbo.syslogins (Chọn trước, tránh JOIN chéo DB)
    SELECT @SID = sid 
    FROM master.dbo.syslogins 
    WHERE name = @LOGINNAME;

    -- Bước 2: Lấy Username và UID từ dbo.sysusers
    SELECT @USERNAME = name, @UID = uid
    FROM dbo.sysusers 
    WHERE sid = @SID;

    IF @USERNAME IS NULL
    BEGIN
        RAISERROR(N'Tài khoản giảng viên không tồn tại trong Database', 16, 1);
        RETURN;
    END

    -- Bước 3: Lấy nhóm quyền (Lọc/chiếu trước trên sysmembers và sysusers rồi mới JOIN)
    SELECT TOP 1 @ROLENAME = role_user.name
    FROM (
        SELECT groupuid 
        FROM dbo.sysmembers 
        WHERE memberuid = @UID
    ) sm
    JOIN (
        SELECT uid, name 
        FROM dbo.sysusers 
        WHERE name IN ('PGV', 'Giangvien')
    ) role_user ON sm.groupuid = role_user.uid;

    -- Bước 4: Trả về kết quả (Inline ghép Họ & Tên tránh dùng UDF)
    SELECT
        @USERNAME                                               AS USERNAME,
        LTRIM(RTRIM(ISNULL(HO, N'') + N' ' + ISNULL(TEN, N'')))   AS HOTEN,
        @ROLENAME                                               AS ROLENAME
    FROM GIAOVIEN
    WHERE MAGV = @USERNAME;
END
GO

GRANT EXECUTE ON [dbo].[usp_TaiKhoan_LayThongTin] TO [PGV];
GO
GRANT EXECUTE ON [dbo].[usp_TaiKhoan_LayThongTin] TO [Giangvien];
GO

PRINT N'OK: usp_TaiKhoan_LayThongTin đã được cập nhật.';
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

-- ------------------------------------------------------------
-- 7. Stored Procedure updates for MonHoc Soft Delete
-- ------------------------------------------------------------

-- 7.1. usp_MonHoc_GetAll (Chỉ lấy môn học đang hoạt động)
CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaMH, TenMH
    FROM MONHOC
    WHERE TrangThai = 1;
END
GO
GRANT EXECUTE ON [dbo].[usp_MonHoc_GetAll] TO [PGV];
GO
GRANT EXECUTE ON [dbo].[usp_MonHoc_GetAll] TO [Giangvien];
GO
GRANT EXECUTE ON [dbo].[usp_MonHoc_GetAll] TO [Sinhvien];
GO

-- 7.2. usp_MonHoc_Search (Chỉ tìm kiếm môn học đang hoạt động)
CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_Search
    @Keyword NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MAMH, TENMH
    FROM MONHOC
    WHERE TrangThai = 1
      AND (@Keyword IS NULL OR @Keyword = ''
           OR MAMH LIKE '%' + @Keyword + '%'
           OR TENMH LIKE '%' + @Keyword + '%')
    OPTION (RECOMPILE);
END
GO
GRANT EXECUTE ON dbo.usp_MonHoc_Search TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_MonHoc_Search TO [Giangvien];
GO
GRANT EXECUTE ON dbo.usp_MonHoc_Search TO [Sinhvien];
GO

-- 7.3. usp_MonHoc_Delete (Xóa mềm kết hợp xóa cứng thông minh)
CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_Delete
    @MaMH NCHAR(5)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra xem môn học đã từng phát sinh dữ liệu liên kết nào chưa
    IF EXISTS (SELECT 1 FROM [dbo].[BANGDIEM] WHERE [MAMH] = @MaMH)
       OR EXISTS (SELECT 1 FROM [dbo].[BODE] WHERE [MAMH] = @MaMH)
       OR EXISTS (SELECT 1 FROM [dbo].[GIAOVIEN_DANGKY] WHERE [MAMH] = @MaMH)
    BEGIN
        -- Đã có dữ liệu liên kết quan trọng: Chuyển sang ngưng dùng (Xóa mềm)
        UPDATE [dbo].[MONHOC]
        SET [TrangThai] = 0
        WHERE [MaMH] = @MaMH;
        PRINT N'INFO: Đã chuyển môn học sang trạng thái Ngưng dùng (Xóa mềm) do có dữ liệu liên kết.';
    END
    ELSE
    BEGIN
        -- Chưa từng sử dụng: Xóa vĩnh viễn khỏi Database (Xóa cứng)
        DELETE FROM [dbo].[MONHOC]
        WHERE [MaMH] = @MaMH;
        PRINT N'INFO: Đã xóa cứng môn học hoàn toàn khỏi Database.';
    END
END
GO
GRANT EXECUTE ON [dbo].[usp_MonHoc_Delete] TO [PGV];
GO

-- 7.4. usp_LayDanhSachMonHoc (Dùng cho Dropdownlist đăng ký thi)
CREATE OR ALTER PROCEDURE dbo.usp_LayDanhSachMonHoc
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MAMH, TENMH
    FROM dbo.MONHOC
    WHERE TrangThai = 1
    ORDER BY TENMH ASC;
END
GO
GRANT EXECUTE ON dbo.usp_LayDanhSachMonHoc TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_LayDanhSachMonHoc TO [Giangvien];
GO

-- 7.5. usp_MonHoc_Restore (Phục hồi môn học bị xóa mềm)
CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_Restore
    @MaMH NCHAR(5)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[MONHOC]
    SET [TrangThai] = 1
    WHERE [MaMH] = @MaMH;
    PRINT N'OK: Đã phục hồi môn học.';
END
GO
GRANT EXECUTE ON [dbo].[usp_MonHoc_Restore] TO [PGV];
GO

-- 7.6. usp_MonHoc_Insert (Hỗ trợ tự phục hồi khi trùng khóa chính đã xóa mềm)
CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_Insert
    @MaMH NCHAR(5),
    @TenMH NVARCHAR(40)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM dbo.MONHOC WHERE MaMH = @MaMH)
    BEGIN
        -- Phục hồi và cập nhật tên môn học mới
        UPDATE dbo.MONHOC
        SET TenMH = @TenMH,
            TrangThai = 1
        WHERE MaMH = @MaMH;
        PRINT N'INFO: Đã phục hồi môn học đã xóa mềm trước đó.';
    END
    ELSE
    BEGIN
        INSERT INTO dbo.MONHOC (MaMH, TenMH, TrangThai)
        VALUES (@MaMH, @TenMH, 1);
        PRINT N'INFO: Đã thêm mới môn học.';
    END
END
GO
GRANT EXECUTE ON [dbo].[usp_MonHoc_Insert] TO [PGV];
GO

PRINT N'OK: Các stored procedure cho MonHoc đã được cập nhật.';
GO
