using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class GiaoVienController : BaseController
    {
        private string _connectionString => ConnectionString;

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
        public IActionResult Insert([FromBody] GiaoVien model)
        {
            if (model == null) return BadRequest("Null");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_GiaoVien_Insert", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add("@MaGV", SqlDbType.NVarChar).Value = model.MaGV;
            cmd.Parameters.Add("@Ho", SqlDbType.NVarChar).Value = model.Ho;
            cmd.Parameters.Add("@Ten", SqlDbType.NVarChar).Value = model.Ten;
            cmd.Parameters.Add("@SoDTLL", SqlDbType.NVarChar).Value = model.SoDTLL ?? "";
            cmd.Parameters.Add("@DiaChi", SqlDbType.NVarChar).Value = model.DiaChi ?? "";

            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult Update([FromBody] GiaoVien model)
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

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<GiaoVien> items)
        {
            if (!CheckRole("PGV")) return Denied();
            if (items == null || items.Count == 0)
                return Json(new List<object>());

            try
            {
                var existingIds = GetExistingGiaoVienIds();

                var results = items.Select((item, index) =>
                {
                    var id = item.MaGV?.Trim().ToUpper() ?? string.Empty;
                    return new
                    {
                        index,
                        maGV = item.MaGV?.Trim() ?? string.Empty,
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

        private HashSet<string> GetExistingGiaoVienIds()
        {
            var ids = new HashSet<string>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("SELECT MAGV FROM GIAOVIEN", conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var id = reader["MAGV"].ToString()?.Trim().ToUpper();
                if (!string.IsNullOrEmpty(id))
                {
                    ids.Add(id);
                }
            }
            return ids;
        }
    }
}