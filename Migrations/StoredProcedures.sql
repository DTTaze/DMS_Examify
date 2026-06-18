USE THITRACNGHIEM
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
GO
GRANT EXECUTE ON [dbo].[usp_TaiKhoan_LayThongTin] TO [Giangvien];
GO

PRINT N'OK: usp_TaiKhoan_LayThongTin đã được cập nhật.';
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

PRINT N'OK: Da tao usp_SinhVien_Login.';
GO

IF COL_LENGTH('dbo.BODE', 'TrangThai') IS NULL
BEGIN
    ALTER TABLE dbo.BODE
    ADD TrangThai BIT NOT NULL
        CONSTRAINT DF_BODE_TrangThai DEFAULT (1);
END
GO

IF OBJECT_ID(N'dbo.trg_BODE_KiemTraTruocKhiXoa', N'TR') IS NOT NULL
BEGIN
    DROP TRIGGER dbo.trg_BODE_KiemTraTruocKhiXoa;
END
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

PRINT N'OK: usp_BoDe_GetAll đã được cập nhật.';
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_BODE_TrangThai_MAGV_CAUHOI'
      AND object_id = OBJECT_ID(N'dbo.BODE')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_BODE_TrangThai_MAGV_CAUHOI]
    ON [dbo].[BODE] ([TrangThai] ASC, [MAGV] ASC, [CAUHOI] ASC)
    INCLUDE ([MAMH], [TRINHDO], [DAP_AN]);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_BODE_TrangThai_MAMH_TRINHDO_CAUHOI'
      AND object_id = OBJECT_ID(N'dbo.BODE')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_BODE_TrangThai_MAMH_TRINHDO_CAUHOI]
    ON [dbo].[BODE] ([TrangThai] ASC, [MAMH] ASC, [TRINHDO] ASC, [CAUHOI] ASC)
    INCLUDE ([DAP_AN], [MAGV]);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_BODE_MAGV_CAUHOI'
      AND object_id = OBJECT_ID(N'dbo.BODE')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_BODE_MAGV_CAUHOI]
    ON [dbo].[BODE] ([MAGV] ASC, [CAUHOI] ASC)
    INCLUDE ([MAMH], [TRINHDO], [DAP_AN]);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_BODE_MAGV_MAMH_CAUHOI'
      AND object_id = OBJECT_ID(N'dbo.BODE')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_BODE_MAGV_MAMH_CAUHOI]
    ON [dbo].[BODE] ([MAGV] ASC, [MAMH] ASC, [CAUHOI] ASC)
    INCLUDE ([TRINHDO], [DAP_AN]);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_BODE_MAMH_TRINHDO_CAUHOI'
      AND object_id = OBJECT_ID(N'dbo.BODE')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_BODE_MAMH_TRINHDO_CAUHOI]
    ON [dbo].[BODE] ([MAMH] ASC, [TRINHDO] ASC, [CAUHOI] ASC)
    INCLUDE ([DAP_AN], [MAGV]);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_BODE_DuplicateCheck'
      AND object_id = OBJECT_ID(N'dbo.BODE')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_BODE_DuplicateCheck]
    ON [dbo].[BODE] ([TrangThai] ASC, [MAMH] ASC, [TRINHDO] ASC)
    INCLUDE ([CAUHOI], [NOIDUNG], [A], [B], [C], [D]);
END
GO

