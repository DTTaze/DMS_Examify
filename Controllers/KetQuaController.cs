using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class KetQuaController : BaseController
    {
        public IActionResult Index()
        {
            ViewData["Title"] = "Xem kết quả thi";
            ViewData["Subtitle"] = "Xem lại bài thi đã làm";

            var model = new KetQuaThiViewModel
            {
                MaSV = "SV001",
                HoTen = "Nguyễn Văn An",
                MaLop = "TH2024A",
                TenLop = "Tin học 2024 - A",
                TenMH = "Cơ sở dữ liệu",
                NgayThi = DateTime.Now,
                Lan = 1,
                Diem = 8.0,
                SoCauDung = 4,
                TongSoCau = 5,
                DanhSachCauHoi = new()
                {
                    new CauHoiThi { STT = 1, CauHoi = 1, NoiDung = "SQL là viết tắt của từ gì?", DapAnA = "Structured Query Language", DapAnB = "Simple Query Language", DapAnC = "Standard Query Language", DapAnD = "Sequential Query Language", DapAnDung = "A", TraLoiSV = "A" },
                    new CauHoiThi { STT = 2, CauHoi = 2, NoiDung = "Lệnh nào dùng để tạo bảng trong SQL?", DapAnA = "INSERT TABLE", DapAnB = "CREATE TABLE", DapAnC = "ALTER TABLE", DapAnD = "MAKE TABLE", DapAnDung = "B", TraLoiSV = "B" },
                    new CauHoiThi { STT = 3, CauHoi = 3, NoiDung = "Khóa chính (Primary Key) có đặc điểm gì?", DapAnA = "Có thể NULL", DapAnB = "Có thể trùng lặp", DapAnC = "Duy nhất và không NULL", DapAnD = "Chỉ là số", DapAnDung = "C", TraLoiSV = "A" },
                    new CauHoiThi { STT = 4, CauHoi = 4, NoiDung = "JOIN trong SQL dùng để?", DapAnA = "Xóa bảng", DapAnB = "Kết nối 2 bảng", DapAnC = "Tạo index", DapAnD = "Backup dữ liệu", DapAnDung = "B", TraLoiSV = "B" },
                    new CauHoiThi { STT = 5, CauHoi = 5, NoiDung = "Lệnh DELETE và TRUNCATE khác nhau ở điểm nào?", DapAnA = "Không khác", DapAnB = "DELETE nhanh hơn", DapAnC = "TRUNCATE có WHERE", DapAnD = "DELETE có thể rollback", DapAnDung = "D", TraLoiSV = "D" },
                }
            };

            return View(model);
        }
    }
}
