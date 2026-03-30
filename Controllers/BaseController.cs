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
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);

            var role = HttpContext.Session.GetString("UserRole");

            // Chưa đăng nhập → redirect về Login
            if (string.IsNullOrEmpty(role))
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
