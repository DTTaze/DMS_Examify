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
    @LGNAME   VARCHAR(50),
    @PASS     VARCHAR(50),
    @USERNAME VARCHAR(50),
    @ROLE     VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @result INT;
    DECLARE @Step NVARCHAR(200);

    -- Trim khoảng trắng đầu cuối
    SET @LGNAME   = LTRIM(RTRIM(@LGNAME));
    SET @PASS     = LTRIM(RTRIM(@PASS));
    SET @USERNAME = LTRIM(RTRIM(@USERNAME));
    SET @ROLE     = LTRIM(RTRIM(@ROLE));

    -- Kiểm tra login đã tồn tại chưa
    IF EXISTS (
        SELECT 1
        FROM master.dbo.syslogins
        WHERE name = @LGNAME
    )
    BEGIN
        RAISERROR(N'Login name bị trùng', 16, 1);
        RETURN 1;
    END

    -- Kiểm tra database user đã tồn tại chưa
    IF EXISTS (
        SELECT 1
        FROM sys.sysusers
        WHERE name = @USERNAME
    )
    BEGIN
        RAISERROR(N'User name bị trùng', 16, 1);
        RETURN 2;
    END

    -- Kiểm tra role có tồn tại không
    IF NOT EXISTS (
        SELECT 1
        FROM sys.sysusers
        WHERE name = @ROLE
          AND issqlrole = 1
    )
    BEGIN
        RAISERROR(N'Role không tồn tại trong database', 16, 1);
        RETURN 4;
    END

    BEGIN TRY
        -- ----------------------------------------------------
        -- BƯỚC 1: Tạo login bằng sp_addlogin
        -- ----------------------------------------------------
        SET @Step = N'1. Tạo login bằng sp_addlogin';

        EXEC @result = sp_addlogin 
            @loginame = @LGNAME,
            @passwd   = @PASS,
            @defdb    = 'THITRACNGHIEM';

        IF @result <> 0
        BEGIN
            RAISERROR(N'Tạo login thất bại', 16, 1);
            RETURN 1;
        END

        -- ----------------------------------------------------
        -- BƯỚC 2: Tạo database user bằng sp_grantdbaccess
        -- ----------------------------------------------------
        SET @Step = N'2. Tạo database user bằng sp_grantdbaccess';

        EXEC @result = sp_grantdbaccess 
            @loginame   = @LGNAME,
            @name_in_db = @USERNAME;

        IF @result <> 0
        BEGIN
            EXEC sp_droplogin @LGNAME;
            RAISERROR(N'Tạo database user thất bại hoặc user name bị trùng', 16, 1);
            RETURN 2;
        END

        -- ----------------------------------------------------
        -- BƯỚC 3: Add user vào database role
        -- ----------------------------------------------------
        SET @Step = N'3. Add user vào database role';

        EXEC @result = sp_addrolemember 
            @rolename   = @ROLE,
            @membername = @USERNAME;

        IF @result <> 0
        BEGIN
            EXEC sp_dropuser @USERNAME;
            EXEC sp_droplogin @LGNAME;
            RAISERROR(N'Add user vào role thất bại', 16, 1);
            RETURN 3;
        END

        -- ----------------------------------------------------
        -- BƯỚC 4: Add login vào securityadmin (nếu role là PGV)
        -- ----------------------------------------------------
        IF @ROLE = 'PGV'
        BEGIN
            SET @Step = N'4. Add login vào securityadmin';

            EXEC @result = sp_addsrvrolemember 
                @loginame = @LGNAME,
                @rolename = 'securityadmin';

            IF @result <> 0
            BEGIN
                EXEC sp_dropuser @USERNAME;
                EXEC sp_droplogin @LGNAME;
                RAISERROR(N'Add login vào securityadmin thất bại', 16, 1);
                RETURN 5;
            END
        END

        RETURN 0;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);

        SET @ErrorMessage = N'Lỗi tại bước: ' + ISNULL(@Step, N'Không xác định')
                          + N'. Chi tiết: ' + ERROR_MESSAGE();

        -- Cleanup: xóa user trước, rồi mới xóa login
        BEGIN TRY
            IF EXISTS (
                SELECT 1
                FROM sys.sysusers
                WHERE name = @USERNAME
            )
            BEGIN
                EXEC sp_dropuser @USERNAME;
            END

            IF EXISTS (
                SELECT 1
                FROM master.dbo.syslogins
                WHERE name = @LGNAME
            )
            BEGIN
                EXEC sp_droplogin @LGNAME;
            END
        END TRY
        BEGIN CATCH
            -- Không để lỗi cleanup che lỗi gốc
        END CATCH

        RAISERROR(@ErrorMessage, 16, 1);
        RETURN 3;
    END CATCH
