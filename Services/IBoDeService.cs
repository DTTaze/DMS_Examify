using DMS_Examify.Models;

namespace DMS_Examify.Services
{
    public interface IBoDeService
    {
        List<BoDe> GetAll(string role, string maGV);
        int Insert(BoDe model, string maGV);
        bool Update(BoDe model, string role, string maGV);
        bool Delete(int cauHoi, string maMH, string role, string maGV);
        List<BoDe> Search(string? keyword, string role, string maGV);
        int GetLatestCauHoi();
        List<BoDeImportCheckResult> CheckImportSubjects(List<BoDe> items);
    }
}
