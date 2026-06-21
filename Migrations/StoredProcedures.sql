USE [THITRACNGHIEM]
GO

-- ============================================================
-- Tài Khoản / Hệ Thống / Quyền
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[usp_TaiKhoan_LayThongTin]
    @LOGINNAME NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @USERNAME NVARCHAR(50);
    DECLARE @UID      INT;
    DECLARE @SID      VARBINARY(85);
    DECLARE @ROLENAME  NVARCHAR(50);

    SELECT @SID = sid 
    FROM master.dbo.syslogins 
    WHERE name = @LOGINNAME;

    SELECT @USERNAME = name, @UID = uid
    FROM dbo.sysusers 
    WHERE sid = @SID;

    IF @USERNAME IS NULL
    BEGIN
        RAISERROR(N'Tài khoản giảng viên không tồn tại trong Database', 16, 1);
        RETURN;
    END

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

    SELECT
        @USERNAME                                               AS USERNAME,
        LTRIM(RTRIM(ISNULL(HO, N'') + N' ' + ISNULL(TEN, N'')))   AS HOTEN,
        @ROLENAME                                               AS ROLENAME
    FROM GIAOVIEN
    WHERE MAGV = @USERNAME;
END
GO

GRANT EXECUTE ON [dbo].[usp_TaiKhoan_LayThongTin] TO [PGV];
GRANT EXECUTE ON [dbo].[usp_TaiKhoan_LayThongTin] TO [Giangvien];
GO

PRINT N'OK: [dbo].[usp_TaiKhoan_LayThongTin] đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[SP_TAOTAIKHOAN]
    @LGNAME  VARCHAR(50),
    @PASS    VARCHAR(50),
    @USERNAME VARCHAR(50),
    @ROLE    VARCHAR(50)
AS
BEGIN
    IF EXISTS (SELECT * FROM sys.server_principals WHERE name = @LGNAME)
        RETURN 1;

    IF EXISTS (SELECT * FROM sys.database_principals WHERE name = @USERNAME)
        RETURN 2;

    BEGIN TRY
        EXEC sp_addlogin @loginame = @LGNAME, @passwd = @PASS;

        EXEC sp_adduser @loginame = @LGNAME, @name_in_db = @USERNAME;

        EXEC sp_addrolemember @rolename = @ROLE, @membername = @USERNAME;

        RETURN 0;
    END TRY
    BEGIN CATCH
        IF EXISTS (SELECT * FROM sys.server_principals WHERE name = @LGNAME)
            EXEC sp_droplogin @loginame = @LGNAME;

        RETURN 3;
    END CATCH
END
GO

GRANT EXECUTE ON [dbo].[SP_TAOTAIKHOAN] TO [PGV];
GO

PRINT N'OK: [dbo].[SP_TAOTAIKHOAN] đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan]
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

PRINT N'OK: [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan] đã sẵn sàng.';
GO

-- ============================================================
-- Môn Học (MONHOC)
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

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
GRANT EXECUTE ON [dbo].[usp_MonHoc_GetAll] TO [Giangvien];
GO

PRINT N'OK: dbo.usp_MonHoc_GetAll đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_Search
    @Keyword NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = NULLIF(LTRIM(RTRIM(@Keyword)), N'');

    IF @Keyword IS NULL
    BEGIN
        SELECT MAMH, TENMH
        FROM dbo.MONHOC
        WHERE TrangThai = 1
        ORDER BY MAMH
        OPTION (RECOMPILE);
        RETURN;
    END

    DECLARE @PrefixResults TABLE (
        MAMH NCHAR(5) PRIMARY KEY,
        TENMH NVARCHAR(40)
    );

    INSERT INTO @PrefixResults (MAMH, TENMH)
    SELECT MAMH, TENMH
    FROM dbo.MONHOC
    WHERE TrangThai = 1
      AND (MAMH LIKE @Keyword + N'%'
           OR TENMH LIKE @Keyword + N'%')
    OPTION (RECOMPILE);

    IF @@ROWCOUNT > 0
    BEGIN
        SELECT MAMH, TENMH
        FROM @PrefixResults
        ORDER BY MAMH;
        RETURN;
    END

    SELECT MAMH, TENMH
    FROM dbo.MONHOC
    WHERE TrangThai = 1
      AND (MAMH LIKE N'%' + @Keyword + N'%'
           OR TENMH LIKE N'%' + @Keyword + N'%')
    ORDER BY MAMH
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_MonHoc_Search TO [PGV];
GRANT EXECUTE ON dbo.usp_MonHoc_Search TO [Giangvien];
GO

