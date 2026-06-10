-- ============================================================
-- FILE: S-12_CreateLayDanhSachTrinhDo.sql
-- THU TU CHAY: S-12 / S-12  (chay cuoi, can bang BODE co du lieu)
-- MUC DICH: Tao SP usp_LayDanhSachTrinhDo
--           Lay danh sach cac Trinh do dang co trong Bo de
-- LY DO: Form Dang ky thi (4.6) can hien thi ComboBox Trinh do.
--        Thay vi hard-code ['A', 'B', 'C'], SP nay lay DISTINCT tu BODE
--        nen chi hien thi cac trinh do thuc su co cau hoi
--        (tranh GV dang ky trinh do chua co cau).
--        CASE WHEN cung cap TenTrinhDo day du de hien thi UI.
-- PHAN DE TAI: 4.5 - Nhap cau hoi, 4.6 - Dang ky thi
-- BAI GIANG: SQL5 - Stored Procedure (DISTINCT, CASE WHEN)
-- ============================================================
USE [THITRACNGHIEM]
GO

CREATE PROCEDURE usp_LayDanhSachTrinhDo
AS
BEGIN
    SET NOCOUNT ON;

    -- Lay DISTINCT Trinh do tu BODE (chi lay trinh do thuc su co cau hoi)
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
