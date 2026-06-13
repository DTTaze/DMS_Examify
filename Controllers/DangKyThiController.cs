using DMS_Examify.Models;
using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace DMS_Examify.Controllers
{
    public class DangKyThiController : BaseController
    {



        public IActionResult Index()
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            ViewData["Title"] = "Đăng ký thi";
            ViewData["Subtitle"] = "Lên lịch thi cho lớp";

            List<Microsoft.AspNetCore.Mvc.Rendering.SelectListItem> lops = new List<Microsoft.AspNetCore.Mvc.Rendering.SelectListItem>();
            string connectionString = ConnectionString;
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("usp_LayDanhSachLop", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        conn.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                string maLop = reader["MALOP"] != DBNull.Value ? reader["MALOP"].ToString() : "";
                                string tenLop = reader["TENLOP"] != DBNull.Value ? reader["TENLOP"].ToString() : "";
                                if (!string.IsNullOrEmpty(maLop))
                                {
                                    lops.Add(new Microsoft.AspNetCore.Mvc.Rendering.SelectListItem
                                    {
                                        Value = maLop,
                                        Text = $"{maLop} - {tenLop}"
                                    });
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = "Lỗi khi truy xuất danh sách lớp từ Server: " + ex.Message;
            }

            List<Microsoft.AspNetCore.Mvc.Rendering.SelectListItem> monHocs = new List<Microsoft.AspNetCore.Mvc.Rendering.SelectListItem>();
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("usp_LayDanhSachMonHoc", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        conn.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                string maMH = reader["MAMH"] != DBNull.Value ? reader["MAMH"].ToString() : "";
                                string tenMH = reader["TENMH"] != DBNull.Value ? reader["TENMH"].ToString() : "";
                                if (!string.IsNullOrEmpty(maMH))
                                {
                                    monHocs.Add(new Microsoft.AspNetCore.Mvc.Rendering.SelectListItem
                                    {
                                        Value = maMH,
                                        Text = tenMH
                                    });
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = "Lỗi khi truy xuất danh sách môn học từ Server: " + ex.Message;
            }

            List<Microsoft.AspNetCore.Mvc.Rendering.SelectListItem> trinhDos = new List<Microsoft.AspNetCore.Mvc.Rendering.SelectListItem>();
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("usp_LayDanhSachTrinhDo", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        conn.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                string maTrinhDo = reader["MaTrinhDo"] != DBNull.Value ? reader["MaTrinhDo"].ToString() : "";
                                string tenTrinhDo = reader["TenTrinhDo"] != DBNull.Value ? reader["TenTrinhDo"].ToString() : "";
                                if (!string.IsNullOrEmpty(maTrinhDo))
                                {
                                    trinhDos.Add(new Microsoft.AspNetCore.Mvc.Rendering.SelectListItem
                                    {
                                        Value = maTrinhDo,
                                        Text = tenTrinhDo
                                    });
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = (ViewBag.ErrorMessage != null ? ViewBag.ErrorMessage + " | " : "") + "Lỗi khi truy xuất danh sách trình độ từ Server: " + ex.Message;
            }

            ViewBag.Lops = lops;
            ViewBag.MonHocs = monHocs;
            ViewBag.TrinhDos = trinhDos;

            List<GiaoVienDangKy> danhSach = new List<GiaoVienDangKy>();
            var maGV = HttpContext.Session.GetString("UserLogin");

            if (!string.IsNullOrEmpty(maGV))
            {
                try
                {
                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        using (SqlCommand cmd = new SqlCommand("usp_LayDanhSachDeThi", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@MaGV", maGV);
                            conn.Open();
                            using (SqlDataReader reader = cmd.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    danhSach.Add(new GiaoVienDangKy
                                    {
                                        MaMH = reader["MAMH"]?.ToString() ?? "",
                                        MaLop = reader["MALOP"]?.ToString() ?? "",
                                        TrinhDo = reader["TRINHDO"]?.ToString() ?? "",
                                        NgayThi = reader["NGAYTHI"] != DBNull.Value ? Convert.ToDateTime(reader["NGAYTHI"]) : DateTime.MinValue,
                                        Lan = reader["LAN"] != DBNull.Value ? Convert.ToInt32(reader["LAN"]) : 1,
                                        SoCauThi = reader["SOCAUTHI"] != DBNull.Value ? Convert.ToInt32(reader["SOCAUTHI"]) : 0,
                                        ThoiGian = reader["THOIGIAN"] != DBNull.Value ? Convert.ToInt32(reader["THOIGIAN"]) : 0
                                    });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    ViewBag.ErrorMessage = (ViewBag.ErrorMessage != null ? ViewBag.ErrorMessage + " | " : "") + "Lỗi khi tải danh sách đã đăng ký: " + ex.Message;
                }
            }

            return View(danhSach);
        }

        [HttpPost]
        public IActionResult DangKy([FromBody] GiaoVienDangKy model)
        {
            if (!CheckRole("PGV", "Giangvien"))
            {
                return Json(new { success = false, message = "Không có quyền thực hiện chức năng này." });
            }

            var maGV = HttpContext.Session.GetString("UserLogin");
            if (string.IsNullOrEmpty(maGV))
            {
                return Json(new { success = false, message = "Hết phiên đăng nhập." });
            }

            // Gán mã GV đăng nhập vào model
            model.MaGV = maGV;

            if (model.NgayThi.Date < DateTime.Now.Date)
            {
                return Json(new { success = false, message = "Ngày thi không hợp lệ, không được chọn ngày trong quá khứ." });
            }

            string connectionString = ConnectionString;
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("usp_ThucHienDangKyThi", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        
                        cmd.Parameters.AddWithValue("@MAGV", model.MaGV);
                        cmd.Parameters.AddWithValue("@MALOP", model.MaLop);
                        cmd.Parameters.AddWithValue("@MAMH", model.MaMH);
                        cmd.Parameters.AddWithValue("@TRINHDO", model.TrinhDo);
                        cmd.Parameters.AddWithValue("@LAN", model.Lan);
                        cmd.Parameters.AddWithValue("@SOCAUTHI", model.SoCauThi);
                        cmd.Parameters.AddWithValue("@THOIGIAN", model.ThoiGian);
                        cmd.Parameters.AddWithValue("@NGAYTHI", model.NgayThi);

                        conn.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                bool isSuccess = reader["IsSuccess"] != DBNull.Value && Convert.ToBoolean(reader["IsSuccess"]);
                                string message = reader["ThongBao"] != DBNull.Value ? reader["ThongBao"].ToString() : "";
                                
                                return Json(new { success = isSuccess, message = message });
                            }
                            else
                            {
                                return Json(new { success = false, message = "Không nhận được phản hồi từ server." });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpGet]
        public IActionResult GetSoCauHoi(string maMH, string trinhDo)
        {
            if (string.IsNullOrEmpty(maMH) || string.IsNullOrEmpty(trinhDo))
                return Json(new { success = false, soCau = 0 });

            int soCau = 0;
            string connectionString = ConnectionString;
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string query = "SELECT dbo.udf_DemSoCauTrongBoDe(@MAMH, @TRINHDO)";
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@MAMH", maMH);
                        cmd.Parameters.AddWithValue("@TRINHDO", trinhDo);
                        
                        object result = cmd.ExecuteScalar();
                        if (result != null && result != DBNull.Value)
                        {
                            soCau = Convert.ToInt32(result);
                        }
                    }
                }
                return Json(new { success = true, soCau = soCau });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
