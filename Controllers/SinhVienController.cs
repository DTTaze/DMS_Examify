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

        [HttpPost]
        public IActionResult CheckImport([FromBody] List<SinhVien> items)
        {
            if (!CheckRole("PGV")) return Denied();
            if (items == null || items.Count == 0)
                return Json(new List<object>());

            try
            {
                var existingIds = GetExistingStudentIds();

                var results = items.Select((item, index) =>
                {
                    var id = item.MaSV?.Trim().ToUpper() ?? string.Empty;
                    return new
                    {
                        index,
                        maSV = item.MaSV?.Trim() ?? string.Empty,
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

        private HashSet<string> GetExistingStudentIds()
        {
            var ids = new HashSet<string>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("SELECT MASV FROM SINHVIEN", conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var id = reader["MASV"].ToString()?.Trim().ToUpper();
                if (!string.IsNullOrEmpty(id))
                {
                    ids.Add(id);
                }
            }
            return ids;
        }

        [HttpGet]
        public IActionResult CheckDuplicateLop(string maLop, string tenLop, bool isEditing)
        {
            if (!CheckRole("PGV")) return Denied();

            bool maLopDuplicate = false;
            bool tenLopDuplicate = false;

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    connection.Open();

                    // 1. Check duplicate MaLop when adding
                    if (!isEditing && !string.IsNullOrWhiteSpace(maLop))
                    {
                        using (var command = new SqlCommand("SELECT COUNT(1) FROM LOP WHERE MALOP = @MALOP", connection))
                        {
                            command.Parameters.Add("@MALOP", SqlDbType.NChar, 15).Value = maLop.Trim();
                            maLopDuplicate = (int)command.ExecuteScalar() > 0;
                        }
                    }

                    // 2. Check duplicate TenLop
                    if (!string.IsNullOrWhiteSpace(tenLop))
                    {
                        string query = isEditing
                            ? "SELECT COUNT(1) FROM LOP WHERE TENLOP = @TENLOP AND MALOP <> @MALOP"
                            : "SELECT COUNT(1) FROM LOP WHERE TENLOP = @TENLOP";

                        using (var command = new SqlCommand(query, connection))
                        {
                            command.Parameters.Add("@TENLOP", SqlDbType.NVarChar, 50).Value = tenLop.Trim();
                            if (isEditing)
                            {
                                command.Parameters.Add("@MALOP", SqlDbType.NChar, 15).Value = maLop.Trim();
                            }
                            tenLopDuplicate = (int)command.ExecuteScalar() > 0;
                        }
                    }
                }

                return Json(new
                {
                    maLopDuplicate,
                    tenLopDuplicate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi kiểm tra trùng lớp: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicateStudent(string maSV, bool isEditing)
        {
            if (!CheckRole("PGV")) return Denied();

            bool maSVDuplicate = false;

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    connection.Open();

                    // Check duplicate MaSV when adding
                    if (!isEditing && !string.IsNullOrWhiteSpace(maSV))
                    {
                        using (var command = new SqlCommand("SELECT COUNT(1) FROM SINHVIEN WHERE MASV = @MASV", connection))
                        {
                            command.Parameters.Add("@MASV", SqlDbType.NChar, 8).Value = maSV.Trim();
                            maSVDuplicate = (int)command.ExecuteScalar() > 0;
                        }
                    }
                }

                return Json(new
                {
                    maSVDuplicate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi kiểm tra trùng sinh viên: {ex.Message}");
            }
        }
    }
}