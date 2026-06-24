namespace DMS_Examify.Models
{
    public class ImportValidationResultDto
    {
        public int Index { get; set; }
        public string MaMH { get; set; } = string.Empty;
        public string TenMH { get; set; } = string.Empty;
        
        public bool IsEmptyCode { get; set; }
        public bool IsEmptyName { get; set; }
        
        public bool CodeDuplicateDB { get; set; }
        public bool NameDuplicateDB { get; set; }
        
        public bool CodeDuplicateFile { get; set; }
        public int? CodeDuplicateFileWithRowIndex { get; set; }
        
        public bool NameDuplicateFile { get; set; }
        public int? NameDuplicateFileWithRowIndex { get; set; }

        public bool CodeDuplicate => CodeDuplicateDB || CodeDuplicateFile;
        public bool NameDuplicate => NameDuplicateDB || NameDuplicateFile;
    }
}
