using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace DMS_Examify.Controllers
{
    /// <summary>
    /// Base controller kiểm tra đăng nhập và phân quyền.
    /// Các controller con kế thừa và gọi [RequireRole("PGV", "Giangvien")] ở action.
    /// </summary>
    public class BaseController : Controller
    {
        protected string ConnectionString
        {
            get
            {
                var connStr = HttpContext.Session.GetString("DbConnectionString");
                if (string.IsNullOrEmpty(connStr))
                {
                    throw new InvalidOperationException("Phiên kết nối cơ sở dữ liệu đã hết hạn. Vui lòng đăng nhập lại.");
                }
                return connStr;
            }
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);

            var role = HttpContext.Session.GetString("UserRole");
            var connStr = HttpContext.Session.GetString("DbConnectionString");

            // Chưa đăng nhập hoặc mất session kết nối → redirect về Login
            if (string.IsNullOrEmpty(role) || string.IsNullOrEmpty(connStr))
            {
                context.Result = RedirectToAction("Login", "Auth");
                return;
            }

            // Set ViewData cho layout hiển thị
            ViewData["UserName"] = HttpContext.Session.GetString("UserName") ?? "User";
            ViewData["UserRole"] = role;
            ViewData["UserLogin"] = HttpContext.Session.GetString("UserLogin") ?? "";
        }

        /// <summary>
        /// Kiểm tra user hiện tại có thuộc 1 trong các vai trò cho phép không.
        /// Nếu không → redirect AccessDenied.
        /// </summary>
        protected bool CheckRole(params string[] allowedRoles)
        {
            var role = HttpContext.Session.GetString("UserRole") ?? "";
            return allowedRoles.Contains(role);
        }

        protected IActionResult Denied()
        {
            return RedirectToAction("AccessDenied", "Auth");
        }
    }
}