PRINT N'OK: dbo.usp_MonHoc_Search đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_Insert
    @MaMH NCHAR(5),
    @TenMH NVARCHAR(40)
AS
BEGIN
    SET NOCOUNT ON;
    SET @MaMH = UPPER(LTRIM(RTRIM(@MaMH)));
    SET @TenMH = LTRIM(RTRIM(@TenMH));
    
    IF EXISTS (SELECT 1 FROM dbo.MONHOC WHERE MaMH = @MaMH)
    BEGIN
        THROW 50001, N'Mã môn học đã tồn tại. Không thể thêm mới.', 1;
    END

    IF EXISTS (SELECT 1 FROM dbo.MONHOC WHERE TenMH = @TenMH)
    BEGIN
        THROW 50002, N'Tên môn học đã tồn tại. Không thể thêm mới.', 1;
    END

    INSERT INTO dbo.MONHOC (MaMH, TenMH, TrangThai)
    VALUES (@MaMH, @TenMH, 1);

    PRINT N'INFO: Đã thêm mới môn học.';
END
GO

GRANT EXECUTE ON [dbo].[usp_MonHoc_Insert] TO [PGV];
GO

PRINT N'OK: dbo.usp_MonHoc_Insert đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_Update
    @MaMH NCHAR(5),
    @TenMH NVARCHAR(40)
AS
BEGIN
    SET NOCOUNT ON;
    SET @MaMH = UPPER(LTRIM(RTRIM(@MaMH)));
    SET @TenMH = LTRIM(RTRIM(@TenMH));

    UPDATE dbo.MONHOC
    SET TenMH = @TenMH
    WHERE MaMH = @MaMH
      AND TrangThai = 1;
END
GO

GRANT EXECUTE ON [dbo].[usp_MonHoc_Update] TO [PGV];
GO

PRINT N'OK: dbo.usp_MonHoc_Update đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_Delete
    @MaMH NCHAR(5)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM [dbo].[BANGDIEM] WHERE [MAMH] = @MaMH)
       OR EXISTS (SELECT 1 FROM [dbo].[BODE] WHERE [MAMH] = @MaMH)
       OR EXISTS (SELECT 1 FROM [dbo].[GIAOVIEN_DANGKY] WHERE [MAMH] = @MaMH)
    BEGIN
        UPDATE [dbo].[MONHOC]
        SET [TrangThai] = 0
        WHERE [MaMH] = @MaMH;
        PRINT N'INFO: Đã chuyển môn học sang trạng thái Ngừng dùng (Xóa mềm) do có dữ liệu liên kết.';
    END
    ELSE
    BEGIN
        DELETE FROM [dbo].[MONHOC]
        WHERE [MaMH] = @MaMH;
        PRINT N'INFO: Đã xóa cứng môn học hoàn toàn khỏi Database.';
    END
END
GO

GRANT EXECUTE ON [dbo].[usp_MonHoc_Delete] TO [PGV];
GO

PRINT N'OK: dbo.usp_MonHoc_Delete đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

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
GRANT EXECUTE ON dbo.usp_LayDanhSachMonHoc TO [Giangvien];
GO

PRINT N'OK: dbo.usp_LayDanhSachMonHoc đã sẵn sàng.';
GO

-- ============================================================
-- Lớp (LOP)
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_Lop_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MALOP,
        TENLOP
    FROM LOP
    WHERE TrangThai = 1
    ORDER BY MALOP;
END
GO

GRANT EXECUTE ON [dbo].[usp_Lop_GetAll] TO [PGV];
GO

