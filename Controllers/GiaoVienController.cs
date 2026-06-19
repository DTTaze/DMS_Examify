using DMS_Examify.Filters;
using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    [RequireRole("PGV")]
    public class GiaoVienController : BaseController
    {
        private const string EmptyTeacherRequestMessage = "Thông tin giáo viên không được để trống.";
        private const string InvalidTeacherMessage = "Thông tin giáo viên chưa đầy đủ.";
        private const string InvalidTeacherIdMessage = "Mã giáo viên không hợp lệ.";
        private const string ImportCheckErrorMessage = "Lỗi hệ thống khi kiểm tra danh sách import.";
        private const string DuplicateCheckErrorMessage = "Lỗi hệ thống khi kiểm tra trùng giáo viên.";

        private readonly IGiaoVienService _giaoVienService;
        private readonly ILogger<GiaoVienController> _logger;

        public GiaoVienController(
            IGiaoVienService giaoVienService,
            ILogger<GiaoVienController> logger)
        {
            _giaoVienService = giaoVienService;
            _logger = logger;
        }

        public IActionResult Index()
        {
            ViewData["Title"] = "Quản lý Giáo viên";
            ViewData["Subtitle"] = "Thêm, sửa, xóa giáo viên";

            return View(_giaoVienService.GetAll());
        }

        [HttpPost]
        public IActionResult Insert([FromBody] GiaoVien? model)
        {
            if (model == null || !ModelState.IsValid)
            {
                return BadRequest(InvalidTeacherMessage);
            }

            try
            {
                _giaoVienService.Insert(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi thêm giáo viên.");
            }
        }

        [HttpPost]
        public IActionResult Update([FromBody] GiaoVien? model)
        {
            if (model == null || !ModelState.IsValid)
            {
                return BadRequest(InvalidTeacherMessage);
            }

            try
            {
                _giaoVienService.Update(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi cập nhật giáo viên.");
            }
        }

        [HttpPost]
        public IActionResult Delete(string maGV)
        {
            if (string.IsNullOrWhiteSpace(maGV))
            {
                return BadRequest(InvalidTeacherIdMessage);
            }

            try
            {
                _giaoVienService.Delete(maGV);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, $"Không thể xóa giáo viên {maGV}.");
            }
        }

        [HttpGet]
        public IActionResult Search(string? keyword)
        {
            try
            {
                var teachers = _giaoVienService.Search(keyword);
                return Json(teachers);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi tìm kiếm giáo viên.");
            }
        }

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<GiaoVien>? items)
        {
            try
            {
                var results = _giaoVienService.CheckImportDuplicates(items ?? new List<GiaoVien>());
                return Json(results);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, ImportCheckErrorMessage);
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicateForCreate(string? maGV)
        {
            try
            {
                var result = _giaoVienService.CheckDuplicateForCreate(maGV);
                return Json(result);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, DuplicateCheckErrorMessage);
            }
        }


    }
}

