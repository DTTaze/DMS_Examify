using DMS_Examify.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Services
{
    public class LopService : ILopService
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public LopService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<Lop> GetAll()
        {
            var list = new List<Lop>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_Lop_GetAll", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new Lop
                {
                    MaLop = reader["MALOP"].ToString() ?? "",
                    TenLop = reader["TENLOP"].ToString() ?? ""
                });
            }
            return list;
        }

        public void Insert(Lop lop)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_Lop_Insert", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = lop.MaLop;
            cmd.Parameters.Add("@TENLOP", SqlDbType.NVarChar, 40).Value = lop.TenLop;
            cmd.ExecuteNonQuery();
        }

        public void Update(Lop lop)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_Lop_Update", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = lop.MaLop;
            cmd.Parameters.Add("@TENLOP", SqlDbType.NVarChar, 40).Value = lop.TenLop;
            cmd.ExecuteNonQuery();
        }

        public void Delete(string maLop)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_Lop_Delete", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = maLop;
            cmd.ExecuteNonQuery();
        }

        public List<Lop> Search(string keyword)
        {
            var list = new List<Lop>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_Lop_Search", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@KEYWORD", SqlDbType.NVarChar, 100).Value =
                string.IsNullOrWhiteSpace(keyword) ? DBNull.Value : keyword.Trim();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new Lop
                {
                    MaLop = reader["MALOP"].ToString() ?? "",
                    TenLop = reader["TENLOP"].ToString() ?? ""
                });
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
            if (string.IsNullOrWhiteSpace(maLop)) return false;
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_Lop_ExistsMaLop", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = maLop.Trim();
            return (int)cmd.ExecuteScalar() > 0;
        }

        public bool ExistsTenLop(string tenLop)
        {
            if (string.IsNullOrWhiteSpace(tenLop)) return false;
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_Lop_ExistsTenLop", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@TENLOP", SqlDbType.NVarChar, 40).Value = tenLop.Trim();
            return (int)cmd.ExecuteScalar() > 0;
        }

        public bool ExistsTenLopExcludingMaLop(string tenLop, string maLop)
        {
            if (string.IsNullOrWhiteSpace(tenLop)) return false;
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_Lop_ExistsTenLopExcludingMaLop", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.Add("@TENLOP", SqlDbType.NVarChar, 40).Value = tenLop.Trim();
            cmd.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = maLop.Trim();
            return (int)cmd.ExecuteScalar() > 0;
        }
    }
}
