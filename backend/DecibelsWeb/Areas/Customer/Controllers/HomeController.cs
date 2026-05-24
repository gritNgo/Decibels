using Decibels.DataAccess.Repository.IRepository;
using Decibels.Models;
using Decibels.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace DecibelsWeb.Areas.Customer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public HomeController(ILogger<HomeController> logger, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        // GET: api/home
        [HttpGet]
        public ActionResult<IEnumerable<Product>> GetCatalog()
        {
            try
            {
                IEnumerable<Product> productList = _unitOfWork.Product.GetAll(includeProperties: "Category");
                return Ok(productList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception encountered inside GetCatalog payload serialization.");
                return StatusCode(500, "Internal operational error occurred.");
            }
        }

        // GET: api/home/details/5
        [HttpGet("details/{productId}")]
        public ActionResult<ShoppingCart> GetProductDetails(int productId)
        {
            try
            {
                var product = _unitOfWork.Product.Get(u => u.Id == productId, includeProperties: "Category");
                
                if (product == null) 
                {
                    return NotFound(new { message = $"Product with ID {productId} does not exist." });
                }

                // Prepare a clean scaffolding layout object for the React state initialization
                ShoppingCart cartTemplate = new()
                {
                    Product = product,
                    Quantity = 1,
                    ProductId = productId
                };

                return Ok(cartTemplate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Exception thrown while pulling product detail tracking identity: {productId}");
                return StatusCode(500, "Internal operational error occurred.");
            }
        }

        // POST: api/home/cart
        [HttpPost("cart")]
        [Authorize] 
        public IActionResult AddToCart([FromBody] ShoppingCart shoppingCart)
        {
            try
            {
                // Extract User identity from JWT Bearer Claims context tokens instead of Cookie headers
                var claimsIdentity = User.Identity as ClaimsIdentity;
                if (claimsIdentity == null || !claimsIdentity.IsAuthenticated)
                {
                    return Unauthorized(new { message = "Authentication scope token context invalid or missing." });
                }

                var userIdClaim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return BadRequest(new { message = "User identifier claim unavailable inside token payload." });
                }

                string userId = userIdClaim.Value;
                shoppingCart.ApplicationUserId = userId;

                // Query runtime data boundaries matching user parameters
                ShoppingCart cartFromDb = _unitOfWork.ShoppingCart.Get(
                    u => u.ApplicationUserId == userId && u.ProductId == shoppingCart.ProductId);

                if (cartFromDb != null)
                {
                    cartFromDb.Quantity += shoppingCart.Quantity;
                    _unitOfWork.ShoppingCart.Update(cartFromDb);
                }
                else
                {
                    // If inserting completely clean data objects, strip relational loops to avoid EF tracking friction
                    shoppingCart.Product = null; 
                    _unitOfWork.ShoppingCart.Add(shoppingCart);
                }
                
                _unitOfWork.Save();

                // Calculate updated direct numeric baseline to return as a simple payload header contract
                int currentCartCount = _unitOfWork.ShoppingCart.GetAll(u => u.ApplicationUserId == userId).Count();

                return Ok(new { 
                    success = true, 
                    message = "Cart persistence tier synchronized successfully.",
                    cartCount = currentCartCount 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during transactional write to shopping cart collection state.");
                return StatusCode(500, "Internal persistence database transaction error.");
            }
        }
    }
}