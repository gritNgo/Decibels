using Xunit;
using Testcontainers.MsSql;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using System.Collections.Generic; 
using System.Linq;
using System;
using Decibels.DataAccess.Data;
using DotNet.Testcontainers.Builders;
using Microsoft.Extensions.Configuration; 

namespace Decibels.API.IntegrationTests
{
    public class IntegrationTestBase : IAsyncLifetime
    {
        // Configured with explicit environment variables to bypass container runtime initialization blocks
        protected readonly MsSqlContainer DbContainer = new MsSqlBuilder()
            .WithImage("mcr.microsoft.com/mssql/server:2022-latest") // using latest instead of specific image like in API project
            .WithPassword("Strong_Arch_Pass123!") 
            .WithEnvironment("ACCEPT_EULA", "Y")  
            .WithWaitStrategy(Wait.ForUnixContainer().UntilPortIsAvailable(1433))   // Bypasses the broken sqlcmd utility check

            .Build();

        protected WebApplicationFactory<Program> Factory { get; private set; } = default!;
        protected HttpClient Client { get; private set; } = default!;
        public const string TestUserId = "mock-integration-user-id";
        
        public IntegrationTestBase()
        {
            AppContext.SetSwitch("System.Text.Json.Serialization.DisableDefaultPipeWriterOptimization", true);
        }

        public async Task InitializeAsync()
        {
            await DbContainer.StartAsync();

            Factory = new WebApplicationFactory<Program>()
                .WithWebHostBuilder(builder =>
                {
                    builder.ConfigureAppConfiguration((context, config) =>
                    {
                        // Inject test configuration values to pass the DbInitializer guard rails
                        var testSettings = new Dictionary<string, string?>
                        {
                            ["AdminUser:Email"] = "admin@decibels.test",
                            ["AdminUser:Password"] = "Test_Admin_Pass123!" 
                        };

                        config.AddInMemoryCollection(testSettings);
                    });
                    
                    builder.UseEnvironment("Testing");

                    builder.ConfigureTestServices(services =>
                    {
                        var descriptor = services.SingleOrDefault(d => 
                            d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                        if (descriptor != null) services.Remove(descriptor);

                        services.AddDbContext<ApplicationDbContext>(options =>
                        {
                            options.UseSqlServer(DbContainer.GetConnectionString());
                        });
    
                        // FORCE NEWTONSOFT TO BYPASS SYSTEM.TEXT.JSON'S PIPEWRITER STREAM BUG
                        services.AddControllers()
                            .AddNewtonsoftJson(options =>
                            {
                                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                                options.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver();
                            });

                        services.Configure<TestAuthHandlerOptions>(options => options.UserId = TestUserId);
                        services.AddAuthentication(options =>
                            {
                                options.DefaultAuthenticateScheme = "TestAuth";
                                options.DefaultChallengeScheme = "TestAuth";
                            })
                            .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, TestAuthHandler>("TestAuth", null);
                    });
                });

            // This triggers the boot-up sequence and runs the database seeder cleanly triggering DbInitializer.Initialize()
            Client = Factory.CreateClient();
        }

        protected async Task ExecuteDbContextAsync(Func<ApplicationDbContext, Task> action)
        {
            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await action(db);
        }

        public async Task DisposeAsync()
        {
            if (Client != null) Client.Dispose();
            if (Factory != null) await Factory.DisposeAsync(); 
    
            if (DbContainer != null) 
            {
                await DbContainer.StopAsync(); 
                await DbContainer.DisposeAsync();
            }
        }
    }

    #region MOCK AUTHENTICATION STUBS
    public class TestAuthHandlerOptions { public string UserId { get; set; } = "TestUser"; }
    
    public class TestAuthHandler : Microsoft.AspNetCore.Authentication.AuthenticationHandler<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions>
    {
        public TestAuthHandler(
            Microsoft.Extensions.Options.IOptionsMonitor<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions> options, 
            ILoggerFactory logger, 
            UrlEncoder encoder,
            Microsoft.AspNetCore.Authentication.ISystemClock clock) 
            : base(options, logger, encoder, clock) { }

        protected override Task<Microsoft.AspNetCore.Authentication.AuthenticateResult> HandleAuthenticateAsync()
        {
            var claims = new[] { 
                new Claim(ClaimTypes.NameIdentifier, IntegrationTestBase.TestUserId),
                new Claim(ClaimTypes.Role, "Admin") 
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new Microsoft.AspNetCore.Authentication.AuthenticationTicket(principal, "TestAuth");
            return Task.FromResult(Microsoft.AspNetCore.Authentication.AuthenticateResult.Success(ticket));
        }
    }
    #endregion
}