namespace DMS_Examify.Models
{
    public class BaiThiDaLamItem
    {
        public string MaMH { get; set; } = "";
        public string TenMH { get; set; } = "";
        public int Lan { get; set; }
        public DateTime NgayThi { get; set; }
        public double Diem { get; set; }
        public string MaLop { get; set; } = "";
        public string TenLop { get; set; } = "";
        public string TrinhDo { get; set; } = "";
        public int SoCauThi { get; set; }
    }

    public class DeThiGVItem
    {
        public string MaMH { get; set; } = "";
        public string TenMH { get; set; } = "";
        public string MaLop { get; set; } = "";
        public string TenLop { get; set; } = "";
        public int Lan { get; set; }
        public string TrinhDo { get; set; } = "";
        public int SoCauThi { get; set; }
        public int ThoiGian { get; set; }
        public DateTime NgayThi { get; set; }
        public string MaGV { get; set; } = "";
        public int SoSVDaThi { get; set; }
    }

    public class KetQuaSVItem
    {
        public string MaSV { get; set; } = "";
        public string Ho { get; set; } = "";
        public string Ten { get; set; } = "";
        public DateTime NgayThi { get; set; }
        public double Diem { get; set; }
    }

    public class ChiTietCauHoiItem
    {
        public int STT { get; set; }
        public int CauHoi { get; set; }
        public string NoiDung { get; set; } = "";
        public string A { get; set; } = "";
        public string B { get; set; } = "";
        public string C { get; set; } = "";
        public string D { get; set; } = "";
        public string CauTraLoi { get; set; } = "";
        public string DapAn { get; set; } = "";
    }
}