PRINT N'OK: dbo.usp_Lop_GetAll đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_Lop_Search
    @KEYWORD NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SET @KEYWORD = NULLIF(LTRIM(RTRIM(@KEYWORD)), N'');

    IF @KEYWORD IS NULL
    BEGIN
        SELECT MALOP, TENLOP
        FROM LOP
        WHERE TrangThai = 1
        ORDER BY MALOP
        OPTION (RECOMPILE);
        RETURN;
    END

    DECLARE @PrefixResults TABLE (
        MALOP NCHAR(8) PRIMARY KEY,
        TENLOP NVARCHAR(40)
    );

    INSERT INTO @PrefixResults (MALOP, TENLOP)
    SELECT MALOP, TENLOP
    FROM LOP
    WHERE TrangThai = 1
      AND (MALOP LIKE @KEYWORD + N'%'
           OR TENLOP LIKE @KEYWORD + N'%')
    OPTION (RECOMPILE);

    IF @@ROWCOUNT > 0
    BEGIN
        SELECT MALOP, TENLOP
        FROM @PrefixResults
        ORDER BY MALOP;
        RETURN;
    END

    SELECT MALOP, TENLOP
    FROM LOP
    WHERE TrangThai = 1
      AND (MALOP LIKE N'%' + @KEYWORD + N'%'
           OR TENLOP LIKE N'%' + @KEYWORD + N'%')
    ORDER BY MALOP
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_Lop_Search TO [PGV];
GRANT EXECUTE ON dbo.usp_Lop_Search TO [Giangvien];
GO

PRINT N'OK: dbo.usp_Lop_Search đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ------------------------------------------------------------
-- Stored Procedures for Lop
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_Lop_Insert
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

    IF EXISTS (SELECT 1 FROM LOP WHERE TENLOP = @TENLOP)
    BEGIN
        RAISERROR(N'Ten lop da ton tai', 16, 1);
        RETURN;
    END

    INSERT INTO LOP(MALOP, TENLOP, TrangThai)
    VALUES(@MALOP, @TENLOP, 1);
END
GO

GRANT EXECUTE ON [dbo].[usp_Lop_Insert] TO [PGV];
GO

PRINT N'OK: usp_Lop_Insert đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_Lop_Update
    @MALOP NCHAR(8),
    @TENLOP NVARCHAR(40)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Khong tim thay lop dang hoat dong', 16, 1);
        RETURN;
    END

    UPDATE LOP
    SET TENLOP = @TENLOP
    WHERE MALOP = @MALOP;
END
GO

GRANT EXECUTE ON [dbo].[usp_Lop_Update] TO [PGV];
GO

PRINT N'OK: dbo.usp_Lop_Update đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_Lop_Delete
    @MALOP NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra xem lớp đang hoạt động có tồn tại hay không
    IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Không tìm thấy lớp đang hoạt động', 16, 1);
        RETURN;
    END

    -- 2. Kiểm tra xem có liên kết dữ liệu với SINHVIEN hoặc GIAOVIEN_DANGKY hay không
    IF EXISTS (SELECT 1 FROM SINHVIEN WHERE MALOP = @MALOP)
       OR EXISTS (SELECT 1 FROM GIAOVIEN_DANGKY WHERE MALOP = @MALOP)
    BEGIN
        -- Xóa mềm lớp học
        UPDATE LOP
        SET TrangThai = 0
        WHERE MALOP = @MALOP;
    END
    ELSE
    BEGIN
        -- Xóa cứng lớp học hoàn toàn
        DELETE FROM LOP
        WHERE MALOP = @MALOP;
    END
END
GO

GRANT EXECUTE ON [dbo].[usp_Lop_Delete] TO [PGV];
GO

PRINT N'OK: dbo.usp_Lop_Delete đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_Lop_ExistsMaLop
    @MALOP NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM dbo.LOP
            WHERE MALOP = @MALOP
        )
        THEN 1 ELSE 0
    END;
END
GO

GRANT EXECUTE ON dbo.usp_Lop_ExistsMaLop TO [PGV];
GO

PRINT N'OK: dbo.usp_Lop_ExistsMaLop đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_Lop_ExistsTenLop
    @TENLOP NVARCHAR(40)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM dbo.LOP
            WHERE TENLOP = @TENLOP
        )
        THEN 1 ELSE 0
    END;
END
GO

GRANT EXECUTE ON dbo.usp_Lop_ExistsTenLop TO [PGV];
GO

PRINT N'OK: dbo.usp_Lop_ExistsTenLop đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_Lop_ExistsTenLopExcludingMaLop
    @TENLOP NVARCHAR(40),
    @MALOP NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM dbo.LOP
            WHERE TENLOP = @TENLOP
              AND MALOP <> @MALOP
        )
        THEN 1 ELSE 0
    END;
END
GO

GRANT EXECUTE ON dbo.usp_Lop_ExistsTenLopExcludingMaLop TO [PGV];
GO

PRINT N'OK: dbo.usp_Lop_ExistsTenLopExcludingMaLop đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_LayDanhSachLop
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MALOP,
        TENLOP
    FROM dbo.LOP
    WHERE TrangThai = 1
    ORDER BY MALOP ASC;
