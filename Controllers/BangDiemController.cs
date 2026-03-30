using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class BangDiemController : BaseController
    {
        public IActionResult Index()
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            ViewData["Title"] = "Bảng điểm môn học";
            ViewData["Subtitle"] = "In bảng điểm thi hết môn";

            var model = new BangDiemViewModel
            {
                MaLop = "TH2024A",
                TenLop = "Tin học 2024 - A",
                TenMH = "Cơ sở dữ liệu",
                Lan = 1,
                DanhSach = new()
                {
                    new BangDiemSinhVien { STT = 1, MaSV = "SV001", Ho = "Nguyễn Văn", Ten = "An", Diem = 8.0, DiemChu = "B+" },
                    new BangDiemSinhVien { STT = 2, MaSV = "SV002", Ho = "Trần Thị", Ten = "Bình", Diem = 9.5, DiemChu = "A" },
                    new BangDiemSinhVien { STT = 3, MaSV = "SV003", Ho = "Lê Hoàng", Ten = "Cường", Diem = 6.0, DiemChu = "C+" },
                }
            };

            return View(model);
        }
    }
}
