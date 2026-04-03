using DMS_Examify.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using DMS_Examify.Infrastructure; // Thêm using cho ApplicationDbContext

namespace DMS_Examify.Controllers
{
    public class HomeController : BaseController // Kế thừa BaseController
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            ViewData["Title"] = "Dashboard";
            return View();
        }

        public IActionResult Privacy()
        {
            ViewData["Title"] = "Chính sách quyền riêng tư";
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
