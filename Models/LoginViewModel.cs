using System.ComponentModel.DataAnnotations;

namespace DMS_Examify.Models
{
    public class LoginViewModel
    {
        public string LoginType { get; set; } = "GiangVien";

        [Required(ErrorMessage = "Vui lòng nhập tài khoản.")]
        public string Login { get; set; } = "";

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
        public string Password { get; set; } = "";
    }
}