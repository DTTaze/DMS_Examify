using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class GiaoVien
    {
        [Required(ErrorMessage = "Mã giáo viên không được để trống.")]
        public string MaGV { get; set; } = "";

        [Required(ErrorMessage = "Họ giáo viên không được để trống.")]
        public string Ho { get; set; } = "";

        [Required(ErrorMessage = "Tên giáo viên không được để trống.")]
        public string Ten { get; set; } = "";

        public string SoDTLL { get; set; } = "";
        public string DiaChi { get; set; } = "";
    }
}
