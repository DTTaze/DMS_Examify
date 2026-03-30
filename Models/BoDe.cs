namespace DMS_Examify.Models
{
    public class BoDe
    {
        public int CauHoi { get; set; }
        public string MaMH { get; set; } = "";
        public string TrinhDo { get; set; } = "A"; // A, B, C
        public string NoiDung { get; set; } = "";
        public string DapAnA { get; set; } = "";
        public string DapAnB { get; set; } = "";
        public string DapAnC { get; set; } = "";
        public string DapAnD { get; set; } = "";
        public string DapAn { get; set; } = ""; // A, B, C, or D
        public string MaGV { get; set; } = "";
    }
}
