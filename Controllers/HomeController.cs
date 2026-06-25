using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace DMS_Examify.Controllers
{
    public class HomeController : BaseController
    {
        public IActionResult Index()
        {
            var role = HttpContext.Session.GetString("UserRole");

            if (role == "PGV")
            {
                return RedirectToAction("Index", "MonHoc");
            }
            if (role == "Giangvien")
            {
                return RedirectToAction("Index", "BoDe");
            }
            if (role == "Sinhvien")
            {
                return RedirectToAction("Index", "Thi");
            }

            return RedirectToAction("Login", "Auth");
        }

        public IActionResult Privacy()
        {
            ViewData["Title"] = "Privacy Policy";
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
