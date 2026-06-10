-- ============================================================
-- FILE: 012_AddSP_BoDe_TimKiemNangCao.sql
-- THU TU CHAY: 13 / 13  (chay cuoi cung, can udf_LayHoTen (005) da ton tai)
-- MUC DICH: Stored Procedure tim kiem cau hoi nang cao
--           voi cac tham so tuy chon (Optional Parameters)
-- LY DO: SP hien tai (usp_BoDe_Search) chi co 1 tham so @Keyword
--        tim tren tat ca cac cot. Phan 4.5 can tim kiem co dinh
--        huong hon: GV muon loc cau hoi theo Mon hoc, Trinh do,
--        hoac tim theo tu khoa trong Noi dung.
--        SP nay dung ky thuat "NULL = khong loc" (Optional Filter)
--        de linh hoat hon, la mot ky thuat nang cao trong SQL5.
-- PHAN DE TAI: 4.5 - Nhap cau hoi thi (GV xem va tim cau hoi)
-- BAI GIANG: SQL5 - Stored Procedure voi Optional Parameters
--            Phoi hop voi SQL8 UDF (udf_LayHoTen)
--            va SQL3 View (co the dung vw_BoDeCuaGiaoVien)
-- ============================================================
USE [THITRACNGHIEM]
GO

CREATE OR ALTER PROCEDURE [dbo].[usp_BoDe_TimKiemNangCao]
    @MAGV    NCHAR(8)      = NULL,  -- NULL = tat ca giao vien
    @MAMH    NCHAR(5)      = NULL,  -- NULL = tat ca mon hoc
    @TRINHDO CHAR(1)       = NULL,  -- NULL = tat ca trinh do (A/B/C)
    @Keyword NVARCHAR(200) = NULL   -- NULL = khong loc theo noi dung
AS
BEGIN
    SET NOCOUNT ON;

    -- Ky thuat: (RTRIM(cot) = RTRIM(@tham_so) OR @tham_so IS NULL)
    -- -> neu tham so la NULL thi dieu kien luon TRUE (bo qua dieu kien loc do)
    -- -> neu tham so co gia tri thi loc chinh xac theo gia tri do
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
    JOIN      [dbo].[MONHOC]   mh ON RTRIM(b.MAMH) = RTRIM(mh.MAMH)
    LEFT JOIN [dbo].[GIAOVIEN] gv ON RTRIM(b.MAGV) = RTRIM(gv.MAGV)
    WHERE
        -- Loc theo Giao vien (neu co truyen @MAGV)
        (RTRIM(b.MAGV) = RTRIM(@MAGV) OR @MAGV IS NULL)
        -- Loc theo Mon hoc (neu co truyen @MAMH)
        AND (RTRIM(b.MAMH) = RTRIM(@MAMH) OR @MAMH IS NULL)
        -- Loc theo Trinh do (neu co truyen @TRINHDO)
        AND (b.TRINHDO = @TRINHDO OR @TRINHDO IS NULL)
        -- Loc theo tu khoa trong Noi dung (neu co truyen @Keyword)
        AND (
            @Keyword IS NULL
            OR @Keyword = N''
            OR b.NOIDUNG LIKE N'%' + @Keyword + N'%'
        )
    ORDER BY b.MAMH ASC, b.TRINHDO ASC, b.CAUHOI ASC;
END
GO

PRINT N'OK: Da tao SP usp_BoDe_TimKiemNangCao.';
GO

-- ============================================================
-- VI DU SU DUNG:
-- ============================================================
-- 1. Lay tat ca cau hoi cua GV TH123, mon CSDL:
--    EXEC usp_BoDe_TimKiemNangCao @MAGV = N'TH123   ', @MAMH = N'CSDL '
--
-- 2. Lay tat ca cau hoi trinh do A cua mon AVCB:
--    EXEC usp_BoDe_TimKiemNangCao @MAMH = N'AVCB ', @TRINHDO = 'A'
--
-- 3. Tim cau hoi co tu "mang" trong noi dung, mon MMTCB:
--    EXEC usp_BoDe_TimKiemNangCao @MAMH = N'MMTCB', @Keyword = N'mang'
--
-- 4. Lay tat ca cau hoi cua GV TH123 (khong loc mon, trinh do):
--    EXEC usp_BoDe_TimKiemNangCao @MAGV = N'TH123   '
--
-- 5. Lay toan bo bo de (khong loc gi):
--    EXEC usp_BoDe_TimKiemNangCao
-- ============================================================
