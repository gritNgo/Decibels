using Microsoft.AspNetCore.Mvc;
using Decibels.Models;
using Decibels.DataAccess.Repository.IRepository;
using Microsoft.AspNetCore.Authorization;
using Decibels.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Decibels.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Decibels.API.Areas.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = StaticDetails.Role_Admin)]
    public class ProductController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStorageService _storageService;
        private readonly ILogger<ProductController> _logger;
        private const string ImageContainerName = "product-images";

        public ProductController(IUnitOfWork unitOfWork, IStorageService storageService, ILogger<ProductController> logger)
        {
            _unitOfWork = unitOfWork;
            _storageService = storageService;
            _logger = logger;
        }

        // GET: api/product
        [HttpGet]
        public ActionResult<IEnumerable<Product>> GetAll()
        {
            try
            {
                List<Product> productList = _unitOfWork.Product.GetAll(includeProperties: "Category").ToList();
                return Ok(productList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve product database catalog records.");
                return StatusCode(500, "Internal data layer exception.");
            }
        }

        // GET: api/product/5
        [HttpGet("{id}")]
        public ActionResult<Product> GetById(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { message = "Invalid product identifier mapping parameter." });

                Product? product = _unitOfWork.Product.Get(u => u.Id == id, includeProperties: "Category");
                if (product == null) return NotFound(new { message = $"Product asset {id} could not be traced." });

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error tracking product target context item: {id}");
                return StatusCode(500, "Internal operational exception.");
            }
        }

        // POST: api/product/upsert
        // Matches frontend's expected catalogApi payload endpoint route
        [HttpPost("upsert")]
        public async Task<IActionResult> Upsert([FromForm] Product product, IFormFile? file)
        {
            try
            {
                // Force-strip validation checking on navigation components to prevent EF tracking validation blocks
                ModelState.Remove("Category");

                if (!ModelState.IsValid) 
                    return BadRequest(new { message = "Validation failure mapping parameters.", errors = ModelState });

                // CREATE BRANCH
                if (product.Id == 0)
                {
                    if (file != null)
                    {
                        string newImageUrl = await _storageService.UploadFileAsync(file, ImageContainerName, "images/product");
                        product.ImageUrl = newImageUrl;
                    }
                    else
                    {
                        product.ImageUrl = "";
                    }

                    _unitOfWork.Product.Add(product);
                    _unitOfWork.Save();
                    return Ok(new { success = true, message = "Product record created successfully.", data = product });
                }
                // UPDATE BRANCH
                else
                {
                    var existingProduct = _unitOfWork.Product.Get(u => u.Id == product.Id, tracked: false);
                    if (existingProduct == null) 
                        return NotFound(new { message = $"Target update item trace lost for ID: {product.Id}" });

                    string oldImageUrl = existingProduct.ImageUrl;

                    if (file != null)
                    {
                        // Erase obsolete historical cloud assets cleanly before re-writing indexes
                        if (!string.IsNullOrEmpty(oldImageUrl))
                        {
                            await _storageService.DeleteFileAsync(oldImageUrl, ImageContainerName);
                        }

                        string newImageUrl = await _storageService.UploadFileAsync(file, ImageContainerName, "images/product");
                        product.ImageUrl = newImageUrl;
                    }
                    else
                    {
                        product.ImageUrl = oldImageUrl; // Preserve asset reference if not updated
                    }

                    _unitOfWork.Product.Update(product);
                    _unitOfWork.Save();
                    return Ok(new { success = true, message = "Product record synchronized seamlessly.", data = product });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Transaction collision inside Upsert pipeline.");
                return StatusCode(500, new { message = "Cloud storage or data serialization constraint failure.", details = ex.Message });
            }
        }

        // DELETE: api/product/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { message = "Invalid data removal parameter requests." });

                var productToBeDeleted = _unitOfWork.Product.Get(u => u.Id == id);
                if (productToBeDeleted == null) return NotFound(new { message = "Product record extraction trace target missing." });

                // Orchestrate clean storage lifecycle teardown events sequentially
                if (!string.IsNullOrEmpty(productToBeDeleted.ImageUrl))
                {
                    await _storageService.DeleteFileAsync(productToBeDeleted.ImageUrl, ImageContainerName);
                }

                _unitOfWork.Product.Remove(productToBeDeleted);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Product asset and associated blob records completely purged." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Critical transactional error executing removal loops inside target index: {id}");
                return StatusCode(500, "Data constraint conflict on sequential purge routines.");
            }
        }
    }
}