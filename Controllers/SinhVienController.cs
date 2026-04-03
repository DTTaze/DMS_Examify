using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class SinhVienController : BaseController
    {
        private readonly string _connectionString;

        public SinhVienController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        public IActionResult Index()
        {
            if (!CheckRole("PGV")) return Denied();
            ViewData["Title"] = "Quản lý Sinh viên";
            ViewData["Subtitle"] = "Nhập lớp và sinh viên";
            return View(GetLopVaSinhVien());
        }

        private List<Lop> GetLopVaSinhVien()
        {
            var svList = new List<SinhVien>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_GetAll", conn) { CommandType = CommandType.StoredProcedure };
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                svList.Add(new SinhVien
                {
                    MaSV = reader["MaSV"].ToString() ?? string.Empty,
                    Ho = reader["Ho"].ToString() ?? string.Empty,
                    Ten = reader["Ten"].ToString() ?? string.Empty,
                    NgaySinh = reader["NgaySinh"] as DateTime? ?? DateTime.MinValue,
                    DiaChi = reader["DiaChi"].ToString() ?? string.Empty,
                    MaLop = reader["MaLop"].ToString() ?? string.Empty,
                    MatKhau = reader["MatKhau"].ToString() ?? string.Empty
                });
            }

            return svList
                .GroupBy(x => x.MaLop)
                .Select(g => new Lop
                {
                    MaLop = g.Key,
                    TenLop = g.Key,
                    DanhSachSV = g.ToList()
                })
                .ToList();
        }

        [HttpPost]
        public IActionResult Insert(SinhVien model)
        {
            if (!CheckRole("PGV")) return Denied();
            if (model == null || string.IsNullOrEmpty(model.MaSV) || string.IsNullOrEmpty(model.Ho) || string.IsNullOrEmpty(model.Ten))
                return BadRequest("Thông tin sinh viên chưa đầy đủ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_Insert", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@MaSV", model.MaSV);
            cmd.Parameters.AddWithValue("@Ho", model.Ho);
            cmd.Parameters.AddWithValue("@Ten", model.Ten);
            cmd.Parameters.AddWithValue("@NgaySinh", model.NgaySinh);
            cmd.Parameters.AddWithValue("@DiaChi", model.DiaChi);
            cmd.Parameters.AddWithValue("@MaLop", model.MaLop);
            cmd.Parameters.AddWithValue("@MatKhau", model.MatKhau);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult Update(SinhVien model)
        {
            if (!CheckRole("PGV")) return Denied();
            if (model == null || string.IsNullOrEmpty(model.MaSV))
                return BadRequest("Thông tin sinh viên chưa đầy đủ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_Update", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@MaSV", model.MaSV);
            cmd.Parameters.AddWithValue("@Ho", model.Ho);
            cmd.Parameters.AddWithValue("@Ten", model.Ten);
            cmd.Parameters.AddWithValue("@NgaySinh", model.NgaySinh);
            cmd.Parameters.AddWithValue("@DiaChi", model.DiaChi);
            cmd.Parameters.AddWithValue("@MaLop", model.MaLop);
            cmd.Parameters.AddWithValue("@MatKhau", model.MatKhau);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult Delete(string maSV)
        {
            if (!CheckRole("PGV")) return Denied();
            if (string.IsNullOrEmpty(maSV)) return BadRequest("Mã sinh viên không hợp lệ.");

            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_Delete", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@MaSV", maSV);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpGet]
        public IActionResult Search(string keyword)
        {
            if (!CheckRole("PGV")) return Denied();
            var ds = new List<SinhVien>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_Search", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@Keyword", (object)keyword ?? DBNull.Value);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new SinhVien
                {
                    MaSV = reader["MaSV"].ToString() ?? string.Empty,
                    Ho = reader["Ho"].ToString() ?? string.Empty,
                    Ten = reader["Ten"].ToString() ?? string.Empty,
                    NgaySinh = reader["NgaySinh"] as DateTime? ?? DateTime.MinValue,
                    DiaChi = reader["DiaChi"].ToString() ?? string.Empty,
                    MaLop = reader["MaLop"].ToString() ?? string.Empty,
                    MatKhau = reader["MatKhau"].ToString() ?? string.Empty
                });
            }
            return Json(ds);
        }
    }
}
