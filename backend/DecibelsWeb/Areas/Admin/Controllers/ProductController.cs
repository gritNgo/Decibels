using Microsoft.AspNetCore.Mvc;
using Decibels.DataAccess.Data; 
using Decibels.Models;
using Decibels.DataAccess.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;
using Decibels.Models.ViewModels;
using Decibels.Utility;
using Microsoft.AspNetCore.Authorization;
using DecibelsWeb.Services; 
using System.Threading.Tasks; 
using System.IO; 

namespace DecibelsWeb.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = StaticDetails.Role_Admin)]
    public class ProductController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        // private readonly IWebHostEnvironment _webHostEnvironment; // No longer needed for image storage
        private readonly IStorageService _storageService;
        private const string ImageContainerName = "product-images"; // Container name

        public ProductController(IUnitOfWork unitOfWork, IWebHostEnvironment webhostEnvironment, IStorageService storageService)
        {
            _unitOfWork = unitOfWork;
            // _webHostEnvironment = webhostEnvironment; 
            _storageService = storageService;
        }

        public IActionResult Index()
        {
            List<Product> objProductList = _unitOfWork.Product.GetAll(includeProperties: "Category").ToList();
            return View(objProductList);
        }

        public IActionResult Upsert(int? id) // Update + Insert
        {
            IEnumerable<SelectListItem> CategoryList = _unitOfWork.Category
                .GetAll().Select(u => new SelectListItem
                {
                    Text = u.Name,
                    Value = u.Id.ToString()
                });

            ProductVM productVM = new()
            {
                CategoryList = CategoryList,
                Product = new Product()
            };

            if (id == null || id == 0)
            {
                // create
                return View(productVM);
            }
            else
            {
                // update
                productVM.Product = _unitOfWork.Product.Get(u => u.Id == id);
                return View(productVM);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Upsert(ProductVM productVM, IFormFile? file)
        {
            if (ModelState.IsValid)
            {
                // Retrieve the existing product if it's an update scenario to get the old ImageUrl
                string oldImageUrl = null;
                if (productVM.Product.Id != 0)
                {
                    var existingProduct = _unitOfWork.Product.Get(u => u.Id == productVM.Product.Id, tracked: false);
                    if (existingProduct != null)
                    {
                        oldImageUrl = existingProduct.ImageUrl;
                    }
                }

                if (file != null)
                {
                    // Delete old image from blob storage if it exists
                    if (!string.IsNullOrEmpty(oldImageUrl))
                    {
                        await _storageService.DeleteFileAsync(oldImageUrl, ImageContainerName);
                    }

                    // Upload the new image to blob storage
                    // The "images/product" parameter adds a virtual folder structure inside the blob container.
                    string newImageUrl = await _storageService.UploadFileAsync(file, ImageContainerName, "images/product");
                    productVM.Product.ImageUrl = newImageUrl; // Store the full URL in the database
                }
                else
                {
                    // If no new file is uploaded, retain the existing ImageUrl for an update operation.
                    // this prevents the image from being cleared on edit if no new image is selected.
                    if (productVM.Product.Id != 0) // It's an update
                    {
                        productVM.Product.ImageUrl = oldImageUrl;
                    }
                    // If it's a new product (Id == 0) and no file is provided, ImageUrl will remain null, which is fine.
                }

                if (productVM.Product.Id == 0)
                {
                    _unitOfWork.Product.Add(productVM.Product);
                }
                else
                {
                    _unitOfWork.Product.Update(productVM.Product);
                }
                _unitOfWork.Save();
                TempData["success"] = "Product created/updated successfully";
                return RedirectToAction("Index", "Product");
            }
            else
            {
                productVM.CategoryList = _unitOfWork.Category
                    .GetAll().Select(u => new SelectListItem
                    {
                        Text = u.Name,
                        Value = u.Id.ToString()
                    });
                return View(productVM);
            }
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            List<Product> objProductList = _unitOfWork.Product.GetAll(includeProperties: "Category").ToList();
            return Json(new { data = objProductList });
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int? id) 
        {
            var productToBeDeleted = _unitOfWork.Product.Get(u => u.Id == id);
            if (productToBeDeleted == null)
            {
                return Json(new { success = false, message = "Error while deleting" });
            }

            // Delete image from blob storage
            if (!string.IsNullOrEmpty(productToBeDeleted.ImageUrl))
            {
                await _storageService.DeleteFileAsync(productToBeDeleted.ImageUrl, ImageContainerName);
            }

            _unitOfWork.Product.Remove(productToBeDeleted);
            _unitOfWork.Save();

            return Json(new { success = true, message = "Delete Successful" });
        }
    }
}