END

GRANT EXECUTE ON [dbo].[SP_TAOTAIKHOAN] TO [PGV];

PRINT N'OK: [dbo].[SP_TAOTAIKHOAN] đã sẵn sàng.';
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
    ORDER BY TENMH ASC;
END
GO

GRANT EXECUTE ON dbo.usp_LayDanhSachMonHoc TO [PGV];
GRANT EXECUTE ON dbo.usp_LayDanhSachMonHoc TO [Giangvien];
GO

PRINT N'OK: dbo.usp_LayDanhSachMonHoc đã sẵn sàng.';
GO

IF TYPE_ID(N'dbo.udt_MonHocImportCheck') IS NULL
BEGIN
    CREATE TYPE [dbo].[udt_MonHocImportCheck] AS TABLE(
        [MaMH] [nchar](5) NOT NULL,
        [TenMH] [nvarchar](40) NOT NULL
    )
END
GO

CREATE OR ALTER PROCEDURE [dbo].[usp_MonHoc_CheckImport]
    @ImportData [dbo].[udt_MonHocImportCheck] READONLY
AS
BEGIN
    SET NOCOUNT ON;

    -- Lấy danh sách MaMH bị trùng
    SELECT m.MaMH 
    FROM dbo.MONHOC m 
    INNER JOIN @ImportData i ON m.MaMH = i.MaMH;

    -- Lấy danh sách TenMH bị trùng
    SELECT m.TenMH 
    FROM dbo.MONHOC m 
    INNER JOIN @ImportData i ON m.TenMH = i.TenMH;
END
GO

GRANT EXECUTE ON TYPE::[dbo].[udt_MonHocImportCheck] TO [PGV];

GRANT EXECUTE ON [dbo].[usp_MonHoc_CheckImport] TO [PGV];
-- ============================================================
-- Lớp (LOP)
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER VIEW dbo.vw_Lop_GetAll
AS
SELECT
    MALOP,
    TENLOP
FROM LOP;
GO

GRANT SELECT ON [dbo].[vw_Lop_GetAll] TO [PGV];
GO

