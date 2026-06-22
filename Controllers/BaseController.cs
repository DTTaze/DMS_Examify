using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace DMS_Examify.Controllers
{
    public class BaseController : Controller
    {
        protected string ConnectionString => HttpContext.Session.GetString("DbConnectionString")
            ?? throw new InvalidOperationException("Phiên kết nối cơ sở dữ liệu đã hết hạn. Vui lòng đăng nhập lại.");

        protected string CurrentTeacherId => HttpContext.Session.GetString("UserLogin") ?? string.Empty;
        protected string CurrentRole => HttpContext.Session.GetString("UserRole") ?? string.Empty;

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);

            var role = HttpContext.Session.GetString("UserRole");
            var connStr = HttpContext.Session.GetString("DbConnectionString");

            if (string.IsNullOrEmpty(role) || string.IsNullOrEmpty(connStr))
            {
                context.Result = RedirectToAction("Login", "Auth");
                return;
            }

            ViewData["UserName"] = HttpContext.Session.GetString("UserName") ?? "User";
            ViewData["UserRole"] = role;
            ViewData["UserLogin"] = HttpContext.Session.GetString("UserLogin") ?? "";
        }

        protected bool CheckRole(params string[] allowedRoles)
        {
            var role = HttpContext.Session.GetString("UserRole") ?? string.Empty;
            return allowedRoles.Contains(role);
        }

        protected IActionResult Denied() => RedirectToAction("AccessDenied", "Auth");

        protected IActionResult LogAndReturnServerError(ILogger logger, Exception exception, string message)
        {
            logger.LogError(exception, message);
            return StatusCode(500, message);
        }
    }
}

