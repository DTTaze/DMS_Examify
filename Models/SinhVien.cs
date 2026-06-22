using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class SinhVien
    {
        [Required(ErrorMessage = "Mã sinh viên không được để trống.")]
        public string MaSV { get; set; } = "";

        [Required(ErrorMessage = "Họ sinh viên không được để trống.")]
        public string Ho { get; set; } = "";

        [Required(ErrorMessage = "Tên sinh viên không được để trống.")]
        public string Ten { get; set; } = "";

        public DateTime NgaySinh { get; set; }
        public string DiaChi { get; set; } = "";

        [Required(ErrorMessage = "Mã lớp không được để trống.")]
        public string MaLop { get; set; } = "";

        public string MatKhau { get; set; } = "";
    }
}