PRINT N'OK: Index BODE da san sang.';
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_CheckDuplicate
    @CauHoi  INT = NULL,
    @MaMH    NCHAR(5),
    @TrinhDo CHAR(1),
    @NoiDung NVARCHAR(200),
    @DapAnA  NVARCHAR(50) = NULL,
    @DapAnB  NVARCHAR(50) = NULL,
    @DapAnC  NVARCHAR(50) = NULL,
    @DapAnD  NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CleanNoiDung NVARCHAR(200) = LTRIM(RTRIM(ISNULL(@NoiDung, N'')));
    DECLARE @CleanA NVARCHAR(50) = LTRIM(RTRIM(ISNULL(@DapAnA, N'')));
    DECLARE @CleanB NVARCHAR(50) = LTRIM(RTRIM(ISNULL(@DapAnB, N'')));
    DECLARE @CleanC NVARCHAR(50) = LTRIM(RTRIM(ISNULL(@DapAnC, N'')));
    DECLARE @CleanD NVARCHAR(50) = LTRIM(RTRIM(ISNULL(@DapAnD, N'')));
    DECLARE @DuplicateLevel NVARCHAR(30) = N'None';
    DECLARE @DuplicateMessage NVARCHAR(255) = N'';

    IF EXISTS (
        SELECT 1
        FROM dbo.BODE
        WHERE TrangThai = 1
          AND MAMH = @MaMH
          AND TRINHDO = @TrinhDo
          AND LTRIM(RTRIM(NOIDUNG)) = @CleanNoiDung
          AND LTRIM(RTRIM(A)) = @CleanA
          AND LTRIM(RTRIM(B)) = @CleanB
          AND LTRIM(RTRIM(C)) = @CleanC
          AND LTRIM(RTRIM(D)) = @CleanD
          AND (@CauHoi IS NULL OR CAUHOI <> @CauHoi)
    )
    BEGIN
        SET @DuplicateLevel = N'Full';
        SET @DuplicateMessage = N'Cau hoi bi trung toan bo noi dung va 4 phuong an trong ngan hang de.';
    END
    ELSE IF EXISTS (
        SELECT 1
        FROM dbo.BODE
        WHERE TrangThai = 1
          AND MAMH = @MaMH
          AND TRINHDO = @TrinhDo
          AND LTRIM(RTRIM(NOIDUNG)) = @CleanNoiDung
          AND (@CauHoi IS NULL OR CAUHOI <> @CauHoi)
    )
    BEGIN
        SET @DuplicateLevel = N'Content';
        SET @DuplicateMessage = N'Noi dung cau hoi da ton tai trong ngan hang de cua mon va trinh do nay.';
    END

    SELECT
        @DuplicateLevel AS DuplicateLevel,
        @DuplicateMessage AS DuplicateMessage,
        CAST(CASE WHEN @DuplicateLevel = N'None' THEN 0 ELSE 1 END AS BIT) AS HasDuplicate;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_CheckDuplicate TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_BoDe_CheckDuplicate TO [Giangvien];
GO

PRINT N'OK: usp_BoDe_CheckDuplicate da duoc cap nhat.';
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

    DECLARE @Duplicate TABLE (
        DuplicateLevel NVARCHAR(30),
        DuplicateMessage NVARCHAR(255),
        HasDuplicate BIT
    );

    INSERT INTO @Duplicate
    EXEC dbo.usp_BoDe_CheckDuplicate
        @CauHoi = NULL,
        @MaMH = @MaMH,
        @TrinhDo = @TrinhDo,
        @NoiDung = @NoiDung,
        @DapAnA = @DapAnA,
        @DapAnB = @DapAnB,
        @DapAnC = @DapAnC,
        @DapAnD = @DapAnD;

    IF EXISTS (SELECT 1 FROM @Duplicate WHERE HasDuplicate = 1)
    BEGIN
        DECLARE @InsertDuplicateMessage NVARCHAR(255);
        SELECT @InsertDuplicateMessage = DuplicateMessage FROM @Duplicate;
        RAISERROR(@InsertDuplicateMessage, 16, 1);
        RETURN;
    END

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

    DECLARE @Duplicate TABLE (
        DuplicateLevel NVARCHAR(30),
        DuplicateMessage NVARCHAR(255),
        HasDuplicate BIT
    );

    INSERT INTO @Duplicate
    EXEC dbo.usp_BoDe_CheckDuplicate
        @CauHoi = @CauHoi,
        @MaMH = @MaMH,
        @TrinhDo = @TrinhDo,
        @NoiDung = @NoiDung,
        @DapAnA = @DapAnA,
        @DapAnB = @DapAnB,
        @DapAnC = @DapAnC,
        @DapAnD = @DapAnD;

    IF EXISTS (SELECT 1 FROM @Duplicate WHERE HasDuplicate = 1)
    BEGIN
        DECLARE @UpdateDuplicateMessage NVARCHAR(255);
        SELECT @UpdateDuplicateMessage = DuplicateMessage FROM @Duplicate;
        RAISERROR(@UpdateDuplicateMessage, 16, 1);
        RETURN;
    END

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
GO
GRANT EXECUTE ON dbo.usp_BoDe_Update TO [Giangvien];
GO

