using DMS_Examify.Filters;
using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    [RequireRole("PGV", "Giangvien")]
    public class BoDeController : BaseController
    {
        private const string InvalidQuestionMessage = "Thông tin câu hỏi không hợp lệ.";
        private const string ImportCheckErrorMessage = "Lỗi hệ thống khi kiểm tra danh sách import.";
        private const string QuestionNotFoundOrDeniedMessage = "Không tìm thấy câu hỏi hoặc bạn không có quyền thao tác.";

        private readonly IBoDeService _boDeService;
        private readonly IMonHocService _monHocService;
        private readonly ILogger<BoDeController> _logger;

        public BoDeController(
            IBoDeService boDeService,
            IMonHocService monHocService,
            ILogger<BoDeController> logger)
        {
            _boDeService = boDeService;
            _monHocService = monHocService;
            _logger = logger;
        }

        public IActionResult Index()
        {
            ViewBag.Title = "Nhập câu hỏi thi";
            ViewBag.Subtitle = "Quản lý bộ đề trắc nghiệm";

            var viewModel = new BoDeViewModel
            {
                BoDes = _boDeService.GetAll(CurrentRole, CurrentTeacherId),
                MonHocList = _monHocService.GetAll()
            };

            return View(viewModel);
        }

        [HttpPost]
        public IActionResult Insert([FromBody] BoDe? model)
        {
            if (model == null) return BadRequest(InvalidQuestionMessage);

            var cauHoi = _boDeService.Insert(model, CurrentTeacherId);
            return Json(new { cauHoi });
        }

        [HttpPost]
        public IActionResult Update([FromBody] BoDe? model)
        {
            if (IsInvalidQuestion(model)) return BadRequest(InvalidQuestionMessage);

            return _boDeService.Update(model!, CurrentRole, CurrentTeacherId)
                ? Ok()
                : NotFound(QuestionNotFoundOrDeniedMessage);
        }

        [HttpPost]
        public IActionResult Delete(int cauHoi, string maMH)
        {
            if (IsInvalidQuestionKey(cauHoi, maMH)) return BadRequest(InvalidQuestionMessage);

            return _boDeService.Delete(cauHoi, maMH, CurrentRole, CurrentTeacherId)
                ? Ok()
                : NotFound(QuestionNotFoundOrDeniedMessage);
        }

        [HttpGet]
        public IActionResult Search(string? keyword)
        {
            return Json(_boDeService.Search(keyword, CurrentRole, CurrentTeacherId));
        }

        [HttpGet]
        public IActionResult GetLatestCauHoi()
        {
            return Json(_boDeService.GetLatestCauHoi());
        }

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<BoDe>? items)
        {
            try
            {
                return Json(_boDeService.CheckImportSubjects(items ?? new List<BoDe>()));
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(ex, ImportCheckErrorMessage);
            }
        }

        private string CurrentTeacherId => HttpContext.Session.GetString("UserLogin") ?? string.Empty;

        private string CurrentRole => HttpContext.Session.GetString("UserRole") ?? string.Empty;

        private IActionResult LogAndReturnServerError(Exception exception, string message)
        {
            _logger.LogError(exception, message);
            return StatusCode(500, message);
        }

        private static bool IsInvalidQuestion(BoDe? question)
        {
            return question == null
                || IsInvalidQuestionKey(question.CauHoi, question.MaMH);
        }

        private static bool IsInvalidQuestionKey(int cauHoi, string? maMH)
        {
            return cauHoi <= 0 || string.IsNullOrWhiteSpace(maMH);
        }
    }
}
