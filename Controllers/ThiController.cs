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
        private const string LecturerRole = "Giangvien";
        private const string GvUserIdPrefix = "GV_";

        public IActionResult Index()
        {
            if (!CheckRole(StudentRole, LecturerRole)) return Denied();

            var isGV = IsLecturer;
            var userLogin = HttpContext.Session.GetString("UserLogin") ?? "";
            var hoTen = HttpContext.Session.GetString("UserName") ?? "";

            var model = new ThiChonViewModel
            {
                MaSV = userLogin,
                HoTen = hoTen,
                IsGiangVien = isGV
            };

            if (isGV)
            {
                model.DanhSachLop = LoadDanhSachLopChoGV(userLogin);
            }
            else
            {
                var maLop = HttpContext.Session.GetString(SessionKeyMaLop) ?? "";
                model.MaLop = maLop;
                model.TenLop = LoadTenLop(maLop);
                model.DanhSachMH = LoadDanhSachMonThi(maLop);
            }

            return View(model);
        }

        [HttpGet]
        public IActionResult LayDanhSachMonThiChoGV(string maLop)
        {
            if (!CheckRole(LecturerRole))
                return Json(new { success = false, message = "Khong co quyen." });

            if (string.IsNullOrWhiteSpace(maLop))
                return Json(new { success = false, message = "Vui long chon lop." });

            var userLogin = HttpContext.Session.GetString("UserLogin") ?? "";
            var list = LoadDanhSachMonThiChoGV(userLogin, maLop);

            return Json(new
            {
                success = true,
                data = list.Select(m => new { maMH = m.MaMH.Trim(), tenMH = m.TenMH.Trim() })
            });
        }

        [HttpPost]
        public IActionResult BatDauThi([FromBody] BatDauThiRequest request)
        {
            if (!CheckRole(StudentRole, LecturerRole))
                return Json(new { success = false, message = "Khong co quyen bat dau thi." });

            if (!IsValidExamRequest(request.MaMH, request.Lan))
                return Json(new { success = false, message = "Thong tin de thi khong hop le." });

            try
            {
                var userId = GetExamUserId();

                var activeExam = LoadPhienThiDangMo(userId);
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

                ExamProcedureResult result;

                if (IsLecturer)
                {
                    result = ExecuteExamProcedure("dbo.usp_BatDauThiThu", cmd =>
                    {
                        AddNChar(cmd, "@MAGV", CurrentTeacherId, 8);
                        AddNChar(cmd, "@MAMH", request.MaMH, 5);
                        AddNChar(cmd, "@MALOP", request.MaLop, 8);
                        cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = request.Lan;
                    });
                }
                else
                {
                    var maSV = HttpContext.Session.GetString("UserLogin") ?? "";
                    result = ExecuteExamProcedure("dbo.usp_BatDauThi", cmd =>
                    {
                        AddNChar(cmd, "@MASV", maSV, 8);
                        AddNChar(cmd, "@MAMH", request.MaMH, 5);
                        cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = request.Lan;
                    });
                }

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
            if (!CheckRole(StudentRole, LecturerRole)) return Denied();
            ViewData["Title"] = IsLecturer ? "Thi thu" : "Lam bai thi";

            if (!IsValidExamRequest(mamh, lan))
            {
                TempData["ErrorMessage"] = "Thong tin de thi khong hop le.";
                return RedirectToAction(nameof(Index));
            }

            var userId = GetExamUserId();
            try
            {
                var activeExam = LoadPhienThiDangMo(userId);
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

                var model = LoadBaiThiDangLam(userId, mamh, lan);
                if (model == null || model.DanhSachCauHoi.Count == 0)
                {
                    TempData["ErrorMessage"] = "Khong tai duoc noi dung bai thi hoac da het thoi gian lam bai.";
                    return RedirectToAction(nameof(Index));
                }

                model.MaSV = userId;
                model.HoTen = HttpContext.Session.GetString("UserName") ?? "";
                model.IsThiThu = IsLecturer;
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
            if (!CheckRole(StudentRole, LecturerRole))
                return Json(new { success = false, message = "Khong co quyen." });

            if (!IsValidExamRequest(request.MaMH, request.Lan) || !IsValidAnswer(request.CauTraLoi))
                return Json(new { success = false, message = "Du lieu cau tra loi khong hop le." });

            var userId = GetExamUserId();
            try
            {
                var result = ExecuteExamProcedure("dbo.usp_TraLoiCauHoi", cmd =>
                {
                    AddNChar(cmd, "@MASV", userId, 8);
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
            if (!CheckRole(StudentRole, LecturerRole))
                return Json(new { success = false, message = "Khong co quyen." });

            if (!IsValidExamRequest(request.MaMH, request.Lan))
                return Json(new { success = false, message = "Thong tin de thi khong hop le." });

            try
            {
                ExamProcedureResult result;

                if (IsLecturer)
                {
                    result = ExecuteExamProcedure("dbo.usp_NopBaiThiThu", cmd =>
                    {
                        AddNChar(cmd, "@MAGV", CurrentTeacherId, 8);
                        AddNChar(cmd, "@MAMH", request.MaMH, 5);
                        cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = request.Lan;
                    });
                }
                else
                {
                    var maSV = HttpContext.Session.GetString("UserLogin") ?? "";
                    result = ExecuteExamProcedure("dbo.usp_NopBaiThi", cmd =>
                    {
                        AddNChar(cmd, "@MASV", maSV, 8);
                        AddNChar(cmd, "@MAMH", request.MaMH, 5);
                        cmd.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = request.Lan;
                    });
                }

                return Json(new
                {
                    success = result.IsSuccess,
                    message = result.ThongBao,
                    soCauDung = result.SoCauDung,
                    tongSoCau = result.TongSoCau,
                    diem = result.Diem,
                    isThiThu = IsLecturer,
                    redirectUrl = result.IsSuccess && !IsLecturer
                        ? Url.Action("Index", "KetQua", new { mamh = request.MaMH, lan = request.Lan })
                        : null
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Loi he thong: " + ex.Message });
            }
        }

        [HttpGet]
        public IActionResult LayThongTinDeThi(string mamh, int lan, string? maLop = null)
        {
            if (!CheckRole(StudentRole, LecturerRole))
                return Json(new { found = false, message = "Khong co quyen." });

            var lopToQuery = IsLecturer
                ? (maLop ?? "")
                : (HttpContext.Session.GetString(SessionKeyMaLop) ?? "");

            try
            {
                using var conn = new SqlConnection(ConnectionString);
                conn.Open();

                using var cmd = new SqlCommand("dbo.usp_LayThongTinDeThiChoSV", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };
                AddNChar(cmd, "@MALOP", lopToQuery, 8);
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

        private string GetExamUserId()
        {
            if (IsLecturer)
            {
                var magv = CurrentTeacherId.Trim();
                var suffix = magv.Length > 5 ? magv.Substring(magv.Length - 5) : magv;
                return GvUserIdPrefix + suffix;
            }

            return HttpContext.Session.GetString("UserLogin") ?? "";
        }

        private bool IsLecturer =>
            string.Equals(CurrentRole, LecturerRole, StringComparison.OrdinalIgnoreCase);

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

        private List<Lop> LoadDanhSachLopChoGV(string maGV)
        {
            var list = new List<Lop>();
            if (string.IsNullOrWhiteSpace(maGV)) return list;

            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_LayDanhSachLopChoGV", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            AddNChar(cmd, "@MAGV", maGV, 8);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new Lop
                {
                    MaLop = reader["MALOP"].ToString()?.Trim() ?? "",
                    TenLop = reader["TENLOP"].ToString()?.Trim() ?? ""
                });
            }

            return list;
        }

        private List<MonHoc> LoadDanhSachMonThiChoGV(string maGV, string maLop)
        {
            var list = new List<MonHoc>();
            if (string.IsNullOrWhiteSpace(maGV) || string.IsNullOrWhiteSpace(maLop)) return list;

            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_LayDanhSachMonThiChoGV", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            AddNChar(cmd, "@MAGV", maGV, 8);
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

        private ThiLamBaiViewModel? LoadBaiThiDangLam(string userId, string maMH, int lan)
        {
            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_LayBaiThiDangLam", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            AddNChar(cmd, "@MASV", userId, 8);
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

        private ActiveExamInfo LoadPhienThiDangMo(string userId)
        {
            using var conn = new SqlConnection(ConnectionString);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_KiemTraPhienThi", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            AddNChar(cmd, "@MASV", userId, 8);

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
