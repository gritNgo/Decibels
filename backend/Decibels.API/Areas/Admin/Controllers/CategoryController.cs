using Microsoft.AspNetCore.Mvc;
using Decibels.Models;
using Decibels.DataAccess.Repository.IRepository;
using Microsoft.AspNetCore.Authorization;
using Decibels.Utility;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Decibels.API.Areas.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = StaticDetails.Role_Admin)] // Keeps the endpoint locked down strictly to Admin JWT tokens
    public class CategoryController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(IUnitOfWork unitOfWork, ILogger<CategoryController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        // GET: api/category
        [HttpGet]
        public ActionResult<IEnumerable<Category>> GetAll()
        {
            try
            {
                List<Category> categoryList = _unitOfWork.Category.GetAll().ToList();
                return Ok(categoryList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pulling all category listings.");
                return StatusCode(500, "Internal data layer exception.");
            }
        }

        // GET: api/category/5
        [HttpGet("{id}")]
        public ActionResult<Category> GetById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new { message = "Invalid category tracking identifier index mapping." });
                }

                Category? category = _unitOfWork.Category.Get(c => c.Id == id);
                if (category == null)
                {
                    return NotFound(new { message = $"Category trace target with ID {id} not found." });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error pulling specific category target asset: {id}");
                return StatusCode(500, "Internal operational exception.");
            }
        }

        // POST: api/category
        [HttpPost]
        public IActionResult Create([FromBody] Category obj)
        {
            try
            {
                // Custom business validation check
                if (obj.Name == obj.DisplayOrder.ToString())
                {
                    ModelState.AddModelError("name", "Display Order parameters cannot match Category Name text properties.");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState); // Returns a clean JSON array mapping the exact structural failures
                }

                _unitOfWork.Category.Add(obj);
                _unitOfWork.Save();

                // Returns standard HTTP 201 Created containing a link pointer metadata index to the new asset entry path
                return CreatedAtAction(nameof(GetById), new { id = obj.Id }, new { success = true, data = obj });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Transaction fault processing category database insertion.");
                return StatusCode(500, "Persistence layer validation write error.");
            }
        }

        // PUT: api/category
        [HttpPut]
        public IActionResult Update([FromBody] Category obj)
        {
            try
            {
                if (obj.Id <= 0)
                {
                    return BadRequest(new { message = "Missing structural validation index parameters on target mutation entity." });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _unitOfWork.Category.Update(obj);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Category parameters synchronized successfully.", data = obj });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Transaction crash handling modification entities inside item key context: {obj.Id}");
                return StatusCode(500, "Persistence layer mutation tracking fault.");
            }
        }

        // DELETE: api/category/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new { message = "Invalid asset deletion indexing request." });
                }

                Category? obj = _unitOfWork.Category.Get(c => c.Id == id);
                if (obj == null)
                {
                    return NotFound(new { message = $"Target category deletion target {id} could not be traced." });
                }

                _unitOfWork.Category.Remove(obj);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Category resource completely wiped out from context records." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Crash tracking constraint bounds during deletion execution loop inside target index: {id}");
                return StatusCode(500, "Data constraint deletion operational conflict failure.");
            }
        }
    }
}