END
GO

GRANT EXECUTE ON dbo.usp_LayDanhSachLop TO [PGV];
GRANT EXECUTE ON dbo.usp_LayDanhSachLop TO [Giangvien];
GO

PRINT N'OK: dbo.usp_LayDanhSachLop đã sẵn sàng.';
GO

-- ============================================================
-- Giáo Viên (GIAOVIEN)
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiaoVien_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MAGV AS MaGV, HO AS Ho, TEN AS Ten, SODTLL AS SoDTLL, DIACHI AS DiaChi
    FROM dbo.GIAOVIEN
    WHERE TrangThai = 1
    ORDER BY HO, TEN, MAGV;
END
GO

GRANT EXECUTE ON dbo.usp_GiaoVien_GetAll TO [PGV];
GO

PRINT N'OK: dbo.usp_GiaoVien_GetAll đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiaoVien_Search
    @Keyword NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SearchKeyword NVARCHAR(250) = NULLIF(LTRIM(RTRIM(@Keyword)), N'');

    IF @SearchKeyword IS NULL
    BEGIN
        SELECT MAGV AS MaGV, HO AS Ho, TEN AS Ten, SODTLL AS SoDTLL, DIACHI AS DiaChi
        FROM dbo.GIAOVIEN
        WHERE TrangThai = 1
        ORDER BY HO, TEN, MAGV;

        RETURN;
    END;

    -- Sử dụng bảng tạm để chứa kết quả khớp Prefix (ưu tiên tối ưu Index Seek)
    DECLARE @PrefixResults TABLE (
        MAGV NCHAR(8) PRIMARY KEY,
        HO NVARCHAR(40),
        TEN NVARCHAR(10),
        SODTLL NCHAR(15),
        DIACHI NVARCHAR(50)
    );

    -- 1. Tìm kiếm theo tiền tố (Prefix Match) - Tận dụng tối đa Index Seek
    INSERT INTO @PrefixResults (MAGV, HO, TEN, SODTLL, DIACHI)
    SELECT MAGV, HO, TEN, SODTLL, DIACHI
    FROM dbo.GIAOVIEN
    WHERE TrangThai = 1
      AND (MAGV = CONVERT(NCHAR(8), @SearchKeyword)
           OR HO LIKE @SearchKeyword + N'%'
           OR TEN LIKE @SearchKeyword + N'%'
           OR SODTLL LIKE @SearchKeyword + N'%'
           OR DIACHI LIKE @SearchKeyword + N'%')
    OPTION (RECOMPILE);

    -- Nếu tìm thấy kết quả khớp tiền tố thì trả về ngay lập tức
    IF @@ROWCOUNT > 0
    BEGIN
        SELECT MAGV AS MaGV, HO AS Ho, TEN AS Ten, SODTLL AS SoDTLL, DIACHI AS DiaChi
        FROM @PrefixResults
        ORDER BY HO, TEN, MAGV;
        RETURN;
    END

    -- 2. Tìm kiếm theo chuỗi con (Infix/Substring Match) nếu không có kết quả khớp tiền tố
    SELECT MAGV AS MaGV, HO AS Ho, TEN AS Ten, SODTLL AS SoDTLL, DIACHI AS DiaChi
    FROM dbo.GIAOVIEN
    WHERE TrangThai = 1
      AND (MAGV = CONVERT(NCHAR(8), @SearchKeyword)
           OR HO LIKE N'%' + @SearchKeyword + N'%'
           OR TEN LIKE N'%' + @SearchKeyword + N'%'
           OR SODTLL LIKE N'%' + @SearchKeyword + N'%'
           OR DIACHI LIKE N'%' + @SearchKeyword + N'%')
    ORDER BY HO, TEN, MAGV
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_GiaoVien_Search TO [PGV];
GO

