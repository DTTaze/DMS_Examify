using DMS_Examify.Models;

namespace DMS_Examify.Services
{
    public interface IDangKyThiService
    {
        List<Lop> GetAvailableClasses();

        List<MonHoc> GetAvailableSubjects();

        List<TrinhDo> GetAvailableLevels();

        List<GiaoVienDropdownItem> GetAvailableTeachers();

        List<GiaoVienDangKy> GetRegistrations(string role, string teacherId);

        int CountQuestions(string subjectId, string levelId);

        (bool IsSuccess, string Message) CreateRegistration(GiaoVienDangKy registration);

        (bool IsSuccess, string Message) UpdateRegistration(GiaoVienDangKy registration);

        (bool IsSuccess, string Message) DeleteRegistration(string subjectId, string classId, int attempt);
    }
}
