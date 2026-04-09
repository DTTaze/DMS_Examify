using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;

namespace DMS_Examify.Controllers
{
    public class BoDeController : BaseController
    {
        private static List<BoDe> _danhSach = new()
        {
            new BoDe { CauHoi = 1, MaMH = "MH001", TrinhDo = "A", NoiDung = "SQL là viết tắt của từ gì?", DapAnA = "Structured Query Language", DapAnB = "Simple Query Language", DapAnC = "Standard Query Language", DapAnD = "Sequential Query Language", DapAn = "A", MaGV = "GV001" },
            new BoDe { CauHoi = 2, MaMH = "MH001", TrinhDo = "A", NoiDung = "Lệnh nào dùng để tạo bảng trong SQL?", DapAnA = "INSERT TABLE", DapAnB = "CREATE TABLE", DapAnC = "ALTER TABLE", DapAnD = "MAKE TABLE", DapAn = "B", MaGV = "GV001" },
            new BoDe { CauHoi = 3, MaMH = "MH001", TrinhDo = "B", NoiDung = "Khóa chính (Primary Key) có đặc điểm gì?", DapAnA = "Có thể NULL", DapAnB = "Có thể trùng lặp", DapAnC = "Duy nhất và không NULL", DapAnD = "Chỉ là số", DapAn = "C", MaGV = "GV001" },
            new BoDe { CauHoi = 4, MaMH = "MH002", TrinhDo = "A", NoiDung = "C++ được phát triển bởi ai?", DapAnA = "Dennis Ritchie", DapAnB = "Bjarne Stroustrup", DapAnC = "James Gosling", DapAnD = "Guido van Rossum", DapAn = "B", MaGV = "GV002" },
            new BoDe { CauHoi = 5, MaMH = "MH002", TrinhDo = "C", NoiDung = "Virtual function trong C++ dùng để làm gì?", DapAnA = "Tối ưu bộ nhớ", DapAnB = "Tạo biến ảo", DapAnC = "Hỗ trợ đa hình", DapAnD = "Khai báo hằng", DapAn = "C", MaGV = "GV002" },
        };

        public IActionResult Index()
        {
            if (!CheckRole("PGV", "Giangvien")) return Denied();
            ViewData["Title"] = "Nhập câu hỏi thi";
            ViewData["Subtitle"] = "Quản lý bộ đề trắc nghiệm";

            var data = _danhSach;
            var userRole = HttpContext.Session.GetString("UserRole");
            var userLogin = HttpContext.Session.GetString("UserLogin");

            if (userRole == "Giangvien")
            {
                // Logic bảo vệ vòng ngoài C#: Giảng viên chỉ xem câu hỏi mình soạn
                // MaGV trong dữ liệu sẽ khớp với Login DB / UserLogin của Giảng viên.
                data = _danhSach.Where(x => x.MaGV == userLogin).ToList();
            }

            return View(data);
        }
    }
}
