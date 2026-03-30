using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class GiaoVienController : BaseController
    {
        private static List<GiaoVien> _danhSach = new()
        {
            new GiaoVien { MaGV = "GV001", Ho = "Trần Minh", Ten = "Tuấn", SoDTLL = "0901234567", DiaChi = "TP.HCM" },
            new GiaoVien { MaGV = "GV002", Ho = "Nguyễn Thị", Ten = "Hoa", SoDTLL = "0912345678", DiaChi = "Hà Nội" },
            new GiaoVien { MaGV = "GV003", Ho = "Lê Văn", Ten = "Sơn", SoDTLL = "0923456789", DiaChi = "Đà Nẵng" },
        };

        public IActionResult Index()
        {
            if (!CheckRole("PGV")) return Denied();
            ViewData["Title"] = "Quản lý Giáo viên";
            ViewData["Subtitle"] = "Thêm, sửa, xóa giáo viên";
            return View(_danhSach);
        }
    }
}
