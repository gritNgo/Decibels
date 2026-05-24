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
    [Authorize(Roles = StaticDetails.Role_Admin)]
    public class CompanyController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CompanyController> _logger;

        public CompanyController(IUnitOfWork unitOfWork, ILogger<CompanyController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        // GET: api/company
        [HttpGet]
        public ActionResult<IEnumerable<Company>> GetAll()
        {
            try
            {
                List<Company> companyList = _unitOfWork.Company.GetAll().ToList();
                return Ok(companyList); // Returns array directly instead of wrapping in an unnecessary { data: [...] } layout object
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve corporate accounts registry collections.");
                return StatusCode(500, "Internal tracking operational architecture fault.");
            }
        }

        // GET: api/company/5
        [HttpGet("{id}")]
        public ActionResult<Company> GetById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new { message = "Invalid company parameter trace identity." });
                }

                Company? company = _unitOfWork.Company.Get(u => u.Id == id);
                if (company == null)
                {
                    return NotFound(new { message = $"Company metadata target {id} could not be resolved." });
                }

                return Ok(company);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error locating target business entity index trace tracking context: {id}");
                return StatusCode(500, "Internal querying subsystem error.");
            }
        }

        // POST: api/company
        [HttpPost]
        public IActionResult Create([FromBody] Company companyObj)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _unitOfWork.Company.Add(companyObj);
                _unitOfWork.Save();

                return CreatedAtAction(nameof(GetById), new { id = companyObj.Id }, new { success = true, data = companyObj });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database transaction collision processing corporate insertion metrics.");
                return StatusCode(500, "Data write operational abort tracking failure.");
            }
        }

        // PUT: api/company/5
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Company companyObj)
        {
            try
            {
                // Verify URL identifier state matches internal JSON payload tracking models
                if (id != companyObj.Id || id <= 0)
                {
                    return BadRequest(new { message = "Mismatched identifier key signatures inside request boundary channels." });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _unitOfWork.Company.Update(companyObj);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Corporate parameters updated successfully.", data = companyObj });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Database mutation crash inside company tracking trace context: {id}");
                return StatusCode(500, "Data storage entity adjustment collision failure.");
            }
        }

        // DELETE: api/company/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new { message = "Invalid data removal tracking target parameters." });
                }

                var companyToBeDeleted = _unitOfWork.Company.Get(u => u.Id == id);
                if (companyToBeDeleted == null)
                {
                    return NotFound(new { message = $"Corporate account index {id} could not be located for extraction loops." });
                }

                _unitOfWork.Company.Remove(companyToBeDeleted);
                _unitOfWork.Save();

                return Ok(new { success = true, message = "Corporate record completely removed from context indices." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Critical transactional rollback executing structural deletion sequence for target entity: {id}");
                return StatusCode(500, "Database removal relationship constraint verification failure.");
            }
        }
    }
}