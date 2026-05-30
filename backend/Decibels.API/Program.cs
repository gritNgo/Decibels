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
using Decibels.API.Services;
using Microsoft.OpenApi.Models;
using System.Text; 
using Microsoft.AspNetCore.Authentication.JwtBearer; 
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Formatting.Compact;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------
// DIAGNOSTIC OBSERVABILITY SERVICES (SERILOG)
// ---------------------------------------------------------
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning) // Silence framework boilerplate noise
    .Enrich.FromLogContext()
    .WriteTo.Console(new CompactJsonFormatter()) // Forces output into structured prod-ready JSON
    .CreateLogger();

builder.Host.UseSerilog(); // Injects Serilog into the dependency injection container engine

// ---------------------------------------------------------
// DATABASE & ARCHITECTURAL CORE SERVICES
// ---------------------------------------------------------

// .NET 8 automatically cascades config: Base JSON -> Env JSON -> User Secrets -> Env Variables
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Identity Pipeline Setup (Used for core user/token validation)
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// ---------------------------------------------------------
// JWT AUTHENTICATION CORE CONFIGURATION LAYER
// ---------------------------------------------------------
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.ASCII.GetBytes(jwtSection.GetValue<string>("Secret")!);

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment(); 
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(secretKey),
            ValidateIssuer = true,
            ValidIssuer = jwtSection.GetValue<string>("Issuer"),
            ValidateAudience = true,
            ValidAudience = jwtSection.GetValue<string>("Audience"),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Strongly Typed Configuration Mapping
builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));

// Infrastructure & Storage
builder.Services.AddSingleton<IStorageService, AzureBlobStorageService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.AddScoped<IDbInitializer, DbInitializer>();

// ---------------------------------------------------------
// DECOUPLED FRONTEND & API SUPPORT SERVICES
// ---------------------------------------------------------

// Reconfigured CORS p[policy for decoupled frontend channels
var frontendUrl = builder.Configuration["FrontendUrl"] 
                  ?? throw new InvalidOperationException("FrontendUrl is not configured.");

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", frontendUrl.TrimEnd('/')) // prevent accidents with TrimEnd()
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // Essential for identity token handling, cookies, and sessions
    });
});

// Replace AddControllersWithViews() with lightweight JSON API controllers
builder.Services.AddControllers();

// Swagger OpenAPI to verify endpoints visually (with JWT Bearer lock support)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Decibels API", Version = "v1" });

    // Define the Security Requirement Schema Type
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer eyJhbGciOi...\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Bind the Global Operational Authorization Guard to the Controller Actions
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// ---------------------------------------------------------
// HTTP REQUEST MIDDLEWARE PIPELINE 
// ---------------------------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    // Enable Swagger discovery page inside development mode
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Decibels API v1"));
}

app.UseHttpsRedirection();

// This automatically logs every incoming HTTP request method, path, status code, and latency duration as a clean structured JSON log
app.UseSerilogRequestLogging();

// Resolve the route first
app.UseRouting();

// Inject CORS directly into the request processing stream to the resolved route 
app.UseCors(); 

// Global Third-Party Configuration initialization
var stripeSecretKey = builder.Configuration["Stripe:SecretKey"];
StripeConfiguration.ApiKey = stripeSecretKey;

// Secure the route
app.UseAuthentication();
app.UseAuthorization();

// Execution Database Seeding on boot
SeedDatabase();

// Map API Attribute Controllers instead of server-side Razor/MVC routes
app.MapControllers();

app.Run();

// Database initialization helper scope isolated cleanly
void SeedDatabase()
{
    using var scope = app.Services.CreateScope();
    var dbInitializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();
    dbInitializer.Initialize();
}

// This forces the compiler to expose Program publicly, unlocking it for WebApplicationFactory assembly wrapper used in the integration testsproject
public partial class Program { }