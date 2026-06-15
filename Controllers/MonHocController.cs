using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
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

            var danhSachMonHoc = GetActiveMonHocList();
            return View(danhSachMonHoc);
        }

        [HttpPost]
        public IActionResult Insert([FromBody] MonHoc model)
        {
            if (!CheckRole("PGV")) return Denied();
            if (model == null)
                return BadRequest("Dữ liệu môn học gửi lên không hợp lệ.");
            if (string.IsNullOrWhiteSpace(model.MaMH))
                return BadRequest("Mã môn học không được để trống.");
            if (string.IsNullOrWhiteSpace(model.TenMH))
                return BadRequest("Tên môn học không được để trống.");

            try
            {
                ExecuteInsert(model);
                return Ok();
            }
            catch (SqlException ex)
            {
                return StatusCode(500, $"Lỗi cơ sở dữ liệu: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult Update([FromBody] MonHoc model)
        {
            if (!CheckRole("PGV")) return Denied();
            if (model == null)
                return BadRequest("Dữ liệu môn học gửi lên không hợp lệ.");
            if (string.IsNullOrWhiteSpace(model.MaMH))
                return BadRequest("Mã môn học không được để trống.");
            if (string.IsNullOrWhiteSpace(model.TenMH))
                return BadRequest("Tên môn học không được để trống.");

            try
            {
                ExecuteUpdate(model);
                return Ok();
            }
            catch (SqlException ex)
            {
                return StatusCode(500, $"Lỗi cơ sở dữ liệu: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult Delete(string maMH)
        {
            if (!CheckRole("PGV")) return Denied();
            if (string.IsNullOrEmpty(maMH)) return BadRequest("Mã môn học không hợp lệ.");

            try
            {
                ExecuteDelete(maMH);
                return Ok();
            }
            catch (SqlException ex)
            {
                return StatusCode(500, $"Lỗi cơ sở dữ liệu: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult Search(string keyword)
        {
            if (!CheckRole("PGV")) return Denied();

            try
            {
                var danhSachTimKiem = ExecuteSearch(keyword);
                return Json(danhSachTimKiem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi tìm kiếm: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult CheckDuplicate(string maMH, string tenMH, bool isEditing)
        {
            if (!CheckRole("PGV")) return Denied();

            bool maMHDuplicate = false;
            bool maMHActive = false;
            bool tenMHDuplicate = false;
            bool tenMHActive = false;

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    connection.Open();

                    // 1. Kiểm tra trùng MaMH khi thêm mới (không phải sửa)
                    if (!isEditing && !string.IsNullOrWhiteSpace(maMH))
                    {
                        using (var command = new SqlCommand("SELECT TrangThai FROM MONHOC WHERE MaMH = @MaMH", connection))
                        {
                            command.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = maMH.Trim();
                            using (var reader = command.ExecuteReader())
                            {
                                if (reader.Read())
                                {
                                    maMHDuplicate = true;
                                    maMHActive = Convert.ToBoolean(reader["TrangThai"]);
                                }
                            }
                        }
                    }

                    // 2. Kiểm tra trùng TenMH
                    if (!string.IsNullOrWhiteSpace(tenMH))
                    {
                        // Nếu đang sửa, ta không trùng với chính môn học hiện tại (lọc theo MaMH)
                        string query = isEditing 
                            ? "SELECT TrangThai FROM MONHOC WHERE TenMH = @TenMH AND MaMH <> @MaMH"
                            : "SELECT TrangThai FROM MONHOC WHERE TenMH = @TenMH";

                        using (var command = new SqlCommand(query, connection))
                        {
                            command.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40).Value = tenMH.Trim();
                            if (isEditing)
                            {
                                command.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = maMH.Trim();
                            }

                            using (var reader = command.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    tenMHDuplicate = true;
                                    if (Convert.ToBoolean(reader["TrangThai"]))
                                    {
                                        tenMHActive = true;
                                    }
                                }
                            }
                        }
                    }
                }

                return Json(new
                {
                    maMHDuplicate,
                    maMHActive,
                    tenMHDuplicate,
                    tenMHActive
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống khi kiểm tra trùng: {ex.Message}");
            }
        }

        #region Database Operations (Data Access Helpers)

        private List<MonHoc> GetActiveMonHocList()
        {
            var danhSachMonHoc = new List<MonHoc>();

            using var connection = new SqlConnection(_connectionString);
            connection.Open();

            using var command = new SqlCommand("dbo.usp_MonHoc_GetAll", connection) 
            { 
                CommandType = CommandType.StoredProcedure 
            };

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                danhSachMonHoc.Add(new MonHoc
                {
                    MaMH = reader["MaMH"].ToString()?.Trim() ?? string.Empty,
                    TenMH = reader["TenMH"].ToString()?.Trim() ?? string.Empty
                });
            }

            return danhSachMonHoc;
        }

        private void ExecuteInsert(MonHoc model)
        {
            using var connection = new SqlConnection(_connectionString);
            connection.Open();

            using var command = new SqlCommand("dbo.usp_MonHoc_Insert", connection) 
            { 
                CommandType = CommandType.StoredProcedure 
            };

            var maMhParameter = command.Parameters.Add("@MaMH", SqlDbType.NChar, 5);
            maMhParameter.Value = model.MaMH.Trim();

            var tenMhParameter = command.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40);
            tenMhParameter.Value = model.TenMH.Trim();

            command.ExecuteNonQuery();
        }

        private void ExecuteUpdate(MonHoc model)
        {
            using var connection = new SqlConnection(_connectionString);
            connection.Open();

            using var command = new SqlCommand("dbo.usp_MonHoc_Update", connection) 
            { 
                CommandType = CommandType.StoredProcedure 
            };

            var maMhParameter = command.Parameters.Add("@MaMH", SqlDbType.NChar, 5);
            maMhParameter.Value = model.MaMH.Trim();

            var tenMhParameter = command.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40);
            tenMhParameter.Value = model.TenMH.Trim();

            command.ExecuteNonQuery();
        }

        private void ExecuteDelete(string maMH)
        {
            using var connection = new SqlConnection(_connectionString);
            connection.Open();

            using var command = new SqlCommand("dbo.usp_MonHoc_Delete", connection) 
            { 
                CommandType = CommandType.StoredProcedure 
            };

            var maMhParameter = command.Parameters.Add("@MaMH", SqlDbType.NChar, 5);
            maMhParameter.Value = maMH.Trim();

            command.ExecuteNonQuery();
        }

        private List<MonHoc> ExecuteSearch(string keyword)
        {
            var danhSachMonHoc = new List<MonHoc>();

            using var connection = new SqlConnection(_connectionString);
            connection.Open();

            using var command = new SqlCommand("dbo.usp_MonHoc_Search", connection) 
            { 
                CommandType = CommandType.StoredProcedure 
            };

            var keywordParameter = command.Parameters.Add("@Keyword", SqlDbType.NVarChar, 250);
            keywordParameter.Value = string.IsNullOrEmpty(keyword) ? DBNull.Value : keyword.Trim();

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                danhSachMonHoc.Add(new MonHoc
                {
                    MaMH = reader["MaMH"].ToString()?.Trim() ?? string.Empty,
                    TenMH = reader["TenMH"].ToString()?.Trim() ?? string.Empty
                });
            }

            return danhSachMonHoc;
        }

        #endregion
    }
}
