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

        [RegularExpression(@"^(0[35789]\d{8}|02\d{9})?$", ErrorMessage = "Số điện thoại không hợp lệ.")]
        public string SoDTLL { get; set; } = "";
        public string DiaChi { get; set; } = "";
        public bool HasDependencies { get; set; }
    }
}
