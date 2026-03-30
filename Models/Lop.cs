namespace DMS_Examify.Models
{
    public class Lop
    {
        public string MaLop { get; set; } = "";
        public string TenLop { get; set; } = "";
        public List<SinhVien> DanhSachSV { get; set; } = new();
    }
}