PRINT N'OK: dbo.usp_GiaoVien_Search đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiaoVien_Insert
    @MaGV   NCHAR(8),
    @Ho     NVARCHAR(40),
    @Ten    NVARCHAR(10),
    @SoDTLL NCHAR(15) = NULL,
    @DiaChi NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.GIAOVIEN WHERE MAGV = @MaGV)
    BEGIN
        RAISERROR(N'Mã giáo viên đã tồn tại', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.GIAOVIEN (MAGV, HO, TEN, SODTLL, DIACHI)
    VALUES (@MaGV, @Ho, @Ten, @SoDTLL, @DiaChi);
END
GO

GRANT EXECUTE ON dbo.usp_GiaoVien_Insert TO [PGV];
GO

PRINT N'OK: dbo.usp_GiaoVien_Insert đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiaoVien_Update
    @MaGV   NCHAR(8),
    @Ho     NVARCHAR(40),
    @Ten    NVARCHAR(10),
    @SoDTLL NCHAR(15) = NULL,
    @DiaChi NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.GIAOVIEN
    SET HO = @Ho,
        TEN = @Ten,
        SODTLL = @SoDTLL,
        DIACHI = @DiaChi
    WHERE MAGV = @MaGV;
END
GO

GRANT EXECUTE ON dbo.usp_GiaoVien_Update TO [PGV];
GO

PRINT N'OK: dbo.usp_GiaoVien_Update đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiaoVien_Delete
    @MaGV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra xem giáo viên đang hoạt động có tồn tại hay không
    IF NOT EXISTS (SELECT 1 FROM dbo.GIAOVIEN WHERE MAGV = @MaGV AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Không tìm thấy giáo viên đang hoạt động', 16, 1);
        RETURN;
    END;

    -- 2. Kiểm tra xem có liên kết dữ liệu với BODE hoặc GIAOVIEN_DANGKY hay không
    IF EXISTS (SELECT 1 FROM dbo.BODE WHERE MAGV = @MaGV)
       OR EXISTS (SELECT 1 FROM dbo.GIAOVIEN_DANGKY WHERE MAGV = @MaGV)
    BEGIN
        -- Xóa mềm giáo viên (chuyển trạng thái hoạt động thành 0)
        UPDATE dbo.GIAOVIEN
        SET TrangThai = 0
        WHERE MAGV = @MaGV;

        RETURN;
    END;

    -- 3. Xóa cứng giáo viên khỏi CSDL nếu không có ràng buộc liên kết
    DELETE FROM dbo.GIAOVIEN
    WHERE MAGV = @MaGV;
END
GO

GRANT EXECUTE ON dbo.usp_GiaoVien_Delete TO [PGV];
GO

PRINT N'OK: dbo.usp_GiaoVien_Delete đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiaoVien_GetExistingIds
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MAGV
    FROM dbo.GIAOVIEN
    ORDER BY MAGV;
END
GO

GRANT EXECUTE ON dbo.usp_GiaoVien_GetExistingIds TO [PGV];
GO

PRINT N'OK: dbo.usp_GiaoVien_GetExistingIds đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiaoVien_ExistsMaGV
    @MaGV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM dbo.GIAOVIEN
            WHERE MAGV = @MaGV
        )
        THEN 1
        ELSE 0
    END;
END
GO

GRANT EXECUTE ON dbo.usp_GiaoVien_ExistsMaGV TO [PGV];
GO

PRINT N'OK: dbo.usp_GiaoVien_ExistsMaGV đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[usp_LayThongTinGiaoVienTheoMa]
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
    FROM dbo.GIAOVIEN
    WHERE MAGV = @MAGV;
END
GO

GRANT EXECUTE ON dbo.usp_LayThongTinGiaoVienTheoMa TO [PGV];
GRANT EXECUTE ON dbo.usp_LayThongTinGiaoVienTheoMa TO [Giangvien];
GO

PRINT N'OK: [dbo].[usp_LayThongTinGiaoVienTheoMa] đã sẵn sàng.';
GO

-- ============================================================
-- Sinh Viên (SINHVIEN)
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaSV, Ho, Ten, NgaySinh, DiaChi, MaLop, MatKhau
    FROM SINHVIEN
    WHERE TrangThai = 1;
END
GO

GRANT EXECUTE ON [dbo].[usp_SinhVien_GetAll] TO [PGV];
GO

PRINT N'OK: dbo.usp_SinhVien_GetAll đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_GetByLop
    @MaLop NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaSV, Ho, Ten, NgaySinh, DiaChi, MaLop, MatKhau
    FROM SINHVIEN
    WHERE MaLop = @MaLop
      AND TrangThai = 1;
END
GO

GRANT EXECUTE ON [dbo].[usp_SinhVien_GetByLop] TO [PGV];
GO

PRINT N'OK: dbo.usp_SinhVien_GetByLop đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_Search
    @Keyword NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = NULLIF(LTRIM(RTRIM(@Keyword)), N'');

    IF @Keyword IS NULL
    BEGIN
        SELECT MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU
        FROM SINHVIEN
        WHERE TrangThai = 1
        ORDER BY MASV
        OPTION (RECOMPILE);
        RETURN;
    END

    DECLARE @PrefixResults TABLE (
        MASV NCHAR(8) PRIMARY KEY,
        HO NVARCHAR(40),
        TEN NVARCHAR(10),
        NGAYSINH DATE,
        DIACHI NVARCHAR(100),
        MALOP NCHAR(8),
        MATKHAU NVARCHAR(128)
    );

    INSERT INTO @PrefixResults (MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU)
    SELECT MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU
    FROM SINHVIEN
    WHERE TrangThai = 1
      AND (MASV  LIKE @Keyword + N'%'
           OR MALOP LIKE @Keyword + N'%'
           OR HO    LIKE @Keyword + N'%'
           OR TEN   LIKE @Keyword + N'%')
    OPTION (RECOMPILE);

    IF @@ROWCOUNT > 0
    BEGIN
        SELECT MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU
        FROM @PrefixResults
        ORDER BY MASV;
        RETURN;
    END

    SELECT MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU
    FROM SINHVIEN
    WHERE TrangThai = 1
      AND (MASV   LIKE N'%' + @Keyword + N'%'
           OR HO     LIKE N'%' + @Keyword + N'%'
           OR TEN    LIKE N'%' + @Keyword + N'%'
           OR DIACHI LIKE N'%' + @Keyword + N'%'
           OR MALOP  LIKE N'%' + @Keyword + N'%')
    ORDER BY MASV
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_Search TO [PGV];
GO

PRINT N'OK: dbo.usp_SinhVien_Search đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_Insert
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

    IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MaLop AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Lớp không tồn tại hoặc đã ngừng sử dụng', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MaSV)
    BEGIN
        RAISERROR(N'Mã sinh viên đã tồn tại', 16, 1);
        RETURN;
    END

    INSERT INTO SINHVIEN (MaSV, Ho, Ten, NgaySinh, DiaChi, MaLop, MatKhau, TrangThai)
    VALUES (@MaSV, @Ho, @Ten, @NgaySinh, @DiaChi, @MaLop, @MatKhau, 1);
END
GO

GRANT EXECUTE ON [dbo].[usp_SinhVien_Insert] TO [PGV];
GO

PRINT N'OK: dbo.usp_SinhVien_Insert đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_Update
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

    IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MaSV AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Khong tim thay sinh vien dang hoat dong', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MaLop AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Lop khong ton tai hoac da ngung su dung', 16, 1);
        RETURN;
    END

    UPDATE SINHVIEN
    SET Ho = @Ho, Ten = @Ten, NgaySinh = @NgaySinh, DiaChi = @DiaChi, MaLop = @MaLop, MatKhau = @MatKhau
    WHERE MaSV = @MaSV;
