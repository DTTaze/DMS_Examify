-- ============================================================
-- FILE: S-07_CreateLayThongTinGiaoVienTheoMa.sql
-- THU TU CHAY: S-07 / S-12  (sau S-01, Role PGV/Giangvien phai ton tai)
-- MUC DICH: Tao SP usp_LayThongTinGiaoVienTheoMa
--           Lay thong tin chi tiet cua 1 Giao vien theo MAGV
-- LY DO: Sau khi dang nhap, C# lay MAGV tu SP_LayThongTinTaiKhoan.
--        Tuy nhien SP do chi tra HoTen chung. GiaoVienController can
--        lay day du: MAGV, HO, TEN, SODTLL, DIACHI de hien thi
--        va cho phep chinh sua thong tin ca nhan (phan 4.2, 4.4).
-- PHAN DE TAI: 4.4 - Quan ly Giao vien (xem thong tin ca nhan)
-- BAI GIANG: SQL5 - Stored Procedure (SELECT theo khoa chinh)
-- ============================================================
USE [THITRACNGHIEM]
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
    FROM Giaovien
    WHERE MAGV = @MAGV;
END
GO

GRANT EXEC ON dbo.usp_LayThongTinGiaoVienTheoMa TO [PGV];
GO
GRANT EXEC ON dbo.usp_LayThongTinGiaoVienTheoMa TO [Giangvien];
GO

PRINT N'OK: Da tao usp_LayThongTinGiaoVienTheoMa.';
GO
