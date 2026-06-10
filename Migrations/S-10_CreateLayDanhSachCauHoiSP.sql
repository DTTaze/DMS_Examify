-- ============================================================
-- FILE: S-10_CreateLayDanhSachCauHoiSP.sql
-- THU TU CHAY: S-10 / S-12  (sau S-09, can bang GIAOVIEN_DANGKY ton tai)
-- MUC DICH: Tao SP usp_LayDanhSachDeThi
--           GV lay danh sach cac de thi (lich thi) da dang ky theo MAGV
-- LY DO: Phan 4.6 - GV can xem lai cac mon hoc da dang ky lich thi
--        de quan ly va kiem tra. SP nay lay tu bang GIAOVIEN_DANGKY
--        loc theo MAGV cua GV dang nhap.
-- PHAN DE TAI: 4.6 - Dang ky thi (GV xem lai lich da dang ky)
-- BAI GIANG: SQL5 - Stored Procedure (SELECT voi tham so loc)
-- ============================================================
USE [THITRACNGHIEM]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE usp_LayDanhSachDeThi
    @MaGV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    -- Lay danh sach lich thi cua GV: Mon hoc, Lop, Trinh do, Ngay thi, Lan, So cau, Thoi gian
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
