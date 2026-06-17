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
            cmd.Parameters.Add("@Keyword", SqlDbType.NVarChar, 250).Value =
                string.IsNullOrWhiteSpace(keyword) ? DBNull.Value : keyword.Trim();
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
            cmd.Parameters.Add("@MaSV", SqlDbType.NChar, 8).Value = sinhVien.MaSV;
            cmd.Parameters.Add("@Ho", SqlDbType.NVarChar, 40).Value = sinhVien.Ho;
            cmd.Parameters.Add("@Ten", SqlDbType.NVarChar, 10).Value = sinhVien.Ten;
            cmd.Parameters.Add("@NgaySinh", SqlDbType.Date).Value = sinhVien.NgaySinh;
            cmd.Parameters.Add("@DiaChi", SqlDbType.NVarChar, 100).Value = sinhVien.DiaChi;
            cmd.Parameters.Add("@MaLop", SqlDbType.NChar, 8).Value = sinhVien.MaLop;
            cmd.Parameters.Add("@MatKhau", SqlDbType.NVarChar, 128).Value = sinhVien.MatKhau;
            cmd.ExecuteNonQuery();
        }

        public void Update(SinhVien sinhVien)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_Update", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@MaSV", SqlDbType.NChar, 8).Value = sinhVien.MaSV;
            cmd.Parameters.Add("@Ho", SqlDbType.NVarChar, 40).Value = sinhVien.Ho;
            cmd.Parameters.Add("@Ten", SqlDbType.NVarChar, 10).Value = sinhVien.Ten;
            cmd.Parameters.Add("@NgaySinh", SqlDbType.Date).Value = sinhVien.NgaySinh;
            cmd.Parameters.Add("@DiaChi", SqlDbType.NVarChar, 100).Value = sinhVien.DiaChi;
            cmd.Parameters.Add("@MaLop", SqlDbType.NChar, 8).Value = sinhVien.MaLop;
            cmd.Parameters.Add("@MatKhau", SqlDbType.NVarChar, 128).Value = sinhVien.MatKhau;
            cmd.ExecuteNonQuery();
        }

        public void Delete(string maSV)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_Delete", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@MaSV", SqlDbType.NChar, 8).Value = maSV;
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
            cmd.Parameters.Add("@MaLop", SqlDbType.NChar, 8).Value = maLop;
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
            using var cmd = new SqlCommand("dbo.usp_SinhVien_GetExistingIds", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
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

        public List<SinhVienImportCheckResult> CheckImportDuplicates(List<SinhVien> items)
        {
            if (items.Count == 0)
            {
                return new List<SinhVienImportCheckResult>();
            }

            var existingIds = GetExistingStudentIds();
            return items.Select((item, index) =>
            {
                var normalizedId = item.MaSV?.Trim().ToUpper() ?? string.Empty;

                return new SinhVienImportCheckResult
                {
                    Index = index,
                    MaSV = item.MaSV?.Trim() ?? string.Empty,
                    Ho = item.Ho?.Trim() ?? string.Empty,
                    Ten = item.Ten?.Trim() ?? string.Empty,
                    IdDuplicate = existingIds.Contains(normalizedId)
                };
            }).ToList();
        }

        public SinhVienDuplicateResult CheckDuplicateForCreate(string maSV)
        {
            return new SinhVienDuplicateResult
            {
                MaSVDuplicate = ExistsMaSV(maSV)
            };
        }

        public bool ExistsMaSV(string maSV)
        {
            if (string.IsNullOrWhiteSpace(maSV)) return false;
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_SinhVien_ExistsMaSV", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@MASV", SqlDbType.NChar, 8).Value = maSV.Trim();
            return (int)cmd.ExecuteScalar() > 0;
        }
    }
}
