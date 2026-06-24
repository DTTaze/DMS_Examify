using DMS_Examify.Filters;
using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    [RequireRole("PGV")]
    public class MonHocController : BaseController
    {
        private readonly IMonHocService _monHocService;
        private readonly ILogger<MonHocController> _logger;

        public MonHocController(
            IMonHocService monHocService,
            ILogger<MonHocController> logger)
        {
            _monHocService = monHocService;
            _logger = logger;
        }

        public IActionResult Index()
        {
            ViewData["Title"] = "Quản lý Môn học";
            ViewData["Subtitle"] = "Thêm, sửa, xóa môn học";

            var subjects = _monHocService.GetAll();
            foreach (var subject in subjects)
            {
                subject.HasDependencies = _monHocService.CheckHasDependencies(subject.MaMH);
            }
            return View(subjects);
        }

        [HttpPost]
        public IActionResult Insert([FromBody] MonHoc? model)
        {
            if (model == null || !ModelState.IsValid)
            {
                return BadRequest("Thông tin môn học không hợp lệ.");
            }

            try
            {
                _monHocService.Insert(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi thêm môn học.");
            }
        }

        [HttpPost]
        public IActionResult Update([FromBody] MonHoc? model)
        {
            if (model == null || !ModelState.IsValid)
            {
                return BadRequest("Thông tin môn học không hợp lệ.");
            }

            try
            {
                _monHocService.Update(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi cập nhật môn học.");
            }
        }

        [HttpPost]
        public IActionResult Delete(string maMH)
        {
            if (string.IsNullOrWhiteSpace(maMH))
            {
                return BadRequest("Mã môn học không hợp lệ.");
            }

            try
            {
                if (_monHocService.CheckHasDependencies(maMH))
                {
                    return BadRequest("Không thể xóa môn học vì đã có dữ liệu liên quan.");
                }
                _monHocService.Delete(maMH);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, $"Không thể xóa môn học {maMH}.");
            }
        }



        [HttpGet]
        public IActionResult Search(string? keyword)
        {
            try
            {
                var subjects = _monHocService.Search(keyword ?? string.Empty);
                foreach (var subject in subjects)
                {
                    subject.HasDependencies = _monHocService.CheckHasDependencies(subject.MaMH);
                }
                return Json(subjects);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi tìm kiếm môn học.");
            }
        }



        [HttpGet]
        public IActionResult CheckDuplicateForCreate(string maMH, string tenMH)
        {
            try
            {
                var maCheck = _monHocService.CheckMaMHDuplicate(maMH);
                var tenCheck = _monHocService.CheckTenMHDuplicate(tenMH);

                return Json(new
                {
                    maMHDuplicate = maCheck.Exists,
                    maMHActive = maCheck.IsActive,
                    tenMHDuplicate = tenCheck.Exists,
                    tenMHActive = tenCheck.IsActive
                });
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi hệ thống khi kiểm tra trùng môn học.");
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicateForUpdate(string maMH, string tenMH)
        {
            try
            {
                var tenCheck = _monHocService.CheckTenMHDuplicateExcludingMaMH(tenMH, maMH);

                return Json(new
                {
                    maMHDuplicate = false,
                    maMHActive = false,
                    tenMHDuplicate = tenCheck.Exists,
                    tenMHActive = tenCheck.IsActive
                });
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi hệ thống khi kiểm tra trùng môn học.");
            }
        }

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<MonHoc>? items)
        {
            if (items == null || items.Count == 0)
            {
                return Json(new List<object>());
            }

            try
            {
                var validationResults = _monHocService.ValidateImportDuplicates(items);
                return Json(validationResults);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi hệ thống khi kiểm tra danh sách import môn học.");
            }
        }


    }
}

