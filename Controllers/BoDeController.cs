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
            if (model == null || !ModelState.IsValid)
            {
                return BadRequest(InvalidQuestionMessage);
            }

            try
            {
                var cauHoi = _boDeService.Insert(model, CurrentTeacherId);
                return Json(new { cauHoi });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
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
            if (model == null || model.CauHoi <= 0 || !ModelState.IsValid)
            {
                return BadRequest(InvalidQuestionMessage);
            }

            try
            {
                _boDeService.Update(model, CurrentRole, CurrentTeacherId);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
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
            if (cauHoi <= 0 || string.IsNullOrWhiteSpace(maMH))
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


    }
}

