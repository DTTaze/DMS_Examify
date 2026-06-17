using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class SinhVienController : BaseController
    {
        private readonly ISinhVienService _sinhVienService;
        private readonly ILopService _lopService;

        public SinhVienController(ISinhVienService sinhVienService, ILopService lopService)
        {
            _sinhVienService = sinhVienService;
            _lopService = lopService;
        }

        public IActionResult Index()
        {
            if (!CheckRole("PGV")) return Denied();

            var classes = _lopService.GetAll();
            return View(classes);
        }

        [HttpPost]
        public IActionResult InsertLop([FromBody] Lop model)
        {
            if (!CheckRole("PGV")) return Denied();

            _lopService.Insert(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult UpdateLop([FromBody] Lop model)
        {
            if (!CheckRole("PGV")) return Denied();

            _lopService.Update(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult DeleteLop(string maLop)
        {
            if (!CheckRole("PGV")) return Denied();

            _lopService.Delete(maLop);
            return Ok();
        }

        [HttpGet]
        public IActionResult SearchLop(string keyword)
        {
            if (!CheckRole("PGV")) return Denied();

            var classes = _lopService.Search(keyword);
            return Json(classes);
        }

        [HttpGet]
        public IActionResult Search(string keyword)
        {
            if (!CheckRole("PGV")) return Denied();

            var students = _sinhVienService.Search(keyword);
            return Json(students);
        }

        [HttpPost]
        public IActionResult Insert([FromBody] SinhVien model)
        {
            if (!CheckRole("PGV")) return Denied();

            _sinhVienService.Insert(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult Update([FromBody] SinhVien model)
        {
            if (!CheckRole("PGV")) return Denied();

            _sinhVienService.Update(model);
            return Ok();
        }

        [HttpPost]
        public IActionResult Delete(string maSV)
        {
            if (!CheckRole("PGV")) return Denied();

            _sinhVienService.Delete(maSV);
            return Ok();
        }

        [HttpGet]
        public IActionResult GetByLop(string maLop)
        {
            if (!CheckRole("PGV")) return Denied();

            var students = _sinhVienService.GetByLop(maLop);
            return Json(students);
        }

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<SinhVien> items)
        {
            if (!CheckRole("PGV")) return Denied();
            if (items == null || items.Count == 0)
                return Json(new List<object>());

            try
            {
                var existingIds = _sinhVienService.GetExistingStudentIds();

                var results = items.Select((item, index) =>
                {
                    var id = item.MaSV?.Trim().ToUpper() ?? string.Empty;
                    return new
                    {
                        index,
                        maSV = item.MaSV?.Trim() ?? string.Empty,
                        ho = item.Ho?.Trim() ?? string.Empty,
                        ten = item.Ten?.Trim() ?? string.Empty,
                        idDuplicate = existingIds.Contains(id)
                    };
                });

                return Json(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi kiểm tra danh sách import: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicateLop(string maLop, string tenLop, bool isEditing)
        {
            if (!CheckRole("PGV")) return Denied();

            try
            {
                bool maLopDuplicate = false;
                if (!isEditing)
                {
                    maLopDuplicate = _lopService.ExistsMaLop(maLop);
                }

                bool tenLopDuplicate = false;
                if (isEditing)
                {
                    tenLopDuplicate = _lopService.ExistsTenLopExcludingMaLop(tenLop, maLop);
                }
                else
                {
                    tenLopDuplicate = _lopService.ExistsTenLop(tenLop);
                }

                return Json(new
                {
                    maLopDuplicate,
                    tenLopDuplicate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi kiểm tra trùng lớp: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicateStudent(string maSV, bool isEditing)
        {
            if (!CheckRole("PGV")) return Denied();

            try
            {
                bool maSVDuplicate = false;
                if (!isEditing)
                {
                    maSVDuplicate = _sinhVienService.ExistsMaSV(maSV);
                }

                return Json(new
                {
                    maSVDuplicate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi kiểm tra trùng sinh viên: {ex.Message}");
            }
        }
    }
}
