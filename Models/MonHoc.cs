using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class MonHoc
    {
        [Required(ErrorMessage = "Mã môn học không được để trống.")]
        public string MaMH { get; set; } = "";

        [Required(ErrorMessage = "Tên môn học không được để trống.")]
        public string TenMH { get; set; } = "";
        
        public bool HasDependencies { get; set; }
    }
}
