using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Decibels.Models;
using Decibels.Models.Dto;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Decibels.API.Areas.Customer.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto { IsAuthSuccessful = false, ErrorMessage = "Invalid incoming layout data specifications." });
            }

            // Find user matching incoming bound payload context string
            var user = await _userManager.FindByEmailAsync(loginRequest.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginRequest.Password))
            {
                return Unauthorized(new AuthResponseDto { IsAuthSuccessful = false, ErrorMessage = "Invalid credentials tracking parameters." });
            }

            // Pull roles associated with current tracked identification entry
            var roles = await _userManager.GetRolesAsync(user);
            var primaryRole = roles.FirstOrDefault() ?? "Customer";

            // Generate cryptographically signed JWT Token
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings.GetValue<string>("Secret")!);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email, user.Email!),
                    new Claim(ClaimTypes.Role, primaryRole),
                    new Claim("fullname", user.Name ?? "")
                }),
                Expires = DateTime.UtcNow.AddDays(7), // Token persists across operations for 1 tracking cycle week
                Issuer = jwtSettings.GetValue<string>("Issuer"),
                Audience = jwtSettings.GetValue<string>("Audience"),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var encryptedToken = tokenHandler.WriteToken(token);

            return Ok(new AuthResponseDto
            {
                IsAuthSuccessful = true,
                Token = encryptedToken,
                Email = user.Email!,
                Role = primaryRole
            });
        }
    }
}