using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class GiaoVienController : BaseController
    {
        private readonly string _connectionString;

        public GiaoVienController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        public IActionResult Index()
        {
            if (!CheckRole("PGV")) return Denied();
            ViewData["Title"] = "Quản lý Giáo viên";
            ViewData["Subtitle"] = "Thêm, sửa, xóa giáo viên";
            return View(GetAllGiaoVien());
        }

        private List<GiaoVien> GetAllGiaoVien()
        {
            var ds = new List<GiaoVien>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_GiaoVien_GetAll", conn) { CommandType = CommandType.StoredProcedure };
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new GiaoVien
                {
                    MaGV = reader["MaGV"].ToString() ?? string.Empty,
                    Ho = reader["Ho"].ToString() ?? string.Empty,
                    Ten = reader["Ten"].ToString() ?? string.Empty,
                    SoDTLL = reader["SoDTLL"].ToString() ?? string.Empty,
                    DiaChi = reader["DiaChi"].ToString() ?? string.Empty
                });
            }
            return ds;
        }

        [HttpPost]
        public IActionResult Insert(GiaoVien model)
        {
            if (!CheckRole("PGV")) return Denied();
            if (model == null || string.IsNullOrEmpty(model.MaGV) || string.IsNullOrEmpty(model.Ho) || string.IsNullOrEmpty(model.Ten))
                return BadRequest("Thông tin giáo viên chưa đầy đủ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_GiaoVien_Insert", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@MaGV", model.MaGV);
            cmd.Parameters.AddWithValue("@Ho", model.Ho);
            cmd.Parameters.AddWithValue("@Ten", model.Ten);
            cmd.Parameters.AddWithValue("@SoDTLL", model.SoDTLL);
            cmd.Parameters.AddWithValue("@DiaChi", model.DiaChi);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult Update(GiaoVien model)
        {
            if (!CheckRole("PGV")) return Denied();
            if (model == null || string.IsNullOrEmpty(model.MaGV))
                return BadRequest("Thông tin giáo viên chưa đầy đủ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_GiaoVien_Update", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@MaGV", model.MaGV);
            cmd.Parameters.AddWithValue("@Ho", model.Ho);
            cmd.Parameters.AddWithValue("@Ten", model.Ten);
            cmd.Parameters.AddWithValue("@SoDTLL", model.SoDTLL);
            cmd.Parameters.AddWithValue("@DiaChi", model.DiaChi);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult Delete(string maGV)
        {
            if (!CheckRole("PGV")) return Denied();
            if (string.IsNullOrEmpty(maGV)) return BadRequest("Mã giáo viên không hợp lệ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_GiaoVien_Delete", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@MaGV", maGV);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpGet]
        public IActionResult Search(string keyword)
        {
            if (!CheckRole("PGV")) return Denied();
            var ds = new List<GiaoVien>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_GiaoVien_Search", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@Keyword", (object)keyword ?? DBNull.Value);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new GiaoVien
                {
                    MaGV = reader["MaGV"].ToString() ?? string.Empty,
                    Ho = reader["Ho"].ToString() ?? string.Empty,
                    Ten = reader["Ten"].ToString() ?? string.Empty,
                    SoDTLL = reader["SoDTLL"].ToString() ?? string.Empty,
                    DiaChi = reader["DiaChi"].ToString() ?? string.Empty
                });
            }
            return Json(ds);
        }
    }
}