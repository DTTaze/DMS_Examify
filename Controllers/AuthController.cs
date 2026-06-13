using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class AuthController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly string _masterConnectionString;
        private readonly string _studentConnectionString;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
            _masterConnectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;

            var builder = new SqlConnectionStringBuilder(_masterConnectionString)
            {
                IntegratedSecurity = false,
                UserID = "sv",
                Password = "sv",
                TrustServerCertificate = true,
            };

            _studentConnectionString = builder.ConnectionString;
        }

        public IActionResult Login()
        {
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

            try
            {
                if (model.LoginType == "SinhVien")
                {
                    var sv = ValidateSinhVien(model.Login, model.Password);
                    if (sv == null)
                    {
                        ViewData["Error"] = "Mã SV hoặc mật khẩu không đúng.";
                        return View(model);
                    }

                    HttpContext.Session.SetString("UserRole", "Sinhvien");
                    HttpContext.Session.SetString("UserName", $"{sv.Ho} {sv.Ten}");
                    HttpContext.Session.SetString("UserLogin", sv.MaSV);
                    HttpContext.Session.SetString("MaLop", sv.MaLop);
                }
                else
                {
                    var user = ValidateGiangVien(model.Login, model.Password);

                    if (user == null || string.IsNullOrEmpty(user.Value.Role))
                    {
                        ViewData["Error"] = "Tên đăng nhập hoặc mật khẩu giảng viên không đúng.";
                        return View(model);
                    }

                    HttpContext.Session.SetString("UserRole", user.Value.Role);
                    HttpContext.Session.SetString("UserName", user.Value.HoTen);
                    HttpContext.Session.SetString("UserLogin", user.Value.UserName);
                }

                return RedirectToAction("Index", "Home");
            }
            catch (SqlException ex)
            {
                if (ex.Number == 18456)
                {
                    ViewData["Error"] = "Tên đăng nhập hoặc mật khẩu giảng viên không đúng.";
                }
                else
                {
                    ViewData["Error"] = "Lỗi kết nối cơ sở dữ liệu: " + ex.Message;
                }
                return View(model);
            }
            catch (Exception ex)
            {
                ViewData["Error"] = "Đăng nhập thất bại: " + ex.Message;
                return View(model);
            }
        }

        private (string Role, string UserName, string HoTen)? ValidateGiangVien(string login, string password)
        {
            var connStr = BuildConnectionString(login, password);

            using var conn = new SqlConnection(connStr);
            conn.Open();
            using var cmd = new SqlCommand("dbo.SP_LayThongTinTaiKhoan", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@TENLOGIN", login);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
                return null;

            return (
                reader["TENNHOM"].ToString() ?? "",
                reader["USERNAME"].ToString() ?? "",
                reader["HOTEN"].ToString() ?? ""
            );
        }

        private SinhVien? ValidateSinhVien(string maSV, string matKhau)
        {
            using var conn = new SqlConnection(_studentConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_SinhVien_Login", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("@MASV", maSV);
            cmd.Parameters.AddWithValue("@PASSWORD", matKhau);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
                return null;

            return new SinhVien
            {
                MaSV = reader["MaSV"].ToString() ?? string.Empty,
                Ho = reader["Ho"].ToString() ?? string.Empty,
                Ten = reader["Ten"].ToString() ?? string.Empty,
                MaLop = reader["MaLop"].ToString() ?? string.Empty
            };
        }

        private string BuildConnectionString(string userId, string password)
        {
            var builder = new SqlConnectionStringBuilder(_masterConnectionString)
            {
                IntegratedSecurity = false,
                UserID = userId,
                Password = password,
                TrustServerCertificate = true
            };
            return builder.ConnectionString;
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
