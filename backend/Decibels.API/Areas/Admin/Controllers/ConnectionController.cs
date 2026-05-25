using Microsoft.AspNetCore.Mvc;

namespace Decibels.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConnectionController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetStatus()
        {
            return Ok(new { message = "Decibels API Connection operational." });
        }
    }
}