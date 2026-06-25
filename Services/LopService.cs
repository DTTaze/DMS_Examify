using DMS_Examify.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Services
{
    public class LopService : ILopService
    {
        private readonly IDbConnectionFactory _connectionFactory;

        private static class StoredProcedures
        {
            public const string Insert = "dbo.usp_Lop_Insert";
            public const string Update = "dbo.usp_Lop_Update";
            public const string Delete = "dbo.usp_Lop_Delete";
            public const string Search = "dbo.usp_Lop_Search";
            public const string ExistsMaLop = "dbo.usp_Lop_ExistsMaLop";
            public const string ExistsTenLop = "dbo.usp_Lop_ExistsTenLop";
            public const string ExistsTenLopExcludingMaLop = "dbo.usp_Lop_ExistsTenLopExcludingMaLop";
        }

        public LopService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<Lop> GetAll()
        {
            var list = new List<Lop>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("SELECT MALOP, TENLOP FROM dbo.vw_Lop_GetAll ORDER BY MALOP", conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(MapLop(reader));
            }
            return list;
        }

        public void Insert(Lop lop)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Insert, conn);
            cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = lop.MaLop.Trim().ToUpperInvariant();
            cmd.Parameters.Add("@TENLOP", SqlDbType.NVarChar, 40).Value = lop.TenLop.Trim();
            cmd.ExecuteNonQuery();
        }

        public void Update(Lop lop)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Update, conn);
            cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = lop.MaLop.Trim().ToUpperInvariant();
            cmd.Parameters.Add("@TENLOP", SqlDbType.NVarChar, 40).Value = lop.TenLop.Trim();
            cmd.ExecuteNonQuery();
        }

        public void Delete(string maLop)
        {
            try
            {
                using var conn = _connectionFactory.CreateConnection();
                using var cmd = CreateStoredProcedureCommand(StoredProcedures.Delete, conn);
                cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = maLop.Trim().ToUpperInvariant();
                cmd.ExecuteNonQuery();
            }
            catch (SqlException ex) when (ex.Number == 547)
            {
                throw new InvalidOperationException("Không thể xóa lớp học vì đã có sinh viên hoặc lịch đăng ký thi liên quan.", ex);
            }
        }

        public List<Lop> Search(string keyword)
        {
            var list = new List<Lop>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.Search, conn);
            cmd.Parameters.Add("@KEYWORD", SqlDbType.NVarChar, 100).Value =
                string.IsNullOrWhiteSpace(keyword) ? DBNull.Value : keyword.Trim();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(MapLop(reader));
            }
            return list;
        }

        public LopDuplicateResult CheckDuplicateForCreate(string maLop, string tenLop)
        {
            return new LopDuplicateResult
            {
                MaLopDuplicate = ExistsMaLop(maLop),
                TenLopDuplicate = ExistsTenLop(tenLop)
            };
        }

        public LopDuplicateResult CheckDuplicateForUpdate(string maLop, string tenLop)
        {
            return new LopDuplicateResult
            {
                MaLopDuplicate = false,
                TenLopDuplicate = ExistsTenLopExcludingMaLop(tenLop, maLop)
            };
        }

        public bool ExistsMaLop(string maLop)
        {
            if (string.IsNullOrWhiteSpace(maLop))
            {
                return false;
            }
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.ExistsMaLop, conn);
            cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = maLop.Trim().ToUpperInvariant();
            return (int)cmd.ExecuteScalar() > 0;
        }

        public bool ExistsTenLop(string tenLop)
        {
            if (string.IsNullOrWhiteSpace(tenLop))
            {
                return false;
            }
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.ExistsTenLop, conn);
            cmd.Parameters.Add("@TENLOP", SqlDbType.NVarChar, 40).Value = tenLop.Trim();
            return (int)cmd.ExecuteScalar() > 0;
        }

        public bool ExistsTenLopExcludingMaLop(string tenLop, string maLop)
        {
            if (string.IsNullOrWhiteSpace(tenLop))
            {
                return false;
            }
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = CreateStoredProcedureCommand(StoredProcedures.ExistsTenLopExcludingMaLop, conn);
            cmd.Parameters.Add("@TENLOP", SqlDbType.NVarChar, 40).Value = tenLop.Trim();
            cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = maLop.Trim().ToUpperInvariant();
            return (int)cmd.ExecuteScalar() > 0;
        }
        public bool CheckHasDependencies(string maLop)
        {
            if (string.IsNullOrWhiteSpace(maLop))
            {
                return false;
            }

            using var conn = _connectionFactory.CreateConnection();
            string sql = @"
                SELECT 1 WHERE EXISTS (
                    SELECT 1 FROM dbo.SINHVIEN WHERE MALOP = @MaLop
                    UNION ALL
                    SELECT 1 FROM dbo.GIAOVIEN_DANGKY WHERE MALOP = @MaLop
                )";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.Add("@MaLop", SqlDbType.NChar, 8).Value = maLop.Trim().ToUpperInvariant();

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

        private static Lop MapLop(SqlDataReader reader)
        {
            return new Lop
            {
                MaLop = reader["MALOP"].ToString() ?? string.Empty,
                TenLop = reader["TENLOP"].ToString() ?? string.Empty
            };
        }
    }
}

