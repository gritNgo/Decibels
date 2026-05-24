using Decibels.DataAccess.Repository;
using Decibels.DataAccess.Repository.IRepository;
using Decibels.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Decibels.Utility;
using Microsoft.AspNetCore.Identity.UI.Services;
using Stripe;
using Decibels.DataAccess.DbInitializer;
using Azure.Storage.Blobs;
using Decibels.Models;
using DecibelsWeb.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------
// 1. DATABASE & ARCHITECTURAL CORE SERVICES
// ---------------------------------------------------------

// .NET 8 automatically cascades config: Base JSON -> Env JSON -> User Secrets -> Env Variables
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Identity Pipeline Setup
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options => {
    options.LoginPath = "/Identity/Account/Login";
    options.LogoutPath = "/Identity/Account/Logout";
    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
});

// Strongly Typed Configuration Mapping (Avoids manual string lookups in controllers)
builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));

builder.Services.AddAuthentication().AddFacebook(options => {
    options.AppId = builder.Configuration["Authentication:Facebook:AppId"] 
        ?? throw new InvalidOperationException("Facebook AppId is missing.");
    options.AppSecret = builder.Configuration["Authentication:Facebook:AppSecret"] 
        ?? throw new InvalidOperationException("Facebook AppSecret is missing.");
    options.AccessDeniedPath = "/Identity/Account/ExternalLogin";
});

// Infrastructure & Storage
builder.Services.AddSingleton<IStorageService, AzureBlobStorageService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.AddScoped<IDbInitializer, DbInitializer>();

// State & Presentation Support
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options => {
    options.IdleTimeout = TimeSpan.FromMinutes(100);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// ---------------------------------------------------------
// 2. HTTP REQUEST PIPELINE (MIDDLEWARE)
// ---------------------------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // Gives clean stack traces locally
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// Global Third-Party Configuration initialization
var stripeSecretKey = builder.Configuration["Stripe:SecretKey"];
StripeConfiguration.ApiKey = stripeSecretKey;

app.UseAuthentication();
app.UseAuthorization();
app.UseSession();

// Execution Database Seeding on boot
SeedDatabase();

app.MapRazorPages();
app.MapControllerRoute(
    name: "default",
    pattern: "{area=Customer}/{controller=Home}/{action=Index}/{id?}");

app.Run();

// Database initialization helper scope isolated cleanly
void SeedDatabase()
{
    using var scope = app.Services.CreateScope();
    var dbInitializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();
    dbInitializer.Initialize();
}