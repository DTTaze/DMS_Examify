using DMS_Examify.Models;

namespace DMS_Examify.Services
{
    public interface IAuthService
    {
        SinhVien? ValidateStudent(string studentId, string password);
        LecturerInfo? ValidateLecturer(string login, string password);
        string GetStudentConnectionString();
        string BuildLecturerConnectionString(string login, string password);
    }
}
