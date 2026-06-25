using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class TaoTaiKhoanViewModel
    {
        [Required(ErrorMessage = "Vui lòng nhập Tên đăng nhập (Login Name)")]
        public string LoginName { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập Mật khẩu")]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập Mã Giáo Viên (User Name in DB)")]
        public string MaGV { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn nhóm quyền")]
        public string Role { get; set; }
    }

    public class XoaTaiKhoanRequest
    {
        public string Username { get; set; } = "";
    }
}