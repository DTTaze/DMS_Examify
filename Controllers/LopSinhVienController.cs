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

        public IActionResult Index()
        {
            var classes = _lopService.GetAll();
            return View(classes);
        }

        [HttpPost]
        public IActionResult CreateClass([FromBody] Lop model)
        {
            _lopService.Insert(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult UpdateClass([FromBody] Lop model)
        {
            _lopService.Update(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult DeleteClass(string maLop)
        {
            _lopService.Delete(maLop);
            return Ok();
        }

        [HttpGet]
        public IActionResult SearchClasses(string keyword)
        {
            var classes = _lopService.Search(keyword);
            return Json(classes);
        }

        [HttpGet]
        public IActionResult SearchStudents(string keyword)
        {
            var students = _sinhVienService.Search(keyword);
            return Json(students);
        }

        [HttpPost]
        public IActionResult CreateStudent([FromBody] SinhVien model)
        {
            _sinhVienService.Insert(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult UpdateStudent([FromBody] SinhVien model)
        {
            _sinhVienService.Update(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult DeleteStudent(string maSV)
        {
            _sinhVienService.Delete(maSV);
            return Ok();
        }

        [HttpGet]
        public IActionResult GetStudentsByClass(string maLop)
        {
            var students = _sinhVienService.GetByLop(maLop);
            return Json(students);
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
                return LogAndReturnServerError(ex, "System error while checking student import.");
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
                return LogAndReturnServerError(ex, "System error while checking class duplicates.");
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
                return LogAndReturnServerError(ex, "System error while checking class duplicates.");
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
                return LogAndReturnServerError(ex, "System error while checking student duplicates.");
            }
        }

        private IActionResult LogAndReturnServerError(Exception exception, string message)
        {
            _logger.LogError(exception, message);
            return StatusCode(500, message);
        }
    }
}
