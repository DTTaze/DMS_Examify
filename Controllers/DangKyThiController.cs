using DMS_Examify.Filters;
using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace DMS_Examify.Controllers
{
    [RequireRole("PGV", "Giangvien")]
    public class DangKyThiController : BaseController
    {
        private const string RegistrarRole = "PGV";
        private const string LecturerRole = "Giangvien";

        private const string SessionExpiredMessage = "Hết phiên đăng nhập.";
        private const string MissingTeacherMessage = "Vui lòng chọn giáo viên.";
        private const string PastExamDateMessage = "Ngày thi không hợp lệ, không được chọn ngày trong quá khứ.";
        private const string InvalidRegistrationMessage = "Thông tin đăng ký thi không hợp lệ.";

        private readonly IDangKyThiService _dangKyThiService;
        private readonly ILogger<DangKyThiController> _logger;

        public DangKyThiController(
            IDangKyThiService dangKyThiService,
            ILogger<DangKyThiController> logger)
        {
            _dangKyThiService = dangKyThiService;
            _logger = logger;
        }

        public IActionResult Index()
        {
            ViewData["Title"] = "Đăng ký thi";
            ViewData["Subtitle"] = "Lên lịch thi cho lớp";

            try
            {
                return View(CreateViewModel());
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi tải màn hình đăng ký thi.");
            }
        }

        [HttpPost]
        public IActionResult DangKy([FromBody] GiaoVienDangKy? registration)
        {
            var preparedRegistration = PrepareNewRegistration(registration);
            if (!preparedRegistration.IsValid)
            {
                return JsonFailure(preparedRegistration.Message);
            }

            try
            {
                var result = _dangKyThiService.CreateRegistration(preparedRegistration.Model!);
                return ToJsonResult(result);
            }
            catch (SqlException ex)
            {
                return JsonFailure(ex.Message);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi đăng ký thi.");
            }
        }

        [HttpGet]
        public IActionResult GetSoCauHoi(string? maMH, string? trinhDo)
        {
            if (string.IsNullOrWhiteSpace(maMH) || string.IsNullOrWhiteSpace(trinhDo))
            {
                return Json(new { success = false, soCau = 0 });
            }

            try
            {
                var questionCount = _dangKyThiService.CountQuestions(maMH, trinhDo);
                return Json(new { success = true, soCau = questionCount });
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi lấy số câu hỏi.");
            }
        }

        [HttpPost]
        public IActionResult CapNhat([FromBody] GiaoVienDangKy? registration)
        {
            var preparedRegistration = PrepareExistingRegistration(registration);
            if (!preparedRegistration.IsValid)
            {
                return JsonFailure(preparedRegistration.Message);
            }

            try
            {
                var result = _dangKyThiService.UpdateRegistration(preparedRegistration.Model!);
                return ToJsonResult(result);
            }
            catch (SqlException ex)
            {
                return JsonFailure(ex.Message);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi cập nhật đăng ký thi.");
            }
        }

        [HttpPost]
        public IActionResult Xoa([FromBody] GiaoVienDangKy? registration)
        {
            if (registration == null)
            {
                return JsonFailure(InvalidRegistrationMessage);
            }

            if (!HasActiveTeacherSession)
            {
                return JsonFailure(SessionExpiredMessage);
            }

            try
            {
                var result = _dangKyThiService.DeleteRegistration(
                    registration.MaMH,
                    registration.MaLop,
                    registration.Lan);

                return ToJsonResult(result);
            }
            catch (SqlException ex)
            {
                return JsonFailure(ex.Message);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi xóa đăng ký thi.");
            }
        }

        private DangKyThiViewModel CreateViewModel()
        {
            return new DangKyThiViewModel
            {
                LopList = _dangKyThiService.GetAvailableClasses(),
                MonHocList = _dangKyThiService.GetAvailableSubjects(),
                TrinhDoList = _dangKyThiService.GetAvailableLevels(),
                GiaoVienList = IsRegistrar ? _dangKyThiService.GetAvailableTeachers() : new List<GiaoVienDropdownItem>(),
                DangKyList = HasActiveTeacherSession
                    ? _dangKyThiService.GetRegistrations(CurrentRole, CurrentTeacherId!)
                    : new List<GiaoVienDangKy>(),
                IsPGV = IsRegistrar
            };
        }

        private PreparedRegistration PrepareNewRegistration(GiaoVienDangKy? registration)
        {
            var preparedRegistration = PrepareExistingRegistration(registration);
            if (!preparedRegistration.IsValid)
            {
                return preparedRegistration;
            }

            return IsPastExamDate(preparedRegistration.Model!)
                ? PreparedRegistration.Invalid(PastExamDateMessage)
                : preparedRegistration;
        }

        private PreparedRegistration PrepareExistingRegistration(GiaoVienDangKy? registration)
        {
            if (registration == null)
            {
                return PreparedRegistration.Invalid(InvalidRegistrationMessage);
            }

            if (!HasActiveTeacherSession)
            {
                return PreparedRegistration.Invalid(SessionExpiredMessage);
            }

            return TryAssignTeacher(registration);
        }

        private PreparedRegistration TryAssignTeacher(GiaoVienDangKy registration)
        {
            if (IsLecturer)
            {
                registration.MaGV = CurrentTeacherId!;
                return PreparedRegistration.Valid(registration);
            }

            return string.IsNullOrWhiteSpace(registration.MaGV)
                ? PreparedRegistration.Invalid(MissingTeacherMessage)
                : PreparedRegistration.Valid(registration);
        }

        private bool IsPastExamDate(GiaoVienDangKy registration)
        {
            return registration.NgayThi.Date < DateTime.Now.Date;
        }

        private bool HasActiveTeacherSession => !string.IsNullOrWhiteSpace(CurrentTeacherId);

        private bool IsRegistrar => string.Equals(CurrentRole, RegistrarRole, StringComparison.OrdinalIgnoreCase);

        private bool IsLecturer => string.Equals(CurrentRole, LecturerRole, StringComparison.OrdinalIgnoreCase);

        private JsonResult ToJsonResult((bool IsSuccess, string Message) result)
        {
            return Json(new { success = result.IsSuccess, message = result.Message });
        }

        private JsonResult JsonFailure(string message)
        {
            return Json(new { success = false, message });
        }

        private sealed class PreparedRegistration
        {
            private PreparedRegistration(bool isValid, string message, GiaoVienDangKy? model)
            {
                IsValid = isValid;
                Message = message;
                Model = model;
            }

            public bool IsValid { get; }

            public string Message { get; }

            public GiaoVienDangKy? Model { get; }

            public static PreparedRegistration Valid(GiaoVienDangKy model)
            {
                return new PreparedRegistration(true, string.Empty, model);
            }

            public static PreparedRegistration Invalid(string message)
            {
                return new PreparedRegistration(false, message, null);
            }
        }
    }
}
