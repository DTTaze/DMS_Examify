using DMS_Examify.Filters;
using DMS_Examify.Models;
using DMS_Examify.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace DMS_Examify.Controllers
{
    [RequireRole("PGV", "Giangvien")]
    public class BangDiemController : BaseController
    {
        private readonly IBangDiemService _bangDiemService;
        private readonly ILogger<BangDiemController> _logger;

        public BangDiemController(
            IBangDiemService bangDiemService,
            ILogger<BangDiemController> logger)
        {
            _bangDiemService = bangDiemService;
            _logger = logger;
        }

        public IActionResult Index()
        {
            ViewData["Title"] = "Bảng điểm môn học";
            ViewData["Subtitle"] = "In bảng điểm thi hết môn";

            try
            {
                var model = new BangDiemViewModel
                {
                    LopList = _bangDiemService.GetClassesWithGrades()
                };

                return View(model);
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi tải màn hình bảng điểm.");
            }
        }

        [HttpGet]
        public IActionResult GetMonHoc(string maLop)
        {
            if (string.IsNullOrWhiteSpace(maLop))
            {
                return Json(new { success = false, data = Array.Empty<object>() });
            }

            try
            {
                var subjects = _bangDiemService.GetSubjectsByClass(maLop);
                var result = subjects.Select(s => new { maMH = s.MaMH, tenMH = s.TenMH });
                return Json(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách môn học theo lớp.");
                return Json(new { success = false, data = Array.Empty<object>() });
            }
        }

        [HttpGet]
        public IActionResult GetLanThi(string maLop, string maMH)
        {
            if (string.IsNullOrWhiteSpace(maLop) || string.IsNullOrWhiteSpace(maMH))
            {
                return Json(new { success = false, data = Array.Empty<int>() });
            }

            try
            {
                var attempts = _bangDiemService.GetAttemptsByClassAndSubject(maLop, maMH);
                return Json(new { success = true, data = attempts });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách lần thi.");
                return Json(new { success = false, data = Array.Empty<int>() });
            }
        }

        [HttpGet]
        public IActionResult XemBangDiem(string maLop, string maMH, int lan)
        {
            if (string.IsNullOrWhiteSpace(maLop) ||
                string.IsNullOrWhiteSpace(maMH) ||
                lan < 1 || lan > 2)
            {
                return Json(new { success = false, message = "Thông tin bộ lọc không hợp lệ." });
            }

            try
            {
                var report = _bangDiemService.GetGradeReport(maLop, maMH, lan);
                return Json(new
                {
                    success = true,
                    tenLop = report.TenLop,
                    tenMH = report.TenMH,
                    lan = report.Lan,
                    danhSach = report.DanhSach.Select(sv => new
                    {
                        stt = sv.STT,
                        maSV = sv.MaSV,
                        ho = sv.Ho,
                        ten = sv.Ten,
                        diem = sv.Diem,
                        diemChu = sv.DiemChu
                    }),
                    tongSo = report.DanhSach.Count
                });
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Lỗi SQL khi lấy bảng điểm.");
                return Json(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return LogAndReturnServerError(_logger, ex, "Lỗi khi lấy bảng điểm môn học.");
            }
        }

        [HttpGet]
        public IActionResult InBangDiem(
            [FromServices] DevExpress.XtraReports.Web.WebDocumentViewer.IWebDocumentViewerClientSideModelGenerator viewerModelGenerator,
            string maLop, string maMH, int lan)
        {
            if (string.IsNullOrWhiteSpace(maLop) ||
                string.IsNullOrWhiteSpace(maMH) ||
                lan < 1 || lan > 2)
            {
                return BadRequest("Thông tin bộ lọc không hợp lệ.");
            }

            try
            {
                var reportData = _bangDiemService.GetGradeReport(maLop, maMH, lan);
                var report = new DMS_Examify.Reports.BangDiemReport();

                // Bind data
                report.DataSource = reportData.DanhSach;

                // Bind parameters
                report.Parameters["TenLop"].Value = reportData.TenLop;
                report.Parameters["TenMH"].Value = reportData.TenMH;
                report.Parameters["Lan"].Value = reportData.Lan;
                report.Parameters["TongSo"].Value = reportData.DanhSach.Count;

                // Create the viewer model using the default URI
                var model = viewerModelGenerator.GetModel(report, DevExpress.AspNetCore.Reporting.WebDocumentViewer.WebDocumentViewerController.DefaultUri);
                return View(model);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi sinh báo cáo bảng điểm.");
                return StatusCode(500, "Đã xảy ra lỗi khi tạo báo cáo.");
            }
        }
    }
}
