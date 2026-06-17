using DMS_Examify.Models;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DMS_Examify.Services
{
    public class AuthService : IAuthService
    {
        private const string ColumnUserName = "USERNAME";
        private const string ColumnFullName = "HOTEN";
        private const string ColumnRoleName = "ROLENAME";
        private const string ColumnMaSv = "MaSV";
        private const string ColumnHo = "Ho";
        private const string ColumnTen = "Ten";
        private const string ColumnMaLop = "MaLop";

        private readonly string _templateConnection;
        private readonly string _studentConnection;

        public AuthService(IConfiguration configuration)
        {
            _templateConnection = configuration.GetConnectionString("DatabaseTemplate")
                ?? string.Empty;

            var studentUser = configuration["StudentCredentials:DefaultUser"] ?? "sv";
            var studentPassword = configuration["StudentCredentials:DefaultPassword"] ?? "sv";

            _studentConnection = BuildConnectionString(studentUser, studentPassword);
        }

        public SinhVien? ValidateStudent(string studentId, string password)
        {
            using var conn = new SqlConnection(_studentConnection);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_SinhVien_Login", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("@MASV", studentId);
            cmd.Parameters.AddWithValue("@PASSWORD", password);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
            {
                return null;
            }

            return new SinhVien
            {
                MaSV = reader[ColumnMaSv].ToString() ?? string.Empty,
                Ho = reader[ColumnHo].ToString() ?? string.Empty,
                Ten = reader[ColumnTen].ToString() ?? string.Empty,
                MaLop = reader[ColumnMaLop].ToString() ?? string.Empty
            };
        }

        public LecturerInfo? ValidateLecturer(string login, string password)
        {
            var connStr = BuildConnectionString(login, password);
            using var conn = new SqlConnection(connStr);
            conn.Open();

            using var cmd = new SqlCommand("dbo.usp_TaiKhoan_LayThongTin", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("@LOGINNAME", login);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
            {
                return null;
            }

            return new LecturerInfo(
                Role: reader[ColumnRoleName].ToString() ?? string.Empty,
                UserName: reader[ColumnUserName].ToString() ?? string.Empty,
                FullName: reader[ColumnFullName].ToString() ?? string.Empty
            );
        }

        public string BuildLecturerConnectionString(string login, string password)
            => BuildConnectionString(login, password);

        public string GetStudentConnectionString()
            => _studentConnection;

        private string BuildConnectionString(string userId, string password)
        {
            var builder = new SqlConnectionStringBuilder(_templateConnection)
            {
                IntegratedSecurity = false,
                UserID = userId,
                Password = password,
                TrustServerCertificate = true
            };
            return builder.ConnectionString;
        }
    }
}
