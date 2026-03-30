using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class TaiKhoanController : BaseController
    {
        private static List<TaiKhoan> _danhSach = new()
        {
            new TaiKhoan { LoginName = "admin", Password = "****", NhomQuyen = "PGV", HoTen = "Admin" },
            new TaiKhoan { LoginName = "gv_tuan", Password = "****", NhomQuyen = "Giangvien", HoTen = "Trần Minh Tuấn" },
            new TaiKhoan { LoginName = "gv_hoa", Password = "****", NhomQuyen = "Giangvien", HoTen = "Nguyễn Thị Hoa" },
            new TaiKhoan { LoginName = "sv", Password = "****", NhomQuyen = "Sinhvien", HoTen = "Tài khoản SV chung" },
        };

        public IActionResult Index()
        {
            if (!CheckRole("PGV")) return Denied();
            ViewData["Title"] = "Tài khoản & Phân quyền";
            ViewData["Subtitle"] = "Tạo tài khoản và quản lý quyền hạn";
            return View(_danhSach);
        }
    }
}
