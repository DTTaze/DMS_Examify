using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class KetQuaController : BaseController
    {
        private const string RoleSinhvien = "Sinhvien";
        private const string RoleGiangvien = "Giangvien";
        private const string RolePGV = "PGV";

        public IActionResult Index()
        {
            if (!CheckRole(RoleSinhvien, RoleGiangvien, RolePGV)) return Denied();

            ViewData["Title"] = "Xem kết quả thi";
            ViewData["Subtitle"] = "Xem lại bài thi đã làm";

            return View();
        }

        [HttpGet]
        public IActionResult DanhSachBaiThi()
        {
            if (!CheckRole(RoleSinhvien))
                return Json(new { success = false, message = "Không có quyền." });

            var maSV = HttpContext.Session.GetString("UserLogin") ?? "";
            try
            {
                var list = LoadDanhSachBaiThiCuaSV(maSV);
                return Json(new { success = true, data = list });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpGet]
        public IActionResult ChiTietBaiThi(string masv, string mamh, int lan)
        {
            if (!CheckRole(RoleSinhvien, RoleGiangvien, RolePGV))
                return Json(new { success = false, message = "Không có quyền." });

            if (string.IsNullOrWhiteSpace(masv))
                masv = HttpContext.Session.GetString("UserLogin") ?? "";

            if (!IsAuthorizedToViewDetail(masv, mamh, lan))
                return Json(new { success = false, message = "Không có quyền xem bài thi này." });

            try
            {
                var list = LoadChiTietBaiThi(masv, mamh, lan);
                return Json(new { success = true, data = list });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpGet]
        public IActionResult DanhSachDeThi()
        {
            if (!CheckRole(RoleGiangvien, RolePGV))
                return Json(new { success = false, message = "Không có quyền." });

            try
            {
                var maGV = CurrentRole == RolePGV ? null : CurrentTeacherId;
                var list = LoadDanhSachDeThiChoGV(maGV);
                return Json(new { success = true, data = list });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpGet]
        public IActionResult KetQuaSVTheoDeThi(string mamh, string malop, int lan)
        {
            if (!CheckRole(RoleGiangvien, RolePGV))
                return Json(new { success = false, message = "Không có quyền." });

            try
            {
                var list = LoadKetQuaSVTheoDeThi(mamh, malop, lan);
                return Json(new { success = true, data = list });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        private bool IsAuthorizedToViewDetail(string masv, string mamh, int lan)
        {
            if (CurrentRole == RoleSinhvien)
            {
                var currentMaSV = HttpContext.Session.GetString("UserLogin") ?? "";
                return string.Equals(masv.Trim(), currentMaSV.Trim(), StringComparison.OrdinalIgnoreCase);
            }

            return CurrentRole == RolePGV || CurrentRole == RoleGiangvien;
        }

        private List<BaiThiDaLamItem> LoadDanhSachBaiThiCuaSV(string maSV)
        {
            var list = new List<BaiThiDaLamItem>();
            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_LayDanhSachBaiThiCuaSV", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@MASV", SqlDbType.NChar, 8).Value = maSV.Trim();

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new BaiThiDaLamItem
                {
                    MaMH = reader["MAMH"].ToString()?.Trim() ?? "",
                    TenMH = reader["TENMH"].ToString()?.Trim() ?? "",
                    Lan = Convert.ToInt32(reader["LAN"]),
                    NgayThi = Convert.ToDateTime(reader["NGAYTHI"]),
                    Diem = Convert.ToDouble(reader["DIEM"]),
                    MaLop = reader["MALOP"].ToString()?.Trim() ?? "",
                    TenLop = reader["TENLOP"].ToString()?.Trim() ?? "",
                    TrinhDo = reader["TRINHDO"].ToString()?.Trim() ?? "",
                    SoCauThi = Convert.ToInt32(reader["SOCAUTHI"])
                });
            }

            return list;
        }

        private List<ChiTietCauHoiItem> LoadChiTietBaiThi(string maSV, string maMH, int lan)
        {
            var list = new List<ChiTietCauHoiItem>();
            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_LayChiTietBaiThi", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@MASV", SqlDbType.NChar, 8).Value = maSV.Trim();
            cmd.Parameters.Add("@MAMH", SqlDbType.NChar, 5).Value = maMH.Trim();
            cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = lan;

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new ChiTietCauHoiItem
                {
                    STT = Convert.ToInt32(reader["STT"]),
                    CauHoi = Convert.ToInt32(reader["CAUHOI"]),
                    NoiDung = reader["NOIDUNG"].ToString() ?? "",
                    A = reader["A"].ToString() ?? "",
                    B = reader["B"].ToString() ?? "",
                    C = reader["C"].ToString() ?? "",
                    D = reader["D"].ToString() ?? "",
                    CauTraLoi = reader["CAUTRALOI"]?.ToString()?.Trim() ?? "",
                    DapAn = reader["DAP_AN"]?.ToString()?.Trim() ?? ""
                });
            }

            return list;
        }

        private List<DeThiGVItem> LoadDanhSachDeThiChoGV(string? maGV)
        {
            var list = new List<DeThiGVItem>();
            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_LayDanhSachDeThiChoGV", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            if (string.IsNullOrWhiteSpace(maGV))
                cmd.Parameters.Add("@MAGV", SqlDbType.NChar, 8).Value = DBNull.Value;
            else
                cmd.Parameters.Add("@MAGV", SqlDbType.NChar, 8).Value = maGV.Trim();

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new DeThiGVItem
                {
                    MaMH = reader["MAMH"].ToString()?.Trim() ?? "",
                    TenMH = reader["TENMH"].ToString()?.Trim() ?? "",
                    MaLop = reader["MALOP"].ToString()?.Trim() ?? "",
                    TenLop = reader["TENLOP"].ToString()?.Trim() ?? "",
                    Lan = Convert.ToInt32(reader["LAN"]),
                    TrinhDo = reader["TRINHDO"].ToString()?.Trim() ?? "",
                    SoCauThi = Convert.ToInt32(reader["SOCAUTHI"]),
                    ThoiGian = Convert.ToInt32(reader["THOIGIAN"]),
                    NgayThi = Convert.ToDateTime(reader["NGAYTHI"]),
                    MaGV = reader["MAGV"].ToString()?.Trim() ?? "",
                    SoSVDaThi = Convert.ToInt32(reader["SoSVDaThi"])
                });
            }

            return list;
        }

        private List<KetQuaSVItem> LoadKetQuaSVTheoDeThi(string maMH, string maLop, int lan)
        {
            var list = new List<KetQuaSVItem>();
            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_LayKetQuaSVTheoDeThi", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@MAMH", SqlDbType.NChar, 5).Value = maMH.Trim();
            cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = maLop.Trim();
            cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = lan;

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new KetQuaSVItem
                {
                    MaSV = reader["MASV"].ToString()?.Trim() ?? "",
                    Ho = reader["HO"].ToString()?.Trim() ?? "",
                    Ten = reader["TEN"].ToString()?.Trim() ?? "",
                    NgayThi = Convert.ToDateTime(reader["NGAYTHI"]),
                    Diem = Convert.ToDouble(reader["DIEM"])
                });
            }

            return list;
        }
    }
}
