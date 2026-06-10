-- ============================================================
-- FILE: S-09_CreateThucHienDangKyThi.sql
-- THU TU CHAY: S-09 / S-12  (sau S-02 CRUD, can bang BODE va GIAOVIEN_DANGKY)
-- MUC DICH: Tao 2 UDF va 1 SP phuc vu chuc nang Dang ky Thi (phan 4.6)
--   1. udf_DemSoCauTrongBoDe(@MAMH, @TRINHDO) -> INT
--      Dem so cau hoi hien co trong bo de theo mon va trinh do.
--   2. udf_KiemTraDieuKienDangKy(@MAMH, @TRINHDO, @SOCAUTHI) -> NVARCHAR(255)
--      Kiem tra co du cau hoi khong truoc khi cho phep dang ky thi.
--      Tra ve chuoi rong neu hop le, tra ve thong bao loi neu khong du.
--   3. usp_ThucHienDangKyThi(...) -> SP thuc hien them de thi
--      Goi udf_KiemTraDieuKienDangKy truoc, neu hop le thi INSERT.
-- LY DO: Truoc khi GV co the dang ky lich thi, he thong phai dam bao
--        bo de co du so luong cau hoi can thiet theo trinh do:
--        - Trinh do C: phai co du SOCAUTHI cau trinhdo C.
--        - Trinh do A/B: 70% cau trinh do chinh, 30% co the lay tu trinh do thap hon.
-- PHAN DE TAI: 4.6 - Dang ky thi (GV lap lich thi)
-- BAI GIANG: SQL4 - User-defined Function (Scalar Function)
--            SQL5 - Stored Procedure (goi UDF, xu ly loi)
--            SQL5 - Transaction (BEGIN TRY/CATCH, BEGIN TRAN/COMMIT/ROLLBACK)
-- ============================================================
USE [THITRACNGHIEM]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ------------------------------------------------------------
-- 1. udf_DemSoCauTrongBoDe
--    Dem so cau hoi trong bo de theo Mon hoc va Trinh do.
--    Duoc goi boi udf_KiemTraDieuKienDangKy (bên duoi).
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
--    Kiem tra co du cau hoi de dang ky thi khong.
--    Tra ve '' (chuoi rong) = hop le.
--    Tra ve thong bao loi = khong hop le.
--
--    Quy tac kiem tra:
--    - Trinh do C: so cau trinh do C >= SOCAUTHI
--    - Trinh do A/B: so cau trinh do chinh >= 70% SOCAUTHI (CEILING)
--                    phan con thieu lay tu trinh do thap hon (B->C, A->B)
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
    DECLARE @ThongBao       NVARCHAR(255) = ''; -- Mac dinh la chuoi rong (Khong co loi)
    DECLARE @TongSoCauTDC   INT;
    DECLARE @SoCauTrinhDoCao INT;

    -- Dem so cau co san o trinh do chon
    SELECT @TongSoCauTDC = dbo.udf_DemSoCauTrongBoDe(@MAMH, @TRINHDO);

    IF @TRINHDO = 'C'
    BEGIN
        IF @TongSoCauTDC < @SOCAUTHI
            SET @ThongBao = N'Loi: Mon nay chi co ' + CAST(@TongSoCauTDC AS NVARCHAR)
                          + N' cau trinh do C, khong du ' + CAST(@SOCAUTHI AS NVARCHAR) + N' cau!';
    END
    ELSE IF @TRINHDO IN ('A', 'B')
    BEGIN
        -- Tinh 70% so cau toi thieu can co
        SET @SoCauTrinhDoCao = CEILING(@SOCAUTHI * 0.7);

        IF @TongSoCauTDC < @SoCauTrinhDoCao
        BEGIN
            SET @ThongBao = N'Loi: Can toi thieu ' + CAST(@SoCauTrinhDoCao AS NVARCHAR)
                          + N' cau trinh do goc (hien chi co ' + CAST(@TongSoCauTDC AS NVARCHAR) + N').';
        END
        ELSE IF @TongSoCauTDC < @SOCAUTHI
        BEGIN
            -- Neu thieu cau so voi tong yeu cau, kiem tra cap thap hon
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
--    SP chinh: GV dang ky lich thi cho 1 lop, 1 mon, 1 lan thi.
--    Buoc 1: Goi udf_KiemTraDieuKienDangKy -> neu loi thi bao loi va dung.
--    Buoc 2: Kiem tra ban ghi trung lap (MALOP + MAMH + LAN).
--    Buoc 3: INSERT vao GIAOVIEN_DANGKY trong Transaction.
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

    -- Buoc 1: Kiem tra dieu kien so luong cau hoi
    SET @Message = dbo.udf_KiemTraDieuKienDangKy(@MAMH, @TRINHDO, @SOCAUTHI);

    IF @Message <> ''
    BEGIN
        SELECT CAST(0 AS BIT) AS IsSuccess, @Message AS ThongBao;
        RETURN;
    END
    ELSE
    BEGIN
        -- Buoc 2: Kiem tra trung lap (cung Lop, Mon, Lan thi)
        IF EXISTS (
            SELECT 1 FROM dbo.GIAOVIEN_DANGKY
            WHERE MALOP = @MALOP AND MAMH = @MAMH AND LAN = @LAN
        )
        BEGIN
            SET @Message = N'De thi da ton tai';
            SELECT CAST(0 AS BIT) AS IsSuccess, @Message AS ThongBao;
            RETURN;
        END

        -- Buoc 3: Them moi lich thi trong Transaction
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
