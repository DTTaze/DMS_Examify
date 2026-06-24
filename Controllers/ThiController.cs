using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Controllers
{
    public class ThiController : BaseController
    {
        private const string SessionKeyMaLop = "MaLop";
        private const string StudentRole = "Sinhvien";

        public IActionResult Index()
        {
            if (!CheckRole("Sinhvien", "Giangvien")) return Denied();

            var maSV = HttpContext.Session.GetString("UserLogin") ?? "";
            var hoTen = HttpContext.Session.GetString("UserName") ?? "";
            var maLop = HttpContext.Session.GetString(SessionKeyMaLop) ?? "";

            var tenLop = LoadTenLop(maLop);
            var danhSachMH = LoadDanhSachMonThi(maLop);

            var model = new ThiChonViewModel
            {
                MaSV = maSV,
                HoTen = hoTen,
                MaLop = maLop,
                TenLop = tenLop,
                DanhSachMH = danhSachMH
            };

            return View(model);
        }

        [HttpPost]
        public IActionResult BatDauThi([FromBody] BatDauThiRequest request)
        {
            if (!CheckRole(StudentRole))
                return Json(new { success = false, message = "Chi sinh vien moi duoc bat dau thi." });

            var maSV = HttpContext.Session.GetString("UserLogin") ?? "";
            if (!IsValidExamRequest(request.MaMH, request.Lan))
                return Json(new { success = false, message = "Thong tin de thi khong hop le." });

            try
            {
                var activeExam = LoadPhienThiDangMo(maSV);
                if (activeExam.CoPhienThi)
                {
                    var redirectUrl = Url.Action(nameof(LamBai), new { mamh = activeExam.MaMH, lan = activeExam.Lan }) ?? "";
                    var isSameExam = IsSameExam(activeExam.MaMH, activeExam.Lan, request.MaMH, request.Lan);

                    return Json(new
                    {
                        success = isSameExam,
                        message = isSameExam
                            ? "Tiep tuc phien thi dang mo."
                            : "Ban dang co phien thi khac chua nop.",
                        redirectUrl
                    });
                }

                var result = ExecuteExamProcedure("dbo.usp_BatDauThi", cmd =>
                {
                    AddNChar(cmd, "@MASV", maSV, 8);
                    AddNChar(cmd, "@MAMH", request.MaMH, 5);
                    cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = request.Lan;
                });

                return Json(new
                {
                    success = result.IsSuccess,
                    message = result.ThongBao,
                    redirectUrl = result.IsSuccess
                        ? Url.Action(nameof(LamBai), new { mamh = request.MaMH, lan = request.Lan })
                        : null
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Loi he thong: " + ex.Message });
            }
        }

        public IActionResult LamBai(string mamh, int lan)
        {
            if (!CheckRole(StudentRole)) return Denied();
            ViewData["Title"] = "Lam bai thi";

            if (!IsValidExamRequest(mamh, lan))
            {
                TempData["ErrorMessage"] = "Thong tin de thi khong hop le.";
                return RedirectToAction(nameof(Index));
            }

            var maSV = HttpContext.Session.GetString("UserLogin") ?? "";
            try
            {
                var activeExam = LoadPhienThiDangMo(maSV);
                if (!activeExam.CoPhienThi)
                {
                    TempData["ErrorMessage"] = "Khong tim thay phien thi dang mo. Hay bat dau thi tu man hinh chon de.";
                    return RedirectToAction(nameof(Index));
                }

                if (!IsSameExam(activeExam.MaMH, activeExam.Lan, mamh, lan))
                {
                    TempData["ErrorMessage"] = "Ban dang co phien thi khac chua nop. He thong da dua ban ve phien thi dang mo.";
                    return RedirectToAction(nameof(LamBai), new { mamh = activeExam.MaMH, lan = activeExam.Lan });
                }

                var model = LoadBaiThiDangLam(maSV, mamh, lan);
                if (model == null || model.DanhSachCauHoi.Count == 0)
                {
                    TempData["ErrorMessage"] = "Khong tai duoc noi dung bai thi hoac da het thoi gian lam bai.";
                    return RedirectToAction(nameof(Index));
                }

                model.MaSV = maSV;
                model.HoTen = HttpContext.Session.GetString("UserName") ?? "";
                return View(model);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = "Loi he thong: " + ex.Message;
                return RedirectToAction(nameof(Index));
            }
        }

        [HttpPost]
        public IActionResult TraLoiCauHoi([FromBody] TraLoiCauHoiRequest request)
        {
            if (!CheckRole(StudentRole))
                return Json(new { success = false, message = "Khong co quyen." });

            if (!IsValidExamRequest(request.MaMH, request.Lan) || !IsValidAnswer(request.CauTraLoi))
                return Json(new { success = false, message = "Du lieu cau tra loi khong hop le." });

            var maSV = HttpContext.Session.GetString("UserLogin") ?? "";
            try
            {
                var result = ExecuteExamProcedure("dbo.usp_TraLoiCauHoi", cmd =>
                {
                    AddNChar(cmd, "@MASV", maSV, 8);
                    AddNChar(cmd, "@MAMH", request.MaMH, 5);
                    cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = request.Lan;
                    cmd.Parameters.Add("@CAUHOI", SqlDbType.Int).Value = request.CauHoi;
                    cmd.Parameters.Add("@CAUTRALOI", SqlDbType.Char, 1).Value = request.CauTraLoi.Trim().ToUpperInvariant();
                });

                return Json(new { success = result.IsSuccess, message = result.ThongBao });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Loi he thong: " + ex.Message });
            }
        }

        [HttpPost]
        public IActionResult NopBaiThi([FromBody] NopBaiThiRequest request)
        {
            if (!CheckRole(StudentRole))
                return Json(new { success = false, message = "Khong co quyen." });

            if (!IsValidExamRequest(request.MaMH, request.Lan))
                return Json(new { success = false, message = "Thong tin de thi khong hop le." });

            var maSV = HttpContext.Session.GetString("UserLogin") ?? "";
            try
            {
                var result = ExecuteExamProcedure("dbo.usp_NopBaiThi", cmd =>
                {
                    AddNChar(cmd, "@MASV", maSV, 8);
                    AddNChar(cmd, "@MAMH", request.MaMH, 5);
                    cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = request.Lan;
                });

                return Json(new
                {
                    success = result.IsSuccess,
                    message = result.ThongBao,
                    soCauDung = result.SoCauDung,
                    tongSoCau = result.TongSoCau,
                    diem = result.Diem,
                    redirectUrl = result.IsSuccess
                        ? Url.Action("Index", "KetQua", new { mamh = request.MaMH, lan = request.Lan })
                        : null
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Loi he thong: " + ex.Message });
            }
        }

        private string LoadTenLop(string maLop)
        {
            if (string.IsNullOrWhiteSpace(maLop)) return "";

            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_LayTenLopByMaLop", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            AddNChar(cmd, "@MALOP", maLop, 8);

            var result = cmd.ExecuteScalar();
            return result?.ToString()?.Trim() ?? "";
        }

        private List<MonHoc> LoadDanhSachMonThi(string maLop)
        {
            var list = new List<MonHoc>();
            if (string.IsNullOrWhiteSpace(maLop)) return list;

            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_LayDanhSachMonThiChoSV", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            AddNChar(cmd, "@MALOP", maLop, 8);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new MonHoc
                {
                    MaMH = reader["MAMH"].ToString()?.Trim() ?? "",
                    TenMH = reader["TENMH"].ToString()?.Trim() ?? ""
                });
            }

            return list;
        }

        [HttpGet]
        public IActionResult LayThongTinDeThi(string mamh, int lan)
        {
            if (!CheckRole("Sinhvien", "Giangvien"))
                return Json(new { found = false, message = "Khong co quyen." });

            var maLop = HttpContext.Session.GetString(SessionKeyMaLop) ?? "";

            try
            {
                using var conn = new SqlConnection(ConnectionString);
                conn.Open();

                using var cmd = new SqlCommand("dbo.usp_LayThongTinDeThiChoSV", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };
                AddNChar(cmd, "@MALOP", maLop, 8);
                AddNChar(cmd, "@MAMH", mamh, 5);
                cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = lan;

                using var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    return Json(new
                    {
                        found = true,
                        soCauThi = Convert.ToInt32(reader["SOCAUTHI"]),
                        thoiGian = Convert.ToInt32(reader["THOIGIAN"]),
                        trinhDo = reader["TRINHDO"].ToString()?.Trim() ?? ""
                    });
                }

                return Json(new { found = false, message = "Khong tim thay de thi cho lan thi nay." });
            }
            catch (Exception ex)
            {
                return Json(new { found = false, message = ex.Message });
            }
        }

        private ThiLamBaiViewModel? LoadBaiThiDangLam(string maSV, string maMH, int lan)
        {
            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_LayBaiThiDangLam", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            AddNChar(cmd, "@MASV", maSV, 8);
            AddNChar(cmd, "@MAMH", maMH, 5);
            cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = lan;

            using var reader = cmd.ExecuteReader();
            ThiLamBaiViewModel? model = null;
            while (reader.Read())
            {
                model ??= new ThiLamBaiViewModel
                {
                    MaMH = reader["MAMH"].ToString()?.Trim() ?? "",
                    TenMH = reader["TENMH"].ToString()?.Trim() ?? "",
                    Lan = Convert.ToInt32(reader["LAN"]),
                    ThoiGian = Convert.ToInt32(reader["THOIGIAN"]),
                    ThoiGianConLaiGiay = Math.Max(0, Convert.ToInt32(reader["ThoiGianConLaiGiay"])),
                    TrinhDo = reader["TRINHDO"].ToString()?.Trim() ?? "",
                    NgayThi = Convert.ToDateTime(reader["NGAYTHI"])
                };

                model.DanhSachCauHoi.Add(new CauHoiThi
                {
                    STT = Convert.ToInt32(reader["STT"]),
                    CauHoi = Convert.ToInt32(reader["CAUHOI"]),
                    NoiDung = reader["NOIDUNG"].ToString() ?? "",
                    DapAnA = reader["A"].ToString() ?? "",
                    DapAnB = reader["B"].ToString() ?? "",
                    DapAnC = reader["C"].ToString() ?? "",
                    DapAnD = reader["D"].ToString() ?? "",
                    TraLoiSV = reader["CAUTRALOI"]?.ToString()?.Trim() ?? ""
                });
            }

            return model;
        }

        private ActiveExamInfo LoadPhienThiDangMo(string maSV)
        {
            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_KiemTraPhienThi", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            AddNChar(cmd, "@MASV", maSV, 8);

            using var reader = cmd.ExecuteReader();
            do
            {
                if (!ReaderHasColumn(reader, "CoPhienThi") || !reader.Read())
                    continue;

                return new ActiveExamInfo
                {
                    CoPhienThi = reader["CoPhienThi"] != DBNull.Value && Convert.ToBoolean(reader["CoPhienThi"]),
                    MaMH = reader["MAMH"]?.ToString()?.Trim() ?? "",
                    Lan = reader["LAN"] == DBNull.Value ? 0 : Convert.ToInt32(reader["LAN"]),
                    ThoiGianConLai = reader["ThoiGianConLai"] == DBNull.Value ? 0 : Convert.ToInt32(reader["ThoiGianConLai"])
                };
            }
            while (reader.NextResult());

            return new ActiveExamInfo();
        }

        private ExamProcedureResult ExecuteExamProcedure(string procedureName, Action<SqlCommand> addParameters)
        {
            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand(procedureName, conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            addParameters(cmd);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
            {
                return new ExamProcedureResult(false, "Khong nhan duoc phan hoi tu server.");
            }

            var result = new ExamProcedureResult(
                reader["IsSuccess"] != DBNull.Value && Convert.ToBoolean(reader["IsSuccess"]),
                reader["ThongBao"]?.ToString() ?? "");

            if (ReaderHasColumn(reader, "SoCauDung") && reader["SoCauDung"] != DBNull.Value)
                result.SoCauDung = Convert.ToInt32(reader["SoCauDung"]);
            if (ReaderHasColumn(reader, "TongSoCau") && reader["TongSoCau"] != DBNull.Value)
                result.TongSoCau = Convert.ToInt32(reader["TongSoCau"]);
            if (ReaderHasColumn(reader, "Diem") && reader["Diem"] != DBNull.Value)
                result.Diem = Convert.ToDouble(reader["Diem"]);

            return result;
        }

        private static bool IsValidExamRequest(string maMH, int lan)
            => !string.IsNullOrWhiteSpace(maMH) && lan is >= 1 and <= 2;

        private static bool IsValidAnswer(string answer)
            => new[] { "A", "B", "C", "D" }.Contains((answer ?? "").Trim().ToUpperInvariant());

        private static bool IsSameExam(string currentMaMH, int currentLan, string requestedMaMH, int requestedLan)
            => string.Equals(currentMaMH.Trim(), requestedMaMH.Trim(), StringComparison.OrdinalIgnoreCase)
               && currentLan == requestedLan;

        private static void AddNChar(SqlCommand cmd, string name, string value, int size)
            => cmd.Parameters.Add(name, SqlDbType.NChar, size).Value = value.Trim();

        private static bool ReaderHasColumn(SqlDataReader reader, string columnName)
        {
            for (var i = 0; i < reader.FieldCount; i++)
            {
                if (string.Equals(reader.GetName(i), columnName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }

        private class ActiveExamInfo
        {
            public bool CoPhienThi { get; set; }
            public string MaMH { get; set; } = "";
            public int Lan { get; set; }
            public int ThoiGianConLai { get; set; }
        }

        private class ExamProcedureResult
        {
            public ExamProcedureResult(bool isSuccess, string thongBao)
            {
                IsSuccess = isSuccess;
                ThongBao = thongBao;
            }

            public bool IsSuccess { get; }
            public string ThongBao { get; }
            public int SoCauDung { get; set; }
            public int TongSoCau { get; set; }
            public double Diem { get; set; }
        }
    }
}
