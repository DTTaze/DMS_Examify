using System.Data;
using DMS_Examify.Models;
using Microsoft.Data.SqlClient;

namespace DMS_Examify.Services
{
    public class DangKyThiService : IDangKyThiService
    {
        private const string RegistrarRole = "PGV";
        private const string DefaultStringValue = "";
        private const string NoServerResponseMessage = "Không nhận được phản hồi từ server.";

        private static class SqlQueries
        {
            public const string SelectClasses = "SELECT MALOP, TENLOP FROM vw_DanhSachLop ORDER BY MALOP";
            public const string SelectSubjects = "SELECT MaMH, TenMH FROM vw_DanhSachMonHoc ORDER BY MaMH";
            public const string SelectTeachers = "SELECT MAGV, HOTEN FROM vw_GiaoVien_DanhSach ORDER BY MAGV";
            public const string SelectAllRegistrations = "SELECT * FROM vw_GiaoVienDangKy ORDER BY NGAYTHI DESC";
            public const string SelectTeacherRegistrations = "SELECT * FROM vw_GiaoVienDangKy WHERE MAGV = @MAGV ORDER BY NGAYTHI DESC";
            public const string CountQuestions = "SELECT dbo.udf_DemSoCauTrongBoDe(@MAMH, @TRINHDO)";
        }

        private static class StoredProcedures
        {
            public const string SelectLevels = "usp_LayDanhSachTrinhDo";
            public const string CreateRegistration = "usp_ThucHienDangKyThi";
            public const string UpdateRegistration = "usp_GiaoVienDangKy_Update";
            public const string DeleteRegistration = "usp_GiaoVienDangKy_Delete";
        }

        private static class Columns
        {
            public const string ClassId = "MALOP";
            public const string ClassName = "TENLOP";
            public const string SubjectId = "MAMH";
            public const string SubjectName = "TENMH";
            public const string TeacherId = "MAGV";
            public const string TeacherName = "TenGV";
            public const string TeacherFullName = "HOTEN";
            public const string LevelId = "MaTrinhDo";
            public const string LevelName = "TenTrinhDo";
            public const string RegistrationLevel = "TRINHDO";
            public const string ExamDate = "NGAYTHI";
            public const string Attempt = "LAN";
            public const string QuestionCount = "SOCAUTHI";
            public const string Duration = "THOIGIAN";
            public const string HasTakenExam = "DaThi";
            public const string IsSuccess = "IsSuccess";
            public const string Message = "ThongBao";
        }

        private readonly IDbConnectionFactory _connectionFactory;

        public DangKyThiService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<Lop> GetAvailableClasses()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateTextCommand(connection, SqlQueries.SelectClasses);
            return ReadClasses(command);
        }

