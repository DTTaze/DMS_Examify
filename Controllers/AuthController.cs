using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class AuthController : Controller
    {
        // Role Constants
        private const string StudentLoginType = "SinhVien";
        private const string StudentRoleName = "Sinhvien";

        // Session Key Constants
        private const string SessionKeyUserRole = "UserRole";
        private const string SessionKeyUserName = "UserName";
        private const string SessionKeyUserLogin = "UserLogin";
        private const string SessionKeyMaLop = "MaLop";
        private const string SessionKeyDbConnectionString = "DbConnectionString";

        // Database Columns Constants
        private const string ColumnUserName = "USERNAME";
        private const string ColumnHoTen = "HOTEN";
        private const string ColumnTenNhom = "ROLENAME";
        private const string ColumnMaSv = "MaSV";
        private const string ColumnHo = "Ho";
        private const string ColumnTen = "Ten";
        private const string ColumnMaLop = "MaLop";

        // Error Message Constants
        private const string ErrorStudentNotFound = "Mã SV hoặc mật khẩu không đúng.";
        private const string ErrorLecturerNotFound = "Tên đăng nhập hoặc mật khẩu giảng viên không đúng.";

        private readonly string _templateConnection;
        private readonly string _studentConnection;

        public AuthController(IConfiguration configuration)
        {
            _templateConnection = configuration.GetConnectionString("DatabaseTemplate")
                ?? string.Empty;

            var studentUser = configuration["StudentCredentials:DefaultUser"] ?? "sv";
            var studentPassword = configuration["StudentCredentials:DefaultPassword"] ?? "sv";

            var builder = new SqlConnectionStringBuilder(_templateConnection)
            {
                IntegratedSecurity = false,
                UserID = studentUser,
                Password = studentPassword,
                TrustServerCertificate = true,
            };

            _studentConnection = builder.ConnectionString;
        }

        public IActionResult Login()
        {
            if (IsUserLoggedIn())
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
                return View(model);
            }

            try
            {
                string? errorMessage = model.LoginType == StudentLoginType
                    ? ProcessStudentLogin(model)
                    : ProcessLecturerLogin(model);

                if (errorMessage != null)
                {
                    ViewData["Error"] = errorMessage;
                    return View(model);
                }

                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                ViewData["Error"] = $"Đăng nhập thất bại: {ex.Message}";
                return View(model);
            }
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

        private bool IsUserLoggedIn()
        {
            return !string.IsNullOrEmpty(HttpContext.Session.GetString(SessionKeyUserRole));
        }

        private string? ProcessStudentLogin(LoginViewModel model)
        {
            try
            {
                var sinhVien = ValidateSinhVien(model.Login, model.Password);
                if (sinhVien == null)
                {
                    return ErrorStudentNotFound;
                }

                SetStudentSession(sinhVien);
                return null;
            }
            catch (SqlException ex)
            {
                return ex.Message;
            }
        }

        private string? ProcessLecturerLogin(LoginViewModel model)
        {
            try
            {
                var giangVien = ValidateGiangVien(model.Login, model.Password);
                if (giangVien == null || string.IsNullOrEmpty(giangVien.Value.Role))
                {
                    return ErrorLecturerNotFound;
                }

                SetLecturerSession(giangVien.Value, model.Login, model.Password);
                return null;
            }
            catch (SqlException ex) when (ex.Number == 18456)
            {
                return ErrorLecturerNotFound;
            }
            catch (SqlException ex)
            {
                return $"Lỗi kết nối cơ sở dữ liệu: {ex.Message}";
            }
        }
        private void SetStudentSession(SinhVien sinhVien)
        {
            HttpContext.Session.SetString(SessionKeyUserRole, StudentRoleName);
            HttpContext.Session.SetString(SessionKeyUserName, $"{sinhVien.Ho} {sinhVien.Ten}");
            HttpContext.Session.SetString(SessionKeyUserLogin, sinhVien.MaSV);
            HttpContext.Session.SetString(SessionKeyMaLop, sinhVien.MaLop);
            HttpContext.Session.SetString(SessionKeyDbConnectionString, _studentConnection);
        }

        private void SetLecturerSession((string Role, string UserName, string HoTen) giangVien, string login, string password)
        {
            HttpContext.Session.SetString(SessionKeyUserRole, giangVien.Role);
            HttpContext.Session.SetString(SessionKeyUserName, giangVien.HoTen);
            HttpContext.Session.SetString(SessionKeyUserLogin, giangVien.UserName);

            var dbConnectionString = BuildConnectionString(login, password);
            HttpContext.Session.SetString(SessionKeyDbConnectionString, dbConnectionString);
        }

        private SinhVien? ValidateSinhVien(string maSinhVien, string matKhau)
        {
            using var conn = new SqlConnection(_studentConnection);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_SinhVien_Login", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("@MASV", maSinhVien);
            cmd.Parameters.AddWithValue("@PASSWORD", matKhau);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
            {
                return null;
            }

            return new SinhVien
            {
                MaSV = reader[ColumnMaSv].ToString() ?? string.Empty,
                Ho = reader[ColumnHo].ToString() ?? string.Empty,
                Ten = reader[ColumnTen].ToString() ?? string.Empty,
                MaLop = reader[ColumnMaLop].ToString() ?? string.Empty
            };
        }

        private (string Role, string UserName, string HoTen)? ValidateGiangVien(string login, string password)
        {
            var connStr = BuildConnectionString(login, password);
            using var conn = new SqlConnection(connStr);
            conn.Open();
            
            using var cmd = new SqlCommand("dbo.usp_TaiKhoan_LayThongTin", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@LOGINNAME", login);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
            {
                return null;
            }

            return (
                reader[ColumnTenNhom].ToString() ?? "",
                reader[ColumnUserName].ToString() ?? "",
                reader[ColumnHoTen].ToString() ?? ""
            );
        }

        private string BuildConnectionString(string userId, string password)
        {
            var builder = new SqlConnectionStringBuilder(_templateConnection)
            {
                IntegratedSecurity = false,
                UserID = userId,
                Password = password,
                TrustServerCertificate = true
            };
            return builder.ConnectionString;
        }
    }
}
