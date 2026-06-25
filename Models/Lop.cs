using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class Lop
    {
        [Required(ErrorMessage = "Mã lớp không được để trống.")]
        [StringLength(8, ErrorMessage = "Mã lớp không được vượt quá 8 ký tự.")]
        public string MaLop { get; set; } = "";

        [Required(ErrorMessage = "Tên lớp không được để trống.")]
        [StringLength(40, ErrorMessage = "Tên lớp không được vượt quá 40 ký tự.")]
        public string TenLop { get; set; } = "";

        public List<SinhVien> DanhSachSV { get; set; } = new();
        public bool HasDependencies { get; set; }
    }
}
