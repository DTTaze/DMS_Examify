using Microsoft.Data.SqlClient;

namespace DMS_Examify.Services
{
    public interface IDbConnectionFactory
    {
        SqlConnection CreateConnection();
    }

    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DbConnectionFactory(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public SqlConnection CreateConnection()
        {
            var connStr = _httpContextAccessor.HttpContext?.Session.GetString("DbConnectionString");
            if (string.IsNullOrEmpty(connStr))
            {
                throw new InvalidOperationException("Phiên kết nối cơ sở dữ liệu đã hết hạn. Vui lòng đăng nhập lại.");
            }
            var connection = new SqlConnection(connStr);
            connection.Open();
            return connection;
        }
    }
}
