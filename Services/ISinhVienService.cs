using DMS_Examify.Models;

namespace DMS_Examify.Services
{
    public interface ISinhVienService
    {
        List<SinhVien> Search(string keyword);
        void Insert(SinhVien sinhVien);
        void Update(SinhVien sinhVien);
        void Delete(string maSV);
        List<SinhVien> GetByLop(string maLop);
        HashSet<string> GetExistingStudentIds();
        List<SinhVienImportCheckResult> CheckImportDuplicates(List<SinhVien> items);
        SinhVienDuplicateResult CheckDuplicateForCreate(string maSV);
        bool ExistsMaSV(string maSV);
        bool CheckHasDependencies(string maSV);
    }
}