END
GO

GRANT EXECUTE ON [dbo].[usp_SinhVien_Update] TO [PGV];
GO

PRINT N'OK: dbo.usp_SinhVien_Update đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_Delete
    @MaSV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MaSV AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Khong tim thay sinh vien dang hoat dong', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM BANGDIEM WHERE MASV = @MaSV)
    BEGIN
        UPDATE SINHVIEN
        SET TrangThai = 0
        WHERE MASV = @MaSV;
        RETURN;
    END

    DELETE FROM SINHVIEN WHERE MaSV = @MaSV;
END
GO

GRANT EXECUTE ON [dbo].[usp_SinhVien_Delete] TO [PGV];
GO

PRINT N'OK: dbo.usp_SinhVien_Delete đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_GetExistingIds
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MASV
    FROM dbo.SINHVIEN
    WHERE TrangThai = 1;
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_GetExistingIds TO [PGV];
GO

PRINT N'OK: dbo.usp_SinhVien_GetExistingIds đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_ExistsMaSV
    @MASV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM dbo.SINHVIEN
            WHERE MASV = @MASV
        )
        THEN 1 ELSE 0
    END;
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_ExistsMaSV TO [PGV];
GO

PRINT N'OK: dbo.usp_SinhVien_ExistsMaSV đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_Login
    @MASV NCHAR(8),
    @PASSWORD NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Found BIT = 0;
    DECLARE @TrangThai BIT;
    DECLARE @MatKhau NVARCHAR(128);
    DECLARE @Ho NVARCHAR(40);
    DECLARE @Ten NVARCHAR(10);
    DECLARE @MaLop NCHAR(8);

    SELECT
        @Found = 1,
        @TrangThai = TrangThai,
        @MatKhau = MATKHAU,
        @Ho = HO,
        @Ten = TEN,
        @MaLop = MALOP
    FROM dbo.SINHVIEN
    WHERE MASV = @MASV;

    IF @Found = 0
    BEGIN
        RAISERROR(N'Tài khoản Sinh viên không tồn tại trong hệ thống!', 16, 1);
        RETURN;
    END

    IF @TrangThai = 0
    BEGIN
        RAISERROR(N'Tài khoản Sinh viên đã ngừng sử dụng!', 16, 1);
        RETURN;
    END

    IF @MatKhau IS NULL OR @MatKhau <> @PASSWORD
    BEGIN
        RAISERROR(N'Mật khẩu đăng nhập không chính xác!', 16, 1);
        RETURN;
    END

    SELECT @MASV AS MASV, @Ho AS HO, @Ten AS TEN, @MaLop AS MALOP;
