using DMS_Examify.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Services
{
    public class MonHocService : IMonHocService
    {
        private readonly IDbConnectionFactory _connectionFactory;

        private static class StoredProcedures
        {
            public const string GetAll = "dbo.usp_MonHoc_GetAll";
            public const string Insert = "dbo.usp_MonHoc_Insert";
            public const string Update = "dbo.usp_MonHoc_Update";
            public const string Delete = "dbo.usp_MonHoc_Delete";
            public const string Search = "dbo.usp_MonHoc_Search";
        }

        public MonHocService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<MonHoc> GetAll()
        {
            var subjects = new List<MonHoc>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.GetAll, conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                subjects.Add(MapMonHoc(reader));
            }
            return subjects;
        }

        public void Insert(MonHoc monHoc)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Insert, conn);
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = NormalizeSubjectCode(monHoc.MaMH);
            cmd.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40).Value = monHoc.TenMH.Trim();
            cmd.ExecuteNonQuery();
        }

        public void Update(MonHoc monHoc)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Update, conn);
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = NormalizeSubjectCode(monHoc.MaMH);
            cmd.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40).Value = monHoc.TenMH.Trim();
            cmd.ExecuteNonQuery();
        }

        public void Delete(string maMH)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Delete, conn);
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = NormalizeSubjectCode(maMH);
            cmd.ExecuteNonQuery();
        }

        public List<MonHoc> Search(string keyword)
        {
            var subjects = new List<MonHoc>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Search, conn);
            cmd.Parameters.Add("@Keyword", SqlDbType.NVarChar, 250).Value = 
                string.IsNullOrEmpty(keyword) ? DBNull.Value : keyword.Trim();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                subjects.Add(MapMonHoc(reader));
            }
            return subjects;
        }

        public SubjectDuplicateCheckResult CheckMaMHDuplicate(string maMH)
        {
            if (string.IsNullOrWhiteSpace(maMH))
            {
                return new SubjectDuplicateCheckResult(false, false);
            }

            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("SELECT TrangThai FROM MONHOC WHERE MaMH = @MaMH", conn);
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = NormalizeSubjectCode(maMH);

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                bool isActive = Convert.ToBoolean(reader["TrangThai"]);
                return new SubjectDuplicateCheckResult(true, isActive);
            }
            return new SubjectDuplicateCheckResult(false, false);
        }

        public SubjectDuplicateCheckResult CheckTenMHDuplicate(string tenMH)
        {
            if (string.IsNullOrWhiteSpace(tenMH))
            {
                return new SubjectDuplicateCheckResult(false, false);
            }

            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("SELECT TrangThai FROM MONHOC WHERE TenMH = @TenMH", conn);
            cmd.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40).Value = tenMH.Trim();

            using var reader = cmd.ExecuteReader();
            bool exists = false;
            bool isActive = false;
            while (reader.Read())
            {
                exists = true;
                if (Convert.ToBoolean(reader["TrangThai"]))
                {
                    isActive = true;
                }
            }
            return new SubjectDuplicateCheckResult(exists, isActive);
        }

        public SubjectDuplicateCheckResult CheckTenMHDuplicateExcludingMaMH(string tenMH, string maMH)
        {
            if (string.IsNullOrWhiteSpace(tenMH))
            {
                return new SubjectDuplicateCheckResult(false, false);
            }

            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("SELECT TrangThai FROM MONHOC WHERE TenMH = @TenMH AND MaMH <> @MaMH", conn);
            cmd.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40).Value = tenMH.Trim();
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = NormalizeSubjectCode(maMH);

            using var reader = cmd.ExecuteReader();
            bool exists = false;
            bool isActive = false;
            while (reader.Read())
            {
                exists = true;
                if (Convert.ToBoolean(reader["TrangThai"]))
                {
                    isActive = true;
                }
            }
            return new SubjectDuplicateCheckResult(exists, isActive);
        }

        public bool CheckIsSoftDelete(string maMH)
        {
            if (string.IsNullOrWhiteSpace(maMH))
            {
                return false;
            }

            using var conn = _connectionFactory.CreateConnection();
            string sql = @"
                SELECT 1 WHERE EXISTS (
                    SELECT 1 FROM dbo.BANGDIEM WHERE MAMH = @MaMH
                    UNION ALL
                    SELECT 1 FROM dbo.BODE WHERE MAMH = @MaMH
                    UNION ALL
                    SELECT 1 FROM dbo.GIAOVIEN_DANGKY WHERE MAMH = @MaMH
                )";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = NormalizeSubjectCode(maMH);

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

        private static MonHoc MapMonHoc(SqlDataReader reader)
        {
            return new MonHoc
            {
                MaMH = reader["MaMH"].ToString()?.Trim() ?? string.Empty,
                TenMH = reader["TenMH"].ToString()?.Trim() ?? string.Empty
            };
        }

        private static string NormalizeSubjectCode(string? value)
        {
            return value?.Trim().ToUpperInvariant() ?? string.Empty;
        }
    }
}

