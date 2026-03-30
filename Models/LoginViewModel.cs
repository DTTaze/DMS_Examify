namespace DMS_Examify.Models
{
    public class LoginViewModel
    {
        public string LoginType { get; set; } = "GiangVien"; // GiangVien or SinhVien
        public string Login { get; set; } = "";
        public string Password { get; set; } = "";
    }
}
