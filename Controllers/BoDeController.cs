using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class BoDeController : BaseController
    {
        private readonly IBoDeService _boDeService;
        private readonly IMonHocService _monHocService;

        public BoDeController(IBoDeService boDeService, IMonHocService monHocService)
        {
            _boDeService = boDeService;
            _monHocService = monHocService;
        }

        public IActionResult Index()
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();

            ViewBag.Title = "Nhập câu hỏi thi";
            ViewBag.Subtitle = "Quản lý bộ đề trắc nghiệm";

            string maGV = HttpContext.Session.GetString("UserLogin") ?? string.Empty;
            string role = HttpContext.Session.GetString("UserRole") ?? string.Empty;

            var viewModel = new BoDeViewModel
            {
                BoDes = _boDeService.GetAll(role, maGV),
                MonHocList = _monHocService.GetAll()
            };

            return View(viewModel);
        }

        [HttpPost]
        public IActionResult Insert([FromBody] BoDe model)
        {
            string maGV = HttpContext.Session.GetString("UserLogin") ?? string.Empty;
            var cauHoi = _boDeService.Insert(model, maGV);
            return Json(new { cauHoi });
        }

        [HttpPost]
        public IActionResult Update([FromBody] BoDe model)
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            if (model == null || model.CauHoi <= 0 || string.IsNullOrEmpty(model.MaMH))
                return BadRequest("Thông tin câu hỏi không hợp lệ.");

            string maGV = HttpContext.Session.GetString("UserLogin") ?? string.Empty;
            _boDeService.Update(model, maGV);
            return Ok();
        }

        [HttpPost]
        public IActionResult Delete(int cauHoi, string maMH)
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            if (cauHoi <= 0 || string.IsNullOrEmpty(maMH))
                return BadRequest("Thông tin câu hỏi không hợp lệ.");

            _boDeService.Delete(cauHoi, maMH);
            return Ok();
        }

        [HttpGet]
        public IActionResult Search(string keyword)
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();

            var questions = _boDeService.Search(keyword);
            return Json(questions);
        }

        [HttpGet]
        public IActionResult GetLatestCauHoi()
        {
            var max = _boDeService.GetLatestCauHoi();
            return Json(max);
        }

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<BoDe> items)
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            if (items == null || items.Count == 0)
                return Json(new List<object>());

            try
            {
                var existingSubjects = _monHocService.GetAll();
                var existingSubjectCodes = existingSubjects.Select(s => s.MaMH.Trim().ToUpper()).ToHashSet();

                var results = items.Select((item, index) =>
                {
                    var code = item.MaMH?.Trim().ToUpper() ?? string.Empty;
                    var subjectExists = existingSubjectCodes.Contains(code);
                    return new
                    {
                        index,
                        maMH = item.MaMH?.Trim() ?? string.Empty,
                        noiDung = item.NoiDung?.Trim() ?? string.Empty,
                        subjectExists = subjectExists
                    };
                });

                return Json(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi kiểm tra danh sách import: {ex.Message}");
            }
        }
    }
}
