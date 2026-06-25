using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class BoDe : IValidatableObject
    {
        public int CauHoi { get; set; }

        [Required(ErrorMessage = "Mã môn học không được để trống.")]
        public string MaMH { get; set; } = "";

        [Required(ErrorMessage = "Trình độ không được để trống.")]
        [RegularExpression("^[ABCabc]$", ErrorMessage = "Trình độ chỉ nhận giá trị A, B hoặc C.")]
        public string TrinhDo { get; set; } = "A"; // A, B, C

        [Required(ErrorMessage = "Nội dung câu hỏi không được để trống.")]
        [StringLength(200, ErrorMessage = "Nội dung câu hỏi không được vượt quá 200 ký tự.")]
        public string NoiDung { get; set; } = "";

        [Required(ErrorMessage = "Đáp án A không được để trống.")]
        [StringLength(50, ErrorMessage = "Đáp án A không được vượt quá 50 ký tự.")]
        public string DapAnA { get; set; } = "";

        [Required(ErrorMessage = "Đáp án B không được để trống.")]
        [StringLength(50, ErrorMessage = "Đáp án B không được vượt quá 50 ký tự.")]
        public string DapAnB { get; set; } = "";

        [Required(ErrorMessage = "Đáp án C không được để trống.")]
        [StringLength(50, ErrorMessage = "Đáp án C không được vượt quá 50 ký tự.")]
        public string DapAnC { get; set; } = "";

        [Required(ErrorMessage = "Đáp án D không được để trống.")]
        [StringLength(50, ErrorMessage = "Đáp án D không được vượt quá 50 ký tự.")]
        public string DapAnD { get; set; } = "";

        [Required(ErrorMessage = "Đáp án đúng không được để trống.")]
        [RegularExpression("^[ABCDabcd]$", ErrorMessage = "Đáp án chỉ nhận giá trị A, B, C hoặc D.")]
        public string DapAn { get; set; } = ""; // A, B, C, or D

        public string MaGV { get; set; } = "";

        public bool HasDependencies { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            var answers = new[] { DapAnA?.Trim(), DapAnB?.Trim(), DapAnC?.Trim(), DapAnD?.Trim() };
            if (answers.Any(a => !string.IsNullOrEmpty(a)) && answers.Distinct().Count() < 4)
            {
                yield return new ValidationResult(
                    "Các phương án trả lời (A, B, C, D) không được trùng nhau.",
                    new[] { nameof(DapAnA), nameof(DapAnB), nameof(DapAnC), nameof(DapAnD) }
                );
            }
        }
    }
}
