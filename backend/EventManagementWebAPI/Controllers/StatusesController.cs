using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventManagementWebAPI.Models;
using EventManagementWebAPI.Services;
using MongoDB.Bson;

namespace EventManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusesController : ControllerBase
    {
        private readonly IStatusService _statusService;
        public StatusesController(IStatusService statusService)
        {
            _statusService = statusService;
        }
        [HttpGet]
        public IActionResult GetAllStatuses()
        {
            var statuses =_statusService.GetAllStatuses();
            if (statuses == null || statuses.Count == 0)
            {
                return NotFound("No categories found.");
            }
            return Ok(statuses);
        }
        [HttpGet("{id}")]
        public IActionResult GetCategoryById(string id)
        {
            var status = _statusService.GetStatusById(new ObjectId(id));
            if (status == null)
            {
                return NotFound();
            }
            return Ok(status);
        }
        [HttpPost]
        public async Task<IActionResult> CreateStatus([FromBody] Status status)
        {
            var result = await _statusService.CreateStatusAsync(status);
            if (!result)
            {
                return BadRequest("Category with this name already exists.");
            }
            return CreatedAtAction(nameof(GetCategoryById), new { id = status.StatusId }, status);
        }

        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteCategory(string id)
        //{
        //    var deleted = await _categoryService.DeleteCategoryAsync(id);
        //    if (!deleted)
        //    {
        //        return NotFound();
        //    }
        //    return NoContent();
        //}
    }
}
