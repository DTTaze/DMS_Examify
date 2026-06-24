using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class Lop
    {
        [Required(ErrorMessage = "Mã lớp không được để trống.")]
        public string MaLop { get; set; } = "";

        [Required(ErrorMessage = "Tên lớp không được để trống.")]
        public string TenLop { get; set; } = "";

        public List<SinhVien> DanhSachSV { get; set; } = new();
        public bool HasDependencies { get; set; }
    }
}
