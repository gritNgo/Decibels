using Decibels.DataAccess.Repository.IRepository;
using Decibels.Models;
using Decibels.Models.ViewModels;
using Decibels.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Decibels.API.Areas.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<OrderController> _logger;
        private readonly IConfiguration _configuration;

        public OrderController(IUnitOfWork unitOfWork, ILogger<OrderController> logger, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _configuration = configuration;
        }

        // GET: api/order
        [HttpGet]
        public ActionResult<IEnumerable<OrderHeader>> GetAll([FromQuery] string? status)
        {
            try
            {
                List<OrderHeader> objOrderHeaders;
        
                // Enforce strict role isolation layers up front
                if (User.IsInRole(StaticDetails.Role_Admin) || User.IsInRole(StaticDetails.Role_Employee))
                {
                    objOrderHeaders = _unitOfWork.OrderHeader.GetAll(includeProperties: "ApplicationUser").ToList();
                }
                else
                {
                    var claimsIdentity = User.Identity as ClaimsIdentity;
                    var userId = claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    
                    if (string.IsNullOrEmpty(userId)) return Unauthorized();
        
                    // Explicitly evaluate to a concrete list right away to put database state into memory
                    objOrderHeaders = _unitOfWork.OrderHeader.GetAll(
                        u => u.ApplicationUserId == userId, 
                        includeProperties: "ApplicationUser"
                    ).ToList();
                }
        
                // Execute strict lowercase structural filtering evaluations safely
                if (!string.IsNullOrEmpty(status))
                {
                    switch (status.ToLower().Trim())
                    {
                        case "pending":
                            objOrderHeaders = objOrderHeaders.Where(u => u.PaymentStatus == StaticDetails.PaymentStatusDelayedPayment).ToList();
                            break;
                        case "inprocess":
                            objOrderHeaders = objOrderHeaders.Where(u => u.OrderStatus == StaticDetails.StatusInProcess).ToList();
                            break;
                        case "completed":
                            objOrderHeaders = objOrderHeaders.Where(u => u.OrderStatus == StaticDetails.StatusShipped).ToList();
                            break;
                        case "approved":
                            objOrderHeaders = objOrderHeaders.Where(u => u.OrderStatus == StaticDetails.StatusApproved).ToList();
                            break;
                        default:
                            // Fall through safely for "all" or unhandled string queries
                            break;
                    }
                }
        
                return Ok(objOrderHeaders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to pull filterable order collections for corporate ledger indices.");
                return StatusCode(500, "Internal data pipeline execution error.");
            }
        }

        // GET: api/order/5
        [HttpGet("{id}")]
        public ActionResult<OrderVM> GetDetails(int id)
        {
            try
            {
                var orderHeader = _unitOfWork.OrderHeader.Get(u => u.Id == id, includeProperties: "ApplicationUser");
                if (orderHeader == null) return NotFound(new { message = "Order not found." });

                var orderDetails = _unitOfWork.OrderDetail.GetAll(u => u.OrderHeaderId == id, includeProperties: "Product");

                OrderVM orderVM = new()
                {
                    OrderHeader = orderHeader,
                    OrderDetail = orderDetails
                };

                return Ok(orderVM);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to assemble details graph for order {id}.");
                return StatusCode(500, "Operational extraction error.");
            }
        }

        // POST: api/order/update
        [HttpPost("update")]
        [Authorize(Roles = StaticDetails.Role_Admin + "," + StaticDetails.Role_Employee)]
        public IActionResult UpdateOrderDetails([FromBody] OrderHeader updatedOrderHeader)
        {
            try
            {
                var orderHeaderFromDb = _unitOfWork.OrderHeader.Get(u => u.Id == updatedOrderHeader.Id);
                if (orderHeaderFromDb == null) return NotFound(new { message = "Target order record missing." });

                orderHeaderFromDb.Name = updatedOrderHeader.Name;
                orderHeaderFromDb.PhoneNumber = updatedOrderHeader.PhoneNumber;
                orderHeaderFromDb.Street = updatedOrderHeader.Street;
                orderHeaderFromDb.City = updatedOrderHeader.City;
                orderHeaderFromDb.State = updatedOrderHeader.State;
                orderHeaderFromDb.PostalCode = updatedOrderHeader.PostalCode;

                if (!string.IsNullOrEmpty(updatedOrderHeader.Courier)) orderHeaderFromDb.Courier = updatedOrderHeader.Courier;
                if (!string.IsNullOrEmpty(updatedOrderHeader.TrackingNumber)) orderHeaderFromDb.TrackingNumber = updatedOrderHeader.TrackingNumber;

                _unitOfWork.OrderHeader.Update(orderHeaderFromDb);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Order logistical details updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Transaction fault processing operational order patch adjustments.");
                return StatusCode(500, "Data storage tracking modification failure.");
            }
        }

        // POST: api/order/start-processing/5
        [HttpPost("start-processing/{id}")]
        [Authorize(Roles = StaticDetails.Role_Admin + "," + StaticDetails.Role_Employee)]
        public IActionResult StartProcessing(int id)
        {
            try
            {
                var orderHeader = _unitOfWork.OrderHeader.Get(u => u.Id == id);
                if (orderHeader == null) return NotFound();

                _unitOfWork.OrderHeader.UpdateStatus(id, StaticDetails.StatusInProcess);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Order workflow status transitioned to In-Process." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed transition state parameters on order context: {id}");
                return StatusCode(500, "Workflow modification exception.");
            }
        }

        // POST: api/order/ship
        [HttpPost("ship")]
        [Authorize(Roles = StaticDetails.Role_Admin + "," + StaticDetails.Role_Employee)]
        public IActionResult ShipOrder([FromBody] OrderHeader shipmentDetails)
        {
            try
            {
                var orderHeader = _unitOfWork.OrderHeader.Get(u => u.Id == shipmentDetails.Id);
                if (orderHeader == null) return NotFound();

                orderHeader.TrackingNumber = shipmentDetails.TrackingNumber;
                orderHeader.Courier = shipmentDetails.Courier;
                orderHeader.OrderStatus = StaticDetails.StatusShipped;
                orderHeader.ShippingDate = DateTime.Now;

                if (orderHeader.PaymentStatus == StaticDetails.PaymentStatusDelayedPayment)
                {
                    orderHeader.PaymentDueDate = DateOnly.FromDateTime(DateTime.Now.AddDays(30));
                }

                _unitOfWork.OrderHeader.Update(orderHeader);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Logistical shipment manifest synchronized completely." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed executing logistical validation shipping routines.");
                return StatusCode(500, "Logistics write transaction failure.");
            }
        }

        // POST: api/order/cancel/5
        [HttpPost("cancel/{id}")]
        [Authorize(Roles = StaticDetails.Role_Admin + "," + StaticDetails.Role_Employee)]
        public IActionResult CancelOrder(int id)
        {
            try
            {
                var orderHeader = _unitOfWork.OrderHeader.Get(u => u.Id == id);
                if (orderHeader == null) return NotFound();

                if (orderHeader.PaymentStatus == StaticDetails.PaymentStatusApproved)
                {
                    var options = new RefundCreateOptions()
                    {
                        Reason = RefundReasons.RequestedByCustomer,
                        PaymentIntent = orderHeader.PaymentIntentId
                    };

                    var service = new RefundService();
                    Refund refund = service.Create(options);

                    _unitOfWork.OrderHeader.UpdateStatus(orderHeader.Id, StaticDetails.StatusCancelled, StaticDetails.StatusRefunded);
                }
                else
                {
                    _unitOfWork.OrderHeader.UpdateStatus(orderHeader.Id, StaticDetails.StatusCancelled);
                }

                _unitOfWork.Save();
                return Ok(new { success = true, message = "Order successfully aborted and transactional assets refunded." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed safely aborting processing sequences for tracking target: {id}");
                return StatusCode(500, "Financial processor cancellation rollback failure.");
            }
        }

        // POST: api/order/pay-now/5
        [HttpPost("pay-now/{id}")]
        public IActionResult PayNow(int id)
        {
            try
            {
                var orderHeader = _unitOfWork.OrderHeader.Get(u => u.Id == id, includeProperties: "ApplicationUser");
                if (orderHeader == null) return NotFound();

                var orderDetails = _unitOfWork.OrderDetail.GetAll(u => u.OrderHeaderId == id, includeProperties: "Product");

                var domain = _configuration["FrontendUrl"] 
                    ?? throw new InvalidOperationException("Frontend URL cloud-native contract configuration missing.");

                var options = new SessionCreateOptions
                {
                    SuccessUrl = domain + $"admin/order-confirmation/{id}",
                    CancelUrl = domain + $"admin/order-details/{id}",
                    LineItems = new List<SessionLineItemOptions>(),
                    Mode = "payment",
                };

                foreach (var item in orderDetails)
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
                _unitOfWork.OrderHeader.UpdateStripePaymentId(id, session.Id, session.PaymentIntentId);
                _unitOfWork.Save();

                return Ok(new { success = true, checkoutUrl = session.Url });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed opening manual checkout interfaces inside transaction context index: {id}");
                return StatusCode(500, "Financial pipeline instantiation failure.");
            }
        }

        // POST: api/order/verify-payment/5
        [HttpPost("verify-payment/{id}")]
        public IActionResult VerifyPayment(int id)
        {
            try
            {
                OrderHeader orderHeader = _unitOfWork.OrderHeader.Get(u => u.Id == id);
                if (orderHeader == null) return NotFound();

                if (orderHeader.PaymentStatus == StaticDetails.PaymentStatusDelayedPayment)
                {
                    var service = new SessionService();
                    Session session = service.Get(orderHeader.SessionId);

                    if (session.PaymentStatus.ToLower() == "paid")
                    {
                        _unitOfWork.OrderHeader.UpdateStripePaymentId(id, session.Id, session.PaymentIntentId);
                        _unitOfWork.OrderHeader.UpdateStatus(id, orderHeader.OrderStatus, StaticDetails.PaymentStatusApproved);
                        _unitOfWork.Save();
                        return Ok(new { success = true, paid = true });
                    }
                }
                return Ok(new { success = true, paid = false });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Critical confirmation block crash on validation lookup indexes for order: {id}");
                return StatusCode(500, "Payment tracking telemetry exception.");
            }
        }
    }
}