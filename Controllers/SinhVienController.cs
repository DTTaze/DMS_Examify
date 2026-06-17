using DMS_Examify.Filters;
using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    [RequireRole("PGV")]
    public class SinhVienController : BaseController
    {
        private readonly ISinhVienService _sinhVienService;
        private readonly ILopService _lopService;
        private readonly ILogger<SinhVienController> _logger;

        public SinhVienController(
            ISinhVienService sinhVienService,
            ILopService lopService,
            ILogger<SinhVienController> logger)
        {
            _sinhVienService = sinhVienService;
            _lopService = lopService;
            _logger = logger;
        }

        public IActionResult Index()
        {
            var classes = _lopService.GetAll();
            return View(classes);
        }

        [HttpPost]
        public IActionResult InsertLop([FromBody] Lop model)
        {
            _lopService.Insert(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult UpdateLop([FromBody] Lop model)
        {
            _lopService.Update(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult DeleteLop(string maLop)
        {
            _lopService.Delete(maLop);
            return Ok();
        }

        [HttpGet]
        public IActionResult SearchLop(string keyword)
        {
            var classes = _lopService.Search(keyword);
            return Json(classes);
        }

        [HttpGet]
        public IActionResult Search(string keyword)
        {
            var students = _sinhVienService.Search(keyword);
            return Json(students);
        }

        [HttpPost]
        public IActionResult Insert([FromBody] SinhVien model)
        {
            _sinhVienService.Insert(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult Update([FromBody] SinhVien model)
        {
            _sinhVienService.Update(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult Delete(string maSV)
        {
            _sinhVienService.Delete(maSV);
            return Ok();
        }

        [HttpGet]
        public IActionResult GetByLop(string maLop)
        {
            var students = _sinhVienService.GetByLop(maLop);
            return Json(students);
        }

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<SinhVien>? items)
        {
            try
            {
                var results = _sinhVienService.CheckImportDuplicates(items ?? new List<SinhVien>());
                return Json(results);
            }
            catch (Exception ex)
            {
                return ServerError(ex, "Lỗi hệ thống khi kiểm tra danh sách import.");
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicateLopForCreate(string maLop, string tenLop)
        {
            try
            {
                var result = _lopService.CheckDuplicateForCreate(maLop, tenLop);
                return Json(result);
            }
            catch (Exception ex)
            {
                return ServerError(ex, "Lỗi hệ thống khi kiểm tra trùng lớp.");
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicateLopForUpdate(string maLop, string tenLop)
        {
            try
            {
                var result = _lopService.CheckDuplicateForUpdate(maLop, tenLop);
                return Json(result);
            }
            catch (Exception ex)
            {
                return ServerError(ex, "Lỗi hệ thống khi kiểm tra trùng lớp.");
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicateStudentForCreate(string maSV)
        {
            try
            {
                var result = _sinhVienService.CheckDuplicateForCreate(maSV);
                return Json(result);
            }
            catch (Exception ex)
            {
                return ServerError(ex, "Lỗi hệ thống khi kiểm tra trùng sinh viên.");
            }
        }

        private IActionResult ServerError(Exception exception, string message)
        {
            _logger.LogError(exception, message);
            return StatusCode(500, message);
        }
    }
}
