using DMS_Examify.Filters;
using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace DMS_Examify.Controllers
{
    [RequireRole("PGV", "Giangvien")]
    public class BoDeController : BaseController
    {
        private const string InvalidQuestionMessage = "Thông tin câu hỏi không hợp lệ.";
        private const string ImportCheckErrorMessage = "Lỗi hệ thống khi kiểm tra danh sách import.";
        private const string DuplicateQuestionMessage = "Câu hỏi này đã tồn tại trong ngân hàng đề của môn học.";

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
            if (IsInvalidQuestionContent(model))
            {
                return BadRequest(InvalidQuestionMessage);
            }

            try
            {
                if (HasDuplicateQuestion(model!))
                {
                    return BadRequest(DuplicateQuestionMessage);
                }

                var cauHoi = _boDeService.Insert(model!, CurrentTeacherId);
                return Json(new { cauHoi });
            }
            catch (SqlException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi thêm câu hỏi.");
            }
        }

        [HttpPost]
        public IActionResult Update([FromBody] BoDe? model)
        {
            if (IsInvalidQuestion(model) || IsInvalidQuestionContent(model))
            {
                return BadRequest(InvalidQuestionMessage);
            }

            try
            {
                if (HasDuplicateQuestion(model!))
                {
                    return BadRequest(DuplicateQuestionMessage);
                }

                _boDeService.Update(model!, CurrentRole, CurrentTeacherId);
                return Ok();
            }
            catch (SqlException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi cập nhật câu hỏi.");
            }
        }

        [HttpPost]
        public IActionResult Delete(int cauHoi, string maMH)
        {
            if (IsInvalidQuestionKey(cauHoi, maMH))
            {
                return BadRequest(InvalidQuestionMessage);
            }

            try
            {
                _boDeService.Delete(cauHoi, maMH, CurrentRole, CurrentTeacherId);
                return Ok();
            }
            catch (SqlException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, $"Không thể xóa câu hỏi {cauHoi} của môn {maMH}.");
            }
        }

        [HttpGet]
        public IActionResult Search(string? keyword)
        {
            try
            {
                var questions = _boDeService.Search(keyword, CurrentRole, CurrentTeacherId);
                return Json(questions);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi tìm kiếm câu hỏi.");
            }
        }

        [HttpGet]
        public IActionResult GetLatestCauHoi()
        {
            try
            {
                var latest = _boDeService.GetLatestCauHoi();
                return Json(latest);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi lấy mã câu hỏi mới nhất.");
            }
        }

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<BoDe>? items)
        {
            try
            {
                var results = _boDeService.CheckImportSubjects(items ?? new List<BoDe>());
                return Json(results);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, ImportCheckErrorMessage);
            }
        }

        private string CurrentTeacherId => HttpContext.Session.GetString("UserLogin") ?? string.Empty;

        private string CurrentRole => HttpContext.Session.GetString("UserRole") ?? string.Empty;

        private bool HasDuplicateQuestion(BoDe question)
        {
            var result = _boDeService.CheckImportSubjects(new List<BoDe> { question }).FirstOrDefault();
            return result?.HasDuplicate == true;
        }

        private static bool IsInvalidQuestion(BoDe? question)
        {
            return question == null || IsInvalidQuestionKey(question.CauHoi, question.MaMH);
        }

        private static bool IsInvalidQuestionContent(BoDe? question)
        {
            return question == null
                || string.IsNullOrWhiteSpace(question.MaMH)
                || string.IsNullOrWhiteSpace(question.NoiDung)
                || string.IsNullOrWhiteSpace(question.DapAnA)
                || string.IsNullOrWhiteSpace(question.DapAnB)
                || string.IsNullOrWhiteSpace(question.DapAnC)
                || string.IsNullOrWhiteSpace(question.DapAnD)
                || string.IsNullOrWhiteSpace(question.DapAn);
        }

        private static bool IsInvalidQuestionKey(int cauHoi, string? maMH)
        {
            return cauHoi <= 0 || string.IsNullOrWhiteSpace(maMH);
        }
    }
}

