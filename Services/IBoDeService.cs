using DMS_Examify.Models;

namespace DMS_Examify.Services
{
    public interface IBoDeService
    {
        List<BoDe> GetAll(string role, string maGV);
        int Insert(BoDe model, string maGV);
        void Update(BoDe model, string maGV);
        void Delete(int cauHoi, string maMH);
        List<BoDe> Search(string keyword);
        int GetLatestCauHoi();
    }
}
