using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class MonHocController : BaseController
    {
        private string _connectionString => ConnectionString;

        public IActionResult Index()
        {
            if (!CheckRole("PGV")) return Denied();
            ViewData["Title"] = "Quản lý Môn học";
            ViewData["Subtitle"] = "Thêm, sửa, xóa môn học";
            return View(GetAllMonHoc());
        }

        public List<MonHoc> GetAllMonHoc()
        {
            var ds = new List<MonHoc>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_MonHoc_GetAll", conn) { CommandType = CommandType.StoredProcedure };
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new MonHoc
                {
                    MaMH = reader["MaMH"].ToString() ?? string.Empty,
                    TenMH = reader["TenMH"].ToString() ?? string.Empty
                });
            }
            return ds;
        }

        [HttpPost]
        public IActionResult Insert([FromBody] MonHoc model)
        {
            if (!CheckRole("PGV")) return Denied();
            if (model == null || string.IsNullOrEmpty(model.MaMH) || string.IsNullOrEmpty(model.TenMH))
                return BadRequest("Thông tin môn học chưa đầy đủ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_MonHoc_Insert", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@MaMH", model.MaMH);
            cmd.Parameters.AddWithValue("@TenMH", model.TenMH);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult Update([FromBody] MonHoc model)
        {
            if (!CheckRole("PGV")) return Denied();
            if (model == null || string.IsNullOrEmpty(model.MaMH) || string.IsNullOrEmpty(model.TenMH))
                return BadRequest("Thông tin môn học chưa đầy đủ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_MonHoc_Update", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@MaMH", model.MaMH);
            cmd.Parameters.AddWithValue("@TenMH", model.TenMH);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult Delete(string maMH)
        {
            if (!CheckRole("PGV")) return Denied();
            if (string.IsNullOrEmpty(maMH)) return BadRequest("Mã môn học không hợp lệ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_MonHoc_Delete", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@MaMH", maMH);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpGet]
        public IActionResult Search(string keyword)
        {
            if (!CheckRole("PGV")) return Denied();
            var ds = new List<MonHoc>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_MonHoc_Search", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@Keyword", (object)keyword ?? DBNull.Value);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new MonHoc
                {
                    MaMH = reader["MaMH"].ToString() ?? string.Empty,
                    TenMH = reader["TenMH"].ToString() ?? string.Empty
                });
            }
            return Json(ds);
        }
    }
}