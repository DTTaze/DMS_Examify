using DMS_Examify.Filters;
using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    [RequireRole("PGV")]
    public class LopSinhVienController : BaseController
    {
        private readonly ISinhVienService _sinhVienService;
        private readonly ILopService _lopService;
        private readonly ILogger<LopSinhVienController> _logger;

        public LopSinhVienController(
            ISinhVienService sinhVienService,
            ILopService lopService,
            ILogger<LopSinhVienController> logger)
        {
            _sinhVienService = sinhVienService;
            _lopService = lopService;
            _logger = logger;
        }

        public IActionResult Index() => View(_lopService.GetAll());

        [HttpPost]
        public IActionResult CreateClass([FromBody] Lop? model)
        {
            if (model == null || !ModelState.IsValid)
            {
                return BadRequest("Thông tin lớp học không hợp lệ.");
            }

            try
            {
                _lopService.Insert(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi thêm lớp học.");
            }
        }

        [HttpPost]
        public IActionResult UpdateClass([FromBody] Lop? model)
        {
            if (model == null || !ModelState.IsValid)
            {
                return BadRequest("Thông tin lớp học không hợp lệ.");
            }

            try
            {
                _lopService.Update(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi cập nhật lớp học.");
            }
        }

        [HttpPost]
        public IActionResult DeleteClass(string maLop)
        {
            if (string.IsNullOrWhiteSpace(maLop))
            {
                return BadRequest("Mã lớp không được để trống.");
            }

            try
            {
                _lopService.Delete(maLop);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, $"Không thể xóa lớp học {maLop}.");
            }
        }

        [HttpGet]
        public IActionResult SearchClasses(string? keyword)
        {
            try
            {
                var classes = _lopService.Search(keyword ?? string.Empty);
                return Json(classes);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi tìm kiếm lớp học.");
            }
        }

        [HttpGet]
        public IActionResult SearchStudents(string? keyword)
        {
            try
            {
                var students = _sinhVienService.Search(keyword ?? string.Empty);
                return Json(students);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi tìm kiếm sinh viên.");
            }
        }

        [HttpPost]
        public IActionResult CreateStudent([FromBody] SinhVien? model)
        {
            if (model == null || !ModelState.IsValid)
            {
                return BadRequest("Thông tin sinh viên không hợp lệ.");
            }

            try
            {
                _sinhVienService.Insert(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi thêm sinh viên.");
            }
        }

        [HttpPost]
        public IActionResult UpdateStudent([FromBody] SinhVien? model)
        {
            if (model == null || !ModelState.IsValid)
            {
                return BadRequest("Thông tin sinh viên không hợp lệ.");
            }

            try
            {
                _sinhVienService.Update(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi cập nhật sinh viên.");
            }
        }

        [HttpPost]
        public IActionResult DeleteStudent(string maSV)
        {
            if (string.IsNullOrWhiteSpace(maSV))
            {
                return BadRequest("Mã sinh viên không được để trống.");
            }

            try
            {
                _sinhVienService.Delete(maSV);
                return Ok();
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, $"Không thể xóa sinh viên {maSV}.");
            }
        }

        [HttpGet]
        public IActionResult GetStudentsByClass(string maLop)
        {
            if (string.IsNullOrWhiteSpace(maLop))
            {
                return BadRequest("Mã lớp không được để trống.");
            }

            try
            {
                var students = _sinhVienService.GetByLop(maLop);
                return Json(students);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi lấy danh sách sinh viên.");
            }
        }

        [HttpPost]
        public IActionResult CheckStudentImport([FromBody] List<SinhVien>? items)
        {
            try
            {
                var results = _sinhVienService.CheckImportDuplicates(items ?? new List<SinhVien>());
                return Json(results);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi hệ thống khi kiểm tra danh sách import sinh viên.");
            }
        }

        [HttpGet]
        public IActionResult CheckClassDuplicateForCreate(string maLop, string tenLop)
        {
            try
            {
                var result = _lopService.CheckDuplicateForCreate(maLop, tenLop);
                return Json(result);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi hệ thống khi kiểm tra trùng lớp học.");
            }
        }

        [HttpGet]
        public IActionResult CheckClassDuplicateForUpdate(string maLop, string tenLop)
        {
            try
            {
                var result = _lopService.CheckDuplicateForUpdate(maLop, tenLop);
                return Json(result);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi hệ thống khi kiểm tra trùng lớp học.");
            }
        }

        [HttpGet]
        public IActionResult CheckStudentDuplicateForCreate(string maSV)
        {
            try
            {
                var result = _sinhVienService.CheckDuplicateForCreate(maSV);
                return Json(result);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi hệ thống khi kiểm tra trùng sinh viên.");
            }
        }


    }
}

