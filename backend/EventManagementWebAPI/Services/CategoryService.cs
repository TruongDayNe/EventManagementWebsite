using EventManagementWebAPI.Data;
using EventManagementWebAPI.Models;
using MongoDB.Driver;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public class CategoryService : ICategoryService
    {
        public IMongoCollection<Category> _categories;
        public CategoryService(AppDbContext context)
        {
            _categories = context.Categories;
        }

        public List<Category> GetAllCategories()
        {
            return _categories.Find(_ => true).ToList();
        }
        public Category GetCategoryById(ObjectId id)
        {
            return _categories.Find(c => c.CategoryId == id).FirstOrDefault();
        }

        public async Task<bool> CreateCategoryAsync(Category category)
        {
            var existingName = await _categories.Find(e => e.CategoryName == category.CategoryName).FirstOrDefaultAsync();
            if (existingName != null)
            {
                Console.WriteLine("Category with this name already exists.");
                return false;
            }
            _categories.InsertOne(category);
            return true;
        }

    }
}
