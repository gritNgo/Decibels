using Azure.Identity;
using Decibels.DataAccess.Data;
using Decibels.Models;
using Decibels.Utility;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Decibels.DataAccess.DbInitializer
{
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

            // IDEMPOTENT ROLE CREATION
            string[] roles = { StaticDetails.Role_Customer, StaticDetails.Role_Employee, StaticDetails.Role_Admin, StaticDetails.Role_Company };
            foreach (var role in roles)
            {
                if (!_roleManager.RoleExistsAsync(role).GetAwaiter().GetResult())
                {
                    _roleManager.CreateAsync(new IdentityRole(role)).GetAwaiter().GetResult();
                }
            }

            // ROOT ADMIN PROFILE SEEDING
            // Extracted from local user-secrets or environment variables for security isolation
            // EXTRACT ENVIRONMENT CONFIGURATIONS FROM MERGED PROVIDERS
            // Using colon syntax to cleanly navigate down the nested JSON keys
            string rootAdminEmail = _configuration["UserSeedSettings:RootAdminEmail"]!; 
            string rootAdminPassword = _configuration["UserSeedSettings:RootAdminPassword"]!;

            if (!string.IsNullOrEmpty(rootAdminEmail) && !string.IsNullOrEmpty(rootAdminPassword))
            {
                if (_userManager.FindByEmailAsync(rootAdminEmail).GetAwaiter().GetResult() == null)
                {
                    var rootResult = _userManager.CreateAsync(new ApplicationUser
                    {
                        UserName = rootAdminEmail,
                        Email = rootAdminEmail,
                        Name = "Owner",
                        PhoneNumber = "0000000000",
                        Street = "Secure Root Enclave",
                        City = "Florence",
                        State = "FI",
                        PostalCode = "50100"
                    }, rootAdminPassword).GetAwaiter().GetResult();

                    if (rootResult.Succeeded)
                    {
                        var user = _userManager.FindByEmailAsync(rootAdminEmail).GetAwaiter().GetResult();
                        _userManager.AddToRoleAsync(user!, StaticDetails.Role_Admin).GetAwaiter().GetResult();
                        _logger.LogInformation("Root administrative master identity successfully seeded.");
                    }
                }
            }

            // HARDCODED EVALUATION DEMO ACCOUNTS SEEDING
            // Standardizing the sandbox credentials matrix for one-click auth bypass compliance
            string demoAdminEmail = _configuration["UserSeedSettings:AdminEmail"]!;
            string demoCustomerEmail = _configuration["UserSeedSettings:BuyerEmail"]!;
            string standardDemoPassword = _configuration["UserSeedSettings:DemoPassword"]!;

            // Seed Admin Demo Account if missing
            if (_userManager.FindByEmailAsync(demoAdminEmail).GetAwaiter().GetResult() == null)
            {
                var adminResult = _userManager.CreateAsync(new ApplicationUser
                {
                    UserName = demoAdminEmail,
                    Email = demoAdminEmail,
                    Name = "Demo Administrator",
                    PhoneNumber = "3334445555",
                    Street = "Via de' Tornabuoni 10",
                    City = "Florence",
                    State = "FI",
                    PostalCode = "50123"
                }, standardDemoPassword).GetAwaiter().GetResult();

                if (adminResult.Succeeded)
                {
                    var user = _userManager.FindByEmailAsync(demoAdminEmail).GetAwaiter().GetResult();
                    _userManager.AddToRoleAsync(user!, StaticDetails.Role_Admin).GetAwaiter().GetResult();
                    _logger.LogInformation("Demo administrator profile successfully seeded.");
                }
            }

            // Seed Customer Demo Account if missing
            if (_userManager.FindByEmailAsync(demoCustomerEmail).GetAwaiter().GetResult() == null)
            {
                var customerResult = _userManager.CreateAsync(new ApplicationUser
                {
                    UserName = demoCustomerEmail,
                    Email = demoCustomerEmail,
                    Name = "Demo Customer User",
                    PhoneNumber = "5556667777",
                    Street = "Piazza della Signoria 1",
                    City = "Florence",
                    State = "FI",
                    PostalCode = "50122"
                }, standardDemoPassword).GetAwaiter().GetResult();

                if (customerResult.Succeeded)
                {
                    var user = _userManager.FindByEmailAsync(demoCustomerEmail).GetAwaiter().GetResult();
                    _userManager.AddToRoleAsync(user!, StaticDetails.Role_Customer).GetAwaiter().GetResult();
                    _logger.LogInformation("Demo customer profile successfully seeded.");
                }
            }
        }
    }
}