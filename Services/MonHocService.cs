using DMS_Examify.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Services
{
    public class MonHocService : IMonHocService
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public MonHocService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<MonHoc> GetAll()
        {
            var subjects = new List<MonHoc>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_MonHoc_GetAll", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                subjects.Add(new MonHoc
                {
                    MaMH = reader["MaMH"].ToString()?.Trim() ?? string.Empty,
                    TenMH = reader["TenMH"].ToString()?.Trim() ?? string.Empty
                });
            }
            return subjects;
        }

        public void Insert(MonHoc monHoc)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_MonHoc_Insert", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = monHoc.MaMH.Trim();
            cmd.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40).Value = monHoc.TenMH.Trim();
            cmd.ExecuteNonQuery();
        }

        public void Update(MonHoc monHoc)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_MonHoc_Update", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = monHoc.MaMH.Trim();
            cmd.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40).Value = monHoc.TenMH.Trim();
            cmd.ExecuteNonQuery();
        }

        public void Delete(string maMH)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_MonHoc_Delete", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = maMH.Trim();
            cmd.ExecuteNonQuery();
        }

        public List<MonHoc> Search(string keyword)
        {
            var subjects = new List<MonHoc>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_MonHoc_Search", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.Add("@Keyword", SqlDbType.NVarChar, 250).Value = string.IsNullOrEmpty(keyword) ? DBNull.Value : keyword.Trim();

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                subjects.Add(new MonHoc
                {
                    MaMH = reader["MaMH"].ToString()?.Trim() ?? string.Empty,
                    TenMH = reader["TenMH"].ToString()?.Trim() ?? string.Empty
                });
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
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = maMH.Trim();

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
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = maMH.Trim();

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
    }
}
