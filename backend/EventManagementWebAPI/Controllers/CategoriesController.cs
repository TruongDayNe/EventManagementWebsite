using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventManagementWebAPI.Models;
using EventManagementWebAPI.Services;
using MongoDB.Bson;

namespace EventManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }
        [HttpGet]
        public IActionResult GetAllCategories()
        {
            var categories =_categoryService.GetAllCategories();
            if (categories == null || categories.Count == 0)
            {
                return NotFound("No categories found.");
            }
            return Ok(categories);
        }
        [HttpGet("{id}")]
        public IActionResult GetCategoryById(string id)
        {
            var category = _categoryService.GetCategoryById(new ObjectId(id));
            if (category == null)
            {
                return NotFound();
            }
            return Ok(category);
        }
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            var result = await _categoryService.CreateCategoryAsync(category);
            if (!result)
            {
                return BadRequest("Category with this name already exists.");
            }
            return CreatedAtAction(nameof(GetCategoryById), new { id = category.CategoryId }, category);
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
