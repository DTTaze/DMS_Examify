-- ============================================================
-- FILE: 001_AddConstraintsAndIndexes.sql
-- THU TU CHAY: 2 / 13  (sau 000, truoc khi chay cac SP CRUD)
-- MUC DICH: Bo sung cac constraint va index con thieu theo de tai
-- LY DO: Schema goc thieu rang buoc toan ven du lieu va index toi uu.
--        Khong co cac rang buoc nay -> co the INSERT du lieu sai,
--        khong co index -> SP chay cham do phai Full Scan.
-- PHAN DE TAI: 4.3 - Nhap sinh vien, 4.5 - Nhap cau hoi thi,
--              4.6 - Dang ky thi
-- BAI GIANG: SQL2 - Constraint (UNIQUE, NOT NULL)
--            SQL6 - Index
-- ============================================================
USE [THITRACNGHIEM]
GO

-- ------------------------------------------------------------
-- 1. MONHOC.TENMH → NOT NULL
--    LÝ DO: Đề tài quy định TENMH là "Unique Key, not NULL".
--           Schema gốc có TENMH là nvarchar(50) NULL → vi phạm đề tài.
--           Nếu không có NOT NULL, có thể INSERT môn học không có tên.
-- ------------------------------------------------------------
-- Kiểm tra xem đã là NOT NULL chưa
IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME  = 'MONHOC'
      AND COLUMN_NAME = 'TENMH'
      AND IS_NULLABLE = 'YES'
)
BEGIN
    -- Đảm bảo không có dữ liệu NULL trước khi đặt NOT NULL
    IF EXISTS (SELECT 1 FROM [dbo].[MONHOC] WHERE TENMH IS NULL)
    BEGIN
        RAISERROR(N'MONHOC.TENMH có dữ liệu NULL. Hãy cập nhật dữ liệu trước khi chạy lệnh này.', 16, 1);
        RETURN;
    END

    ALTER TABLE [dbo].[MONHOC]
    ALTER COLUMN [TENMH] NVARCHAR(50) NOT NULL;

    PRINT N'OK: MONHOC.TENMH đã được đặt thành NOT NULL.';
END
ELSE
BEGIN
    PRINT N'SKIP: MONHOC.TENMH đã là NOT NULL.';
END
GO

-- ------------------------------------------------------------
-- 2. MONHOC.TENMH → UNIQUE
--    LÝ DO: Đề tài quy định "Unique Key". Không có UNIQUE,
--           hai môn học có thể trùng tên gây nhầm lẫn khi GV chọn môn soạn đề (4.5).
-- ------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_NAME       = 'MONHOC'
      AND CONSTRAINT_NAME  = 'UQ_MONHOC_TENMH'
      AND CONSTRAINT_TYPE  = 'UNIQUE'
)
BEGIN
    -- Kiểm tra dữ liệu trùng trước khi tạo UNIQUE
    IF EXISTS (
        SELECT TENMH FROM [dbo].[MONHOC]
        GROUP BY TENMH
        HAVING COUNT(*) > 1
    )
    BEGIN
        RAISERROR(N'MONHOC.TENMH có dữ liệu trùng. Hãy xử lý trước khi thêm UNIQUE constraint.', 16, 1);
        RETURN;
    END

    ALTER TABLE [dbo].[MONHOC]
    ADD CONSTRAINT [UQ_MONHOC_TENMH] UNIQUE ([TENMH]);

    PRINT N'OK: Đã thêm UNIQUE constraint UQ_MONHOC_TENMH.';
END
ELSE
BEGIN
    PRINT N'SKIP: UQ_MONHOC_TENMH đã tồn tại.';
END
GO