PRINT N'OK: usp_BoDe_Update đã được cập nhật.';
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Delete
    @CauHoi INT,
    @MaMH NCHAR(5),
    @MAGV NCHAR(8) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @HasReference BIT = 0;
    DECLARE @ReferenceCheckSql NVARCHAR(MAX) = N'';

    SELECT @ReferenceCheckSql = @ReferenceCheckSql
        + N'IF EXISTS (SELECT 1 FROM '
        + QUOTENAME(OBJECT_SCHEMA_NAME(fkc.parent_object_id)) + N'.' + QUOTENAME(OBJECT_NAME(fkc.parent_object_id))
        + N' WHERE ' + QUOTENAME(COL_NAME(fkc.parent_object_id, fkc.parent_column_id))
        + N' = @CauHoi) SET @HasReference = 1;'
    FROM sys.foreign_key_columns fkc
    WHERE fkc.referenced_object_id = OBJECT_ID(N'dbo.BODE')
      AND COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) = N'CAUHOI';

    IF @ReferenceCheckSql <> N''
    BEGIN
        EXEC sp_executesql
            @ReferenceCheckSql,
            N'@CauHoi INT, @HasReference BIT OUTPUT',
            @CauHoi = @CauHoi,
            @HasReference = @HasReference OUTPUT;
    END

    BEGIN TRANSACTION;

    IF @HasReference = 1
    BEGIN
        UPDATE dbo.BODE
        SET TrangThai = 0
        WHERE CAUHOI = @CauHoi
          AND MAMH = @MaMH
          AND TrangThai = 1
          AND (@MAGV IS NULL OR MAGV = @MAGV);
    END
    ELSE
    BEGIN
        DELETE FROM dbo.BODE
        WHERE CAUHOI = @CauHoi
          AND MAMH = @MaMH
          AND TrangThai = 1
          AND (@MAGV IS NULL OR MAGV = @MAGV);
    END

    COMMIT TRANSACTION;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Delete TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_BoDe_Delete TO [Giangvien];
GO

PRINT N'OK: usp_BoDe_Delete da duoc cap nhat.';
GO

CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Search
    @Keyword NVARCHAR(250) = NULL,
    @MAGV NCHAR(8) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SearchKeyword NVARCHAR(250) = NULLIF(LTRIM(RTRIM(@Keyword)), N'');

    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM dbo.BODE
    WHERE TrangThai = 1
      AND (@MAGV IS NULL OR MAGV = @MAGV)
      AND (
          @SearchKeyword IS NULL
          OR (LEN(@SearchKeyword) <= 5 AND MAMH = CONVERT(NCHAR(5), @SearchKeyword))
          OR (LEN(@SearchKeyword) <= 8 AND MAGV = CONVERT(NCHAR(8), @SearchKeyword))
          OR MAMH LIKE @SearchKeyword + N'%'
          OR NOIDUNG LIKE N'%' + @SearchKeyword + N'%'
      )
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
GO
GRANT EXECUTE ON dbo.usp_BoDe_GetActiveSubjectCodes TO [Giangvien];
GO

PRINT N'OK: usp_BoDe_GetActiveSubjectCodes da duoc cap nhat.';
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
GO
GRANT EXECUTE ON dbo.usp_BoDe_GetDanhSach TO [Giangvien];
GO

PRINT N'OK: Đã tạo usp_BoDe_GetDanhSach.';
GO

