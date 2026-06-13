using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class SinhVienController : BaseController
    {
        private string _connectionString => ConnectionString;

        public IActionResult Index()
        {
            if (!CheckRole("PGV")) return Denied();

            var dsLop = GetAllLop();
            return View(dsLop);
        }

        private List<Lop> GetAllLop()
        {
            var ds = new List<Lop>();

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_Lop_GetAll", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new Lop
                {
                    MaLop = reader["MALOP"].ToString() ?? "",
                    TenLop = reader["TENLOP"].ToString() ?? ""
                });
            }

            return ds;
        }

        [HttpPost]
        public IActionResult InsertLop([FromBody] Lop model)
        {
            if (!CheckRole("PGV")) return Denied();

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_Lop_Insert", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@MALOP", model.MaLop);
            cmd.Parameters.AddWithValue("@TENLOP", model.TenLop);

            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult UpdateLop([FromBody] Lop model)
        {
            if (!CheckRole("PGV")) return Denied();

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_Lop_Update", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@MALOP", model.MaLop);
            cmd.Parameters.AddWithValue("@TENLOP", model.TenLop);

            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPost]
        public IActionResult DeleteLop(string maLop)
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_Lop_Delete", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@MALOP", maLop);

            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpGet]
        public IActionResult SearchLop(string keyword)
        {
            var ds = new List<Lop>();

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_Lop_Search", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@KEYWORD", (object)keyword ?? DBNull.Value);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new Lop
                {
                    MaLop = reader["MALOP"].ToString() ?? "",
                    TenLop = reader["TENLOP"].ToString() ?? ""
                });
            }

            return Json(ds);
        }

        [HttpGet]
        public IActionResult Search(string keyword)
        {
            var ds = new List<SinhVien>();

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_SinhVien_Search", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@Keyword", (object)keyword ?? DBNull.Value);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new SinhVien
                {
                    MaSV = reader["MaSV"].ToString() ?? "",
                    Ho = reader["Ho"].ToString() ?? "",
                    Ten = reader["Ten"].ToString() ?? "",
                    NgaySinh = reader["NgaySinh"] as DateTime? ?? DateTime.MinValue,
                    DiaChi = reader["DiaChi"].ToString() ?? "",
                    MaLop = reader["MaLop"].ToString() ?? "",
                    MatKhau = reader["MatKhau"].ToString() ?? ""
                });
            }

            return Json(ds);
        }

        [HttpPost]
        public IActionResult Insert([FromBody] SinhVien model)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_SinhVien_Insert", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

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
        public IActionResult Update([FromBody] SinhVien model)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_SinhVien_Update", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

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
            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_SinhVien_Delete", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@MaSV", maSV);

            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpGet]
        public IActionResult GetByLop(string maLop)
        {
            var ds = new List<SinhVien>();

            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_SinhVien_GetByLop", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@MaLop", maLop);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                ds.Add(new SinhVien
                {
                    MaSV = reader["MaSV"].ToString() ?? "",
                    Ho = reader["Ho"].ToString() ?? "",
                    Ten = reader["Ten"].ToString() ?? "",
                    NgaySinh = reader["NgaySinh"] as DateTime? ?? DateTime.MinValue,
                    DiaChi = reader["DiaChi"].ToString() ?? "",
                    MaLop = reader["MaLop"].ToString() ?? "",
                    MatKhau = reader["MATKHAU"].ToString() ?? ""
                });
            }

            return Json(ds);
        }
    }
}