PRINT N'OK: dbo.vw_Lop_GetAll đã sẵn sàng.';
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
    WHERE (MALOP LIKE @KEYWORD + N'%'
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
    WHERE (MALOP LIKE N'%' + @KEYWORD + N'%'
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

    INSERT INTO LOP(MALOP, TENLOP)
    VALUES(@MALOP, @TENLOP);
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

    -- Chuẩn hóa dữ liệu đầu vào
    SET @MALOP = LTRIM(RTRIM(@MALOP));

    BEGIN TRY
        -- Thử xóa cứng trực tiếp (sẽ tiết kiệm số lần SELECT kiểm tra)
        DELETE FROM LOP WHERE MALOP = @MALOP;

        -- Nếu không có dòng nào bị ảnh hưởng, nghĩa là mã Lớp không tồn tại
        IF @@ROWCOUNT = 0
        BEGIN
            THROW 50000, N'Không tìm thấy lớp', 1;
        END
    END TRY
    BEGIN CATCH
        -- Bắt lỗi vi phạm khóa ngoại (The DELETE statement conflicted with the REFERENCE constraint)
        IF ERROR_NUMBER() = 547
        BEGIN
            -- Ném lỗi nếu muốn chặn xóa cứng
            THROW 50001, N'Không thể xóa lớp này vì đã có dữ liệu liên kết', 1;
        END
        ELSE
        BEGIN
            -- Ném lại các lỗi không mong muốn khác
            THROW;
        END
    END CATCH
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
    WHERE (MAGV = CONVERT(NCHAR(8), @SearchKeyword)
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
    WHERE (MAGV = CONVERT(NCHAR(8), @SearchKeyword)
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

    -- Chuẩn hóa dữ liệu đầu vào
    SET @MaGV = LTRIM(RTRIM(@MaGV));

    BEGIN TRY
        -- Thử xóa cứng trực tiếp
        DELETE FROM dbo.GIAOVIEN WHERE MAGV = @MaGV;

        -- Nếu không có dòng nào bị ảnh hưởng, nghĩa là mã Giáo viên không tồn tại
        IF @@ROWCOUNT = 0
        BEGIN
            THROW 50000, N'Không tìm thấy giáo viên', 1;
        END
    END TRY
    BEGIN CATCH
        -- Bắt lỗi vi phạm khóa ngoại (The DELETE statement conflicted with the REFERENCE constraint)
        IF ERROR_NUMBER() = 547
        BEGIN
            -- Ném lỗi nếu muốn chặn xóa cứng
            THROW 50001, N'Không thể xóa giảng viên này vì đã có dữ liệu liên kết', 1;
        END
        ELSE
        BEGIN
            -- Ném lại các lỗi không mong muốn khác
            THROW;
        END
    END CATCH
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
    FROM SINHVIEN;
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
    WHERE MaLop = @MaLop;
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
    WHERE (MASV  LIKE @Keyword + N'%'
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
    WHERE (MASV   LIKE N'%' + @Keyword + N'%'
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

    IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MaLop)
    BEGIN
        RAISERROR(N'Lớp không tồn tại', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MaSV)
    BEGIN
        RAISERROR(N'Mã sinh viên đã tồn tại', 16, 1);
        RETURN;
    END

    INSERT INTO SINHVIEN (MaSV, Ho, Ten, NgaySinh, DiaChi, MaLop, MatKhau)
    VALUES (@MaSV, @Ho, @Ten, @NgaySinh, @DiaChi, @MaLop, @MatKhau);
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

    IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MaSV)
    BEGIN
        RAISERROR(N'Khong tim thay sinh vien', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MaLop)
    BEGIN
        RAISERROR(N'Lop khong ton tai', 16, 1);
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

    IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MaSV)
    BEGIN
        RAISERROR(N'Khong tim thay sinh vien', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM BANGDIEM WHERE MASV = @MaSV)
    BEGIN
        RAISERROR(N'Không thể xóa sinh viên vì đã có điểm thi', 16, 1);
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
    FROM dbo.SINHVIEN;
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

    DECLARE @MatKhau NVARCHAR(128);
    DECLARE @Ho NVARCHAR(40);
    DECLARE @Ten NVARCHAR(10);
    DECLARE @MaLop NCHAR(8);

    SELECT
        @MatKhau = MATKHAU,
        @Ho = HO,
        @Ten = TEN,
        @MaLop = MALOP
    FROM dbo.SINHVIEN
    WHERE MASV = @MASV;

    IF @@ROWCOUNT = 0
    BEGIN
        THROW 50001, N'Tài khoản Sinh viên không tồn tại trong hệ thống!', 1;
    END

    IF @MatKhau IS NULL OR @MatKhau <> @PASSWORD
    BEGIN
        THROW 50001, N'Tài khoản Sinh viên không tồn tại trong hệ thống!', 1;
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
    FROM dbo.BODE WHERE (@MAGV IS NULL OR MAGV = @MAGV)
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
        FROM dbo.BODE WHERE (@MAGV IS NULL OR MAGV = @MAGV)
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
    FROM dbo.BODE WHERE (@MAGV IS NULL OR MAGV = @MAGV)
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
    FROM dbo.BODE WHERE (@MAGV IS NULL OR MAGV = @MAGV)
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
    FROM BODE;
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
      AND MAMH = @MAMH;
    RETURN @SoCau;
END
GO

PRINT N'OK: [dbo].[udf_DemSoCauTrongBoDe] đã sẵn sàng.';
GO

GRANT EXECUTE ON [dbo].[udf_DemSoCauTrongBoDe] TO [PGV];
GRANT EXECUTE ON [dbo].[udf_DemSoCauTrongBoDe] TO [Giangvien];
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

GRANT EXECUTE ON [dbo].[udf_KiemTraDieuKienDangKy] TO [PGV];
GRANT EXECUTE ON [dbo].[udf_KiemTraDieuKienDangKy] TO [Giangvien];
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

GRANT EXECUTE ON usp_ThucHienDangKyThi TO [PGV];
GRANT EXECUTE ON usp_ThucHienDangKyThi TO [Giangvien];
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

-- ============================================================
-- SP: usp_BangDiemMonHoc
-- Muc dich: Lay bang diem mon hoc theo lop, mon, lan thi
-- Bao gom ca sinh vien chua thi (LEFT JOIN)
-- Ky thuat toi uu: Khu phep ket (tip v), Phep chon truoc phep ket sau (tip iv)
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.usp_BangDiemMonHoc
    @MALOP NCHAR(8),
    @MAMH  NCHAR(5),
    @LAN   SMALLINT
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @TENLOP NVARCHAR(40), @TENMH NVARCHAR(40)
    SELECT @TENLOP = TENLOP FROM LOP WHERE MALOP = @MALOP
    SELECT @TENMH  = TENMH  FROM MONHOC WHERE MAMH = @MAMH

    SELECT
        @TENLOP  AS TENLOP,
        @TENMH   AS TENMH,
        SV.MASV,
        SV.HO,
        SV.TEN,
        BD.DIEM
    FROM
        (SELECT MASV, HO, TEN
         FROM SINHVIEN
         WHERE MALOP = @MALOP) SV
    LEFT JOIN
        (SELECT MASV, DIEM
         FROM BANGDIEM
         WHERE MAMH = @MAMH AND LAN = @LAN) BD
    ON SV.MASV = BD.MASV
    ORDER BY SV.TEN, SV.HO
END
GO

GRANT EXECUTE ON dbo.usp_BangDiemMonHoc TO [Giangvien];
GRANT EXECUTE ON dbo.usp_BangDiemMonHoc TO [PGV];
GO

PRINT N'OK: dbo.usp_BangDiemMonHoc da san sang.';
GO

-- ============================================================
-- Thi (Luong thi cua sinh vien - Staging Table)
-- ============================================================

-- SP: Lay ten lop theo ma lop
CREATE OR ALTER PROCEDURE dbo.usp_LayTenLopByMaLop
    @MALOP NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TENLOP FROM dbo.LOP WHERE MALOP = @MALOP;
END
GO

GRANT EXECUTE ON dbo.usp_LayTenLopByMaLop TO [Sinhvien];
GO

PRINT N'OK: usp_LayTenLopByMaLop da san sang.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- SP: Lay danh sach mon thi cho sinh vien (theo lop)
CREATE OR ALTER PROCEDURE dbo.usp_LayDanhSachMonThiChoSV
    @MALOP NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        gvdk.MAMH,
        mh.TENMH
    FROM dbo.GIAOVIEN_DANGKY gvdk
    JOIN dbo.MONHOC mh ON gvdk.MAMH = mh.MAMH
    WHERE gvdk.MALOP = @MALOP
    ORDER BY mh.TENMH;
END
GO

GRANT EXECUTE ON dbo.usp_LayDanhSachMonThiChoSV TO [Sinhvien];
GO

PRINT N'OK: usp_LayDanhSachMonThiChoSV da san sang.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- SP: Lay thong tin de thi cho sinh vien (so cau, thoi gian, trinh do)
CREATE OR ALTER PROCEDURE dbo.usp_LayThongTinDeThiChoSV
    @MALOP NCHAR(8),
    @MAMH  NCHAR(5),
    @LAN   SMALLINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT SOCAUTHI, THOIGIAN, TRINHDO
    FROM dbo.GIAOVIEN_DANGKY
    WHERE MALOP = @MALOP
      AND MAMH  = @MAMH
      AND LAN   = @LAN;
END
GO

GRANT EXECUTE ON dbo.usp_LayThongTinDeThiChoSV TO [Sinhvien];
GO

PRINT N'OK: usp_LayThongTinDeThiChoSV da san sang.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ------------------------------------------------------------
-- usp_BatDauThi
-- Bat dau phien thi: tao BAITHI_TEMP + random cau hoi vao CT_BAITHI_TEMP
-- Quy tac random:
--   - Trinh do A: 70% cau A, con lai lay B
--   - Trinh do B: 70% cau B, con lai lay C
--   - Trinh do C: 100% cau C
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_BatDauThi
    @MASV NCHAR(8),
    @MAMH NCHAR(5),
    @LAN  SMALLINT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MALOP    NCHAR(8);
    DECLARE @TRINHDO  CHAR(1);
    DECLARE @SOCAUTHI INT;
    DECLARE @THOIGIAN INT;

    -- Lay ma lop cua sinh vien
    SELECT @MALOP = MALOP FROM dbo.SINHVIEN WHERE MASV = @MASV;
    IF @MALOP IS NULL
    BEGIN
        SELECT CAST(0 AS BIT) AS IsSuccess, N'Sinh vien khong ton tai.' AS ThongBao;
        RETURN;
    END

    -- Lay thong tin de thi
    SELECT @TRINHDO = TRINHDO, @SOCAUTHI = SOCAUTHI, @THOIGIAN = THOIGIAN
    FROM dbo.GIAOVIEN_DANGKY
    WHERE MAMH = @MAMH AND MALOP = @MALOP AND LAN = @LAN;

    IF @TRINHDO IS NULL
    BEGIN
        SELECT CAST(0 AS BIT) AS IsSuccess, N'Khong tim thay de thi cho lan thi nay.' AS ThongBao;
        RETURN;
    END

    -- Kiem tra da thi lan nay chua (trong bang that)
    IF EXISTS (SELECT 1 FROM dbo.BAITHI WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN)
    BEGIN
        SELECT CAST(0 AS BIT) AS IsSuccess, N'Ban da thi lan nay roi. Khong the thi lai.' AS ThongBao;
        RETURN;
    END

    -- Kiem tra dang co phien thi trong bang tam khong
    IF EXISTS (SELECT 1 FROM dbo.BAITHI_TEMP WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN)
    BEGIN
        SELECT CAST(1 AS BIT) AS IsSuccess, N'Tiep tuc phien thi dang mo.' AS ThongBao;
        RETURN;
    END

    -- Random cau hoi
    DECLARE @CauHoiRandom TABLE (CAUHOI INT, STT INT);
    DECLARE @SoCauTrinhDoCao INT;
    DECLARE @SoCauTrinhDoThap INT;

    IF @TRINHDO = 'C'
    BEGIN
        INSERT INTO @CauHoiRandom (CAUHOI, STT)
        SELECT CAUHOI, ROW_NUMBER() OVER (ORDER BY NEWID())
        FROM dbo.BODE
        WHERE MAMH = @MAMH AND TRINHDO = 'C'
        ORDER BY NEWID()
        OFFSET 0 ROWS FETCH NEXT @SOCAUTHI ROWS ONLY;
    END
    ELSE
    BEGIN
        SET @SoCauTrinhDoCao = CEILING(@SOCAUTHI * 0.7);
        SET @SoCauTrinhDoThap = @SOCAUTHI - @SoCauTrinhDoCao;

        -- Lay cau trinh do goc
        INSERT INTO @CauHoiRandom (CAUHOI, STT)
        SELECT CAUHOI, ROW_NUMBER() OVER (ORDER BY NEWID())
        FROM dbo.BODE
        WHERE MAMH = @MAMH AND TRINHDO = @TRINHDO
        ORDER BY NEWID()
        OFFSET 0 ROWS FETCH NEXT @SoCauTrinhDoCao ROWS ONLY;

        -- Lay cau trinh do thap hon de bu
        DECLARE @TrinhDoThap CHAR(1) = CASE WHEN @TRINHDO = 'A' THEN 'B' ELSE 'C' END;
        DECLARE @STTOffset INT = (SELECT ISNULL(MAX(STT), 0) FROM @CauHoiRandom);

        INSERT INTO @CauHoiRandom (CAUHOI, STT)
        SELECT CAUHOI, @STTOffset + ROW_NUMBER() OVER (ORDER BY NEWID())
        FROM dbo.BODE
        WHERE MAMH = @MAMH AND TRINHDO = @TrinhDoThap
          AND CAUHOI NOT IN (SELECT CAUHOI FROM @CauHoiRandom)
        ORDER BY NEWID()
        OFFSET 0 ROWS FETCH NEXT @SoCauTrinhDoThap ROWS ONLY;
    END

    -- Kiem tra du cau hoi
    IF (SELECT COUNT(*) FROM @CauHoiRandom) < @SOCAUTHI
    BEGIN
        SELECT CAST(0 AS BIT) AS IsSuccess, N'Khong du cau hoi trong bo de.' AS ThongBao;
        RETURN;
    END

    -- Tao phien thi trong bang tam
    BEGIN TRY
        BEGIN TRAN;

        INSERT INTO dbo.BAITHI_TEMP (MASV, MAMH, LAN, MALOP, THOIDIEMBATDAU, THOIGIANCONLAI, LANCAPNHATCUOI)
        VALUES (@MASV, @MAMH, @LAN, @MALOP, GETDATE(), @THOIGIAN * 60, GETDATE());

        INSERT INTO dbo.CT_BAITHI_TEMP (MASV, MAMH, LAN, CAUHOI, STT, CAUTRALOI)
        SELECT @MASV, @MAMH, @LAN, CAUHOI, STT, NULL
        FROM @CauHoiRandom;

        COMMIT TRAN;

        SELECT CAST(1 AS BIT) AS IsSuccess, N'Bat dau thi thanh cong.' AS ThongBao;
    END TRY
    BEGIN CATCH
        ROLLBACK TRAN;
        SELECT CAST(0 AS BIT) AS IsSuccess,
               N'Loi khi bat dau thi: ' + ERROR_MESSAGE() AS ThongBao;
    END CATCH
END
GO

GRANT EXECUTE ON dbo.usp_BatDauThi TO [Sinhvien];
GO

PRINT N'OK: usp_BatDauThi da san sang.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ------------------------------------------------------------
-- usp_KiemTraPhienThi
-- Kiem tra xem SV co phien thi dang mo trong bang tam khong.
-- Thoi gian con lai: lay truc tiep tu THOIGIANCONLAI (da duoc
-- pause khi cup dien, chi tru thoi gian khi SV dang online).
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_KiemTraPhienThi
    @MASV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.BAITHI_TEMP WHERE MASV = @MASV)
    BEGIN
        SELECT
            CAST(1 AS BIT) AS CoPhienThi,
            bt.MAMH,
            bt.LAN,
            bt.THOIGIANCONLAI AS ThoiGianConLai
        FROM dbo.BAITHI_TEMP bt
        WHERE bt.MASV = @MASV;
    END
    ELSE
    BEGIN
        SELECT
            CAST(0 AS BIT) AS CoPhienThi,
            CAST('' AS NCHAR(5)) AS MAMH,
            CAST(0 AS INT) AS LAN,
            CAST(0 AS INT) AS ThoiGianConLai;
    END
END
GO

GRANT EXECUTE ON dbo.usp_KiemTraPhienThi TO [Sinhvien];
GO

PRINT N'OK: usp_KiemTraPhienThi da san sang.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ------------------------------------------------------------
-- usp_LayBaiThiDangLam
-- Load noi dung bai thi tu bang tam.
-- QUAN TRONG: Reset LANCAPNHATCUOI = GETDATE() de bo qua
-- khoang thoi gian cup dien (thoi gian offline khong bi tru).
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_LayBaiThiDangLam
    @MASV NCHAR(8),
    @MAMH NCHAR(5),
    @LAN  SMALLINT
AS
BEGIN
    SET NOCOUNT ON;

    -- Reset moc thoi gian khi resume (bo qua thoi gian offline)
    UPDATE dbo.BAITHI_TEMP
    SET LANCAPNHATCUOI = GETDATE()
    WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN;

    -- Tra ve noi dung bai thi
    SELECT
        bt.MAMH,
        mh.TENMH,
        bt.LAN,
        gvdk.THOIGIAN,
        bt.THOIGIANCONLAI AS ThoiGianConLaiGiay,
        gvdk.TRINHDO,
        bt.THOIDIEMBATDAU AS NGAYTHI,
        ct.STT,
        ct.CAUHOI,
        bd.NOIDUNG,
        bd.A,
        bd.B,
        bd.C,
        bd.D,
        ct.CAUTRALOI
    FROM dbo.BAITHI_TEMP bt
    JOIN dbo.CT_BAITHI_TEMP ct ON bt.MASV = ct.MASV
                               AND bt.MAMH = ct.MAMH
                               AND bt.LAN  = ct.LAN
    JOIN dbo.BODE bd ON ct.CAUHOI = bd.CAUHOI
    JOIN dbo.MONHOC mh ON bt.MAMH = mh.MAMH
    JOIN dbo.GIAOVIEN_DANGKY gvdk ON gvdk.MAMH  = bt.MAMH
                                  AND gvdk.MALOP = bt.MALOP
                                  AND gvdk.LAN   = bt.LAN
    WHERE bt.MASV = @MASV
      AND bt.MAMH = @MAMH
      AND bt.LAN  = @LAN
    ORDER BY ct.STT;
END
GO

GRANT EXECUTE ON dbo.usp_LayBaiThiDangLam TO [Sinhvien];
GO

PRINT N'OK: usp_LayBaiThiDangLam da san sang.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ------------------------------------------------------------
-- usp_TraLoiCauHoi
-- Ghi dap an vao bang tam CT_BAITHI_TEMP.
-- Dong thoi tru thoi gian da troi ke tu lan cap nhat cuoi.
-- Neu het gio thi tu choi va thong bao.
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_TraLoiCauHoi
    @MASV      NCHAR(8),
    @MAMH      NCHAR(5),
    @LAN       SMALLINT,
    @CAUHOI    INT,
    @CAUTRALOI CHAR(1)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ThoiGianConLai INT;
    DECLARE @LanCapNhatCuoi DATETIME;

    -- Lay thong tin phien thi
    SELECT @ThoiGianConLai = THOIGIANCONLAI,
           @LanCapNhatCuoi = LANCAPNHATCUOI
    FROM dbo.BAITHI_TEMP
    WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN;

    IF @ThoiGianConLai IS NULL
    BEGIN
        SELECT CAST(0 AS BIT) AS IsSuccess, N'Khong tim thay phien thi.' AS ThongBao;
        RETURN;
    END

    -- Tru thoi gian da troi ke tu lan cap nhat cuoi
    DECLARE @ThoiGianDaTroi INT = DATEDIFF(SECOND, @LanCapNhatCuoi, GETDATE());
    SET @ThoiGianConLai = @ThoiGianConLai - @ThoiGianDaTroi;

    IF @ThoiGianConLai <= 0
    BEGIN
        SELECT CAST(0 AS BIT) AS IsSuccess, N'Da het thoi gian lam bai.' AS ThongBao;
        RETURN;
    END

    -- Cap nhat dap an va thoi gian
    UPDATE dbo.CT_BAITHI_TEMP
    SET CAUTRALOI = @CAUTRALOI
    WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN AND CAUHOI = @CAUHOI;

    UPDATE dbo.BAITHI_TEMP
    SET THOIGIANCONLAI = @ThoiGianConLai,
        LANCAPNHATCUOI = GETDATE()
    WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN;

    SELECT CAST(1 AS BIT) AS IsSuccess, N'Da luu cau tra loi.' AS ThongBao;
END
GO

GRANT EXECUTE ON dbo.usp_TraLoiCauHoi TO [Sinhvien];
GO

PRINT N'OK: usp_TraLoiCauHoi da san sang.';
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ------------------------------------------------------------
-- usp_NopBaiThi
-- Nop bai: chuyen du lieu tu bang tam sang bang that,
--          cham diem, ghi vao BANGDIEM, xoa bang tam.
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_NopBaiThi
    @MASV NCHAR(8),
    @MAMH NCHAR(5),
    @LAN  SMALLINT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MALOP NCHAR(8);
    DECLARE @THOIDIEMBATDAU DATETIME;

    -- Kiem tra phien thi ton tai trong bang tam
    SELECT @MALOP = MALOP,
           @THOIDIEMBATDAU = THOIDIEMBATDAU
    FROM dbo.BAITHI_TEMP
    WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN;

    IF @MALOP IS NULL
    BEGIN
        SELECT CAST(0 AS BIT) AS IsSuccess, N'Khong tim thay phien thi de nop.' AS ThongBao,
               CAST(0 AS INT) AS SoCauDung, CAST(0 AS INT) AS TongSoCau, CAST(0.0 AS FLOAT) AS Diem;
        RETURN;
    END

    BEGIN TRY
        BEGIN TRAN;

        -- 1. Chuyen BAITHI_TEMP -> BAITHI
        INSERT INTO dbo.BAITHI (MASV, MAMH, LAN, MALOP, THOIDIEMBATDAU)
        VALUES (@MASV, @MAMH, @LAN, @MALOP, @THOIDIEMBATDAU);

        -- 2. Chuyen CT_BAITHI_TEMP -> CT_BAITHI
        INSERT INTO dbo.CT_BAITHI (MASV, MAMH, LAN, CAUHOI, STT, CAUTRALOI)
        SELECT MASV, MAMH, LAN, CAUHOI, STT, CAUTRALOI
        FROM dbo.CT_BAITHI_TEMP
        WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN;

        -- 3. Cham diem
        DECLARE @SoCauDung INT;
        DECLARE @TongSoCau INT;
        DECLARE @Diem FLOAT;

        SELECT @TongSoCau = COUNT(*),
               @SoCauDung = SUM(CASE
                   WHEN ct.CAUTRALOI IS NOT NULL AND ct.CAUTRALOI = bd.DAP_AN
                   THEN 1 ELSE 0 END)
        FROM dbo.CT_BAITHI ct
        JOIN dbo.BODE bd ON ct.CAUHOI = bd.CAUHOI
        WHERE ct.MASV = @MASV AND ct.MAMH = @MAMH AND ct.LAN = @LAN;

        SET @Diem = CASE
            WHEN @TongSoCau = 0 THEN 0.0
            ELSE ROUND(CAST(@SoCauDung AS FLOAT) / @TongSoCau * 10, 1)
        END;

        -- 4. Ghi diem vao BANGDIEM
        IF EXISTS (SELECT 1 FROM dbo.BANGDIEM WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN)
        BEGIN
            UPDATE dbo.BANGDIEM
            SET DIEM = @Diem, NGAYTHI = CAST(GETDATE() AS DATE)
            WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN;
        END
        ELSE
        BEGIN
            INSERT INTO dbo.BANGDIEM (MASV, MAMH, LAN, NGAYTHI, DIEM)
            VALUES (@MASV, @MAMH, @LAN, CAST(GETDATE() AS DATE), @Diem);
        END

        -- 5. Xoa du lieu trong bang tam
        DELETE FROM dbo.CT_BAITHI_TEMP
        WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN;

        DELETE FROM dbo.BAITHI_TEMP
        WHERE MASV = @MASV AND MAMH = @MAMH AND LAN = @LAN;

        COMMIT TRAN;

        SELECT CAST(1 AS BIT) AS IsSuccess,
               N'Nop bai thanh cong!' AS ThongBao,
               @SoCauDung AS SoCauDung,
               @TongSoCau AS TongSoCau,
               @Diem AS Diem;
    END TRY
    BEGIN CATCH
        ROLLBACK TRAN;
        SELECT CAST(0 AS BIT) AS IsSuccess,
               N'Loi khi nop bai: ' + ERROR_MESSAGE() AS ThongBao,
               CAST(0 AS INT) AS SoCauDung,
               CAST(0 AS INT) AS TongSoCau,
               CAST(0.0 AS FLOAT) AS Diem;
    END CATCH
END
GO

GRANT EXECUTE ON dbo.usp_NopBaiThi TO [Sinhvien];
GO

PRINT N'OK: usp_NopBaiThi da san sang.';
GO

CREATE OR ALTER PROCEDURE [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        name AS TenNhomQuyen
    FROM
        sysusers
    WHERE
        name IN ('PGV', 'Giangvien')
    ORDER BY
        name;
END
GO

PRINT N'OK: usp_LayDanhSachQuyen_TaoTaiKhoan đã sẵn sàng.';
GO

GRANT EXECUTE ON [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan] TO [PGV];
GRANT EXECUTE ON [dbo].[usp_LayDanhSachQuyen_TaoTaiKhoan] TO [Giangvien];
GO