using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class AuthController : Controller
    {
        // Mock accounts — 3 vai trò
        private static readonly List<TaiKhoan> MockAccounts = new()
        {
            new TaiKhoan { LoginName = "admin",  Password = "admin123", NhomQuyen = "PGV",       HoTen = "Quản trị viên" },
            new TaiKhoan { LoginName = "gv01",   Password = "gv123",    NhomQuyen = "Giangvien", HoTen = "Trần Minh Tuấn" },
        };

        // Mock sinh viên
        private static readonly List<SinhVien> MockSinhVien = new()
        {
            new SinhVien { MaSV = "SV001", Ho = "Nguyễn Văn", Ten = "An", MatKhau = "sv123", MaLop = "TH2024A" },
            new SinhVien { MaSV = "SV002", Ho = "Trần Thị",   Ten = "Bình", MatKhau = "sv123", MaLop = "TH2024A" },
        };

        public IActionResult Login()
        {
            // Nếu đã login rồi thì redirect về Home
            if (!string.IsNullOrEmpty(HttpContext.Session.GetString("UserRole")))
            {
                return RedirectToAction("Index", "Home");
            }
            return View(new LoginViewModel());
        }

        [HttpPost]
        public IActionResult Login(LoginViewModel model)
        {
            if (string.IsNullOrEmpty(model.Login) || string.IsNullOrEmpty(model.Password))
            {
                ViewData["Error"] = "Vui lòng nhập đầy đủ thông tin đăng nhập.";
                return View(model);
            }

            if (model.LoginType == "SinhVien")
            {
                // Đăng nhập bằng Sinh viên: Login = Mã SV
                var sv = MockSinhVien.FirstOrDefault(s =>
                    s.MaSV.Equals(model.Login, StringComparison.OrdinalIgnoreCase) &&
                    s.MatKhau == model.Password);

                if (sv == null)
                {
                    ViewData["Error"] = "Mã SV hoặc mật khẩu không đúng.";
                    return View(model);
                }

                // Lưu session
                HttpContext.Session.SetString("UserRole", "Sinhvien");
                HttpContext.Session.SetString("UserName", $"{sv.Ho} {sv.Ten}");
                HttpContext.Session.SetString("UserLogin", sv.MaSV);
                HttpContext.Session.SetString("MaLop", sv.MaLop);
            }
            else
            {
                // Đăng nhập bằng Giảng viên / PGV
                var account = MockAccounts.FirstOrDefault(a =>
                    a.LoginName.Equals(model.Login, StringComparison.OrdinalIgnoreCase) &&
                    a.Password == model.Password);

                if (account == null)
                {
                    ViewData["Error"] = "Tên đăng nhập hoặc mật khẩu không đúng.";
                    return View(model);
                }

                // Lưu session
                HttpContext.Session.SetString("UserRole", account.NhomQuyen);
                HttpContext.Session.SetString("UserName", account.HoTen);
                HttpContext.Session.SetString("UserLogin", account.LoginName);
            }

            return RedirectToAction("Index", "Home");
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }

        public IActionResult AccessDenied()
        {
            ViewData["Title"] = "Truy cập bị từ chối";
            return View();
        }
    }
}
