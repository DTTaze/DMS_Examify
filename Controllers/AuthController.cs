using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace DMS_Examify.Controllers
{
    public class AuthController : Controller
    {
        private const string StudentLoginType = "SinhVien";
        private const string StudentRoleName = "Sinhvien";

        private const string SessionKeyUserRole = "UserRole";
        private const string SessionKeyUserName = "UserName";
        private const string SessionKeyUserLogin = "UserLogin";
        private const string SessionKeyMaLop = "MaLop";
        private const string SessionKeyDbConnectionString = "DbConnectionString";

        private const string ErrorStudentNotFound = "Mã SV hoặc mật khẩu không đúng.";
        private const string ErrorLecturerNotFound = "Tên đăng nhập hoặc mật khẩu giảng viên không đúng.";

        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
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
            return !string.IsNullOrEmpty(GetSessionValue(SessionKeyUserRole));
        }

        private string? ProcessStudentLogin(LoginViewModel model)
        {
            try
            {
                var student = _authService.ValidateStudent(model.Login, model.Password);
                if (student == null)
                {
                    return ErrorStudentNotFound;
                }

                SetStudentSession(student);
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
                var lecturer = _authService.ValidateLecturer(model.Login, model.Password);
                if (lecturer == null || string.IsNullOrEmpty(lecturer.Role))
                {
                    return ErrorLecturerNotFound;
                }

                SetLecturerSession(lecturer, model.Login, model.Password);
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

        private void SetStudentSession(SinhVien student)
        {
            SetSessionValue(SessionKeyUserRole, StudentRoleName);
            SetSessionValue(SessionKeyUserName, $"{student.Ho} {student.Ten}");
            SetSessionValue(SessionKeyUserLogin, student.MaSV);
            SetSessionValue(SessionKeyMaLop, student.MaLop);
            SetSessionValue(SessionKeyDbConnectionString, _authService.GetStudentConnectionString());
        }

        private void SetLecturerSession(LecturerInfo lecturer, string login, string password)
        {
            SetSessionValue(SessionKeyUserRole, lecturer.Role);
            SetSessionValue(SessionKeyUserName, lecturer.FullName);
            SetSessionValue(SessionKeyUserLogin, lecturer.UserName);
            SetSessionValue(SessionKeyDbConnectionString, _authService.BuildLecturerConnectionString(login, password));
        }

        private string? GetSessionValue(string key)
            => HttpContext.Session.GetString(key);

        private void SetSessionValue(string key, string value)
            => HttpContext.Session.SetString(key, value);
    }
}
