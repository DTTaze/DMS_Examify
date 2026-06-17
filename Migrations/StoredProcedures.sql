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

    -- Bước 3: Lấy nhóm quyền (Lọc/chiều trước trên sysmembers và sysusers rồi mới JOIN)
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
        -- Đã có dữ liệu liên kết quan trọng: Chuyển sang ngừng dùng (Xóa mềm)
        UPDATE [dbo].[MONHOC]
        SET [TrangThai] = 0
        WHERE [MaMH] = @MaMH;
        PRINT N'INFO: Đã chuyển môn học sang trạng thái Ngừng dùng (Xóa mềm) do có dữ liệu liên kết.';
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

GO

-- ============================================================
-- FILE: S02_CRUD_StoredProcedures.sql
-- THU TU CHAY: S02 (sau S01 PhanQuyen, truoc S04 IDENTITY Migration)
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

GRANT EXECUTE ON [dbo].[usp_MonHoc_GetAll] TO [PGV];
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

GRANT EXECUTE ON [dbo].[usp_SinhVien_GetAll] TO [PGV]
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

GRANT EXECUTE ON [dbo].[usp_SinhVien_GetByLop] TO [PGV]
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

GRANT EXECUTE ON [dbo].[usp_Lop_GetAll] TO [PGV]
GO

PRINT N'OK: Da tao toan bo SP CRUD (MonHoc, GiaoVien, SinhVien, BoDe, Lop).';
GO

GO

-- ============================================================
-- FILE: S03_Account_And_Lecturer_StoredProcedures.sql
-- THU TU CHAY: S03 (sau S01 PhanQuyen, Role phai ton tai truoc)
-- MUC DICH: Gom cac SP quan ly tai khoan va thong tin Giang vien:
--   1. SP_TAOTAIKHOAN
--   2. usp_LayDanhSachQuyen_TaoTaiKhoan
--   3. usp_LayThongTinGiaoVienTheoMa
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. SP_TAOTAIKHOAN
--    PGV tao tai khoan SQL Server cho Giao vien (Login + User + Role)
-- ------------------------------------------------------------
CREATE PROCEDURE [dbo].[SP_TAOTAIKHOAN]
    @LGNAME  VARCHAR(50),   -- Ten dang nhap (Login name)
    @PASS    VARCHAR(50),   -- Mat khau
    @USERNAME VARCHAR(50),  -- Ten User trong database (Ma Giao Vien)
    @ROLE    VARCHAR(50)    -- Ten nhom quyen ('PGV' hoac 'Giangvien')
AS
BEGIN
    -- 1. Kiem tra xem Login name da ton tai tren Server chua
    IF EXISTS (SELECT * FROM sys.server_principals WHERE name = @LGNAME)
        RETURN 1; -- Tra ve 1: Loi do Login name da ton tai

    -- 2. Kiem tra xem User (Ma Giao Vien) da duoc cap tai khoan trong Database chua
    IF EXISTS (SELECT * FROM sys.database_principals WHERE name = @USERNAME)
        RETURN 2; -- Tra ve 2: Loi do User nay da co tai khoan roi

    BEGIN TRY
        -- 3. Tao Login o muc Server
        EXEC sp_addlogin @loginame = @LGNAME, @passwd = @PASS;

        -- 4. Tao User o muc Database, lien ket voi Login vua tao
        EXEC sp_adduser @loginame = @LGNAME, @name_in_db = @USERNAME;

        -- 5. Gan User vao Role (Nhom quyen PGV hoac Giangvien)
        EXEC sp_addrolemember @rolename = @ROLE, @membername = @USERNAME;

        RETURN 0; -- Thanh cong
    END TRY
    BEGIN CATCH
        -- Xoa login neu bi loi giua chung de tranh rac he thong
        IF EXISTS (SELECT * FROM sys.server_principals WHERE name = @LGNAME)
            EXEC sp_droplogin @loginame = @LGNAME;

        RETURN 3; -- Loi he thong bat ngo
    END CATCH
END
GO

GRANT EXECUTE ON [dbo].[SP_TAOTAIKHOAN] TO [PGV];
GO

PRINT N'OK: Da tao SP_TAOTAIKHOAN.';
GO

-- ------------------------------------------------------------
-- 2. usp_LayDanhSachQuyen_TaoTaiKhoan
--    Lay danh sach cac Role co the chon khi PGV tao tai khoan GV
-- ------------------------------------------------------------
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
        name;
END
GO

GRANT EXECUTE ON [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan] TO [PGV];
GO

PRINT N'OK: Da tao usp_LayDanhSachQuyen_TaoTaiKhoan.';
GO

