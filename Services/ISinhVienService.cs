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
        bool ExistsMaSV(string maSV);
    }
}
