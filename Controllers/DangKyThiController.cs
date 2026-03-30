using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class DangKyThiController : BaseController
    {
        private static List<GiaoVienDangKy> _danhSach = new()
        {
            new GiaoVienDangKy { MaGV = "GV001", MaMH = "MH001", MaLop = "TH2024A", TrinhDo = "B", NgayThi = new DateTime(2026, 4, 1), Lan = 1, SoCauThi = 20, ThoiGian = 45 },
            new GiaoVienDangKy { MaGV = "GV002", MaMH = "MH002", MaLop = "TH2024B", TrinhDo = "A", NgayThi = new DateTime(2026, 4, 3), Lan = 1, SoCauThi = 30, ThoiGian = 60 },
        };

        public IActionResult Index()
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            ViewData["Title"] = "Đăng ký thi";
            ViewData["Subtitle"] = "Lên lịch thi cho lớp";
            return View(_danhSach);
        }
    }
}
