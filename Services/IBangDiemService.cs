using DMS_Examify.Models;

namespace DMS_Examify.Services
{
    public interface IBangDiemService
    {
        List<Lop> GetClassesWithGrades();

        List<MonHoc> GetSubjectsByClass(string classId);

        List<int> GetAttemptsByClassAndSubject(string classId, string subjectId);

        BangDiemViewModel GetGradeReport(string classId, string subjectId, int attempt);
    }
}
