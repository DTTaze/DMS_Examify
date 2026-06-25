using DMS_Examify.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DMS_Examify.Services
{
    public class GiaoVienService : IGiaoVienService
    {
        private const string DefaultStringValue = "";
        private const string CannotDeleteTeacherWithDependenciesMessage = "Khong the xoa giang vien nay vi da co du lieu lien ket.";

        private readonly IDbConnectionFactory _connectionFactory;

        private static class StoredProcedures
        {
            public const string GetAll = "dbo.usp_GiaoVien_GetAll";
            public const string Insert = "dbo.usp_GiaoVien_Insert";
            public const string Update = "dbo.usp_GiaoVien_Update";
            public const string Delete = "dbo.usp_GiaoVien_Delete";
            public const string Search = "dbo.usp_GiaoVien_Search";
            public const string GetExistingIds = "dbo.usp_GiaoVien_GetExistingIds";
            public const string ExistsMaGV = "dbo.usp_GiaoVien_ExistsMaGV";
        }

        private static class TeacherColumns
        {
            public const string MaGV = "MaGV";
            public const string Ho = "Ho";
            public const string Ten = "Ten";
            public const string SoDTLL = "SoDTLL";
            public const string DiaChi = "DiaChi";
        }

        public GiaoVienService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<GiaoVien> GetAll()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.GetAll, connection);

            var teachers = ReadTeachers(command);
            SetTeacherDependencies(teachers);
            return teachers;
        }

        public void Insert(GiaoVien giaoVien)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.Insert, connection);

            AddTeacherParameters(command, giaoVien);
            command.ExecuteNonQuery();
        }

        public void Update(GiaoVien giaoVien)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.Update, connection);

            AddTeacherParameters(command, giaoVien);
            command.ExecuteNonQuery();
        }

        public void Delete(string maGV)
        {
            if (HasDependencies(maGV))
            {
                throw new InvalidOperationException(CannotDeleteTeacherWithDependenciesMessage);
            }

            try
            {
                using var connection = _connectionFactory.CreateConnection();
                using var command = CreateStoredProcedureCommand(StoredProcedures.Delete, connection);

                AddTeacherIdParameter(command, "@MaGV", maGV);
                command.ExecuteNonQuery();
            }
            catch (SqlException ex) when (ex.Number == 547)
            {
                throw new InvalidOperationException(CannotDeleteTeacherWithDependenciesMessage, ex);
            }
        }

        public List<GiaoVien> Search(string? keyword)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.Search, connection);

            command.Parameters.Add("@Keyword", SqlDbType.NVarChar, 250).Value = GetDbValue(keyword);

            var teachers = ReadTeachers(command);
            SetTeacherDependencies(teachers);
            return teachers;
        }

        public List<GiaoVienImportCheckResult> CheckImportDuplicates(List<GiaoVien> items)
        {
            if (items.Count == 0)
            {
                return new List<GiaoVienImportCheckResult>();
            }

            var existingIds = GetExistingGiaoVienIds();
            var seenIdsInFile = new Dictionary<string, int>();

            return items.Select((item, index) =>
            {
                var normalizedId = NormalizeTeacherId(item.MaGV);
                bool isEmptyId = string.IsNullOrWhiteSpace(normalizedId);

                bool idDuplicateDB = !isEmptyId && existingIds.Contains(normalizedId);

                bool idDuplicateFile = false;
                int? idDuplicateFileWithRowIndex = null;
                if (!isEmptyId)
                {
                    if (seenIdsInFile.TryGetValue(normalizedId, out int firstRowIndex))
                    {
                        idDuplicateFile = true;
                        idDuplicateFileWithRowIndex = firstRowIndex;
                    }
                    else
                    {
                        seenIdsInFile.Add(normalizedId, index);
                    }
                }

                return new GiaoVienImportCheckResult
                {
                    Index = index,
                    MaGV = Trim(item.MaGV),
                    Ho = Trim(item.Ho),
                    Ten = Trim(item.Ten),
                    IdDuplicateDB = idDuplicateDB,
                    IdDuplicateFile = idDuplicateFile,
                    IdDuplicateFileWithRowIndex = idDuplicateFileWithRowIndex
                };
            }).ToList();
        }

        public GiaoVienDuplicateResult CheckDuplicateForCreate(string? maGV)
        {
            return new GiaoVienDuplicateResult
            {
                MaGVDuplicate = ExistsMaGV(maGV)
            };
        }

        public bool CheckIsSoftDelete(string maGV)
        {
            return HasDependencies(maGV);
        }

        private bool HasDependencies(string? maGV)
        {
            if (string.IsNullOrWhiteSpace(maGV))
            {
                return false;
            }

            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT 1 WHERE EXISTS (SELECT 1 FROM dbo.BODE WHERE MAGV = @MaGV)
                    OR EXISTS (SELECT 1 FROM dbo.GIAOVIEN_DANGKY WHERE MAGV = @MaGV)";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.Add("@MaGV", SqlDbType.NChar, 8).Value = NormalizeTeacherId(maGV);

            return command.ExecuteScalar() != null;
        }

        private void SetTeacherDependencies(List<GiaoVien> teachers)
        {
            if (teachers.Count == 0)
            {
                return;
            }

            var parameterNames = teachers
                .Select((_, index) => $"@MaGV{index}")
                .ToArray();
            var inClause = string.Join(", ", parameterNames);

            using var connection = _connectionFactory.CreateConnection();
            string sql = $@"
                SELECT DISTINCT MAGV FROM dbo.BODE WHERE MAGV IN ({inClause})
                UNION
                SELECT DISTINCT MAGV FROM dbo.GIAOVIEN_DANGKY WHERE MAGV IN ({inClause})";
            using var command = new SqlCommand(sql, connection);

            for (int i = 0; i < teachers.Count; i++)
            {
                command.Parameters.Add(parameterNames[i], SqlDbType.NChar, 8).Value = NormalizeTeacherId(teachers[i].MaGV);
            }

            using var reader = command.ExecuteReader();
            var dependencyIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            while (reader.Read())
            {
                dependencyIds.Add(NormalizeTeacherId(reader["MAGV"].ToString()));
            }

            foreach (var teacher in teachers)
            {
                teacher.HasDependencies = dependencyIds.Contains(NormalizeTeacherId(teacher.MaGV));
            }
        }

        private bool ExistsMaGV(string? maGV)
        {
            if (string.IsNullOrWhiteSpace(maGV)) return false;

            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.ExistsMaGV, connection);

            command.Parameters.Add("@MaGV", SqlDbType.NChar, 8).Value = maGV.Trim();

            return (int)command.ExecuteScalar()! > 0;
        }

        private HashSet<string> GetExistingGiaoVienIds()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = CreateStoredProcedureCommand(StoredProcedures.GetExistingIds, connection);
            using var reader = command.ExecuteReader();

            var ids = new HashSet<string>();
            while (reader.Read())
            {
                var id = NormalizeTeacherId(reader["MAGV"].ToString());
                if (!string.IsNullOrEmpty(id))
                {
                    ids.Add(id);
                }
            }

            return ids;
        }

        private static SqlCommand CreateStoredProcedureCommand(string procedureName, SqlConnection connection)
        {
            return new SqlCommand(procedureName, connection)
            {
                CommandType = CommandType.StoredProcedure
            };
        }

        private static List<GiaoVien> ReadTeachers(SqlCommand command)
        {
            using var reader = command.ExecuteReader();
            var teachers = new List<GiaoVien>();

            while (reader.Read())
            {
                teachers.Add(MapTeacher(reader));
            }

            return teachers;
        }

        private static GiaoVien MapTeacher(SqlDataReader reader)
        {
            return new GiaoVien
            {
                MaGV = ReadString(reader, TeacherColumns.MaGV),
                Ho = ReadString(reader, TeacherColumns.Ho),
                Ten = ReadString(reader, TeacherColumns.Ten),
                SoDTLL = ReadString(reader, TeacherColumns.SoDTLL),
                DiaChi = ReadString(reader, TeacherColumns.DiaChi)
            };
        }

        private static string ReadString(SqlDataReader reader, string columnName)
        {
            return reader[columnName].ToString() ?? DefaultStringValue;
        }

        private static void AddTeacherParameters(SqlCommand command, GiaoVien teacher)
        {
            command.Parameters.Add("@MaGV", SqlDbType.NChar, 8).Value = Trim(teacher.MaGV);
            command.Parameters.Add("@Ho", SqlDbType.NVarChar, 40).Value = Trim(teacher.Ho);
            command.Parameters.Add("@Ten", SqlDbType.NVarChar, 10).Value = Trim(teacher.Ten);
            command.Parameters.Add("@SoDTLL", SqlDbType.NChar, 15).Value = GetOptionalDbValue(teacher.SoDTLL);
            command.Parameters.Add("@DiaChi", SqlDbType.NVarChar, 50).Value = GetOptionalDbValue(teacher.DiaChi);
        }

        private static void AddTeacherIdParameter(SqlCommand command, string parameterName, string? value)
        {
            command.Parameters.Add(parameterName, SqlDbType.NChar, 8).Value = NormalizeTeacherId(value);
        }

        private static object GetDbValue(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
        }

        private static object GetOptionalDbValue(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
        }

        private static string NormalizeTeacherId(string? maGV)
        {
            return Trim(maGV).ToUpperInvariant();
        }

        private static string Trim(string? value)
        {
            return value?.Trim() ?? DefaultStringValue;
        }
    }
}
