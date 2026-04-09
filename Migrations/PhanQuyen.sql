-- Chạy đoạn này để tạo 3 nhóm quyền
CREATE ROLE [PGV];
CREATE ROLE [Giangvien];
CREATE ROLE [Sinhvien];
GO

-- =======================================================
-- 1. PHÂN QUYỀN CHO NHÓM PGV
-- =======================================================
-- PGV được Thêm, Xóa, Sửa, Đọc trên tất cả các bảng
GRANT SELECT, INSERT, UPDATE, DELETE ON [Lop] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Monhoc] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Sinhvien] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Giaovien] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Giaovien_Dangky] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [BODE] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [BangDiem] TO [PGV];

-- Ghi chú: PGV không có chức năng thi sẽ được chặn ở tầng Ứng dụng (App UI)
-- Nếu muốn chặn cứng trực tiếp ở DB, có thể sử dụng lệnh DENY đối với INSERT/UPDATE trên bảng Bảng Điểm
-- DENY INSERT, UPDATE ON [BangDiem] TO [PGV];
GO

-- =======================================================
-- 2. PHÂN QUYỀN CHO NHÓM GIANGVIEN
-- =======================================================
-- Quyền thao tác (Thêm, Xóa, Sửa, Đọc) trên các bảng nghiệp vụ của GV
GRANT SELECT, INSERT, UPDATE, DELETE ON [BODE] TO [Giangvien];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Giaovien_Dangky] TO [Giangvien];

-- Chỉ được quyền Xem (Đọc) trên các bảng danh mục và kết quả
GRANT SELECT ON [Lop] TO [Giangvien];
GRANT SELECT ON [Monhoc] TO [Giangvien];
GRANT SELECT ON [Sinhvien] TO [Giangvien];
GRANT SELECT ON [Giaovien] TO [Giangvien];

-- Giáo viên xem lại bài thi của sinh viên, in bảng điểm môn học -> sử dụng SELECT
-- Giáo viên không được cấp quyền INSERT trên BangDiem -> nên thao tác thi thử (nếu có gọi xuống DB ghi điểm) tự động bị từ chối, do đó thi thử không ghi điểm.
GRANT SELECT ON [BangDiem] TO [Giangvien]; 
GO

-- =======================================================
-- 3. PHÂN QUYỀN CHO NHÓM SINHVIEN
-- =======================================================
-- Quyền xem (để lọc danh sách lúc đăng nhập, chọn môn thi, và lấy đề thi)
GRANT SELECT ON [Lop] TO [Sinhvien];
GRANT SELECT ON [Monhoc] TO [Sinhvien];
GRANT SELECT ON [Sinhvien] TO [Sinhvien];
GRANT SELECT ON [Giaovien_Dangky] TO [Sinhvien];
GRANT SELECT ON [BODE] TO [Sinhvien];

-- Sinh viên có quyền thi (ghi nhận điểm) và xem lại bài thi đã thi
GRANT INSERT, SELECT ON [BangDiem] TO [Sinhvien];

-- Cấm tuyệt đối (DENY) việc sửa/xóa trên tất cả các bảng
DENY UPDATE, DELETE ON [BODE] TO [Sinhvien];
DENY UPDATE, DELETE ON [BangDiem] TO [Sinhvien];
GO

-- =======================================================
-- 4. ROW LEVEL SECURITY (RLS) CHO BẢNG BỘ ĐỀ
-- =======================================================
-- Đảm bảo Giảng viên chỉ được quyền xem và cập nhật câu hỏi thi do TỰ MÌNH soạn
CREATE SCHEMA Security;
GO

CREATE FUNCTION Security.fn_rls_BODE(@MaGV AS varchar(50))
    RETURNS TABLE
WITH SCHEMABINDING
AS
    RETURN SELECT 1 AS fn_securitypredicate_result
    -- PGV và Sinh viên không bị giới hạn (SV cần lấy đề thi bất kỳ)
    WHERE IS_MEMBER('PGV') = 1 
       OR IS_MEMBER('Sinhvien') = 1
       OR USER_NAME() = 'dbo'
       -- Giảng viên chỉ được thao tác dòng có MaGV đúng bằng Login/User_Name của mình
       OR (IS_MEMBER('Giangvien') = 1 AND @MaGV = USER_NAME());
GO

CREATE SECURITY POLICY Security.BodeSecurityPolicy
    ADD FILTER PREDICATE Security.fn_rls_BODE(MaGV) ON dbo.BODE,
    ADD BLOCK PREDICATE Security.fn_rls_BODE(MaGV) ON dbo.BODE
    WITH (STATE = ON);
GO

-- =======================================================
-- 5. PHÂN QUYỀN THỰC THI THỦ TỤC (STORED PROCEDURES)
-- =======================================================
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [PGV];
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [Giangvien];
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [Sinhvien];
GO

-- Nhóm PGV được tạo tài khoản (cho PGV, Giangvien)
GRANT EXECUTE ON [dbo].[SP_TAOTAIKHOAN] TO [PGV];
GO

GRANT EXECUTE ON [dbo].[usp_GiangVien_Login] TO [PGV];
GO

GRANT EXECUTE ON [dbo].[usp_GiangVien_Login] TO [Giangvien];
GO

-- Đăng nhập Sinh viên (Nhóm Sinhvien tất cả dùng chung 1 tài khoản Server login nhưng xác thực Ứng dụng bằng MSSV)
GRANT EXECUTE ON [dbo].[usp_SinhVien_Login] TO [Sinhvien];
GO