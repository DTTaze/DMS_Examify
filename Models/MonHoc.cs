using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class MonHoc
    {
        [Required(ErrorMessage = "Mã môn học không được để trống.")]
        [StringLength(5, ErrorMessage = "Mã môn học không được vượt quá 5 ký tự.")]
        public string MaMH { get; set; } = "";

        [Required(ErrorMessage = "Tên môn học không được để trống.")]
        [StringLength(40, ErrorMessage = "Tên môn học không được vượt quá 40 ký tự.")]
        public string TenMH { get; set; } = "";
        
        public bool HasDependencies { get; set; }
    }
}