END
GO

GRANT EXECUTE ON [dbo].[usp_SinhVien_Login] TO [Sinhvien];
GO

PRINT N'OK: dbo.usp_SinhVien_Login đã sẵn sàng.';
GO

-- ============================================================
-- Bộ Đề (BODE)
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM BODE
    WHERE TrangThai = 1
    ORDER BY CAUHOI;
END
GO

PRINT N'OK: dbo.usp_BoDe_GetAll đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_GetDanhSach
    @MAGV NCHAR(8) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM dbo.BODE
    WHERE TrangThai = 1
      AND (@MAGV IS NULL OR MAGV = @MAGV)
    ORDER BY CAUHOI;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_GetDanhSach TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_GetDanhSach TO [Giangvien];
GO

PRINT N'OK: dbo.usp_BoDe_GetDanhSach đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Search
    @Keyword NVARCHAR(250) = NULL,
    @MAGV NCHAR(8) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SearchKeyword NVARCHAR(250) = NULLIF(LTRIM(RTRIM(@Keyword)), N'');

    -- 1. Nếu không có từ khóa -> Trả về ngay lập tức (Tối ưu hóa nhánh rỗng)
    IF @SearchKeyword IS NULL
    BEGIN
        SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
               A, B, C, D, DAP_AN, MAGV
        FROM dbo.BODE
        WHERE TrangThai = 1
          AND (@MAGV IS NULL OR MAGV = @MAGV)
        ORDER BY CAUHOI
        OPTION (RECOMPILE);
        RETURN;
    END

    -- Tạo bảng tạm chứa các kết quả ưu tiên khớp chính xác hoặc tiền tố
    DECLARE @TempResults TABLE (
        CAUHOI INT PRIMARY KEY,
        MAMH NCHAR(5),
        TRINHDO CHAR(1),
        NOIDUNG NVARCHAR(200),
        A NVARCHAR(50),
        B NVARCHAR(50),
        C NVARCHAR(50),
        D NVARCHAR(50),
        DAP_AN CHAR(1),
        MAGV NCHAR(8)
    );

    -- 2. Tìm kiếm ưu tiên bằng Index Seek (MAMH, MAGV)
    INSERT INTO @TempResults
    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM dbo.BODE
    WHERE TrangThai = 1
      AND (@MAGV IS NULL OR MAGV = @MAGV)
      AND (
          (LEN(@SearchKeyword) <= 5 AND MAMH = CONVERT(NCHAR(5), @SearchKeyword))
          OR (LEN(@SearchKeyword) <= 8 AND MAGV = CONVERT(NCHAR(8), @SearchKeyword))
          OR MAMH LIKE @SearchKeyword + N'%'
      )
    OPTION (RECOMPILE);

    -- Nếu tìm thấy các kết quả khớp ưu tiên thì trả về ngay lập tức (Bỏ qua việc quét NOIDUNG)
    IF @@ROWCOUNT > 0
    BEGIN
        SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
               A, B, C, D, DAP_AN, MAGV
        FROM @TempResults
        ORDER BY CAUHOI;
        RETURN;
    END

    -- 3. Fallback: Quét chứa chuỗi trên cột NOIDUNG (Non-SARGable)
    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM dbo.BODE
    WHERE TrangThai = 1
      AND (@MAGV IS NULL OR MAGV = @MAGV)
      AND NOIDUNG LIKE N'%' + @SearchKeyword + N'%'
    ORDER BY CAUHOI
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Search TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_Search TO [Giangvien];
GO

