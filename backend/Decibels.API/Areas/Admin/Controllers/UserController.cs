using Microsoft.AspNetCore.Mvc;
using Decibels.DataAccess.Data;
using Decibels.Models;
using Microsoft.AspNetCore.Authorization;
using Decibels.Utility;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Decibels.API.Areas.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = StaticDetails.Role_Admin)] // Strict guard-rail over structural user credentials management records
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<UserController> _logger;

        public UserController(ApplicationDbContext db, ILogger<UserController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // GET: api/user
        [HttpGet]
        public ActionResult<IEnumerable<ApplicationUser>> GetAll()
        {
            try
            {
                // Ingest explicit query paths to grab lazy-loaded corporate navigation properties
                List<ApplicationUser> objUserList = _db.ApplicationUsers.Include(u => u.Company).ToList();

                var userRoles = _db.UserRoles.ToList();
                var roles = _db.Roles.ToList();

                foreach (var user in objUserList)
                {
                    var userRoleMapping = userRoles.FirstOrDefault(u => u.UserId == user.Id);
                    if (userRoleMapping != null)
                    {
                        var role = roles.FirstOrDefault(u => u.Id == userRoleMapping.RoleId);
                        if (role != null)
                        {
                            user.Role = role.Name;
                        }
                    }

                    // Protect client parsing loops against null entity objects by delivering structured fallback values
                    if (user.Company == null)
                    {
                        user.Company = new Company() { Name = string.Empty };
                    }
                }

                return Ok(objUserList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resolve systemic Identity catalog tables graphs.");
                return StatusCode(500, "Security matrix query subsystem fault.");
            }
        }

        // POST: api/user/lock-unlock
        [HttpPost("lock-unlock")]
        public IActionResult LockUnlock([FromBody] string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return BadRequest(new { message = "Target tracking key signature must be supplied." });
                }

                var objFromDb = _db.ApplicationUsers.FirstOrDefault(u => u.Id == id);
                if (objFromDb == null)
                {
                    return NotFound(new { message = "Target identity user record could not be mapped." });
                }

                bool isCurrentlyLocked = objFromDb.LockoutEnd != null && objFromDb.LockoutEnd > DateTime.Now;

                if (isCurrentlyLocked)
                {
                    // Revoke lockout bounds by shifting expiration to baseline execution windows
                    objFromDb.LockoutEnd = DateTime.Now;
                }
                else
                {
                    // Enforce structural suspension by projecting constraints 100 years out
                    objFromDb.LockoutEnd = DateTime.Now.AddYears(100);
                }

                _db.SaveChanges();

                return Ok(new 
                { 
                    success = true, 
                    message = isCurrentlyLocked ? "Identity access unlocked successfully." : "Identity token access locked down completely.",
                    isLocked = !isCurrentlyLocked
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Critical failure handling account containment mutations for user account index: {id}");
                return StatusCode(500, "Identity state mutation persist failure.");
            }
        }
    }
}