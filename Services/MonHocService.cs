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
            public const string Insert = "dbo.usp_MonHoc_Insert";
            public const string Update = "dbo.usp_MonHoc_Update";
            public const string Search = "dbo.usp_MonHoc_Search";
        }

        public MonHocService(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public List<MonHoc> GetAll()
        {
            var subjects = new List<MonHoc>();
            using var conn = (SqlConnection)_connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("SELECT MaMH, TenMH FROM dbo.MONHOC", conn);
            cmd.CommandType = CommandType.Text;
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
            try
            {
                using var conn = (SqlConnection)_connectionFactory.CreateConnection();
                using var cmd = new SqlCommand("DELETE FROM [dbo].[MONHOC] WHERE [MaMH] = @MaMH", conn);
                cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = NormalizeSubjectCode(maMH);
                cmd.ExecuteNonQuery();
            }
            catch (SqlException ex) when (ex.Number == 547)
            {
                throw new InvalidOperationException("Không thể xóa môn học vì đã có dữ liệu liên quan.", ex);
            }
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
                return new SubjectDuplicateCheckResult(false);
            }

            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("SELECT 1 WHERE EXISTS (SELECT 1 FROM dbo.MONHOC WHERE MaMH = @MaMH)", conn);
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = NormalizeSubjectCode(maMH);

            return new SubjectDuplicateCheckResult(cmd.ExecuteScalar() != null);
        }

        public SubjectDuplicateCheckResult CheckTenMHDuplicate(string tenMH)
        {
            if (string.IsNullOrWhiteSpace(tenMH))
            {
                return new SubjectDuplicateCheckResult(false);
            }

            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("SELECT 1 WHERE EXISTS (SELECT 1 FROM dbo.MONHOC WHERE TenMH = @TenMH)", conn);
            cmd.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40).Value = tenMH.Trim();

            return new SubjectDuplicateCheckResult(cmd.ExecuteScalar() != null);
        }

        public SubjectDuplicateCheckResult CheckTenMHDuplicateExcludingMaMH(string tenMH, string maMH)
        {
            if (string.IsNullOrWhiteSpace(tenMH))
            {
                return new SubjectDuplicateCheckResult(false);
            }

            using var conn = _connectionFactory.CreateConnection();
            using var cmd = new SqlCommand("SELECT 1 WHERE EXISTS (SELECT 1 FROM dbo.MONHOC WHERE TenMH = @TenMH AND MaMH <> @MaMH)", conn);
            cmd.Parameters.Add("@TenMH", SqlDbType.NVarChar, 40).Value = tenMH.Trim();
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = NormalizeSubjectCode(maMH);

            return new SubjectDuplicateCheckResult(cmd.ExecuteScalar() != null);
        }

        public bool CheckHasDependencies(string maMH)
        {
            if (string.IsNullOrWhiteSpace(maMH))
            {
                return false;
            }

            using var conn = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT 1 WHERE EXISTS (SELECT 1 FROM dbo.BANGDIEM WHERE MAMH = @MaMH)
                    OR EXISTS (SELECT 1 FROM dbo.BODE WHERE MAMH = @MaMH)
                    OR EXISTS (SELECT 1 FROM dbo.GIAOVIEN_DANGKY WHERE MAMH = @MaMH)";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.Add("@MaMH", SqlDbType.NChar, 5).Value = NormalizeSubjectCode(maMH);

            return cmd.ExecuteScalar() != null;
        }

        public List<ImportValidationResultDto> ValidateImportDuplicates(List<MonHoc> items)
        {
            var activeCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var activeNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            if (items.Any())
            {
                var dt = new DataTable();
                dt.Columns.Add("MaMH", typeof(string));
                dt.Columns.Add("TenMH", typeof(string));

                foreach (var item in items)
                {
                    if (!string.IsNullOrWhiteSpace(item.MaMH) || !string.IsNullOrWhiteSpace(item.TenMH))
                    {
                        dt.Rows.Add(
                            item.MaMH?.Trim() ?? string.Empty,
                            item.TenMH?.Trim() ?? string.Empty
                        );
                    }
                }

                if (dt.Rows.Count > 0)
                {
                    using var conn = (SqlConnection)_connectionFactory.CreateConnection();
                    using var cmd = new SqlCommand("dbo.usp_MonHoc_CheckImport", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    var tvpParam = cmd.Parameters.AddWithValue("@ImportData", dt);
                    tvpParam.SqlDbType = SqlDbType.Structured;
                    tvpParam.TypeName = "dbo.udt_MonHocImportCheck";

                    using var reader = cmd.ExecuteReader();
                    
                    while (reader.Read())
                    {
                        activeCodes.Add(reader["MaMH"].ToString()!.Trim().ToUpper());
                    }

                    if (reader.NextResult())
                    {
                        while (reader.Read())
                        {
                            activeNames.Add(reader["TenMH"].ToString()!.Trim().ToLower());
                        }
                    }
                }
            }

            var seenCodesInFile = new Dictionary<string, int>();
            var seenNamesInFile = new Dictionary<string, int>();

            return items.Select((item, index) =>
            {
                var code = item.MaMH?.Trim().ToUpper() ?? string.Empty;
                var name = item.TenMH?.Trim().ToLower() ?? string.Empty;

                bool isEmptyCode = string.IsNullOrWhiteSpace(code);
                bool isEmptyName = string.IsNullOrWhiteSpace(name);

                bool codeDuplicateDB = !isEmptyCode && activeCodes.Contains(code);
                bool nameDuplicateDB = !isEmptyName && activeNames.Contains(name);

                bool codeDuplicateFile = false;
                int? codeDuplicateFileWithRowIndex = null;
                if (!isEmptyCode)
                {
                    if (seenCodesInFile.TryGetValue(code, out int firstCodeRow))
                    {
                        codeDuplicateFile = true;
                        codeDuplicateFileWithRowIndex = firstCodeRow;
                    }
                    else
                    {
                        seenCodesInFile.Add(code, index);
                    }
                }

                bool nameDuplicateFile = false;
                int? nameDuplicateFileWithRowIndex = null;
                if (!isEmptyName)
                {
                    if (seenNamesInFile.TryGetValue(name, out int firstNameRow))
                    {
                        nameDuplicateFile = true;
                        nameDuplicateFileWithRowIndex = firstNameRow;
                    }
                    else
                    {
                        seenNamesInFile.Add(name, index);
                    }
                }

                return new ImportValidationResultDto
                {
                    Index = index,
                    MaMH = item.MaMH?.Trim() ?? string.Empty,
                    TenMH = item.TenMH?.Trim() ?? string.Empty,
                    IsEmptyCode = isEmptyCode,
                    IsEmptyName = isEmptyName,
                    CodeDuplicateDB = codeDuplicateDB,
                    NameDuplicateDB = nameDuplicateDB,
                    CodeDuplicateFile = codeDuplicateFile,
                    CodeDuplicateFileWithRowIndex = codeDuplicateFileWithRowIndex,
                    NameDuplicateFile = nameDuplicateFile,
                    NameDuplicateFileWithRowIndex = nameDuplicateFileWithRowIndex
                };
            }).ToList();
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