CREATE OR ALTER PROCEDURE dbo.usp_GetCauHoiByGiangVien
    @MAGV NCHAR(8) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    EXEC dbo.usp_BoDe_GetDanhSach @MAGV = @MAGV;
END
GO

GRANT EXECUTE ON dbo.usp_GetCauHoiByGiangVien TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_GetCauHoiByGiangVien TO [Giangvien];
GO

PRINT N'OK: Đã tạo usp_GetCauHoiByGiangVien compatibility wrapper.';
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

    IF EXISTS (
        SELECT 1
        FROM LOP
        WHERE TrangThai = 1
          AND (MALOP LIKE @KEYWORD + N'%'
               OR TENLOP LIKE @KEYWORD + N'%')
    )
    BEGIN
        SELECT MALOP, TENLOP
        FROM LOP
        WHERE TrangThai = 1
          AND (MALOP LIKE @KEYWORD + N'%'
               OR TENLOP LIKE @KEYWORD + N'%')
        ORDER BY MALOP
        OPTION (RECOMPILE);
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
GO
GRANT EXECUTE ON dbo.usp_Lop_Search TO [Giangvien];
GO

PRINT N'OK: Đã tạo usp_Lop_Search.';
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

    IF EXISTS (
        SELECT 1
        FROM SINHVIEN
        WHERE TrangThai = 1
          AND (MASV  LIKE @Keyword + N'%'
               OR MALOP LIKE @Keyword + N'%'
               OR HO    LIKE @Keyword + N'%'
               OR TEN   LIKE @Keyword + N'%')
    )
    BEGIN
        SELECT MASV, HO, TEN, NGAYSINH, DIACHI, MALOP, MATKHAU
        FROM SINHVIEN
        WHERE TrangThai = 1
          AND (MASV  LIKE @Keyword + N'%'
               OR MALOP LIKE @Keyword + N'%'
               OR HO    LIKE @Keyword + N'%'
               OR TEN   LIKE @Keyword + N'%')
        ORDER BY MASV
        OPTION (RECOMPILE);
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

PRINT N'OK: usp_SinhVien_Search đã được cập nhật.';
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
    JOIN      [dbo].[MONHOC]   mh ON b.MAMH = mh.MAMH
    LEFT JOIN [dbo].[GIAOVIEN] gv ON b.MAGV = gv.MAGV
    WHERE
        b.TrangThai = 1
        AND (b.MAGV = @MAGV OR @MAGV IS NULL)
        AND (b.MAMH = @MAMH OR @MAMH IS NULL)
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

CREATE OR ALTER PROCEDURE dbo.usp_MonHoc_Insert
    @MaMH NCHAR(5),
    @TenMH NVARCHAR(40)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM dbo.MONHOC WHERE MaMH = @MaMH)
    BEGIN
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

USE [THITRACNGHIEM]
GO

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

IF COL_LENGTH('dbo.GIAOVIEN', 'TrangThai') IS NULL
BEGIN
    ALTER TABLE dbo.GIAOVIEN
    ADD TrangThai BIT NOT NULL
        CONSTRAINT DF_GIAOVIEN_TrangThai DEFAULT (1);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_GIAOVIEN_TrangThai_HO_TEN'
      AND object_id = OBJECT_ID(N'dbo.GIAOVIEN')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_GIAOVIEN_TrangThai_HO_TEN]
    ON [dbo].[GIAOVIEN] ([TrangThai] ASC, [HO] ASC, [TEN] ASC, [MAGV] ASC)
    INCLUDE ([SODTLL], [DIACHI]);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_GIAOVIEN_DANGKY_MAGV'
      AND object_id = OBJECT_ID(N'dbo.GIAOVIEN_DANGKY')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_GIAOVIEN_DANGKY_MAGV]
    ON [dbo].[GIAOVIEN_DANGKY] ([MAGV] ASC)
    INCLUDE ([MAMH], [MALOP], [LAN]);
END
GO

