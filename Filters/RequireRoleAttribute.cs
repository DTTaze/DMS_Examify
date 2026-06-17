using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace DMS_Examify.Filters
{
    public class RequireRoleAttribute : ActionFilterAttribute
    {
        private readonly string[] _allowedRoles;

        public RequireRoleAttribute(params string[] allowedRoles)
        {
            _allowedRoles = allowedRoles;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var session = context.HttpContext.Session;
            var role = session.GetString("UserRole");
            var connectionString = session.GetString("DbConnectionString");

            if (string.IsNullOrEmpty(role) || string.IsNullOrEmpty(connectionString))
            {
                context.Result = new RedirectToActionResult("Login", "Auth", null);
                return;
            }

            if (!_allowedRoles.Contains(role))
            {
                context.Result = new RedirectToActionResult("AccessDenied", "Auth", null);
                return;
            }

            base.OnActionExecuting(context);
        }
    }
}
