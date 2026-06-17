namespace DMS_Examify.Models
{
    public class GiaoVienImportCheckResult
    {
        public int Index { get; set; }
        public string MaGV { get; set; } = "";
        public string Ho { get; set; } = "";
        public string Ten { get; set; } = "";
        public bool IdDuplicate { get; set; }
    }
}
