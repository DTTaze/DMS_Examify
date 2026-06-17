using DMS_Examify.Models;

namespace DMS_Examify.Services
{
    public interface IGiaoVienService
    {
        List<GiaoVien> GetAll();
        void Insert(GiaoVien giaoVien);
        void Update(GiaoVien giaoVien);
        void Delete(string maGV);
        List<GiaoVien> Search(string? keyword);
        List<GiaoVienImportCheckResult> CheckImportDuplicates(List<GiaoVien> items);
        GiaoVienDuplicateResult CheckDuplicateForCreate(string? maGV);
    }
}
