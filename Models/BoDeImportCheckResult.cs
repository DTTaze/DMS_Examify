namespace DMS_Examify.Models
{
    public class BoDeImportCheckResult
    {
        public int Index { get; set; }
        public string MaMH { get; set; } = "";
        public string NoiDung { get; set; } = "";
        public bool SubjectExists { get; set; }
        public bool HasDuplicate { get; set; }
        public string DuplicateLevel { get; set; } = "";
        public string DuplicateMessage { get; set; } = "";
    }
}