-- ------------------------------------------------------------
-- 3. usp_LayThongTinGiaoVienTheoMa
--    Lay thong tin chi tiet cua 1 Giao vien theo MAGV
-- ------------------------------------------------------------
CREATE PROCEDURE [dbo].[usp_LayThongTinGiaoVienTheoMa]
    @MAGV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MAGV,
        HO,
        TEN,
        SODTLL,
        DIACHI
    FROM Giaovien
    WHERE MAGV = @MAGV;
END
GO

GRANT EXECUTE ON dbo.usp_LayThongTinGiaoVienTheoMa TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_LayThongTinGiaoVienTheoMa TO [Giangvien];
GO

PRINT N'OK: Da tao usp_LayThongTinGiaoVienTheoMa.';
GO

GO

-- ============================================================
-- FILE: S05_Exam_And_Class_StoredProcedures.sql
-- THU TU CHAY: S05 (sau S02 CRUD, can bang BODE, GIAOVIEN_DANGKY, LOP)
-- MUC DICH: Gom cac UDF va SP phuc vu dang ky thi va quan ly danh muc lop, trinh do:
--   1. udf_DemSoCauTrongBoDe
--   2. udf_KiemTraDieuKienDangKy
--   3. usp_ThucHienDangKyThi
--   4. usp_LayDanhSachDeThi
--   5. usp_LayDanhSachLop
--   6. usp_LayDanhSachTrinhDo
-- ============================================================
USE [THITRACNGHIEM]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ------------------------------------------------------------
-- 1. udf_DemSoCauTrongBoDe
--    Dem so cau hoi trong bo de theo Mon hoc va Trinh do
-- ------------------------------------------------------------
CREATE FUNCTION [dbo].[udf_DemSoCauTrongBoDe]
(
    @MAMH    NCHAR(8),
    @TRINHDO CHAR(1)
)
RETURNS INT
AS
BEGIN
    DECLARE @SoCau INT = 0;
    SELECT @SoCau = COUNT(CAUHOI)
    FROM dbo.BODE
    WHERE TRINHDO = @TRINHDO AND MAMH = @MAMH;
    RETURN @SoCau;
END
GO

PRINT N'OK: Da tao udf_DemSoCauTrongBoDe.';
GO

-- ------------------------------------------------------------
-- 2. udf_KiemTraDieuKienDangKy
--    Kiem tra co du cau hoi de dang ky thi khong
-- ------------------------------------------------------------
CREATE FUNCTION [dbo].[udf_KiemTraDieuKienDangKy]
(
    @MAMH     CHAR(5),
    @TRINHDO  CHAR(1),
    @SOCAUTHI INT
)
RETURNS NVARCHAR(255)
AS
BEGIN
    DECLARE @ThongBao       NVARCHAR(255) = '';
    DECLARE @TongSoCauTDC   INT;
    DECLARE @SoCauTrinhDoCao INT;

    SELECT @TongSoCauTDC = dbo.udf_DemSoCauTrongBoDe(@MAMH, @TRINHDO);

    IF @TRINHDO = 'C'
    BEGIN
        IF @TongSoCauTDC < @SOCAUTHI
            SET @ThongBao = N'Loi: Mon nay chi co ' + CAST(@TongSoCauTDC AS NVARCHAR)
                          + N' cau trinh do C, khong du ' + CAST(@SOCAUTHI AS NVARCHAR) + N' cau!';
    END
    ELSE IF @TRINHDO IN ('A', 'B')
    BEGIN
        SET @SoCauTrinhDoCao = CEILING(@SOCAUTHI * 0.7);

        IF @TongSoCauTDC < @SoCauTrinhDoCao
        BEGIN
            SET @ThongBao = N'Loi: Can toi thieu ' + CAST(@SoCauTrinhDoCao AS NVARCHAR)
                          + N' cau trinh do goc (hien chi co ' + CAST(@TongSoCauTDC AS NVARCHAR) + N').';
        END
        ELSE IF @TongSoCauTDC < @SOCAUTHI
        BEGIN
            DECLARE @SoCauTrinhDoThap INT = @SOCAUTHI - @TongSoCauTDC;
            DECLARE @TrinhDoThap CHAR(1) = CASE WHEN @TRINHDO = 'A' THEN 'B' ELSE 'C' END;
            DECLARE @TongSoCauTDT INT;

            SELECT @TongSoCauTDT = dbo.udf_DemSoCauTrongBoDe(@MAMH, @TrinhDoThap);

            IF @TongSoCauTDT < @SoCauTrinhDoThap
            BEGIN
                SET @ThongBao = N'Loi: Khong du cau hoi trinh do ' + @TrinhDoThap
                              + N' de bu (Can them ' + CAST(@SoCauTrinhDoThap AS NVARCHAR)
                              + N', hien co ' + CAST(@TongSoCauTDT AS NVARCHAR) + N').';
            END
        END
    END

    RETURN @ThongBao;
END
GO

PRINT N'OK: Da tao udf_KiemTraDieuKienDangKy.';
GO

