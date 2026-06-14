-- ============================================================
-- FILE: S01_PhanQuyen.sql
-- THU TU CHAY: S01 (chay DAU TIEN, truoc moi SP va Migration khac)
-- MUC DICH: Tao 3 Role va phan quyen tren tung bang + SP cho tung nhom
-- ============================================================
USE [THITRACNGHIEM]
GO

-- Chay doan nay de tao 3 nhom quyen
CREATE ROLE [PGV];
CREATE ROLE [Giangvien];
CREATE ROLE [Sinhvien];
GO

-- PGV duoc Them, Xoa, Sua, Doc tren tat ca cac bang
GRANT SELECT, INSERT, UPDATE, DELETE ON [Lop] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Monhoc] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Sinhvien] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Giaovien] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Giaovien_Dangky] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [BODE] TO [PGV];
GRANT SELECT, INSERT, UPDATE, DELETE ON [BangDiem] TO [PGV];
GO

-- 1. Quyen thao tac (Them, Xoa, Sua, Doc) tren cac bang nghiep vu cua GV
GRANT SELECT, INSERT, UPDATE, DELETE ON [BODE] TO [Giangvien];
GRANT SELECT, INSERT, UPDATE, DELETE ON [Giaovien_Dangky] TO [Giangvien];

-- 2. Chi duoc quyen Xem (Doc) tren cac bang danh muc va ket qua
GRANT SELECT ON [Lop] TO [Giangvien];
GRANT SELECT ON [Monhoc] TO [Giangvien];
GRANT SELECT ON [Sinhvien] TO [Giangvien];
GRANT SELECT ON [Giaovien] TO [Giangvien];
GRANT SELECT ON [BangDiem] TO [Giangvien];
GO

-- 1. Quyen xem (de loc danh sach luc dang nhap, chon mon thi, va lay de thi)
GRANT SELECT ON [Lop] TO [Sinhvien];
GRANT SELECT ON [Monhoc] TO [Sinhvien];
GRANT SELECT ON [Sinhvien] TO [Sinhvien];
GRANT SELECT ON [Giaovien_Dangky] TO [Sinhvien];
GRANT SELECT ON [BODE] TO [Sinhvien];

-- 2. Quyen ghi diem khi thi xong va xem lai diem
GRANT INSERT, SELECT ON [BangDiem] TO [Sinhvien];

-- 3. Cam tuyet doi (DENY) viec sua/xoa tren tat ca cac bang
DENY UPDATE, DELETE ON [BODE] TO [Sinhvien];
DENY UPDATE, DELETE ON [BangDiem] TO [Sinhvien];
GO

-- Cap quyen thuc thi SP lay thong tin tai khoan cho ca 3 nhom quyen
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [PGV];
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [Giangvien];
GRANT EXECUTE ON [dbo].[SP_LayThongTinTaiKhoan] TO [Sinhvien];
GO

GRANT EXECUTE ON [dbo].[SP_TAOTAIKHOAN] TO [PGV];
GO

GRANT EXECUTE ON [dbo].[usp_SinhVien_Login] TO [Sinhvien];
GO
