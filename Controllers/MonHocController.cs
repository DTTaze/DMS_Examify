using DMS_Examify.Filters;
using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace DMS_Examify.Controllers
{
    [RequireRole("PGV")]
    public class MonHocController : BaseController
    {
        private readonly IMonHocService _monHocService;

        public MonHocController(IMonHocService monHocService)
        {
            _monHocService = monHocService;
        }

        public IActionResult Index()
        {
            ViewData["Title"] = "Quản lý Môn học";
            ViewData["Subtitle"] = "Thêm, sửa, xóa môn học";

            var subjects = _monHocService.GetAll();
            return View(subjects);
        }

        [HttpPost]
        public IActionResult Insert([FromBody] MonHoc model)
        {
            if (model == null)
                return BadRequest("Dữ liệu môn học gửi lên không hợp lệ.");
            if (string.IsNullOrWhiteSpace(model.MaMH))
                return BadRequest("Mã môn học không được để trống.");
            if (string.IsNullOrWhiteSpace(model.TenMH))
                return BadRequest("Tên môn học không được để trống.");

            try
            {
                _monHocService.Insert(model);
                return Ok();
            }
            catch (SqlException ex)
            {
                return StatusCode(500, $"Lỗi cơ sở dữ liệu: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult Update([FromBody] MonHoc model)
        {
            if (model == null)
                return BadRequest("Dữ liệu môn học gửi lên không hợp lệ.");
            if (string.IsNullOrWhiteSpace(model.MaMH))
                return BadRequest("Mã môn học không được để trống.");
            if (string.IsNullOrWhiteSpace(model.TenMH))
                return BadRequest("Tên môn học không được để trống.");

            try
            {
                _monHocService.Update(model);
                return Ok();
            }
            catch (SqlException ex)
            {
                return StatusCode(500, $"Lỗi cơ sở dữ liệu: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult Delete(string maMH)
        {
            if (string.IsNullOrEmpty(maMH)) return BadRequest("Mã môn học không hợp lệ.");

            try
            {
                _monHocService.Delete(maMH);
                return Ok();
            }
            catch (SqlException ex)
            {
                return StatusCode(500, $"Lỗi cơ sở dữ liệu: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult Search(string keyword)
        {
            try
            {
                var subjects = _monHocService.Search(keyword);
                return Json(subjects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi tìm kiếm: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicate(string maMH, string tenMH, bool isEditing)
        {
            try
            {
                bool maMHDuplicate = false;
                bool maMHActive = false;
                if (!isEditing)
                {
                    var maCheck = _monHocService.CheckMaMHDuplicate(maMH);
                    maMHDuplicate = maCheck.Exists;
                    maMHActive = maCheck.IsActive;
                }

                bool tenMHDuplicate = false;
                bool tenMHActive = false;
                if (isEditing)
                {
                    var tenCheck = _monHocService.CheckTenMHDuplicateExcludingMaMH(tenMH, maMH);
                    tenMHDuplicate = tenCheck.Exists;
                    tenMHActive = tenCheck.IsActive;
                }
                else
                {
                    var tenCheck = _monHocService.CheckTenMHDuplicate(tenMH);
                    tenMHDuplicate = tenCheck.Exists;
                    tenMHActive = tenCheck.IsActive;
                }

                return Json(new
                {
                    maMHDuplicate,
                    maMHActive,
                    tenMHDuplicate,
                    tenMHActive
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi kiểm tra trùng: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<MonHoc> items)
        {
            if (items == null || items.Count == 0)
                return Json(new List<object>());

            try
            {
                var validationResults = ValidateImportDuplicates(items);
                return Json(validationResults);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi kiểm tra danh sách import: {ex.Message}");
            }
        }

        private IEnumerable<object> ValidateImportDuplicates(List<MonHoc> items)
        {
            var activeSubjects = _monHocService.GetAll();
            var activeCodes = activeSubjects.Select(s => s.MaMH.Trim().ToUpper()).ToHashSet();
            var activeNames = activeSubjects.Select(s => s.TenMH.Trim().ToLower()).ToHashSet();

            return items.Select((item, index) =>
            {
                var code = item.MaMH?.Trim().ToUpper() ?? string.Empty;
                var name = item.TenMH?.Trim().ToLower() ?? string.Empty;

                return new
                {
                    index,
                    maMH = item.MaMH?.Trim() ?? string.Empty,
                    tenMH = item.TenMH?.Trim() ?? string.Empty,
                    codeDuplicate = activeCodes.Contains(code),
                    nameDuplicate = activeNames.Contains(name)
                };
            });
        }
    }
}
