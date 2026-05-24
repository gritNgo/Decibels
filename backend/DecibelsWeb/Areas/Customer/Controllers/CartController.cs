using Decibels.DataAccess.Repository.IRepository;
using Decibels.Models;
using Decibels.Models.ViewModels;
using Decibels.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace DecibelsWeb.Areas.Customer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CartController> _logger;
        private readonly IConfiguration _configuration;

        public CartController(IUnitOfWork unitOfWork, ILogger<CartController> logger, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _configuration = configuration;
        }

        // GET: api/cart
        [HttpGet]
        public ActionResult<ShoppingCartVM> GetCart()
        {
            try
            {
                string userId = GetUserIdFromClaims();
                
                ShoppingCartVM shoppingCartVM = new()
                {
                    ShoppingCartList = _unitOfWork.ShoppingCart.GetAll(
                        u => u.ApplicationUserId == userId, includeProperties: "Product"),
                    OrderHeader = new()
                };

                foreach (var cart in shoppingCartVM.ShoppingCartList)
                {
                    cart.Price = cart.Product.Price;
                    shoppingCartVM.OrderHeader.OrderTotal += (cart.Price * cart.Quantity);
                }

                return Ok(shoppingCartVM);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve shopping cart collection state.");
                return StatusCode(500, "Internal tracking infrastructure fault.");
            }
        }

        // GET: api/cart/summary
        [HttpGet("summary")]
        public ActionResult<ShoppingCartVM> GetSummary()
        {
            try
            {
                string userId = GetUserIdFromClaims();

                ShoppingCartVM shoppingCartVM = new()
                {
                    ShoppingCartList = _unitOfWork.ShoppingCart.GetAll(
                        u => u.ApplicationUserId == userId, includeProperties: "Product"),
                    OrderHeader = new()
                };

                shoppingCartVM.OrderHeader.ApplicationUser = _unitOfWork.ApplicationUser.Get(u => u.Id == userId);
                shoppingCartVM.OrderHeader.Name = shoppingCartVM.OrderHeader.ApplicationUser.Name;
                shoppingCartVM.OrderHeader.PhoneNumber = shoppingCartVM.OrderHeader.ApplicationUser.PhoneNumber;
                shoppingCartVM.OrderHeader.Street = shoppingCartVM.OrderHeader.ApplicationUser.Street;
                shoppingCartVM.OrderHeader.City = shoppingCartVM.OrderHeader.ApplicationUser.City;
                shoppingCartVM.OrderHeader.State = shoppingCartVM.OrderHeader.ApplicationUser.State;
                shoppingCartVM.OrderHeader.PostalCode = shoppingCartVM.OrderHeader.ApplicationUser.PostalCode;

                foreach (var cart in shoppingCartVM.ShoppingCartList)
                {
                    cart.Price = cart.Product.Price;
                    shoppingCartVM.OrderHeader.OrderTotal += (cart.Price * cart.Quantity);
                }

                return Ok(shoppingCartVM);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to assemble checkout data summary view models.");
                return StatusCode(500, "Internal operational tracking layer fault.");
            }
        }

        // POST: api/cart/summary
        [HttpPost("summary")]
        public IActionResult SubmitOrder([FromBody] OrderHeader postOrderHeader)
        {
            try
            {
                string userId = GetUserIdFromClaims();

                var shoppingCartList = _unitOfWork.ShoppingCart.GetAll(
                        u => u.ApplicationUserId == userId, includeProperties: "Product");

                if (!shoppingCartList.Any())
                {
                    return BadRequest(new { message = "Cannot checkout an empty shopping cart configuration." });
                }

                postOrderHeader.OrderDate = DateTime.Now;
                postOrderHeader.ApplicationUserId = userId;
                postOrderHeader.OrderTotal = 0; // Explicitly recalculate on the server side to guarantee price safety

                foreach (var cart in shoppingCartList)
                {
                    cart.Price = cart.Product.Price;
                    postOrderHeader.OrderTotal += (cart.Price * cart.Quantity);
                }

                ApplicationUser applicationUser = _unitOfWork.ApplicationUser.Get(u => u.Id == userId);

                if (applicationUser.CompanyId.GetValueOrDefault() == 0)
                {
                    postOrderHeader.PaymentStatus = StaticDetails.PaymentStatusPending;
                    postOrderHeader.OrderStatus = StaticDetails.StatusPending;
                }
                else
                {
                    postOrderHeader.PaymentStatus = StaticDetails.PaymentStatusDelayedPayment;
                    postOrderHeader.OrderStatus = StaticDetails.StatusApproved;
                }

                _unitOfWork.OrderHeader.Add(postOrderHeader);
                _unitOfWork.Save();

                foreach (var cart in shoppingCartList)
                {
                    OrderDetail orderDetail = new()
                    {
                        ProductId = cart.ProductId,
                        OrderHeaderId = postOrderHeader.Id,
                        Price = cart.Price,
                        Quantity = cart.Quantity,
                    };
                    _unitOfWork.OrderDetail.Add(orderDetail);
                }
                _unitOfWork.Save();

                if (applicationUser.CompanyId.GetValueOrDefault() == 0)
                {
                    // Stripe pipeline orchestration
                    // Extract the domain dynamically based on environment execution context
                    var domain = _configuration["FrontendUrl"] 
                                 ?? throw new InvalidOperationException("Frontend URL configuration contract missing.");

                    var options = new SessionCreateOptions
                    {
                        SuccessUrl = domain + $"order-confirmation/{postOrderHeader.Id}",  // Re-target to direct traffic back to the React client engine base
                        CancelUrl = domain + "cart",
                        LineItems = new List<SessionLineItemOptions>(),
                        Mode = "payment",
                    };

                    foreach (var item in shoppingCartList)
                    {
                        options.LineItems.Add(new SessionLineItemOptions
                        {
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                UnitAmount = (long)(item.Price * 100),
                                Currency = "usd",
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = item.Product.Name
                                }
                            },
                            Quantity = item.Quantity
                        });
                    }

                    var service = new SessionService();
                    Session session = service.Create(options);
                    _unitOfWork.OrderHeader.UpdateStripePaymentId(postOrderHeader.Id, session.Id, session.PaymentIntentId);
                    _unitOfWork.Save();

                    // Hand down the Stripe engine URL to let the React client coordinate window transition states smoothly
                    return Ok(new { requiresPayment = true, checkoutUrl = session.Url, orderId = postOrderHeader.Id });
                }

                return Ok(new { requiresPayment = false, orderId = postOrderHeader.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical database crash handling client checkout operations.");
                return StatusCode(500, "Transactional write constraint crash.");
            }
        }

        // POST: api/cart/verify/5
        [HttpPost("verify/{id}")]
        public IActionResult VerifyPayment(int id)
        {
            try
            {
                OrderHeader orderHeader = _unitOfWork.OrderHeader.Get(u => u.Id == id, includeProperties: "ApplicationUser");
                
                if (orderHeader == null)
                {
                    return NotFound(new { message = "Target order configuration trace target could not be recovered." });
                }

                if (orderHeader.PaymentStatus != StaticDetails.PaymentStatusDelayedPayment)
                {
                    var service = new SessionService();
                    Session session = service.Get(orderHeader.SessionId);

                    if (session.PaymentStatus.ToLower() == "paid")
                    {
                        _unitOfWork.OrderHeader.UpdateStripePaymentId(id, session.Id, session.PaymentIntentId);
                        _unitOfWork.OrderHeader.UpdateStatus(id, StaticDetails.StatusApproved, StaticDetails.PaymentStatusApproved);
                        _unitOfWork.Save();
                    }
                }

                List<ShoppingCart> shoppingCarts = _unitOfWork.ShoppingCart
                    .GetAll(u => u.ApplicationUserId == orderHeader.ApplicationUserId).ToList();

                _unitOfWork.ShoppingCart.RemoveRange(shoppingCarts);
                _unitOfWork.Save();

                return Ok(new { success = true, status = orderHeader.OrderStatus });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error verifying stripe confirmation tracking indexes for order boundary target {id}");
                return StatusCode(500, "Payment contract confirmation tracking evaluation failure.");
            }
        }

        // PATCH: api/cart/plus/5
        [HttpPatch("plus/{cartId}")]
        public IActionResult Plus(int cartId)
        {
            var cartFromDb = _unitOfWork.ShoppingCart.Get(u => u.Id == cartId);
            if (cartFromDb == null) return NotFound();

            cartFromDb.Quantity += 1;
            _unitOfWork.ShoppingCart.Update(cartFromDb);
            _unitOfWork.Save();
            return Ok(new { success = true });
        }

        // PATCH: api/cart/minus/5
        [HttpPatch("minus/{cartId}")]
        public IActionResult Minus(int cartId)
        {
            var cartFromDb = _unitOfWork.ShoppingCart.Get(u => u.Id == cartId, tracked: true);
            if (cartFromDb == null) return NotFound();

            if (cartFromDb.Quantity <= 1)
            {
                _unitOfWork.ShoppingCart.Remove(cartFromDb);
            }
            else
            {
                cartFromDb.Quantity -= 1;
                _unitOfWork.ShoppingCart.Update(cartFromDb);
            }
            _unitOfWork.Save();
            return Ok(new { success = true });
        }

        // DELETE: api/cart/remove/5
        [HttpDelete("remove/{cartId}")]
        public IActionResult Remove(int cartId)
        {
            var cartFromDb = _unitOfWork.ShoppingCart.Get(u => u.Id == cartId, tracked: true);
            if (cartFromDb == null) return NotFound();

            _unitOfWork.ShoppingCart.Remove(cartFromDb);
            _unitOfWork.Save();
            return Ok(new { success = true });
        }

        private string GetUserIdFromClaims()
        {
            var claimsIdentity = User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? throw new InvalidOperationException("User context index not verified inside active authorization tokens.");
        }
    }
}