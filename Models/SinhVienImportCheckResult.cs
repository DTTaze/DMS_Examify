namespace DMS_Examify.Models
{
    public class SinhVienImportCheckResult
    {
        public int Index { get; set; }
        public string MaSV { get; set; } = "";
        public string Ho { get; set; } = "";
        public string Ten { get; set; } = "";
        public bool IdDuplicateDB { get; set; }
        public bool IdDuplicateFile { get; set; }
        public int? IdDuplicateFileWithRowIndex { get; set; }
        public bool IdDuplicate => IdDuplicateDB || IdDuplicateFile;
    }
}
