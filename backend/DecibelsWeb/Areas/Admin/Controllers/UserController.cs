using Microsoft.AspNetCore.Mvc;
using Decibels.DataAccess.Data;
using Decibels.Models;
using Decibels.DataAccess.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;
using Decibels.Models.ViewModels;
using Decibels.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DecibelsWeb.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = StaticDetails.Role_Admin)]
    public class UserController : Controller
    {
        private readonly ApplicationDbContext _db;

        public UserController(ApplicationDbContext db)
        {
            _db = db;
        }

        public IActionResult Index()
        {
            return View();
        }

        


        #region API CALLS
        // Get role of users
        [HttpGet]
        public IActionResult GetAll()
        {
            List<ApplicationUser> objUserList = _db.ApplicationUsers.Include(u => u.Company).ToList();

            // Role of AspNetUsers table is inside AspNetRoles table and the 2 are joined and mapped by AspNetUserRoles table 
            // access built-on Identity tables with dbContext by removing the 'AspNet' prefix before the table name i.e. AspNetUserRoles > _db.UserRoles
            var userRoles = _db.UserRoles.ToList();
            var roles = _db.Roles.ToList();

            foreach (var user in objUserList)
            {
                // based on user's roleId from the UserRoles table where both UserId and RoleId of users are mapped, find the role name from Roles table
                var roleId = userRoles.FirstOrDefault(u => u.UserId == user.Id).RoleId;
                // this role needs to be passed into the data, so add a [NotMapped] property in the ApplicationUser model
                user.Role = roles.FirstOrDefault(u=>u.Id == roleId).Name;  

                if (user.Company == null)
                {
                    user.Company = new Company()
                    {
                        Name = ""
                    };
                }
            }

            return Json(new { data = objUserList });
        }

        // Lock any account until a future date
        [HttpPost]
        public IActionResult LockUnlock([FromBody]string id)
        {
            var objFromDb = _db.ApplicationUsers.FirstOrDefault(u=> u.Id == id);
            if (objFromDb == null)
            {
                return Json(new { success = false, message = "Error while Locking/Unlocking"});
            }

            if (objFromDb.LockoutEnd != null && objFromDb.LockoutEnd > DateTime.Now)
            {
                // user is locked and needs to be unlocked
                objFromDb.LockoutEnd = DateTime.Now;
            }

            else
            {
                objFromDb.LockoutEnd = DateTime.Now.AddYears(100);
            }
            _db.SaveChanges();

            return Json(new { success = true, message = "Operation Successful" });
        }

        #endregion

    }
}