PRINT N'OK: dbo.usp_BoDe_Search đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Insert
    @MaMH    NCHAR(5),
    @TrinhDo CHAR(1),
    @NoiDung NVARCHAR(200),
    @DapAnA  NVARCHAR(50),
    @DapAnB  NVARCHAR(50),
    @DapAnC  NVARCHAR(50),
    @DapAnD  NVARCHAR(50),
    @DapAn   CHAR(1),
    @MaGV    NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO BODE (MAMH, TRINHDO, NOIDUNG, A, B, C, D, DAP_AN, MAGV)
    VALUES (@MaMH, @TrinhDo, @NoiDung, @DapAnA, @DapAnB, @DapAnC, @DapAnD, @DapAn, @MaGV);

    SELECT SCOPE_IDENTITY() AS CauHoi;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Insert TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_Insert TO [Giangvien];
GO

PRINT N'OK: dbo.usp_BoDe_Insert đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Update
    @CauHoi  INT,
    @MaMH    NCHAR(5),
    @TrinhDo CHAR(1),
    @NoiDung NVARCHAR(200),
    @DapAnA  NVARCHAR(50),
    @DapAnB  NVARCHAR(50),
    @DapAnC  NVARCHAR(50),
    @DapAnD  NVARCHAR(50),
    @DapAn   CHAR(1),
    @MAGV    NCHAR(8) = NULL
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
        DAP_AN  = @DapAn
    WHERE CAUHOI = @CauHoi
      AND MAMH = @MaMH
      AND TrangThai = 1
      AND (@MAGV IS NULL OR MAGV = @MAGV);
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Update TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_Update TO [Giangvien];
GO

PRINT N'OK: dbo.usp_BoDe_Update đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Delete
    @CauHoi INT,
    @MaMH NCHAR(5),
    @MAGV NCHAR(8) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.BODE
    WHERE CAUHOI = @CauHoi
      AND MAMH = @MaMH
      AND TrangThai = 1
      AND (@MAGV IS NULL OR MAGV = @MAGV);
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Delete TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_Delete TO [Giangvien];
GO

PRINT N'OK: dbo.usp_BoDe_Delete đã sẵn sàng.';
GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_GetActiveSubjectCodes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MAMH
    FROM dbo.MONHOC
    WHERE TrangThai = 1
    ORDER BY MAMH;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_GetActiveSubjectCodes TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_GetActiveSubjectCodes TO [Giangvien];
GO

PRINT N'OK: dbo.usp_BoDe_GetActiveSubjectCodes đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_GetLatestCauHoi
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ISNULL(MAX(CAUHOI), 0) AS LatestCauHoi
    FROM BODE
    WHERE TrangThai = 1;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_GetLatestCauHoi TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_GetLatestCauHoi TO [Giangvien];
GO

PRINT N'OK: dbo.usp_BoDe_GetLatestCauHoi đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE usp_LayDanhSachTrinhDo
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
    WHERE TrangThai = 1
    ORDER BY TRINHDO ASC;
END
GO

GRANT EXECUTE ON dbo.usp_LayDanhSachTrinhDo TO [PGV];
GRANT EXECUTE ON dbo.usp_LayDanhSachTrinhDo TO [Giangvien];
GO

PRINT N'OK: usp_LayDanhSachTrinhDo đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER FUNCTION [dbo].[udf_DemSoCauTrongBoDe]
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
    WHERE TRINHDO = @TRINHDO
      AND MAMH = @MAMH
      AND TrangThai = 1;
    RETURN @SoCau;
END
GO

PRINT N'OK: [dbo].[udf_DemSoCauTrongBoDe] đã sẵn sàng.';
GO

-- ============================================================
-- Đăng Ký Thi / Đề Thi (GIAOVIEN_DANGKY)
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER FUNCTION [dbo].[udf_KiemTraDieuKienDangKy]
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

PRINT N'OK: [dbo].[udf_KiemTraDieuKienDangKy] đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE usp_ThucHienDangKyThi
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

PRINT N'OK: usp_ThucHienDangKyThi đã sẵn sàng.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_LayDanhSachDeThi
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
GRANT EXECUTE ON dbo.usp_LayDanhSachDeThi TO [PGV];
GO

PRINT N'OK: dbo.usp_LayDanhSachDeThi đã sẵn sàng.';
GO
