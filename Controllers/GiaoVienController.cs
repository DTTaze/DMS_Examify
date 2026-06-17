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
            if (model == null) return BadRequest(EmptyTeacherRequestMessage);

            _giaoVienService.Insert(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult Update([FromBody] GiaoVien? model)
        {
            if (IsInvalidTeacher(model))
                return BadRequest(InvalidTeacherMessage);

            _giaoVienService.Update(model!);
            return Ok();
        }

        [HttpPost]
        public IActionResult Delete(string maGV)
        {
            if (string.IsNullOrWhiteSpace(maGV)) return BadRequest(InvalidTeacherIdMessage);

            _giaoVienService.Delete(maGV);
            return Ok();
        }

        [HttpGet]
        public IActionResult Search(string? keyword)
        {
            return Json(_giaoVienService.Search(keyword));
        }

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<GiaoVien>? items)
        {
            try
            {
                return Json(_giaoVienService.CheckImportDuplicates(items ?? new List<GiaoVien>()));
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(ex, ImportCheckErrorMessage);
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicateForCreate(string? maGV)
        {
            try
            {
                return Json(_giaoVienService.CheckDuplicateForCreate(maGV));
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(ex, DuplicateCheckErrorMessage);
            }
        }

        private IActionResult LogAndReturnServerError(Exception exception, string message)
        {
            _logger.LogError(exception, message);
            return StatusCode(500, message);
        }

        private static bool IsInvalidTeacher(GiaoVien? teacher)
        {
            return teacher == null || string.IsNullOrWhiteSpace(teacher.MaGV);
        }
    }
}
