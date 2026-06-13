using DMS_Examify.Models;
using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace DMS_Examify.Controllers
{
    public class TaiKhoanController : BaseController
    {
        private static List<TaiKhoan> _danhSach = new()
        {
            new TaiKhoan { LoginName = "admin", Password = "****", NhomQuyen = "PGV", HoTen = "Admin" },
            new TaiKhoan { LoginName = "gv_tuan", Password = "****", NhomQuyen = "Giangvien", HoTen = "Trần Minh Tuấn" },
            new TaiKhoan { LoginName = "gv_hoa", Password = "****", NhomQuyen = "Giangvien", HoTen = "Nguyễn Thị Hoa" },
            new TaiKhoan { LoginName = "sv", Password = "****", NhomQuyen = "Sinhvien", HoTen = "Tài khoản SV chung" },
        };

        public IActionResult Index()
        {
            if (!CheckRole("PGV")) return Denied();
            ViewData["Title"] = "Tài khoản & Phân quyền";
            ViewData["Subtitle"] = "Tạo tài khoản và quản lý quyền hạn";

            List<Microsoft.AspNetCore.Mvc.Rendering.SelectListItem> roles = new List<Microsoft.AspNetCore.Mvc.Rendering.SelectListItem>();
            string connectionString = ConnectionString;
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("usp_LayDanhSachQuyen_TaoTaiKhoan", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        conn.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                string roleValue = reader["TenNhomQuyen"] != DBNull.Value ? reader["TenNhomQuyen"].ToString() : "";
                                if (!string.IsNullOrEmpty(roleValue))
                                {
                                    string roleText = roleValue;
                                    if (roleValue == "PGV") roleText = "PGV (Phòng giáo vụ - Toàn quyền)";
                                    else if (roleValue == "Giangvien") roleText = "Giảng viên";
                                    
                                    roles.Add(new Microsoft.AspNetCore.Mvc.Rendering.SelectListItem
                                    {
                                        Value = roleValue,
                                        Text = roleText,
                                        Selected = (roleValue == "Giangvien")
                                    });
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = "Lỗi khi truy xuất danh sách quyền từ Server: " + ex.Message;
            }

            ViewBag.Roles = roles;

            return View(_danhSach);
        }



        [HttpGet]
        public IActionResult GetGiaoVienInfo(string magv)
        {
            if (!CheckRole("PGV")) return Json(new { success = false, message = "Bạn không có quyền thực hiện thao tác này." });
            if (string.IsNullOrEmpty(magv)) return Json(new { success = false, message = "Mã GV không được để trống" });

            string connectionString = ConnectionString;
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    // LƯU Ý: Thay đổi tên SP_LayThongTinGiaoVien theo đúng tên SP trong database của bạn
                    using (SqlCommand cmd = new SqlCommand("usp_LayThongTinGiaoVienTheoMa", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@MAGV", magv);
                        
                        conn.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                string magvResult = reader["MAGV"] != DBNull.Value ? reader["MAGV"].ToString() : "";
                                string ho = reader["HO"] != DBNull.Value ? reader["HO"].ToString() : "";
                                string ten = reader["TEN"] != DBNull.Value ? reader["TEN"].ToString() : "";
                                string sodtll = reader["SODTLL"] != DBNull.Value ? reader["SODTLL"].ToString() : "";
                                string diachi = reader["DIACHI"] != DBNull.Value ? reader["DIACHI"].ToString() : "";
                                
                                string hoTen = $"{ho} {ten}".Trim();

                                return Json(new { 
                                    success = true, 
                                    magv = magvResult,
                                    fullName = hoTen,
                                    sodtll = sodtll,
                                    diachi = diachi
                                });
                            }
                            else
                            {
                                return Json(new { success = false, message = "Không tìm thấy thông tin giáo viên với mã này." });
                            }
                        }
                    }
                }
            }
            catch (SqlException ex)
            {
                // Bắt lỗi đỏ từ RAISERROR trong SP trả về
                return Json(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpGet]
        public IActionResult Create(){
            if (!CheckRole("PGV")) return Denied();

            return View(new TaoTaiKhoanViewModel());
        } 

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(TaoTaiKhoanViewModel model)
        {
            // Chặn ở vòng POST
            if (!CheckRole("PGV"))
            {
                return Denied();
            }

            if (ModelState.IsValid)
            {
                // Ràng buộc bảo vệ cấp ứng dụng: Chỉ tạo PGV hoặc Giangvien
                if (model.Role != "PGV" && model.Role != "Giangvien")
                {
                    ModelState.AddModelError("Role", "Chỉ được phép tạo tài khoản cho Giảng viên hoặc PGV.");
                    return View(model);
                }

                string connectionString = ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("SP_TAOTAIKHOAN", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        // Truyền tham số Input
                        cmd.Parameters.AddWithValue("@LGNAME", model.LoginName);
                        cmd.Parameters.AddWithValue("@PASS", model.Password);
                        cmd.Parameters.AddWithValue("@USERNAME", model.MaGV);
                        cmd.Parameters.AddWithValue("@ROLE", model.Role);

                        // Khai báo tham số Output để nhận giá trị RETURN từ SP
                        SqlParameter returnParameter = cmd.Parameters.Add("@ReturnVal", SqlDbType.Int);
                        returnParameter.Direction = ParameterDirection.ReturnValue;

                        try
                        {
                            conn.Open();
                            cmd.ExecuteNonQuery();

                            // Lấy giá trị trả về từ biến @ReturnVal
                            int result = (int)returnParameter.Value;

                            // Xử lý logic theo mã lỗi trả về từ SP của bạn
                            switch (result)
                            {
                                case 0:
                                    TempData["SuccessMessage"] = "Tạo tài khoản thành công!";
                                    return RedirectToAction("Index");
                                case 1:
                                    ModelState.AddModelError("LoginName", "Tên đăng nhập (Login name) đã tồn tại trên Server.");
                                    break;
                                case 2:
                                    ModelState.AddModelError("MaGV", "Giáo viên này đã được cấp tài khoản trong hệ thống.");
                                    break;
                                case 3:
                                    ModelState.AddModelError(string.Empty, "Lỗi hệ thống trong quá trình thực thi (Có thể do lỗi phân quyền cấp Server).");
                                    break;
                                default:
                                    ModelState.AddModelError(string.Empty, "Lỗi không xác định.");
                                    break;
                            }
                        }
                        catch (SqlException ex)
                        {
                            ModelState.AddModelError(string.Empty, "Lỗi Database: " + ex.Message);
                        }
                    }
                }
            }

            // Nếu có lỗi, hiển thị lại Form với các thông báo lỗi
            return View(model);
        }
    }
}
