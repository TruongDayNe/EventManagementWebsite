using MongoDB.EntityFrameworkCore;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace EventManagementWebAPI.Models
{
    [Collection("Categories")]
    public class Category
    {
        public ObjectId Id { get; set; }

        [Display(Name = "Category")]
        public string name { get; set; } = string.Empty;

    }
}
