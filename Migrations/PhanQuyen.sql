-- Chạy đoạn này để tạo 3 nhóm quyền
CREATE ROLE [PGV];
CREATE ROLE [Giangvien];
CREATE ROLE [Sinhvien];
GO

-- PGV được Thêm, Xóa, Sửa, Đọc trên tất cả các bảng
GRANT SELECT, INSERT, UPDATE, DELETE ON [Lop] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Monhoc] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Sinhvien] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Giaovien] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Giaovien_Dangky] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [BODE] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [BangDiem] TO [PGV];
GO

-- 1. Quyền thao tác (Thêm, Xóa, Sửa, Đọc) trên các bảng nghiệp vụ của GV
GRANT SELECT, INSERT, UPDATE, DELETE ON [BODE] TO [Giangvien];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Giaovien_Dangky] TO [Giangvien];

-- 2. Chỉ được quyền Xem (Đọc) trên các bảng danh mục và kết quả
GRANT SELECT ON [Lop] TO [Giangvien];
GRANT SELECT ON [Monhoc] TO [Giangvien];
GRANT SELECT ON [Sinhvien] TO [Giangvien];
GRANT SELECT ON [Giaovien] TO [Giangvien];
GRANT SELECT ON [BangDiem] TO [Giangvien]; 
GO

-- 1. Quyền xem (để lọc danh sách lúc đăng nhập, chọn môn thi, và lấy đề thi)
GRANT SELECT ON [Lop] TO [Sinhvien];
GRANT SELECT ON [Monhoc] TO [Sinhvien];
GRANT SELECT ON [Sinhvien] TO [Sinhvien];
GRANT SELECT ON [Giaovien_Dangky] TO [Sinhvien];
GRANT SELECT ON [BODE] TO [Sinhvien];

-- 2. Quyền ghi điểm khi thi xong và xem lại điểm
GRANT INSERT, SELECT ON [BangDiem] TO [Sinhvien];

-- 3. Cấm tuyệt đối (DENY) việc sửa/xóa trên tất cả các bảng
DENY UPDATE, DELETE ON [BODE] TO [Sinhvien];
DENY UPDATE, DELETE ON [BangDiem] TO [Sinhvien];
GO

-- Cấp quyền thực thi SP lấy thông tin tài khoản cho cả 3 nhóm quyền
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [PGV];
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [Giangvien];
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [Sinhvien];
GO

GRANT EXECUTE ON [dbo].[SP_TAOTAIKHOAN] TO [PGV];
GO

GRANT EXECUTE ON [dbo].[usp_GiangVien_Login] TO [PGV];
GO

GRANT EXECUTE ON [dbo].[usp_GiangVien_Login] TO [Giangvien];
GO

GRANT EXECUTE ON [dbo].[usp_SinhVien_Login] TO [Sinhvien];
GO