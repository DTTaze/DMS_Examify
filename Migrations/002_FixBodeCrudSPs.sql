-- ============================================================
-- FILE: 002_FixBodeCrudSPs.sql
-- THU TU CHAY: 3 / 13  (sau 001, can chay truoc 003 vi 003 phu thuoc vao SP nay)
-- MUC DICH: Sua toan bo SP CRUD cua bang BODE
-- LY DO: Tat ca SP trong CreateCrudStoredProcedures.sql dung ten cot sai:
--        DapAnA, DapAnB, DapAnC, DapAnD, DapAn
--        -> Ten thuc te trong DB (tu THITRACNGHIEM.sql): A, B, C, D, DAP_AN
--        -> Ket qua: SP goi se bao loi "Invalid column name 'DapAnA'"
--          va toan bo tinh nang 4.5 khong hoat dong.
--
--        Dung CREATE OR ALTER de an toan: SP da ton tai se duoc cap nhat,
--        SP chua ton tai se duoc tao moi.
-- PHAN DE TAI: 4.5 - Nhap cau hoi thi
-- BAI GIANG: SQL5 - Stored Procedure (CRUD)
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. usp_BoDe_GetAll — Sửa tên cột (DapAnA→A, DapAnB→B, ...)
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_BoDe_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM BODE
    ORDER BY CAUHOI;
END
GO

PRINT N'OK: usp_BoDe_GetAll đã được cập nhật (sửa tên cột).';
GO

-- ------------------------------------------------------------
-- 2. usp_BoDe_Insert — Sửa tên cột + bỏ @CauHoi + thêm SCOPE_IDENTITY
--    LÝ DO THÊM: CAUHOI là IDENTITY(1,1) sau khi chạy MigrateBODEAddIdentityCAUHOI.sql.
--               SP cũ vẫn có @CauHoi INT và cố INSERT vào cột IDENTITY → lỗi.
--               BoDeController.Insert() gọi ExecuteScalar() mong nhận CAUHOI mới
--               → SP phải trả về SCOPE_IDENTITY().
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Insert
    @MaMH    NVARCHAR(50),
    @TrinhDo NVARCHAR(10),
    @NoiDung NVARCHAR(MAX),
    @DapAnA  NVARCHAR(MAX),   -- Tham số vẫn giữ tên dễ đọc, INSERT vào cột A
    @DapAnB  NVARCHAR(MAX),   -- INSERT vào cột B
    @DapAnC  NVARCHAR(MAX),   -- INSERT vào cột C
    @DapAnD  NVARCHAR(MAX),   -- INSERT vào cột D
    @DapAn   NVARCHAR(10),    -- INSERT vào cột DAP_AN
    @MaGV    NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO BODE (MAMH, TRINHDO, NOIDUNG, A, B, C, D, DAP_AN, MAGV)
    VALUES (@MaMH, @TrinhDo, @NoiDung, @DapAnA, @DapAnB, @DapAnC, @DapAnD, @DapAn, @MaGV);

    -- Trả về CAUHOI vừa được sinh bởi IDENTITY
    -- BoDeController.Insert() gọi ExecuteScalar() để nhận giá trị này
    SELECT SCOPE_IDENTITY() AS CauHoi;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Insert TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_Insert TO [Giangvien];
PRINT N'OK: usp_BoDe_Insert đã được cập nhật (sửa tên cột, bỏ @CauHoi, thêm SCOPE_IDENTITY).';
GO

-- ------------------------------------------------------------
-- 3. usp_BoDe_Update — Sửa tên cột (DapAnA→A, DapAnB→B, ...)
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Update
    @CauHoi  INT,
    @MaMH    NVARCHAR(50),
    @TrinhDo NVARCHAR(10),
    @NoiDung NVARCHAR(MAX),
    @DapAnA  NVARCHAR(MAX),
    @DapAnB  NVARCHAR(MAX),
    @DapAnC  NVARCHAR(MAX),
    @DapAnD  NVARCHAR(MAX),
    @DapAn   NVARCHAR(10),
    @MaGV    NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE BODE
    SET TRINHDO = @TrinhDo,
        NOIDUNG = @NoiDung,
        A       = @DapAnA,    -- Tên cột thực tế: A
        B       = @DapAnB,    -- Tên cột thực tế: B
        C       = @DapAnC,    -- Tên cột thực tế: C
        D       = @DapAnD,    -- Tên cột thực tế: D
        DAP_AN  = @DapAn,     -- Tên cột thực tế: DAP_AN
        MAGV    = @MaGV
    WHERE CAUHOI = @CauHoi AND MAMH = @MaMH;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Update TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_Update TO [Giangvien];
PRINT N'OK: usp_BoDe_Update đã được cập nhật (sửa tên cột).';
GO

-- ------------------------------------------------------------
-- 4. usp_BoDe_Search — Sửa tên cột + thêm OPTION (RECOMPILE)
--    LÝ DO RECOMPILE: SP dùng pattern @Keyword IS NULL OR @Keyword = '' OR col LIKE ...
--                     Nếu plan được cache cho @Keyword=NULL (không filter → Full Scan plan),
--                     khi gọi với keyword thực sẽ dùng plan sai → hiệu năng tệ.
--                     OPTION (RECOMPILE) buộc tạo plan mới mỗi lần gọi.
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_BoDe_Search
    @Keyword NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM BODE
    WHERE @Keyword IS NULL OR @Keyword = ''
       OR MAMH    LIKE '%' + @Keyword + '%'
       OR NOIDUNG LIKE '%' + @Keyword + '%'
       OR MAGV    LIKE '%' + @Keyword + '%'
    ORDER BY CAUHOI
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_Search TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_Search TO [Giangvien];
PRINT N'OK: usp_BoDe_Search đã được cập nhật (sửa tên cột, thêm OPTION RECOMPILE).';
GO
