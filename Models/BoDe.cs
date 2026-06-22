using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class BoDe
    {
        public int CauHoi { get; set; }

        [Required(ErrorMessage = "Mã môn học không được để trống.")]
        public string MaMH { get; set; } = "";

        [Required(ErrorMessage = "Trình độ không được để trống.")]
        [RegularExpression("^[ABCabc]$", ErrorMessage = "Trình độ chỉ nhận giá trị A, B hoặc C.")]
        public string TrinhDo { get; set; } = "A"; // A, B, C

        [Required(ErrorMessage = "Nội dung câu hỏi không được để trống.")]
        public string NoiDung { get; set; } = "";

        [Required(ErrorMessage = "Đáp án A không được để trống.")]
        public string DapAnA { get; set; } = "";

        [Required(ErrorMessage = "Đáp án B không được để trống.")]
        public string DapAnB { get; set; } = "";

        [Required(ErrorMessage = "Đáp án C không được để trống.")]
        public string DapAnC { get; set; } = "";

        [Required(ErrorMessage = "Đáp án D không được để trống.")]
        public string DapAnD { get; set; } = "";

        [Required(ErrorMessage = "Đáp án đúng không được để trống.")]
        [RegularExpression("^[ABCDabcd]$", ErrorMessage = "Đáp án chỉ nhận giá trị A, B, C hoặc D.")]
        public string DapAn { get; set; } = ""; // A, B, C, or D

        public string MaGV { get; set; } = "";
    }
}