        public List<MonHoc> GetAvailableSubjects()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateTextCommand(connection, SqlQueries.SelectSubjects);
            return ReadSubjects(command);
        }

        public List<TrinhDo> GetAvailableLevels()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(connection, StoredProcedures.SelectLevels);
            return ReadLevels(command);
        }

        public List<GiaoVienDropdownItem> GetAvailableTeachers()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateTextCommand(connection, SqlQueries.SelectTeachers);
            return ReadTeachers(command);
        }

        public List<GiaoVienDangKy> GetRegistrations(string role, string teacherId)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateTextCommand(connection, GetRegistrationsQuery(role));
            AddTeacherFilterWhenNeeded(command, role, teacherId);
            return ReadRegistrations(command);
        }

        public int CountQuestions(string subjectId, string levelId)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateTextCommand(connection, SqlQueries.CountQuestions);
            AddSubjectParameter(command, subjectId);
            AddLevelParameter(command, levelId);

            var result = command.ExecuteScalar();
            return result == null || result == DBNull.Value
                ? 0
                : Convert.ToInt32(result);
        }

        public (bool IsSuccess, string Message) CreateRegistration(GiaoVienDangKy registration)
        {
            return ExecuteRegistrationProcedure(StoredProcedures.CreateRegistration, registration);
        }

        public (bool IsSuccess, string Message) UpdateRegistration(GiaoVienDangKy registration)
        {
            return ExecuteRegistrationProcedure(StoredProcedures.UpdateRegistration, registration);
        }

        public (bool IsSuccess, string Message) DeleteRegistration(string subjectId, string classId, int attempt)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(connection, StoredProcedures.DeleteRegistration);
            AddSubjectParameter(command, subjectId);
            AddClassParameter(command, classId);
            AddAttemptParameter(command, attempt);

            return ReadProcedureResult(command);
        }

        private (bool IsSuccess, string Message) ExecuteRegistrationProcedure(
            string procedureName,
            GiaoVienDangKy registration)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(connection, procedureName);
            AddRegistrationParameters(command, registration);
            return ReadProcedureResult(command);
        }

        private static void AddRegistrationParameters(SqlCommand command, GiaoVienDangKy registration)
        {
            AddTeacherParameter(command, registration.MaGV);
            AddClassParameter(command, registration.MaLop);
            AddSubjectParameter(command, registration.MaMH);
            AddLevelParameter(command, registration.TrinhDo);
            AddAttemptParameter(command, registration.Lan);
            command.Parameters.Add("@SOCAUTHI", SqlDbType.Int).Value = registration.SoCauThi;
            command.Parameters.Add("@THOIGIAN", SqlDbType.Int).Value = registration.ThoiGian;
            command.Parameters.Add("@NGAYTHI", SqlDbType.DateTime).Value = registration.NgayThi;
        }

        private (bool IsSuccess, string Message) ReadProcedureResult(SqlCommand command)
        {
            using var reader = command.ExecuteReader();
            if (!reader.Read())
            {
                return (false, NoServerResponseMessage);
            }

            return (
                ReadBool(reader, Columns.IsSuccess),
                ReadString(reader, Columns.Message));
        }

        private static List<Lop> ReadClasses(SqlCommand command)
        {
            var classes = new List<Lop>();
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var examClass = MapClass(reader);
                if (examClass != null)
                {
                    classes.Add(examClass);
                }
            }

            return classes;
        }

        private static List<MonHoc> ReadSubjects(SqlCommand command)
        {
            var subjects = new List<MonHoc>();
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var subject = MapSubject(reader);
                if (subject != null)
                {
                    subjects.Add(subject);
                }
            }

            return subjects;
        }

        private static List<TrinhDo> ReadLevels(SqlCommand command)
        {
            var levels = new List<TrinhDo>();
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var level = MapLevel(reader);
                if (level != null)
                {
                    levels.Add(level);
                }
            }

            return levels;
        }

        private static List<GiaoVienDropdownItem> ReadTeachers(SqlCommand command)
        {
            var teachers = new List<GiaoVienDropdownItem>();
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var teacher = MapTeacher(reader);
                if (teacher != null)
                {
                    teachers.Add(teacher);
                }
            }

            return teachers;
        }

        private static List<GiaoVienDangKy> ReadRegistrations(SqlCommand command)
        {
            var registrations = new List<GiaoVienDangKy>();
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                registrations.Add(MapRegistration(reader));
            }

            return registrations;
        }

        private static SqlCommand CreateTextCommand(SqlConnection connection, string commandText)
        {
            return CreateCommand(connection, commandText, CommandType.Text);
        }

        private static SqlCommand CreateStoredProcedureCommand(SqlConnection connection, string procedureName)
        {
            return CreateCommand(connection, procedureName, CommandType.StoredProcedure);
        }

        private static SqlCommand CreateCommand(
            SqlConnection connection,
            string commandText,
            CommandType commandType)
        {
            return new SqlCommand(commandText, connection)
            {
                CommandType = commandType
            };
        }

        private static string GetRegistrationsQuery(string role)
        {
            return IsRegistrarRole(role)
                ? SqlQueries.SelectAllRegistrations
                : SqlQueries.SelectTeacherRegistrations;
        }

        private static void AddTeacherFilterWhenNeeded(SqlCommand command, string role, string teacherId)
        {
            if (IsRegistrarRole(role))
            {
                return;
            }

            AddTeacherParameter(command, teacherId);
        }

        private static Lop? MapClass(SqlDataReader reader)
        {
            var classId = ReadString(reader, Columns.ClassId);
            if (string.IsNullOrWhiteSpace(classId))
            {
                return null;
            }

            return new Lop
            {
                MaLop = classId,
                TenLop = ReadString(reader, Columns.ClassName)
            };
        }

        private static MonHoc? MapSubject(SqlDataReader reader)
        {
            var subjectId = ReadString(reader, Columns.SubjectId);
            if (string.IsNullOrWhiteSpace(subjectId))
            {
                return null;
            }

            return new MonHoc
            {
                MaMH = subjectId,
                TenMH = ReadString(reader, Columns.SubjectName)
            };
        }

        private static TrinhDo? MapLevel(SqlDataReader reader)
        {
            var levelId = ReadString(reader, Columns.LevelId);
            if (string.IsNullOrWhiteSpace(levelId))
            {
                return null;
            }

            return new TrinhDo
            {
                MaTrinhDo = levelId,
                TenTrinhDo = ReadString(reader, Columns.LevelName)
            };
        }

        private static GiaoVienDropdownItem? MapTeacher(SqlDataReader reader)
        {
            var teacherId = ReadString(reader, Columns.TeacherId);
            if (string.IsNullOrWhiteSpace(teacherId))
            {
                return null;
            }

            return new GiaoVienDropdownItem
            {
                MaGV = teacherId,
                HoTen = ReadString(reader, Columns.TeacherFullName)
            };
        }

        private static GiaoVienDangKy MapRegistration(SqlDataReader reader)
        {
            return new GiaoVienDangKy
            {
                MaGV = ReadString(reader, Columns.TeacherId),
                TenGV = ReadString(reader, Columns.TeacherName),
                MaMH = ReadString(reader, Columns.SubjectId),
                TenMH = ReadString(reader, Columns.SubjectName),
                MaLop = ReadString(reader, Columns.ClassId),
                TenLop = ReadString(reader, Columns.ClassName),
                TrinhDo = ReadString(reader, Columns.RegistrationLevel),
                NgayThi = ReadDateTime(reader, Columns.ExamDate),
                Lan = ReadInt(reader, Columns.Attempt, defaultValue: 1),
                SoCauThi = ReadInt(reader, Columns.QuestionCount),
                ThoiGian = ReadInt(reader, Columns.Duration),
                DaThi = ReadBool(reader, Columns.HasTakenExam)
            };
        }

        private static void AddTeacherParameter(SqlCommand command, string teacherId)
        {
            command.Parameters.Add("@MAGV", SqlDbType.NChar, 8).Value = Trim(teacherId);
        }

        private static void AddClassParameter(SqlCommand command, string classId)
        {
            command.Parameters.Add("@MALOP", SqlDbType.NChar, 8).Value = Trim(classId);
        }

        private static void AddSubjectParameter(SqlCommand command, string subjectId)
        {
            command.Parameters.Add("@MAMH", SqlDbType.NChar, 5).Value = Trim(subjectId);
        }

        private static void AddLevelParameter(SqlCommand command, string levelId)
        {
            command.Parameters.Add("@TRINHDO", SqlDbType.NChar, 1).Value = Trim(levelId);
        }

        private static void AddAttemptParameter(SqlCommand command, int attempt)
        {
            command.Parameters.Add("@LAN", SqlDbType.Int).Value = attempt;
        }

        private static string ReadString(SqlDataReader reader, string columnName)
        {
            var value = reader[columnName];
            return value == DBNull.Value ? DefaultStringValue : value.ToString()!.Trim();
        }

        private static int ReadInt(SqlDataReader reader, string columnName, int defaultValue = 0)
        {
            var value = reader[columnName];
            return value == DBNull.Value ? defaultValue : Convert.ToInt32(value);
        }

        private static bool ReadBool(SqlDataReader reader, string columnName)
        {
            var value = reader[columnName];
            return value != DBNull.Value && Convert.ToBoolean(value);
        }

        private static DateTime ReadDateTime(SqlDataReader reader, string columnName)
        {
            var value = reader[columnName];
            return value == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(value);
        }

        private static bool IsRegistrarRole(string role)
        {
            return string.Equals(role, RegistrarRole, StringComparison.OrdinalIgnoreCase);
        }

        private static string Trim(string? value)
        {
            return value?.Trim() ?? DefaultStringValue;
        }
    }
}
