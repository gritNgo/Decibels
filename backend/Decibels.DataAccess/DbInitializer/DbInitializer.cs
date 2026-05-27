using Azure.Identity;
using Decibels.DataAccess.Data;
using Decibels.Models;
using Decibels.Utility;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging; // Added for structural logging support
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
        private readonly IConfiguration _configuration;
        private readonly ILogger<DbInitializer> _logger; 

        public DbInitializer(
            ApplicationDbContext db,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager, 
            IConfiguration configuration,
            ILogger<DbInitializer> logger) 
        {
            _db = db;
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _logger = logger;
        }

        public void Initialize()
        {
            // MIGRATION LAYER
            try 
            {
                // Force an explicit connection pass check to handle Docker wake synchronization
                if (_db.Database.CanConnect())
                {
                    if (_db.Database.GetPendingMigrations().Any())
                    {
                        _db.Database.Migrate();
                    }
                }
                else
                {
                    // Fallback to auto-creation sequence if first boot
                    _db.Database.Migrate();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CRITICAL ERROR: Error applying database migrations, sequence aborted.");
                throw;
            }

            // ROLE AND USER SEEDING LOGIC
            string adminEmail = _configuration["AdminUser:Email"]!; 
            string adminPassword = _configuration["AdminUser:Password"]!;

            if (string.IsNullOrEmpty(adminEmail) || string.IsNullOrEmpty(adminPassword))
            {
                _logger.LogCritical("Admin user data attributes missing from structural configurations initialization variables.");
                throw new InvalidOperationException("Admin user configuration is missing.");
            }

            // create roles if they are not created
            if (!_roleManager.RoleExistsAsync(StaticDetails.Role_Customer).GetAwaiter().GetResult())
            {
                // No need for 'SaveChanges' as CreateAsync takes care of that
                _roleManager.CreateAsync(new IdentityRole(StaticDetails.Role_Customer)).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole(StaticDetails.Role_Employee)).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole(StaticDetails.Role_Admin)).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole(StaticDetails.Role_Company)).GetAwaiter().GetResult();

                // Capture the identity result
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

                // Validate execution success
                if (result.Succeeded)
                {
                    ApplicationUser user = _db.ApplicationUsers.FirstOrDefault(u => u.Email == adminEmail)!;
                    if (user != null)
                    {
                        _userManager.AddToRoleAsync(user, StaticDetails.Role_Admin).GetAwaiter().GetResult();
                        _logger.LogInformation("Root administrative profile records successfully seeded into persistent storage contexts.");
                    }
                }
                else 
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    _logger.LogError("Seeding validation failed on execution constraint exceptions: {Errors}", errors);
                    throw new Exception($"CRITICAL: Admin user seeding failed. Errors: {errors}");
                }
            }
            return;
        }
    }
}