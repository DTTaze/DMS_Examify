namespace DMS_Examify.Models
{
    public class BangDiem
    {
        public string MaSV { get; set; } = "";
        public string MaMH { get; set; } = "";
        public int Lan { get; set; }
        public DateTime NgayThi { get; set; }
        public double Diem { get; set; }
    }

    public class BangDiemViewModel
    {
        public string MaLop { get; set; } = "";
        public string TenLop { get; set; } = "";
        public string TenMH { get; set; } = "";
        public int Lan { get; set; }
        public List<BangDiemSinhVien> DanhSach { get; set; } = new();
    }

    public class BangDiemSinhVien
    {
        public int STT { get; set; }
        public string MaSV { get; set; } = "";
        public string Ho { get; set; } = "";
        public string Ten { get; set; } = "";
        public double Diem { get; set; }
        public string DiemChu { get; set; } = ""; // A, B, C, D, F
    }
}
