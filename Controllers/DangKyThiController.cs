using DMS_Examify.Models;
using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace DMS_Examify.Controllers
{
    public class DangKyThiController : BaseController
    {
        private readonly IConfiguration _configuration;

        public DangKyThiController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private static List<GiaoVienDangKy> _danhSach = new()
        {
            new GiaoVienDangKy { MaGV = "GV001", MaMH = "MH001", MaLop = "TH2024A", TrinhDo = "B", NgayThi = new DateTime(2026, 4, 1), Lan = 1, SoCauThi = 20, ThoiGian = 45 },
            new GiaoVienDangKy { MaGV = "GV002", MaMH = "MH002", MaLop = "TH2024B", TrinhDo = "A", NgayThi = new DateTime(2026, 4, 3), Lan = 1, SoCauThi = 30, ThoiGian = 60 },
        };

        public IActionResult Index()
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            ViewData["Title"] = "Đăng ký thi";
            ViewData["Subtitle"] = "Lên lịch thi cho lớp";

            List<Microsoft.AspNetCore.Mvc.Rendering.SelectListItem> lops = new List<Microsoft.AspNetCore.Mvc.Rendering.SelectListItem>();
            string connectionString = _configuration.GetConnectionString("DefaultConnection");
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

            ViewBag.Lops = lops;
            ViewBag.MonHocs = monHocs;

            return View(_danhSach);
        }
    }
}
