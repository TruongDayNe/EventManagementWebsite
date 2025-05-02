using EventManagementWebAPI.Models;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public interface ICategoryService
    {
        Task<bool> CreateCategoryAsync(Category category);
        List<Category> GetAllCategories();
        Category GetCategoryById(ObjectId id);
    }
}