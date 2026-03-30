using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class ThiController : BaseController
    {
        public IActionResult Index()
        {
            if (!CheckRole("Sinhvien", "Giangvien")) return Denied();
            ViewData["Title"] = "Thi trắc nghiệm";
            ViewData["Subtitle"] = "Chọn thông tin và bắt đầu thi";

            var model = new ThiChonViewModel
            {
                MaSV = "SV001",
                HoTen = "Nguyễn Văn An",
                MaLop = "TH2024A",
                TenLop = "Tin học 2024 - A",
                DanhSachMH = new()
                {
                    new MonHoc { MaMH = "MH001", TenMH = "Cơ sở dữ liệu" },
                    new MonHoc { MaMH = "MH002", TenMH = "Lập trình C++" },
                }
            };

            return View(model);
        }

        public IActionResult LamBai()
        {
            if (!CheckRole("Sinhvien", "Giangvien")) return Denied();
            ViewData["Title"] = "Làm bài thi";

            var model = new ThiLamBaiViewModel
            {
                MaSV = "SV001",
                HoTen = "Nguyễn Văn An",
                MaMH = "MH001",
                TenMH = "Cơ sở dữ liệu",
                Lan = 1,
                ThoiGian = 45,
                TrinhDo = "B",
                NgayThi = DateTime.Now,
                DanhSachCauHoi = new()
                {
                    new CauHoiThi { STT = 1, CauHoi = 1, NoiDung = "SQL là viết tắt của từ gì?", DapAnA = "Structured Query Language", DapAnB = "Simple Query Language", DapAnC = "Standard Query Language", DapAnD = "Sequential Query Language", DapAnDung = "A" },
                    new CauHoiThi { STT = 2, CauHoi = 2, NoiDung = "Lệnh nào dùng để tạo bảng trong SQL?", DapAnA = "INSERT TABLE", DapAnB = "CREATE TABLE", DapAnC = "ALTER TABLE", DapAnD = "MAKE TABLE", DapAnDung = "B" },
                    new CauHoiThi { STT = 3, CauHoi = 3, NoiDung = "Khóa chính (Primary Key) có đặc điểm gì?", DapAnA = "Có thể NULL", DapAnB = "Có thể trùng lặp", DapAnC = "Duy nhất và không NULL", DapAnD = "Chỉ là số", DapAnDung = "C" },
                    new CauHoiThi { STT = 4, CauHoi = 4, NoiDung = "JOIN trong SQL dùng để?", DapAnA = "Xóa bảng", DapAnB = "Kết nối 2 bảng", DapAnC = "Tạo index", DapAnD = "Backup dữ liệu", DapAnDung = "B" },
                    new CauHoiThi { STT = 5, CauHoi = 5, NoiDung = "Lệnh DELETE và TRUNCATE khác nhau ở điểm nào?", DapAnA = "Không khác", DapAnB = "DELETE nhanh hơn", DapAnC = "TRUNCATE có WHERE", DapAnD = "DELETE có thể rollback", DapAnDung = "D" },
                }
            };

            return View(model);
        }
    }
}
