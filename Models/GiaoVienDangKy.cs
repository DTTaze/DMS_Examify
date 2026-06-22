namespace DMS_Examify.Models
{
    public class GiaoVienDangKy
    {
        public string MaGV { get; set; } = "";
        public string TenGV { get; set; } = "";
        public string MaMH { get; set; } = "";
        public string TenMH { get; set; } = "";
        public string MaLop { get; set; } = "";
        public string TenLop { get; set; } = "";
        public string TrinhDo { get; set; } = "A";
        public DateTime NgayThi { get; set; }
        public int Lan { get; set; } = 1;
        public int SoCauThi { get; set; }
        public int ThoiGian { get; set; }
        public bool DaThi { get; set; }
    }
}
