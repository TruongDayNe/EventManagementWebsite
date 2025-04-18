using MongoDB.EntityFrameworkCore;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson.Serialization.Attributes;

namespace EventManagementWebAPI.Models
{
    [Collection("Categories")]
    public class Category
    {
        [BsonId]
        [BsonElement("CategoryId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId CategoryId { get; set; }

        [BsonElement("CategoryName")]
        public string CategoryName { get; set; } = string.Empty;

    }
}
