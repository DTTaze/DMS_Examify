using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class BoDeController : BaseController
    {
        private readonly string _connectionString;

        public BoDeController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        public IActionResult Index()
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            ViewData["Title"] = "Nhập câu hỏi thi";
            ViewData["Subtitle"] = "Quản lý bộ đề trắc nghiệm";
            return View(GetAllBoDe());
        }

        private List<BoDe> GetAllBoDe()
        {
            var ds = new List<BoDe>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_BoDe_GetAll", conn) { CommandType = CommandType.StoredProcedure };
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new BoDe
                {
                    CauHoi = reader["CauHoi"] as int? ?? 0,
                    MaMH = reader["MaMH"].ToString() ?? string.Empty,
                    TrinhDo = reader["TrinhDo"].ToString() ?? string.Empty,
                    NoiDung = reader["NoiDung"].ToString() ?? string.Empty,
                    DapAnA = reader["DapAnA"].ToString() ?? string.Empty,
                    DapAnB = reader["DapAnB"].ToString() ?? string.Empty,
                    DapAnC = reader["DapAnC"].ToString() ?? string.Empty,
                    DapAnD = reader["DapAnD"].ToString() ?? string.Empty,
                    DapAn = reader["DapAn"].ToString() ?? string.Empty,
                    MaGV = reader["MaGV"].ToString() ?? string.Empty
                });
            }
            return ds;
        }

        [HttpPost]
        public IActionResult Insert(BoDe model)
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            if (model == null || model.CauHoi <= 0 || string.IsNullOrEmpty(model.MaMH))
                return BadRequest("Thông tin câu hỏi không hợp lệ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_BoDe_Insert", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@CauHoi", model.CauHoi);
            cmd.Parameters.AddWithValue("@MaMH", model.MaMH);
            cmd.Parameters.AddWithValue("@TrinhDo", model.TrinhDo);
            cmd.Parameters.AddWithValue("@NoiDung", model.NoiDung);
            cmd.Parameters.AddWithValue("@DapAnA", model.DapAnA);
            cmd.Parameters.AddWithValue("@DapAnB", model.DapAnB);
            cmd.Parameters.AddWithValue("@DapAnC", model.DapAnC);
            cmd.Parameters.AddWithValue("@DapAnD", model.DapAnD);
            cmd.Parameters.AddWithValue("@DapAn", model.DapAn);
            cmd.Parameters.AddWithValue("@MaGV", model.MaGV);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult Update(BoDe model)
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
            cmd.Parameters.AddWithValue("@MaGV", model.MaGV);
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
            using var cmd = new SqlCommand("dbo.usp_BoDe_Search", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@Keyword", (object)keyword ?? DBNull.Value);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new BoDe
                {
                    CauHoi = reader["CauHoi"] as int? ?? 0,
                    MaMH = reader["MaMH"].ToString() ?? string.Empty,
                    TrinhDo = reader["TrinhDo"].ToString() ?? string.Empty,
                    NoiDung = reader["NoiDung"].ToString() ?? string.Empty,
                    DapAnA = reader["DapAnA"].ToString() ?? string.Empty,
                    DapAnB = reader["DapAnB"].ToString() ?? string.Empty,
                    DapAnC = reader["DapAnC"].ToString() ?? string.Empty,
                    DapAnD = reader["DapAnD"].ToString() ?? string.Empty,
                    DapAn = reader["DapAn"].ToString() ?? string.Empty,
                    MaGV = reader["MaGV"].ToString() ?? string.Empty
                });
            }
            return Json(ds);
        }
    }
}
