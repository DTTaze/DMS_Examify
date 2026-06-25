using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class SinhVien
    {
        [Required(ErrorMessage = "Mã sinh viên không được để trống.")]
        [StringLength(8, ErrorMessage = "Mã sinh viên không được vượt quá 8 ký tự.")]
        public string MaSV { get; set; } = "";

        [Required(ErrorMessage = "Họ sinh viên không được để trống.")]
        [StringLength(40, ErrorMessage = "Họ sinh viên không được vượt quá 40 ký tự.")]
        public string Ho { get; set; } = "";

        [Required(ErrorMessage = "Tên sinh viên không được để trống.")]
        [StringLength(10, ErrorMessage = "Tên sinh viên không được vượt quá 10 ký tự.")]
        public string Ten { get; set; } = "";

        public DateTime NgaySinh { get; set; }

        [StringLength(100, ErrorMessage = "Địa chỉ không được vượt quá 100 ký tự.")]
        public string DiaChi { get; set; } = "";

        [Required(ErrorMessage = "Mã lớp không được để trống.")]
        [StringLength(8, ErrorMessage = "Mã lớp không được vượt quá 8 ký tự.")]
        public string MaLop { get; set; } = "";

        public string MatKhau { get; set; } = "";
        
        public bool HasDependencies { get; set; }
    }
}
