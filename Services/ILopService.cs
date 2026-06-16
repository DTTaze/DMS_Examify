using DMS_Examify.Models;

namespace DMS_Examify.Services
{
    public interface ILopService
    {
        List<Lop> GetAll();
        void Insert(Lop lop);
        void Update(Lop lop);
        void Delete(string maLop);
        List<Lop> Search(string keyword);
        bool ExistsMaLop(string maLop);
        bool ExistsTenLop(string tenLop);
        bool ExistsTenLopExcludingMaLop(string tenLop, string maLop);
    }
}
