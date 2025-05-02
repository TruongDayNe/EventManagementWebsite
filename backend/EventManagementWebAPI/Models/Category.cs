using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace EventManagementWebAPI.Models
{
    [Collection("Categories")]
    public class Category
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string CategoryId { get; set; }  = ObjectId.GenerateNewId().ToString();

        [BsonElement("CategoryName")]
        public string CategoryName { get; set; } = string.Empty;
    }
}
