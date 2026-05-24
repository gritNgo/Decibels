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

        // POST: api/product
        // Uses [FromForm] to natively bind binary multipart streams transmitted from the client layout forms
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] Product product, IFormFile? file)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                if (file != null)
                {
                    string newImageUrl = await _storageService.UploadFileAsync(file, ImageContainerName, "images/product");
                    product.ImageUrl = newImageUrl;
                }

                _unitOfWork.Product.Add(product);
                _unitOfWork.Save();

                return CreatedAtAction(nameof(GetById), new { id = product.Id }, new { success = true, data = product });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Transaction collision injecting new binary product metadata targets.");
                return StatusCode(500, "Cloud storage or write boundary execution failure.");
            }
        }

        // PUT: api/product/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] Product product, IFormFile? file)
        {
            try
            {
                if (id != product.Id || id <= 0)
                {
                    return BadRequest(new { message = "Mismatched or invalid request index route identity signatures." });
                }

                if (!ModelState.IsValid) return BadRequest(ModelState);

                var existingProduct = _unitOfWork.Product.Get(u => u.Id == id, tracked: false);
                if (existingProduct == null) return NotFound(new { message = "Target update item trace lost." });

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
                    // Preserve verified baseline tracking asset signatures if no modification is submitted
                    product.ImageUrl = oldImageUrl;
                }

                _unitOfWork.Product.Update(product);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Product record synchronized seamlessly.", data = product });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Database tracking adjustment failure for product context signature key: {id}");
                return StatusCode(500, "Persistence tier asset synchronization collision.");
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