-- ------------------------------------------------------------
-- 3. LOP.TENLOP → UNIQUE
--    LÝ DO: Đề tài quy định TENLOP là "Unique". Cột đã NOT NULL nhưng thiếu UNIQUE.
--           Không có UNIQUE, hai lớp có thể trùng tên,
--           gây nhầm lẫn khi PGV quản lý lớp (4.3).
-- ------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_NAME       = 'LOP'
      AND CONSTRAINT_NAME  = 'UQ_LOP_TENLOP'
      AND CONSTRAINT_TYPE  = 'UNIQUE'
)
BEGIN
    -- Kiểm tra dữ liệu trùng trước khi tạo UNIQUE
    IF EXISTS (
        SELECT TENLOP FROM [dbo].[LOP]
        GROUP BY TENLOP
        HAVING COUNT(*) > 1
    )
    BEGIN
        RAISERROR(N'LOP.TENLOP có dữ liệu trùng. Hãy xử lý trước khi thêm UNIQUE constraint.', 16, 1);
        RETURN;
    END

    ALTER TABLE [dbo].[LOP]
    ADD CONSTRAINT [UQ_LOP_TENLOP] UNIQUE ([TENLOP]);

    PRINT N'OK: Đã thêm UNIQUE constraint UQ_LOP_TENLOP.';
END
ELSE
BEGIN
    PRINT N'SKIP: UQ_LOP_TENLOP đã tồn tại.';
END
GO

-- ------------------------------------------------------------
-- 4. INDEX: IX_BODE_MAGV
--    LÝ DO: SP usp_GetCauHoiByGiangVien lọc theo WHERE MAGV = @MAGV.
--           Không có index → SQL Server full scan toàn bảng BODE
--           mỗi lần GV mở trang Nhập câu hỏi (4.5).
-- ------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_BODE_MAGV'
      AND object_id = OBJECT_ID('BODE')
)
BEGIN
    CREATE INDEX [IX_BODE_MAGV]
    ON [dbo].[BODE] ([MAGV]);

    PRINT N'OK: Đã tạo index IX_BODE_MAGV.';
END
ELSE
BEGIN
    PRINT N'SKIP: Index IX_BODE_MAGV đã tồn tại.';
END
GO

-- ------------------------------------------------------------
-- 5. INDEX: IX_BODE_MAMH_TRINHDO
--    LÝ DO: Function udf_DemSoCauTrongBoDe lọc theo
--           WHERE TRINHDO = @TRINHDO AND MAMH = @MAMH.
--           Composite index (MAMH, TRINHDO) bao phủ chính xác điều kiện này.
--           Được gọi trong usp_ThucHienDangKyThi khi đăng ký thi (4.6).
-- ------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_BODE_MAMH_TRINHDO'
      AND object_id = OBJECT_ID('BODE')
)
BEGIN
    CREATE INDEX [IX_BODE_MAMH_TRINHDO]
    ON [dbo].[BODE] ([MAMH], [TRINHDO]);

    PRINT N'OK: Đã tạo index IX_BODE_MAMH_TRINHDO.';
END
ELSE
BEGIN
    PRINT N'SKIP: Index IX_BODE_MAMH_TRINHDO đã tồn tại.';
END
GO

-- ------------------------------------------------------------
-- 6. INDEX: IX_SINHVIEN_MALOP
--    LÝ DO: SP usp_SinhVien_GetByLop lọc theo WHERE MALOP = @MALOP.
--           Đây là thao tác rất thường xuyên: PGV click vào lớp để xem danh sách SV (4.3).
--           Không có index → full scan toàn bảng SINHVIEN.
-- ------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_SINHVIEN_MALOP'
      AND object_id = OBJECT_ID('SINHVIEN')
)
BEGIN
    CREATE INDEX [IX_SINHVIEN_MALOP]
    ON [dbo].[SINHVIEN] ([MALOP]);

    PRINT N'OK: Đã tạo index IX_SINHVIEN_MALOP.';
END
ELSE
BEGIN
    PRINT N'SKIP: Index IX_SINHVIEN_MALOP đã tồn tại.';
END
GO
