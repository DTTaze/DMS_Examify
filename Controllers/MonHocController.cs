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
                var maCheck = _monHocService.CheckMaMHDuplicate(model.MaMH);
                if (maCheck.Exists)
                {
                    return BadRequest("Mã môn học đã tồn tại trong CSDL.");
                }

                var tenCheck = _monHocService.CheckTenMHDuplicate(model.TenMH);
                if (tenCheck.Exists)
                {
                    return BadRequest("Tên môn học đã tồn tại trong CSDL.");
                }

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
                var tenCheck = _monHocService.CheckTenMHDuplicateExcludingMaMH(model.TenMH, model.MaMH);
                if (tenCheck.Exists)
                {
                    return BadRequest("Tên môn học đã tồn tại trong CSDL.");
                }

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
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
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
                    tenMHDuplicate = tenCheck.Exists
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
                    tenMHDuplicate = tenCheck.Exists
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