PRINT N'OK: Index GiaoVien soft-delete da san sang.';
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiaoVien_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MAGV AS MaGV, HO AS Ho, TEN AS Ten, SODTLL AS SoDTLL, DIACHI AS DiaChi
    FROM dbo.vw_GiaoVien_DanhSach
    ORDER BY HO, TEN, MAGV;
END
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

    INSERT INTO dbo.GIAOVIEN (MAGV, HO, TEN, SODTLL, DIACHI)
    VALUES (@MaGV, @Ho, @Ten, @SoDTLL, @DiaChi);
END
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

CREATE OR ALTER PROCEDURE dbo.usp_GiaoVien_Delete
    @MaGV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.BODE WHERE MAGV = @MaGV)
       OR EXISTS (SELECT 1 FROM dbo.GIAOVIEN_DANGKY WHERE MAGV = @MaGV)
    BEGIN
        UPDATE dbo.GIAOVIEN
        SET TrangThai = 0
        WHERE MAGV = @MaGV;

        RETURN;
    END;

    DELETE FROM dbo.GIAOVIEN
    WHERE MAGV = @MaGV;
END
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
        FROM dbo.vw_GiaoVien_DanhSach
        ORDER BY HO, TEN, MAGV;

        RETURN;
    END;

    SELECT MAGV AS MaGV, HO AS Ho, TEN AS Ten, SODTLL AS SoDTLL, DIACHI AS DiaChi
    FROM dbo.vw_GiaoVien_DanhSach
    WHERE MAGV = CONVERT(NCHAR(8), @SearchKeyword)
       OR HO LIKE @SearchKeyword + N'%'
       OR TEN LIKE @SearchKeyword + N'%'
       OR SODTLL LIKE @SearchKeyword + N'%'
       OR DIACHI LIKE @SearchKeyword + N'%'
    ORDER BY HO, TEN, MAGV
    OPTION (RECOMPILE);
END
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

GRANT EXECUTE ON dbo.usp_GiaoVien_GetAll TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_GiaoVien_Insert TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_GiaoVien_Update TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_GiaoVien_Delete TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_GiaoVien_Search TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_GiaoVien_GetExistingIds TO [PGV];
GO
GRANT EXECUTE ON dbo.usp_GiaoVien_ExistsMaGV TO [PGV];
GO

PRINT N'OK: Da cap nhat SP va index GiaoVien.';
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

GRANT EXECUTE ON [dbo].[usp_SinhVien_GetAll] TO [PGV]
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

GRANT EXECUTE ON [dbo].[usp_SinhVien_GetByLop] TO [PGV]
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
        RAISERROR(N'Lop khong ton tai hoac da ngung su dung', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MaSV)
    BEGIN
        UPDATE SINHVIEN
        SET Ho = @Ho,
            Ten = @Ten,
            NgaySinh = @NgaySinh,
            DiaChi = @DiaChi,
            MaLop = @MaLop,
            MatKhau = @MatKhau,
            TrangThai = 1
        WHERE MASV = @MaSV
          AND TrangThai = 0;

        IF @@ROWCOUNT = 0
            RAISERROR(N'Ma sinh vien da ton tai', 16, 1);

        RETURN;
    END

    INSERT INTO SINHVIEN (MaSV, Ho, Ten, NgaySinh, DiaChi, MaLop, MatKhau, TrangThai)
    VALUES (@MaSV, @Ho, @Ten, @NgaySinh, @DiaChi, @MaLop, @MatKhau, 1);
END
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

CREATE OR ALTER PROCEDURE dbo.usp_Lop_Insert
    @MALOP NCHAR(8),
    @TENLOP NVARCHAR(40)
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

CREATE OR ALTER PROCEDURE dbo.usp_Lop_Delete
    @MALOP NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Khong tim thay lop dang hoat dong', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM SINHVIEN WHERE MALOP = @MALOP AND TrangThai = 1)
    BEGIN
        RAISERROR(N'Khong the xoa lop vi con sinh vien dang hoat dong', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM SINHVIEN WHERE MALOP = @MALOP)
       OR EXISTS (SELECT 1 FROM GIAOVIEN_DANGKY WHERE MALOP = @MALOP)
    BEGIN
        UPDATE LOP
        SET TrangThai = 0
        WHERE MALOP = @MALOP;
        RETURN;
    END

    DELETE FROM LOP
    WHERE MALOP = @MALOP;
