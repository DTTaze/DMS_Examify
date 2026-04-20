USE [THITRACNGHIEM]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[usp_LayThongTinGiaoVienTheoMa]
    @MAGV nchar(8)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MAGV,
        HO,
        TEN,
        SODTLL,
        DIACHI
    FROM 
        Giaovien
    WHERE 
        MAGV = @MAGV
END
GO

GRANT EXEC ON dbo.usp_LayThongTinGiaoVienTheoMa TO [PGV];