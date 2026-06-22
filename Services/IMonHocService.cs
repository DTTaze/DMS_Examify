using DMS_Examify.Models;

namespace DMS_Examify.Services
{
    public record SubjectDuplicateCheckResult(bool Exists, bool IsActive);

    public interface IMonHocService
    {
        List<MonHoc> GetAll();
        void Insert(MonHoc monHoc);
        void Update(MonHoc monHoc);
        void Delete(string maMH);
        List<MonHoc> Search(string keyword);
        SubjectDuplicateCheckResult CheckMaMHDuplicate(string maMH);
        SubjectDuplicateCheckResult CheckTenMHDuplicate(string tenMH);
        SubjectDuplicateCheckResult CheckTenMHDuplicateExcludingMaMH(string tenMH, string maMH);
        bool CheckIsSoftDelete(string maMH);
    }
}
