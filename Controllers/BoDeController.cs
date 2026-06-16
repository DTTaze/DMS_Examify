using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class BoDeController : BaseController
    {
        private string _connectionString => ConnectionString;

        public IActionResult Index()
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();

            ViewBag.Title = "Nhập câu hỏi thi";
            ViewBag.Subtitle = "Quản lý bộ đề trắc nghiệm";

            var vm = new BoDeViewModel
            {
                BoDes = GetAllBoDe(),
                MonHocList = GetMonHocList()
            };

            return View(vm);
        }

        private List<BoDe> GetAllBoDe()
        {
            var ds = new List<BoDe>();
            string maGV = HttpContext.Session.GetString("UserLogin") ?? string.Empty;
            string role = HttpContext.Session.GetString("UserRole") ?? string.Empty;

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_GetCauHoiByGiangVien", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            if (role == "PGV")
            {
                cmd.Parameters.AddWithValue("@MAGV", DBNull.Value);
            }
            else
            {
                cmd.Parameters.AddWithValue("@MAGV", maGV);
            }

            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                ds.Add(new BoDe
                {
                    CauHoi = reader["CAUHOI"] as int? ?? 0,
                    MaMH = reader["MAMH"]?.ToString() ?? string.Empty,
                    TrinhDo = reader["TRINHDO"]?.ToString() ?? string.Empty,
                    NoiDung = reader["NOIDUNG"]?.ToString() ?? string.Empty,
                    DapAnA = reader["A"]?.ToString() ?? string.Empty,
                    DapAnB = reader["B"]?.ToString() ?? string.Empty,
                    DapAnC = reader["C"]?.ToString() ?? string.Empty,
                    DapAnD = reader["D"]?.ToString() ?? string.Empty,
                    DapAn = reader["DAP_AN"]?.ToString() ?? string.Empty,
                    MaGV = reader["MAGV"]?.ToString() ?? string.Empty
                });
            }

            return ds;
        }

        [HttpPost]
        public IActionResult Insert([FromBody] BoDe model)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();


            using var cmd = new SqlCommand("usp_BoDe_Insert", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@MaMH", model.MaMH);
            cmd.Parameters.AddWithValue("@TrinhDo", model.TrinhDo);
            cmd.Parameters.AddWithValue("@NoiDung", model.NoiDung);
            cmd.Parameters.AddWithValue("@DapAnA", model.DapAnA);
            cmd.Parameters.AddWithValue("@DapAnB", model.DapAnB);
            cmd.Parameters.AddWithValue("@DapAnC", model.DapAnC);
            cmd.Parameters.AddWithValue("@DapAnD", model.DapAnD);
            cmd.Parameters.AddWithValue("@DapAn", model.DapAn);
            cmd.Parameters.AddWithValue("@MaGV", HttpContext.Session.GetString("UserLogin")); // Dùng UserLogin = MAGV

            var cauHoi = Convert.ToInt32(cmd.ExecuteScalar());

            return Json(new { cauHoi });
        }

        [HttpPost]
        public IActionResult Update([FromBody] BoDe model)
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            if (model == null || model.CauHoi <= 0 || string.IsNullOrEmpty(model.MaMH))
                return BadRequest("Thông tin câu hỏi không hợp lệ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_BoDe_Update", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@CauHoi", model.CauHoi);
            cmd.Parameters.AddWithValue("@MaMH", model.MaMH);
            cmd.Parameters.AddWithValue("@TrinhDo", model.TrinhDo);
            cmd.Parameters.AddWithValue("@NoiDung", model.NoiDung);
            cmd.Parameters.AddWithValue("@DapAnA", model.DapAnA);
            cmd.Parameters.AddWithValue("@DapAnB", model.DapAnB);
            cmd.Parameters.AddWithValue("@DapAnC", model.DapAnC);
            cmd.Parameters.AddWithValue("@DapAnD", model.DapAnD);
            cmd.Parameters.AddWithValue("@DapAn", model.DapAn);
            cmd.Parameters.AddWithValue("@MaGV", HttpContext.Session.GetString("UserLogin")); // Dùng UserLogin = MAGV
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult Delete(int cauHoi, string maMH)
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            if (cauHoi <= 0 || string.IsNullOrEmpty(maMH))
                return BadRequest("Thông tin câu hỏi không hợp lệ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_BoDe_Delete", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@CauHoi", cauHoi);
            cmd.Parameters.AddWithValue("@MaMH", maMH);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpGet]
        public IActionResult Search(string keyword)
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();

            var ds = new List<BoDe>();

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_BoDe_Search", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.Add("@Keyword", SqlDbType.NVarChar, 500)
                .Value = string.IsNullOrWhiteSpace(keyword) ? DBNull.Value : keyword;

            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                ds.Add(new BoDe
                {
                    CauHoi = reader.GetInt32(reader.GetOrdinal("CAUHOI")),

                    MaMH = reader["MAMH"]?.ToString()?.Trim() ?? "",
                    TrinhDo = reader["TRINHDO"]?.ToString()?.Trim() ?? "",
                    NoiDung = reader["NOIDUNG"]?.ToString() ?? "",

                    DapAnA = reader["A"]?.ToString() ?? "",
                    DapAnB = reader["B"]?.ToString() ?? "",
                    DapAnC = reader["C"]?.ToString() ?? "",
                    DapAnD = reader["D"]?.ToString() ?? "",

                    DapAn = reader["DAP_AN"]?.ToString()?.Trim() ?? "",
                    MaGV = reader["MAGV"]?.ToString()?.Trim() ?? ""
                });
            }

            return Json(ds);
        }

        private List<MonHoc> GetMonHocList()
        {
            var list = new List<MonHoc>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("usp_MonHoc_GetAll", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                list.Add(new MonHoc
                {
                    MaMH = reader["MAMH"]?.ToString() ?? string.Empty,
                    TenMH = reader["TENMH"]?.ToString() ?? string.Empty
                });
            }

            return list;
        }

        [HttpGet]
        public IActionResult GetLatestCauHoi()
        {
            int max = 0;

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("usp_BoDe_GetLatestCauHoi", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            var result = cmd.ExecuteScalar();
            max = result != null ? Convert.ToInt32(result) : 0;

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
                var existingSubjectCodes = GetExistingSubjectCodes();

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

        private HashSet<string> GetExistingSubjectCodes()
        {
            var codes = new HashSet<string>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("SELECT MAMH FROM MONHOC", conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var code = reader["MAMH"].ToString()?.Trim().ToUpper();
                if (!string.IsNullOrEmpty(code))
                {
                    codes.Add(code);
                }
            }
            return codes;
        }
    }
}
