using DMS_Examify.Models;

namespace DMS_Examify.Services
{
    public interface IBoDeService
    {
        List<BoDe> GetAll(string role, string maGV);
        int Insert(BoDe model, string maGV);
        void Update(BoDe model, string role, string maGV);
        void Delete(int cauHoi, string maMH, string role, string maGV);
        List<BoDe> Search(string? keyword, string role, string maGV);
        int GetLatestCauHoi();
        List<BoDeImportCheckResult> CheckImportSubjects(List<BoDe> items);
    }
}
