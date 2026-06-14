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
