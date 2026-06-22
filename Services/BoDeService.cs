using DMS_Examify.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Services
{
    public class BoDeService : IBoDeService
    {
        private const string LecturerRole = "Giangvien";
        private const string DefaultStringValue = "";

        private readonly IDbConnectionFactory _connectionFactory;

        private static class StoredProcedures
        {
            public const string GetList = "dbo.usp_BoDe_GetDanhSach";
            public const string Insert = "dbo.usp_BoDe_Insert";
            public const string Update = "dbo.usp_BoDe_Update";
            public const string Delete = "dbo.usp_BoDe_Delete";
            public const string Search = "dbo.usp_BoDe_Search";
            public const string GetLatestCauHoi = "dbo.usp_BoDe_GetLatestCauHoi";
            public const string GetActiveSubjectCodes = "dbo.usp_BoDe_GetActiveSubjectCodes";
        }

        private static class Columns
        {
            public const string CauHoi = "CAUHOI";
            public const string MaMH = "MAMH";
            public const string TrinhDo = "TRINHDO";
            public const string NoiDung = "NOIDUNG";
            public const string DapAnA = "A";
            public const string DapAnB = "B";
            public const string DapAnC = "C";
            public const string DapAnD = "D";
            public const string DapAn = "DAP_AN";
            public const string MaGV = "MAGV";
        }

        public BoDeService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<BoDe> GetAll(string role, string maGV)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.GetList, connection);

            command.Parameters.Add("@MAGV", SqlDbType.NChar, 8).Value = GetTeacherFilterValue(role, maGV);

            return ReadQuestions(command);
        }

        public int Insert(BoDe model, string maGV)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.Insert, connection);

            AddQuestionParameters(command, model);
            command.Parameters.Add("@MaGV", SqlDbType.NChar, 8).Value = Trim(maGV);

            return Convert.ToInt32(command.ExecuteScalar());
        }

        public void Update(BoDe model, string role, string maGV)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.Update, connection);

            command.Parameters.Add("@CauHoi", SqlDbType.Int).Value = model.CauHoi;
            AddQuestionParameters(command, model);
            command.Parameters.Add("@MAGV", SqlDbType.NChar, 8).Value = GetTeacherFilterValue(role, maGV);
            command.ExecuteNonQuery();
        }

        public void Delete(int cauHoi, string maMH, string role, string maGV)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.Delete, connection);

            command.Parameters.Add("@CauHoi", SqlDbType.Int).Value = cauHoi;
            command.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = Trim(maMH);
            command.Parameters.Add("@MAGV", SqlDbType.NChar, 8).Value = GetTeacherFilterValue(role, maGV);
            command.ExecuteNonQuery();
        }

        public List<BoDe> Search(string? keyword, string role, string maGV)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.Search, connection);

            command.Parameters.Add("@Keyword", SqlDbType.NVarChar, 250).Value = GetDbValue(keyword);
            command.Parameters.Add("@MAGV", SqlDbType.NChar, 8).Value = GetTeacherFilterValue(role, maGV);

            return ReadQuestions(command);
        }

        public int GetLatestCauHoi()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.GetLatestCauHoi, connection);

            var result = command.ExecuteScalar();
            return result != null ? Convert.ToInt32(result) : 0;
        }

        public List<BoDeImportCheckResult> CheckImportSubjects(List<BoDe> items)
        {
            if (items.Count == 0)
            {
                return new List<BoDeImportCheckResult>();
            }

            var subjectCodes = GetActiveSubjectCodes();

            return items.Select((item, index) =>
            {
                return new BoDeImportCheckResult
                {
                    Index = index,
                    MaMH = Trim(item.MaMH),
                    NoiDung = Trim(item.NoiDung),
                    SubjectExists = subjectCodes.Contains(NormalizeCode(item.MaMH)),
                    HasDuplicate = false
                };
            }).ToList();
        }

        private HashSet<string> GetActiveSubjectCodes()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.GetActiveSubjectCodes, connection);
            using var reader = command.ExecuteReader();

            var subjectCodes = new HashSet<string>();
            while (reader.Read())
            {
                var code = NormalizeCode(reader[Columns.MaMH].ToString());
                if (!string.IsNullOrEmpty(code))
                {
                    subjectCodes.Add(code);
                }
            }

            return subjectCodes;
        }

        private static SqlCommand CreateStoredProcedureCommand(string procedureName, SqlConnection connection)
        {
            return new SqlCommand(procedureName, connection)
            {
                CommandType = CommandType.StoredProcedure
            };
        }

        private static List<BoDe> ReadQuestions(SqlCommand command)
        {
            using var reader = command.ExecuteReader();
            var questions = new List<BoDe>();

            while (reader.Read())
            {
                questions.Add(MapQuestion(reader));
            }

            return questions;
        }

        private static BoDe MapQuestion(SqlDataReader reader)
        {
            return new BoDe
            {
                CauHoi = reader.GetInt32(reader.GetOrdinal(Columns.CauHoi)),
                MaMH = ReadString(reader, Columns.MaMH).Trim(),
                TrinhDo = ReadString(reader, Columns.TrinhDo).Trim(),
                NoiDung = ReadString(reader, Columns.NoiDung),
                DapAnA = ReadString(reader, Columns.DapAnA),
                DapAnB = ReadString(reader, Columns.DapAnB),
                DapAnC = ReadString(reader, Columns.DapAnC),
                DapAnD = ReadString(reader, Columns.DapAnD),
                DapAn = ReadString(reader, Columns.DapAn).Trim(),
                MaGV = ReadString(reader, Columns.MaGV).Trim()
            };
        }

        private static void AddQuestionParameters(SqlCommand command, BoDe question)
        {
            AddQuestionParametersWithoutAnswer(command, question);
            command.Parameters.Add("@DapAn", SqlDbType.Char, 1).Value = Trim(question.DapAn);
        }

        private static void AddQuestionParametersWithoutAnswer(SqlCommand command, BoDe question)
        {
            command.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = Trim(question.MaMH);
            command.Parameters.Add("@TrinhDo", SqlDbType.Char, 1).Value = Trim(question.TrinhDo);
            command.Parameters.Add("@NoiDung", SqlDbType.NVarChar, 200).Value = Trim(question.NoiDung);
            command.Parameters.Add("@DapAnA", SqlDbType.NVarChar, 50).Value = Trim(question.DapAnA);
            command.Parameters.Add("@DapAnB", SqlDbType.NVarChar, 50).Value = Trim(question.DapAnB);
            command.Parameters.Add("@DapAnC", SqlDbType.NVarChar, 50).Value = Trim(question.DapAnC);
            command.Parameters.Add("@DapAnD", SqlDbType.NVarChar, 50).Value = Trim(question.DapAnD);
        }

        private static object GetTeacherFilterValue(string role, string maGV)
        {
            return IsLecturer(role) ? Trim(maGV) : DBNull.Value;
        }

        private static bool IsLecturer(string role)
        {
            return string.Equals(role, LecturerRole, StringComparison.OrdinalIgnoreCase);
        }

        private static object GetDbValue(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
        }

        private static string ReadString(SqlDataReader reader, string columnName)
        {
            return reader[columnName].ToString() ?? DefaultStringValue;
        }

        private static string NormalizeCode(string? value)
        {
            return Trim(value).ToUpperInvariant();
        }

        private static string Trim(string? value)
        {
            return value?.Trim() ?? DefaultStringValue;
        }
    }
}
