USE [THITRACNGHIEM]
GO
/****** Object:  UserDefinedFunction [dbo].[udf_KiemTraDieuKienDangKy]    Script Date: 06/05/2026 10:47:13 SA ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[udf_DemSoCauTrongBoDe] (@MAMH NChar(8), @TRINHDO Char(1)) 
RETURNS INT
AS
BEGIN
	DECLARE @SoCau INT = 0;
	SELECT @SoCau = COUNT(CAUHOI) FROM dbo.BODE WHERE TRINHDO = @TRINHDO AND MAMH = @MAMH;
	RETURN @SoCau;
END
GO

CREATE FUNCTION [dbo].[udf_KiemTraDieuKienDangKy]
(
    @MAMH Char(5),
    @TRINHDO Char(1),
    @SOCAUTHI Int
)
RETURNS NVARCHAR(255)
AS
BEGIN
    DECLARE @ThongBao NVARCHAR(255) = ''; -- Mặc định là chuỗi rỗng (Không có lỗi)
    DECLARE @TongSoCauTDC Int;
    DECLARE @SoCauTrinhDoCao Int;

    -- Đếm số câu có sẵn ở trình độ chọn
    SELECT @TongSoCauTDC = dbo.udf_DemSoCauTrongBoDe(@MAMH, @TRINHDO);

    IF @TRINHDO = 'C'
    BEGIN
        IF @TongSoCauTDC < @SOCAUTHI
            SET @ThongBao = N'Lỗi: Môn này chỉ có ' + CAST(@TongSoCauTDC AS NVARCHAR) + N' câu trình độ C, không đủ ' + CAST(@SOCAUTHI AS NVARCHAR) + N' câu!';
    END
    ELSE IF @TRINHDO IN ('A', 'B')
    BEGIN
        -- Tính 70% số câu tối thiểu cần có
        SET @SoCauTrinhDoCao = CEILING(@SOCAUTHI * 0.7);
        
        IF @TongSoCauTDC < @SoCauTrinhDoCao
        BEGIN
            SET @ThongBao = N'Lỗi: Cần tối thiểu ' + CAST(@SoCauTrinhDoCao AS NVARCHAR) + N' câu trình độ gốc (hiện chỉ có ' + CAST(@TongSoCauTDC AS NVARCHAR) + N').';
        END
        ELSE IF @TongSoCauTDC < @SOCAUTHI
        BEGIN
            -- Nếu thiếu câu so với tổng yêu cầu, kiểm tra cấp thấp hơn
            DECLARE @SoCauTrinhDoThap Int = @SOCAUTHI - @TongSoCauTDC;
            DECLARE @TrinhDoThap Char(1) = CASE WHEN @TRINHDO = 'A' THEN 'B' ELSE 'C' END;
            DECLARE @TongSoCauTDT Int;

            SELECT @TongSoCauTDT = dbo.udf_DemSoCauTrongBoDe(@MAMH, @TrinhDoThap);

            IF @TongSoCauTDT < @SoCauTrinhDoThap 
            BEGIN
                SET @ThongBao = N'Lỗi: Không đủ câu hỏi trình độ ' + @TrinhDoThap + N' để bù (Cần thêm ' + CAST(@SoCauTrinhDoThap AS NVARCHAR) + N', hiện có ' + CAST(@TongSoCauTDT AS NVARCHAR) + N').';
            END
        END
    END

    RETURN @ThongBao;
END
GO

CREATE PROCEDURE usp_ThucHienDangKyThi 
    @MAGV nChar(8),
    @MALOP nChar(8),
    @MAMH Char(5),
    @TRINHDO Char(1),
    @LAN SmallInt,
    @SOCAUTHI SmallInt,
    @THOIGIAN SmallInt,
    @NGAYTHI datetime
AS
BEGIN
    Declare @Message NVarChar(255)

    set @Message = dbo.udf_KiemTraDieuKienDangKy(@MAMH, @TRINHDO, @SOCAUTHI)

    if @Message <> '' 
    begin
        Select cast(0 as bit) as IsSuccess, @Message as ThongBao;
        return;
    end
    else 
    Begin
        if exists(select 1 from dbo.GIAOVIEN_DANGKY where MALOP = @MALOP and MAMH = @MAMH and LAN = @LAN)
            begin
                set @Message = N'Đề thi đã tồn tại'
                Select cast(0 as bit) as IsSuccess, @Message as ThongBao;
                return;
            end
        else
        begin try
            begin tran
                INSERT INTO GiaoVien_DangKy (MAGV, MALOP, MAMH, TRINHDO, NGAYTHI, LAN, SOCAUTHI, THOIGIAN)
                VALUES (@MAGV, @MALOP, @MAMH, @TRINHDO, ISNULL(@NGAYTHI, GETDATE()), @LAN, @SOCAUTHI, @THOIGIAN);

            commit tran;

            set @Message = N'Thêm đề thi thành công';
            Select cast(1 as bit) as IsSuccess, @Message as ThongBao;
            return;
        end try
        begin catch
            rollback tran;

            set @Message = N'Thêm đề thi thất bại: ' + ERROR_MESSAGE();

            Select cast(0 as bit) as IsSuccess, @Message as ThongBao;
            return;
        end catch
    End
END