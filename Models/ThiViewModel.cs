namespace DMS_Examify.Models
{
    // Chọn thông tin thi
    public class ThiChonViewModel
    {
        public string MaSV { get; set; } = "";
        public string HoTen { get; set; } = "";
        public string MaLop { get; set; } = "";
        public string TenLop { get; set; } = "";
        public string MaMH { get; set; } = "";
        public DateTime NgayThi { get; set; }
        public int Lan { get; set; }
        // Auto-filled
        public int SoCauThi { get; set; }
        public int ThoiGian { get; set; }
        public string TrinhDo { get; set; } = "";
        public List<MonHoc> DanhSachMH { get; set; } = new();
    }

    // Làm bài thi
    public class ThiLamBaiViewModel
    {
        public string MaSV { get; set; } = "";
        public string HoTen { get; set; } = "";
        public string MaMH { get; set; } = "";
        public string TenMH { get; set; } = "";
        public int Lan { get; set; }
        public int ThoiGian { get; set; } // phút
        public string TrinhDo { get; set; } = "";
        public DateTime NgayThi { get; set; }
        public List<CauHoiThi> DanhSachCauHoi { get; set; } = new();
    }

    public class CauHoiThi
    {
        public int STT { get; set; }
        public int CauHoi { get; set; } // số câu trong bộ đề
        public string NoiDung { get; set; } = "";
        public string DapAnA { get; set; } = "";
        public string DapAnB { get; set; } = "";
        public string DapAnC { get; set; } = "";
        public string DapAnD { get; set; } = "";
        public string DapAnDung { get; set; } = "";
        public string TraLoiSV { get; set; } = "";
    }

    // Kết quả thi
    public class KetQuaThiViewModel
    {
        public string MaSV { get; set; } = "";
        public string HoTen { get; set; } = "";
        public string MaLop { get; set; } = "";
        public string TenLop { get; set; } = "";
        public string TenMH { get; set; } = "";
        public DateTime NgayThi { get; set; }
        public int Lan { get; set; }
        public double Diem { get; set; }
        public int SoCauDung { get; set; }
        public int TongSoCau { get; set; }
        public List<CauHoiThi> DanhSachCauHoi { get; set; } = new();
    }
}
