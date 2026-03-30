using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class SinhVienController : BaseController
    {
        private static List<Lop> _danhSachLop = new()
        {
            new Lop
            {
                MaLop = "TH2024A", TenLop = "Tin học 2024 - A",
                DanhSachSV = new()
                {
                    new SinhVien { MaSV = "SV001", Ho = "Nguyễn Văn", Ten = "An", NgaySinh = new DateTime(2004, 3, 15), DiaChi = "TP.HCM", MaLop = "TH2024A", MatKhau = "123456" },
                    new SinhVien { MaSV = "SV002", Ho = "Trần Thị", Ten = "Bình", NgaySinh = new DateTime(2004, 7, 22), DiaChi = "Hà Nội", MaLop = "TH2024A", MatKhau = "123456" },
                    new SinhVien { MaSV = "SV003", Ho = "Lê Hoàng", Ten = "Cường", NgaySinh = new DateTime(2004, 1, 10), DiaChi = "Đà Nẵng", MaLop = "TH2024A", MatKhau = "123456" },
                }
            },
            new Lop
            {
                MaLop = "TH2024B", TenLop = "Tin học 2024 - B",
                DanhSachSV = new()
                {
                    new SinhVien { MaSV = "SV004", Ho = "Phạm Minh", Ten = "Đức", NgaySinh = new DateTime(2004, 5, 8), DiaChi = "TP.HCM", MaLop = "TH2024B", MatKhau = "123456" },
                    new SinhVien { MaSV = "SV005", Ho = "Hoàng Thị", Ten = "Em", NgaySinh = new DateTime(2004, 11, 30), DiaChi = "Cần Thơ", MaLop = "TH2024B", MatKhau = "123456" },
                }
            },
            new Lop
            {
                MaLop = "TH2024C", TenLop = "Tin học 2024 - C",
                DanhSachSV = new()
                {
                    new SinhVien { MaSV = "SV006", Ho = "Võ Thanh", Ten = "Phúc", NgaySinh = new DateTime(2004, 9, 18), DiaChi = "Huế", MaLop = "TH2024C", MatKhau = "123456" },
                }
            }
        };

        public IActionResult Index()
        {
            if (!CheckRole("PGV")) return Denied();
            ViewData["Title"] = "Quản lý Sinh viên";
            ViewData["Subtitle"] = "Nhập lớp và sinh viên";
            return View(_danhSachLop);
        }
    }
}
