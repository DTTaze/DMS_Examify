using DMS_Examify.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Services
{
    public class SinhVienService : ISinhVienService
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public SinhVienService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<SinhVien> Search(string keyword)
        {
            var list = new List<SinhVien>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_Search", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("@Keyword", (object)keyword ?? DBNull.Value);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new SinhVien
                {
                    MaSV = reader["MaSV"].ToString() ?? "",
                    Ho = reader["Ho"].ToString() ?? "",
                    Ten = reader["Ten"].ToString() ?? "",
                    NgaySinh = reader["NgaySinh"] as DateTime? ?? DateTime.MinValue,
                    DiaChi = reader["DiaChi"].ToString() ?? "",
                    MaLop = reader["MaLop"].ToString() ?? "",
                    MatKhau = reader["MatKhau"].ToString() ?? ""
                });
            }
            return list;
        }

        public void Insert(SinhVien sinhVien)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_Insert", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("@MaSV", sinhVien.MaSV);
            cmd.Parameters.AddWithValue("@Ho", sinhVien.Ho);
            cmd.Parameters.AddWithValue("@Ten", sinhVien.Ten);
            cmd.Parameters.AddWithValue("@NgaySinh", sinhVien.NgaySinh);
            cmd.Parameters.AddWithValue("@DiaChi", sinhVien.DiaChi);
            cmd.Parameters.AddWithValue("@MaLop", sinhVien.MaLop);
            cmd.Parameters.AddWithValue("@MatKhau", sinhVien.MatKhau);
            cmd.ExecuteNonQuery();
        }

        public void Update(SinhVien sinhVien)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_Update", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("@MaSV", sinhVien.MaSV);
            cmd.Parameters.AddWithValue("@Ho", sinhVien.Ho);
            cmd.Parameters.AddWithValue("@Ten", sinhVien.Ten);
            cmd.Parameters.AddWithValue("@NgaySinh", sinhVien.NgaySinh);
            cmd.Parameters.AddWithValue("@DiaChi", sinhVien.DiaChi);
            cmd.Parameters.AddWithValue("@MaLop", sinhVien.MaLop);
            cmd.Parameters.AddWithValue("@MatKhau", sinhVien.MatKhau);
            cmd.ExecuteNonQuery();
        }

        public void Delete(string maSV)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_Delete", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("@MaSV", maSV);
            cmd.ExecuteNonQuery();
        }

        public List<SinhVien> GetByLop(string maLop)
        {
            var list = new List<SinhVien>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_GetByLop", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("@MaLop", maLop);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new SinhVien
                {
                    MaSV = reader["MaSV"].ToString() ?? "",
                    Ho = reader["Ho"].ToString() ?? "",
                    Ten = reader["Ten"].ToString() ?? "",
                    NgaySinh = reader["NgaySinh"] as DateTime? ?? DateTime.MinValue,
                    DiaChi = reader["DiaChi"].ToString() ?? "",
                    MaLop = reader["MaLop"].ToString() ?? "",
                    MatKhau = reader["MatKhau"].ToString() ?? ""
                });
            }
            return list;
        }

        public HashSet<string> GetExistingStudentIds()
        {
            var ids = new HashSet<string>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("SELECT MASV FROM SINHVIEN", conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var id = reader["MASV"].ToString()?.Trim().ToUpper();
                if (!string.IsNullOrEmpty(id))
                {
                    ids.Add(id);
                }
            }
            return ids;
        }

        public bool ExistsMaSV(string maSV)
        {
            if (string.IsNullOrWhiteSpace(maSV)) return false;
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("SELECT COUNT(1) FROM SINHVIEN WHERE MASV = @MASV", conn);
            cmd.Parameters.Add("@MASV", SqlDbType.NChar, 8).Value = maSV.Trim();
            return (int)cmd.ExecuteScalar() > 0;
        }
    }
}
