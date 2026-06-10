-- ============================================================
-- FILE: 011_AddTriggerBodeDeleteCheck.sql
-- MUC DICH: INSTEAD OF DELETE Trigger bao ve bang BODE
-- LY DO: Phan 4.5 - GV co quyen xoa cau hoi trong bo de.
--        Neu GV xoa cau hoi cua mot mon ma MON DO co lich thi
--        trong TUONG LAI -> so cau trong bo de giam xuat duoi
--        nguong toi thieu -> vi pham logic kiem tra cua udf_KiemTraDieuKienDangKy.
--        Trigger INSTEAD OF DELETE se chan viec xoa trong truong hop nay.
-- PHAN DE TAI: 4.5 - Nhap cau hoi thi
-- BAI GIANG: SQL8 - Trigger (INSTEAD OF DELETE)
-- ============================================================
USE [THITRACNGHIEM]
GO

CREATE OR ALTER TRIGGER [dbo].[trg_BODE_KiemTraTruocKhiXoa]
ON [dbo].[BODE]
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiem tra: cau hoi xoa co thuoc mon hoc dang co LICH THI TUONG LAI?
    -- Neu co -> tu choi xoa (vi xoa se lam giam so cau, co the vi pham
    -- dieu kien toi thieu khi GV da dang ky thi mon do roi)
    IF EXISTS (
        SELECT 1
        FROM deleted d
        JOIN [dbo].[GIAOVIEN_DANGKY] gdk
            ON RTRIM(d.MAMH) = RTRIM(gdk.MAMH)
        WHERE gdk.NGAYTHI >= GETDATE()
    )
    BEGIN
        RAISERROR(
            N'Khong the xoa! Cau hoi thuoc mon hoc dang co lich thi trong tuong lai. ' +
            N'Hay huy lich thi truoc hoac vo hieu hoa cau hoi thay vi xoa.',
            16, 1
        );
        RETURN; -- Khong thuc hien xoa, rollback tu dong
    END

    -- Neu khong vi pham -> cho phep xoa binh thuong
    DELETE FROM [dbo].[BODE]
    WHERE [CAUHOI] IN (SELECT [CAUHOI] FROM deleted);

    DECLARE @SoXoa INT = @@ROWCOUNT;
    PRINT N'OK: Da xoa ' + CAST(@SoXoa AS NVARCHAR) + N' cau hoi.';
END
GO

PRINT N'OK: Da tao Trigger trg_BODE_KiemTraTruocKhiXoa.';
GO
