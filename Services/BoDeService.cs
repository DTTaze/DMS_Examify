using DMS_Examify.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Services
{
    public class BoDeService : IBoDeService
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public BoDeService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<BoDe> GetAll(string role, string maGV)
        {
            var questions = new List<BoDe>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_GetCauHoiByGiangVien", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            if (role == "PGV")
            {
                cmd.Parameters.AddWithValue("@MAGV", DBNull.Value);
            }
            else
            {
                cmd.Parameters.AddWithValue("@MAGV", maGV);
            }

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                questions.Add(new BoDe
                {
                    CauHoi = reader["CAUHOI"] as int? ?? 0,
                    MaMH = reader["MAMH"]?.ToString() ?? string.Empty,
                    TrinhDo = reader["TRINHDO"]?.ToString() ?? string.Empty,
                    NoiDung = reader["NOIDUNG"]?.ToString() ?? string.Empty,
                    DapAnA = reader["A"]?.ToString() ?? string.Empty,
                    DapAnB = reader["B"]?.ToString() ?? string.Empty,
                    DapAnC = reader["C"]?.ToString() ?? string.Empty,
                    DapAnD = reader["D"]?.ToString() ?? string.Empty,
                    DapAn = reader["DAP_AN"]?.ToString() ?? string.Empty,
                    MaGV = reader["MAGV"]?.ToString() ?? string.Empty
                });
            }
            return questions;
        }

        public int Insert(BoDe model, string maGV)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("usp_BoDe_Insert", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@MaMH", model.MaMH);
            cmd.Parameters.AddWithValue("@TrinhDo", model.TrinhDo);
            cmd.Parameters.AddWithValue("@NoiDung", model.NoiDung);
            cmd.Parameters.AddWithValue("@DapAnA", model.DapAnA);
            cmd.Parameters.AddWithValue("@DapAnB", model.DapAnB);
            cmd.Parameters.AddWithValue("@DapAnC", model.DapAnC);
            cmd.Parameters.AddWithValue("@DapAnD", model.DapAnD);
            cmd.Parameters.AddWithValue("@DapAn", model.DapAn);
            cmd.Parameters.AddWithValue("@MaGV", maGV);

            return Convert.ToInt32(cmd.ExecuteScalar());
        }

        public void Update(BoDe model, string maGV)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_BoDe_Update", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@CauHoi", model.CauHoi);
            cmd.Parameters.AddWithValue("@MaMH", model.MaMH);
            cmd.Parameters.AddWithValue("@TrinhDo", model.TrinhDo);
            cmd.Parameters.AddWithValue("@NoiDung", model.NoiDung);
            cmd.Parameters.AddWithValue("@DapAnA", model.DapAnA);
            cmd.Parameters.AddWithValue("@DapAnB", model.DapAnB);
            cmd.Parameters.AddWithValue("@DapAnC", model.DapAnC);
            cmd.Parameters.AddWithValue("@DapAnD", model.DapAnD);
            cmd.Parameters.AddWithValue("@DapAn", model.DapAn);
            cmd.Parameters.AddWithValue("@MaGV", maGV);

            cmd.ExecuteNonQuery();
        }

        public void Delete(int cauHoi, string maMH)
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_BoDe_Delete", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@CauHoi", cauHoi);
            cmd.Parameters.AddWithValue("@MaMH", maMH);

            cmd.ExecuteNonQuery();
        }

        public List<BoDe> Search(string keyword)
        {
            var questions = new List<BoDe>();
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("dbo.usp_BoDe_Search", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.Add("@Keyword", SqlDbType.NVarChar, 500).Value = string.IsNullOrWhiteSpace(keyword) ? DBNull.Value : keyword;

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                questions.Add(new BoDe
                {
                    CauHoi = reader.GetInt32(reader.GetOrdinal("CAUHOI")),
                    MaMH = reader["MAMH"]?.ToString()?.Trim() ?? "",
                    TrinhDo = reader["TRINHDO"]?.ToString()?.Trim() ?? "",
                    NoiDung = reader["NOIDUNG"]?.ToString() ?? "",
                    DapAnA = reader["A"]?.ToString() ?? "",
                    DapAnB = reader["B"]?.ToString() ?? "",
                    DapAnC = reader["C"]?.ToString() ?? "",
                    DapAnD = reader["D"]?.ToString() ?? "",
                    DapAn = reader["DAP_AN"]?.ToString()?.Trim() ?? "",
                    MaGV = reader["MAGV"]?.ToString()?.Trim() ?? ""
                });
            }
            return questions;
        }

        public int GetLatestCauHoi()
        {
            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("usp_BoDe_GetLatestCauHoi", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            var result = cmd.ExecuteScalar();
            return result != null ? Convert.ToInt32(result) : 0;
        }
    }
}
