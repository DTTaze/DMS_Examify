using System.Data;
using DMS_Examify.Models;
using Microsoft.Data.SqlClient;

namespace DMS_Examify.Services
{
    public class BangDiemService : IBangDiemService
    {
        private const string DefaultStringValue = "";
        private const double GradeA_MinScore = 8.5;
        private const double GradeB_MinScore = 7.0;
        private const double GradeC_MinScore = 5.5;
        private const double GradeD_MinScore = 4.0;

        private static class SqlQueries
        {
            public const string SelectClasses =
                "SELECT MALOP, TENLOP FROM vw_BangDiem_DanhSachLop ORDER BY MALOP";

            public const string SelectSubjectsByClass =
                "SELECT MAMH, TENMH FROM vw_BangDiem_MonHocTheoLop WHERE MALOP = @MALOP ORDER BY MAMH";

            public const string SelectAttempts =
                "SELECT LAN FROM vw_BangDiem_LanThiTheoLopMon WHERE MALOP = @MALOP AND MAMH = @MAMH ORDER BY LAN";
        }

        private static class StoredProcedures
        {
            public const string GradeReport = "usp_BangDiemMonHoc";
        }

        private static class Columns
        {
            public const string ClassId = "MALOP";
            public const string ClassName = "TENLOP";
            public const string SubjectId = "MAMH";
            public const string SubjectName = "TENMH";
            public const string StudentId = "MASV";
            public const string LastName = "HO";
            public const string FirstName = "TEN";
            public const string Score = "DIEM";
            public const string Attempt = "LAN";
        }

        private readonly IDbConnectionFactory _connectionFactory;

        public BangDiemService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<Lop> GetClassesWithGrades()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateTextCommand(connection, SqlQueries.SelectClasses);
            return ReadClasses(command);
        }

        public List<MonHoc> GetSubjectsByClass(string classId)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateTextCommand(connection, SqlQueries.SelectSubjectsByClass);
            AddClassParameter(command, classId);
            return ReadSubjects(command);
        }

        public List<int> GetAttemptsByClassAndSubject(string classId, string subjectId)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateTextCommand(connection, SqlQueries.SelectAttempts);
            AddClassParameter(command, classId);
            AddSubjectParameter(command, subjectId);
            return ReadAttempts(command);
        }

        public BangDiemViewModel GetGradeReport(string classId, string subjectId, int attempt)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(connection, StoredProcedures.GradeReport);
            AddClassParameter(command, classId);
            AddSubjectParameter(command, subjectId);
            command.Parameters.Add("@LAN", SqlDbType.SmallInt).Value = attempt;

            return ReadGradeReport(command, classId, subjectId, attempt);
        }

        private static BangDiemViewModel ReadGradeReport(
            SqlCommand command, string classId, string subjectId, int attempt)
        {
            var viewModel = new BangDiemViewModel
            {
                MaLop = classId.Trim(),
                MaMH = subjectId.Trim(),
                Lan = attempt
            };

            using var reader = command.ExecuteReader();
            var rowNumber = 0;

            while (reader.Read())
            {
                if (rowNumber == 0)
                {
                    viewModel.TenLop = ReadString(reader, Columns.ClassName);
                    viewModel.TenMH = ReadString(reader, Columns.SubjectName);
                }

                rowNumber++;
                var score = ReadNullableDouble(reader, Columns.Score);

                viewModel.DanhSach.Add(new BangDiemSinhVien
                {
                    STT = rowNumber,
                    MaSV = ReadString(reader, Columns.StudentId),
                    Ho = ReadString(reader, Columns.LastName),
                    Ten = ReadString(reader, Columns.FirstName),
                    Diem = score,
                    DiemChu = score.HasValue ? ConvertToGradeLetter(score.Value) : ""
                });
            }

            return viewModel;
        }

        private static List<Lop> ReadClasses(SqlCommand command)
        {
            var classes = new List<Lop>();
            using var reader = command.ExecuteReader();

            while (reader.Read())
            {
                var classId = ReadString(reader, Columns.ClassId);
                if (string.IsNullOrWhiteSpace(classId)) continue;

                classes.Add(new Lop
                {
                    MaLop = classId,
                    TenLop = ReadString(reader, Columns.ClassName)
                });
            }

            return classes;
        }

        private static List<MonHoc> ReadSubjects(SqlCommand command)
        {
            var subjects = new List<MonHoc>();
            using var reader = command.ExecuteReader();

            while (reader.Read())
            {
                var subjectId = ReadString(reader, Columns.SubjectId);
                if (string.IsNullOrWhiteSpace(subjectId)) continue;

                subjects.Add(new MonHoc
                {
                    MaMH = subjectId,
                    TenMH = ReadString(reader, Columns.SubjectName)
                });
            }

            return subjects;
        }

        private static List<int> ReadAttempts(SqlCommand command)
        {
            var attempts = new List<int>();
            using var reader = command.ExecuteReader();

            while (reader.Read())
            {
                attempts.Add(ReadInt(reader, Columns.Attempt));
            }

            return attempts;
        }

        private static string ConvertToGradeLetter(double score)
        {
            if (score >= GradeA_MinScore) return "A";
            if (score >= GradeB_MinScore) return "B";
            if (score >= GradeC_MinScore) return "C";
            if (score >= GradeD_MinScore) return "D";
            return "F";
        }

        private static SqlCommand CreateTextCommand(SqlConnection connection, string commandText)
        {
            return new SqlCommand(commandText, connection)
            {
                CommandType = CommandType.Text
            };
        }

        private static SqlCommand CreateStoredProcedureCommand(SqlConnection connection, string procedureName)
        {
            return new SqlCommand(procedureName, connection)
            {
                CommandType = CommandType.StoredProcedure
            };
        }

        private static void AddClassParameter(SqlCommand command, string classId)
        {
            command.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = classId?.Trim() ?? DefaultStringValue;
        }

        private static void AddSubjectParameter(SqlCommand command, string subjectId)
        {
            command.Parameters.Add("@MAMH", SqlDbType.NChar, 5).Value = subjectId?.Trim() ?? DefaultStringValue;
        }

        private static string ReadString(SqlDataReader reader, string columnName)
        {
            var value = reader[columnName];
            return value == DBNull.Value ? DefaultStringValue : value.ToString()!.Trim();
        }

        private static int ReadInt(SqlDataReader reader, string columnName)
        {
            var value = reader[columnName];
            return value == DBNull.Value ? 0 : Convert.ToInt32(value);
        }

        private static double ReadDouble(SqlDataReader reader, string columnName)
        {
            var value = reader[columnName];
            return value == DBNull.Value ? 0.0 : Convert.ToDouble(value);
        }

        private static double? ReadNullableDouble(SqlDataReader reader, string columnName)
        {
            var value = reader[columnName];
            return value == DBNull.Value ? null : Convert.ToDouble(value);
        }
    }
}
