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
            return View(_danhSach);
        }

        private readonly IConfiguration _configuration;

        public TaiKhoanController(IConfiguration configuration)
        {
            _configuration = configuration;
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

                string connectionString = _configuration.GetConnectionString("DefaultConnection");

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
                                    return RedirectToAction("Index", "Home");
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
