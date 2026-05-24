using Azure.Identity;
using Decibels.DataAccess.Data;
using Decibels.Models;
using Decibels.Utility;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Decibels.DataAccess.DbInitializer
{
    // class responsible for creating Admin and user Roles
    public class DbInitializer : IDbInitializer
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration; // Added to use Azure App Service secrets instead of hard coding sensitive data

        public DbInitializer(
            ApplicationDbContext db,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager, 
            IConfiguration configuration)
        {
            _db = db;
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
        }

        // creates admin and other Roles, and pushes pending migrations
        public void Initialize()
        {
            // if migrations are not applied
            try 
            {
                if (_db.Database.GetPendingMigrations().Count() > 0)
                {
                    _db.Database.Migrate();
                }
            }
            catch (Exception ex)
            {
                // Add Serilog
                Console.WriteLine($"CRITICAL ERROR: Error applying database migrations: {ex.Message}");
                // Re-throw the exception as migration failure is usually a fatal startup error
                throw;
            }

            string adminEmail = _configuration["AdminUser:Email"]; 
            string adminPassword = _configuration["AdminUser:Password"];

            if (string.IsNullOrEmpty(adminEmail) || string.IsNullOrEmpty(adminPassword))
            {
                // Log an error and throw if essential admin details are missing
                Console.WriteLine("CRITICAL ERROR: Admin user email or password not found in configuration.");
                throw new InvalidOperationException("Admin user configuration is missing.");
            }

            // create roles if they are not created
            // using 'GetAwaiter().GetResult()' instead of 'await' in order to get the result of the task
            if (!_roleManager.RoleExistsAsync(StaticDetails.Role_Customer).GetAwaiter().GetResult())
            {
                // No need for 'SaveChanges' as CreateAsync takes care of that
                _roleManager.CreateAsync(new IdentityRole(StaticDetails.Role_Customer)).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole(StaticDetails.Role_Employee)).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole(StaticDetails.Role_Admin)).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole(StaticDetails.Role_Company)).GetAwaiter().GetResult();

                // 1. Capture the identity result
                var result = _userManager.CreateAsync(new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    Name = "Admin User (Configured)",
                    PhoneNumber = "1112223333",
                    Street = "Configured Street",
                    State = "UT",
                    PostalCode = "00000",
                    City = "Configured City",
                }, adminPassword).GetAwaiter().GetResult();

// 2. Explicitly validate execution success
                if (result.Succeeded)
                {
                    ApplicationUser user = _db.ApplicationUsers.FirstOrDefault(u => u.Email == adminEmail);
                    if (user != null)
                    {
                        _userManager.AddToRoleAsync(user, StaticDetails.Role_Admin).GetAwaiter().GetResult();
                    }
                }
                else 
                {
                    // Fail fast and clear out exactly why it failed (e.g., Password policy violation)
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new Exception($"CRITICAL: Admin user seeding failed. Errors: {errors}");
                }
            }
            return;
        }

    }
}