END
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

CREATE OR ALTER PROCEDURE dbo.usp_SinhVien_GetExistingIds
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MASV
    FROM dbo.SINHVIEN
    WHERE TrangThai = 1;
END
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
              AND TrangThai = 1
        )
        THEN 1 ELSE 0
    END;
END
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
              AND TrangThai = 1
        )
        THEN 1 ELSE 0
    END;
END
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
              AND TrangThai = 1
        )
        THEN 1 ELSE 0
    END;
END
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
              AND TrangThai = 1
        )
        THEN 1 ELSE 0
    END;
END
GO

GRANT EXECUTE ON dbo.usp_SinhVien_GetExistingIds TO [PGV]
GO
GRANT EXECUTE ON dbo.usp_SinhVien_ExistsMaSV TO [PGV]
GO
GRANT EXECUTE ON dbo.usp_Lop_ExistsMaLop TO [PGV]
GO
GRANT EXECUTE ON dbo.usp_Lop_ExistsTenLop TO [PGV]
GO
GRANT EXECUTE ON dbo.usp_Lop_ExistsTenLopExcludingMaLop TO [PGV]
GO

GRANT EXECUTE ON [dbo].[usp_Lop_GetAll] TO [PGV]
GO
GRANT EXECUTE ON [dbo].[usp_Lop_Insert] TO [PGV]
GO
GRANT EXECUTE ON [dbo].[usp_Lop_Update] TO [PGV]
GO
GRANT EXECUTE ON [dbo].[usp_Lop_Delete] TO [PGV]
GO
GRANT EXECUTE ON [dbo].[usp_SinhVien_Insert] TO [PGV]
GO
GRANT EXECUTE ON [dbo].[usp_SinhVien_Update] TO [PGV]
GO
GRANT EXECUTE ON [dbo].[usp_SinhVien_Delete] TO [PGV]
GO
REVOKE EXECUTE ON [dbo].[usp_SinhVien_GetAll] FROM [Giangvien]
GO
REVOKE EXECUTE ON [dbo].[usp_SinhVien_GetByLop] FROM [Giangvien]
GO
REVOKE EXECUTE ON [dbo].[usp_SinhVien_Insert] FROM [Giangvien]
GO
REVOKE EXECUTE ON [dbo].[usp_SinhVien_Update] FROM [Giangvien]
GO
REVOKE EXECUTE ON [dbo].[usp_SinhVien_Delete] FROM [Giangvien]
GO

PRINT N'OK: Da tao toan bo SP CRUD (MonHoc, GiaoVien, SinhVien, BoDe, Lop).';
GO

GO

USE [THITRACNGHIEM]
GO

CREATE PROCEDURE [dbo].[SP_TAOTAIKHOAN]
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

PRINT N'OK: Da tao SP_TAOTAIKHOAN.';
GO

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
GO
GRANT EXECUTE ON dbo.usp_LayThongTinGiaoVienTheoMa TO [Giangvien];
GO

PRINT N'OK: Da tao usp_LayThongTinGiaoVienTheoMa.';
GO

GO

USE [THITRACNGHIEM]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

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
    WHERE TRINHDO = @TRINHDO
      AND MAMH = @MAMH
      AND TrangThai = 1;
    RETURN @SoCau;
END
GO

PRINT N'OK: Da tao udf_DemSoCauTrongBoDe.';
GO

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
GO
GRANT EXECUTE ON dbo.usp_LayDanhSachDeThi TO [PGV];
GO

PRINT N'OK: Da tao usp_LayDanhSachDeThi.';
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
GO
GRANT EXECUTE ON dbo.usp_LayDanhSachLop TO [Giangvien];
GO

PRINT N'OK: Da tao usp_LayDanhSachLop.';
GO

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
    WHERE TrangThai = 1
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