-- ------------------------------------------------------------
-- 3. usp_ThucHienDangKyThi
--    GV dang ky lich thi cho 1 lop, 1 mon, 1 lan thi
-- ------------------------------------------------------------
CREATE PROCEDURE usp_ThucHienDangKyThi
    @MAGV     NCHAR(8),
    @MALOP    NCHAR(8),
    @MAMH     CHAR(5),
    @TRINHDO  CHAR(1),
    @LAN      SMALLINT,
    @SOCAUTHI SMALLINT,
    @THOIGIAN SMALLINT,
    @NGAYTHI  DATETIME
AS
BEGIN
    DECLARE @Message NVARCHAR(255);

    SET @Message = dbo.udf_KiemTraDieuKienDangKy(@MAMH, @TRINHDO, @SOCAUTHI);

    IF @Message <> ''
    BEGIN
        SELECT CAST(0 AS BIT) AS IsSuccess, @Message AS ThongBao;
        RETURN;
    END
    ELSE
    BEGIN
        IF EXISTS (
            SELECT 1 FROM dbo.GIAOVIEN_DANGKY
            WHERE MALOP = @MALOP AND MAMH = @MAMH AND LAN = @LAN
        )
        BEGIN
            SET @Message = N'De thi da ton tai';
            SELECT CAST(0 AS BIT) AS IsSuccess, @Message AS ThongBao;
            RETURN;
        END

        BEGIN TRY
            BEGIN TRAN;
                INSERT INTO GiaoVien_DangKy (MAGV, MALOP, MAMH, TRINHDO, NGAYTHI, LAN, SOCAUTHI, THOIGIAN)
                VALUES (@MAGV, @MALOP, @MAMH, @TRINHDO, ISNULL(@NGAYTHI, GETDATE()), @LAN, @SOCAUTHI, @THOIGIAN);
            COMMIT TRAN;

            SET @Message = N'Them de thi thanh cong';
            SELECT CAST(1 AS BIT) AS IsSuccess, @Message AS ThongBao;
            RETURN;
        END TRY
        BEGIN CATCH
            ROLLBACK TRAN;
            SET @Message = N'Them de thi that bai: ' + ERROR_MESSAGE();
            SELECT CAST(0 AS BIT) AS IsSuccess, @Message AS ThongBao;
            RETURN;
        END CATCH
    END
END
GO

PRINT N'OK: Da tao usp_ThucHienDangKyThi.';
GO

-- ------------------------------------------------------------
-- 4. usp_LayDanhSachDeThi
--    GV lay danh sach cac de thi (lich thi) da dang ky theo MAGV
-- ------------------------------------------------------------
CREATE PROCEDURE usp_LayDanhSachDeThi
    @MaGV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        [MAMH],
        [MALOP],
        [TRINHDO],
        [NGAYTHI],
        [LAN],
        [SOCAUTHI],
        [THOIGIAN]
    FROM dbo.GIAOVIEN_DANGKY
    WHERE MAGV = @MaGV
    ORDER BY NGAYTHI DESC;
END
GO

GRANT EXECUTE ON dbo.usp_LayDanhSachDeThi TO [Giangvien];
GO
GRANT EXECUTE ON dbo.usp_LayDanhSachDeThi TO [PGV];
GO

PRINT N'OK: Da tao usp_LayDanhSachDeThi.';
GO

-- ------------------------------------------------------------
-- 5. usp_LayDanhSachLop
--    SinhVienController va LopController lay danh sach lop
-- ------------------------------------------------------------
CREATE PROCEDURE usp_LayDanhSachLop
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MALOP,
        TENLOP
    FROM dbo.LOP
    ORDER BY MALOP ASC;
END
GO

GRANT EXECUTE ON dbo.usp_LayDanhSachLop TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_LayDanhSachLop TO [Giangvien];
GO

PRINT N'OK: Da tao usp_LayDanhSachLop.';
GO

-- ------------------------------------------------------------
-- 6. usp_LayDanhSachTrinhDo
--    Lay danh sach cac Trinh do dang co trong Bo de
-- ------------------------------------------------------------
CREATE PROCEDURE usp_LayDanhSachTrinhDo
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        TRINHDO AS MaTrinhDo,
        CASE TRINHDO
            WHEN 'A' THEN N'A - Dai hoc chuyen nganh'
            WHEN 'B' THEN N'B - Dai hoc khong chuyen nganh'
            WHEN 'C' THEN N'C - Cao dang'
            ELSE TRINHDO
        END AS TenTrinhDo
    FROM dbo.BODE
    ORDER BY TRINHDO ASC;
END
GO

GRANT EXECUTE ON dbo.usp_LayDanhSachTrinhDo TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_LayDanhSachTrinhDo TO [Giangvien];
GO

PRINT N'OK: Da tao usp_LayDanhSachTrinhDo.';
GO

GO

