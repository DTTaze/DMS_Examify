-- ============================================================
-- FILE: 003_AddMissingSPs.sql
-- MỤC ĐÍCH: Tạo các SP còn thiếu được gọi từ code C# nhưng chưa tồn tại trong DB
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. usp_GetCauHoiByGiangVien
--    LÝ DO: BoDeController.GetAllBoDe() gọi SP này nhưng chưa có trong Migrations.
--           Logic:
--             - Nếu @MAGV là MAGV của GiangVien (có trong bảng GIAOVIEN) → trả câu hỏi của mình
--             - Nếu @MAGV không thuộc GIAOVIEN (tức là PGV đang đăng nhập) → trả tất cả
--    TỐI ƯU: KHÔNG dùng LTRIM/RTRIM trên cột MAGV vì nchar(8) so sánh
--             tự xử lý trailing spaces → không cần RTRIM, và giữ được Index IX_BODE_MAGV.
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_GetCauHoiByGiangVien
    @MAGV NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @IsGV BIT = 0;

    -- Kiểm tra @MAGV có phải MAGV của giảng viên trong bảng GIAOVIEN không
    -- nchar comparison trong SQL Server tự xử lý trailing spaces
    -- 'TH123' = 'TH123   ' đều cho kết quả đúng → không cần RTRIM trên cột
    IF EXISTS (SELECT 1 FROM GIAOVIEN WHERE MAGV = @MAGV)
        SET @IsGV = 1;

    SELECT CAUHOI, MAMH, TRINHDO, NOIDUNG,
           A, B, C, D, DAP_AN, MAGV
    FROM BODE
    WHERE @IsGV = 0       -- PGV: xem tất cả
       OR MAGV = @MAGV    -- GV: chỉ xem câu của mình (IX_BODE_MAGV được sử dụng)
    ORDER BY CAUHOI;
END
GO

GRANT EXECUTE ON dbo.usp_GetCauHoiByGiangVien TO [PGV];
GRANT EXECUTE ON dbo.usp_GetCauHoiByGiangVien TO [Giangvien];
PRINT N'OK: Đã tạo usp_GetCauHoiByGiangVien.';
GO

-- ------------------------------------------------------------
-- 2. usp_BoDe_GetLatestCauHoi
--    LÝ DO: BoDeController.GetLatestCauHoi() gọi SP này nhưng chưa tồn tại.
--           SP trả về số CAUHOI lớn nhất hiện có, UI dùng để hiển thị
--           "Số thứ tự câu hỏi tiếp theo sẽ là X+1".
--           Dùng ISNULL để trả 0 khi bảng rỗng thay vì NULL.
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_BoDe_GetLatestCauHoi
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ISNULL(MAX(CAUHOI), 0) AS LatestCauHoi
    FROM BODE;
END
GO

GRANT EXECUTE ON dbo.usp_BoDe_GetLatestCauHoi TO [PGV];
GRANT EXECUTE ON dbo.usp_BoDe_GetLatestCauHoi TO [Giangvien];
PRINT N'OK: Đã tạo usp_BoDe_GetLatestCauHoi.';
GO

-- ------------------------------------------------------------
-- 3. usp_Lop_Search
--    LÝ DO: SinhVienController.SearchLop() gọi SP này nhưng chưa tồn tại.
--           Kết quả: Chức năng tìm kiếm lớp (trong trang 4.3) bị lỗi khi gọi.
--           Thêm OPTION (RECOMPILE) để tránh parameter sniffing
--           (plan cache cho NULL keyword áp dụng cho keyword thực).
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_Lop_Search
    @KEYWORD NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MALOP, TENLOP
    FROM LOP
    WHERE @KEYWORD IS NULL OR @KEYWORD = ''
       OR MALOP  LIKE '%' + @KEYWORD + '%'
       OR TENLOP LIKE '%' + @KEYWORD + '%'
    ORDER BY MALOP
    OPTION (RECOMPILE);
END
GO

GRANT EXECUTE ON dbo.usp_Lop_Search TO [PGV];
GRANT EXECUTE ON dbo.usp_Lop_Search TO [Giangvien];
PRINT N'OK: Đã tạo usp_Lop_Search.';
GO
