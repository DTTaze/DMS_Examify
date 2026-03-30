using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class MonHocController : BaseController
    {
        private static List<MonHoc> _danhSach = new()
        {
            new MonHoc { MaMH = "MH001", TenMH = "Cơ sở dữ liệu" },
            new MonHoc { MaMH = "MH002", TenMH = "Lập trình C++" },
            new MonHoc { MaMH = "MH003", TenMH = "Mạng máy tính" },
            new MonHoc { MaMH = "MH004", TenMH = "Cấu trúc dữ liệu và giải thuật" },
            new MonHoc { MaMH = "MH005", TenMH = "Hệ điều hành" },
        };

        public IActionResult Index()
        {
            if (!CheckRole("PGV")) return Denied();
            ViewData["Title"] = "Quản lý Môn học";
            ViewData["Subtitle"] = "Thêm, sửa, xóa môn học";
            return View(_danhSach);
        }
    }
}
