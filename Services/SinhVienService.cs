using DMS_Examify.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Services
{
    public class SinhVienService : ISinhVienService
    {
        private readonly IDbConnectionFactory _connectionFactory;

        private static class StoredProcedures
        {
            public const string Search = "dbo.usp_SinhVien_Search";
            public const string Insert = "dbo.usp_SinhVien_Insert";
            public const string Update = "dbo.usp_SinhVien_Update";
            public const string Delete = "dbo.usp_SinhVien_Delete";
            public const string GetByLop = "dbo.usp_SinhVien_GetByLop";
            public const string GetExistingIds = "dbo.usp_SinhVien_GetExistingIds";
            public const string ExistsMaSV = "dbo.usp_SinhVien_ExistsMaSV";
        }

        public SinhVienService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<SinhVien> Search(string keyword)
        {
            var list = new List<SinhVien>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Search, conn);
            cmd.Parameters.Add("@Keyword", SqlDbType.NVarChar, 250).Value =
                string.IsNullOrWhiteSpace(keyword) ? DBNull.Value : keyword.Trim();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(MapSinhVien(reader));
            }
            return list;
        }

        public void Insert(SinhVien sinhVien)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Insert, conn);
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
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Update, conn);
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
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Delete, conn);
            cmd.Parameters.Add("@MaSV", SqlDbType.NChar, 8).Value = maSV;
            cmd.ExecuteNonQuery();
        }

        public List<SinhVien> GetByLop(string maLop)
        {
            var list = new List<SinhVien>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.GetByLop, conn);
            cmd.Parameters.Add("@MaLop", SqlDbType.NChar, 8).Value = maLop;
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(MapSinhVien(reader));
            }
            return list;
        }

        public HashSet<string> GetExistingStudentIds()
        {
            var ids = new HashSet<string>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.GetExistingIds, conn);
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
            if (string.IsNullOrWhiteSpace(maSV))
            {
                return false;
            }
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.ExistsMaSV, conn);
            cmd.Parameters.Add("@MASV", SqlDbType.NChar, 8).Value = maSV.Trim();
            return (int)cmd.ExecuteScalar() > 0;
        }

        public bool CheckIsSoftDelete(string maSV)
        {
            if (string.IsNullOrWhiteSpace(maSV))
            {
                return false;
            }

            using var conn = _connectionFactory.CreateConnection();
            string sql = "SELECT 1 WHERE EXISTS (SELECT 1 FROM dbo.BANGDIEM WHERE MASV = @MaSV)";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.Add("@MaSV", SqlDbType.NChar, 8).Value = maSV.Trim();

            var result = cmd.ExecuteScalar();
            return result != null && result != DBNull.Value;
        }

        private static SqlCommand CreateStoredProcedureCommand(string procedureName, SqlConnection connection)
        {
            return new SqlCommand(procedureName, connection)
            {
                CommandType = CommandType.StoredProcedure
            };
        }

        private static SinhVien MapSinhVien(SqlDataReader reader)
        {
            return new SinhVien
            {
                MaSV = reader["MaSV"].ToString() ?? string.Empty,
                Ho = reader["Ho"].ToString() ?? string.Empty,
                Ten = reader["Ten"].ToString() ?? string.Empty,
                NgaySinh = reader["NgaySinh"] as DateTime? ?? DateTime.MinValue,
                DiaChi = reader["DiaChi"].ToString() ?? string.Empty,
                MaLop = reader["MaLop"].ToString() ?? string.Empty,
                MatKhau = reader["MatKhau"].ToString() ?? string.Empty
            };
        }
    }
}

