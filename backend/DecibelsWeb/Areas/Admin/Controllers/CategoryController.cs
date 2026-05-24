using Microsoft.AspNetCore.Mvc;
using Decibels.DataAccess.Data;
using Decibels.Models;
using Decibels.DataAccess.Repository.IRepository;
using Microsoft.AspNetCore.Authorization;
using Decibels.Utility;

namespace DecibelsWeb.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = StaticDetails.Role_Admin)]
    public class CategoryController : Controller
    {
        // UnitOfWork internally creates an object/implementation of CategoryRepository
        private readonly IUnitOfWork _unitOfWork;

        public CategoryController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IActionResult Index()
        {
            // specify which object/repository being worked on to call methods
            List<Category> objCategoryList = _unitOfWork.Category.GetAll().ToList();
            return View(objCategoryList);
        }

        // When creating a new from an existing page, first create an action method
        // that will be invoked on the controller. Then the View.
        public IActionResult Create()
        {
            return View();
        }

        // This annotation identifies an action that supports the HTTP POST method from the Create Category form (When this is absent it's always a GET)
        [HttpPost]
        public IActionResult Create(Category obj) // an object that takes the Category Model properties of the form will be created
        {
            if (obj.Name == obj.DisplayOrder.ToString())
            {
                ModelState.AddModelError("name", "Display Order cannot be the same as Category Name");
            }

            if (ModelState.IsValid) // by checking obj against the Category Model and it's validations
            {
                // Add is an Entity Framework method that tracks the given entity and any changes to be made in the database
                _unitOfWork.Category.Add(obj);
                _unitOfWork.Save();  // creates the Category on the database

                TempData["success"] = "Category created successfully"; // Displays this message on the next immediate render only

                // Redirects to the Index view which is reloaded once Category is added
                return RedirectToAction("Index", "Category");
            }
            return View();
        }

        public IActionResult Edit(int? id)
        {
            if (id == null || id == 0)
            {
                return NotFound(); // or return an Error View
            }

            Category? categoryFromDb = _unitOfWork.Category.Get(category => category.Id == id);
            /* Other ways to retrieve a record
             * Category? categoryFromDb1 = _db.Categories.FirstOrDefault(category => category.Id==id);
             * Category? categoryFromDb2 = _db.Categories.Where(category => category.Id == id).FirstOrDefault();
            */

            if (categoryFromDb == null)
            {
                return NotFound();
            }
            return View(categoryFromDb);
        }

        [HttpPost]
        public IActionResult Edit(Category obj)
        {
            if (ModelState.IsValid)
            {
                _unitOfWork.Category.Update(obj);
                _unitOfWork.Save();
                TempData["success"] = "Category updated successfully";
                return RedirectToAction("Index", "Category");
            }
            return View();
        }

        public IActionResult Delete(int? id)
        {
            if (id == null || id == 0)
            {
                return NotFound();
            }

            Category? categoryFromDb = _unitOfWork.Category.Get(category => category.Id == id);
            if (categoryFromDb == null)
            {
                return NotFound();
            }
            return View(categoryFromDb);
        }

        [HttpPost, ActionName("Delete")]
        public IActionResult DeletePOST(int? id)
        {
            Category? obj = _unitOfWork.Category.Get(category => category.Id == id);

            if (obj == null)
            {
                return NotFound();
            }

            _unitOfWork.Category.Remove(obj);
            _unitOfWork.Save();
            TempData["success"] = "Category deleted successfully";
            return RedirectToAction("Index");
        }
    }
}
