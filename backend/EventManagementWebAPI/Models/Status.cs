using MongoDB.Bson;
using MongoDB.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson.Serialization.Attributes;
namespace EventManagementWebAPI.Models
{
    [Collection("Status")]
    public class Status
    {
        [BsonId]
        [BsonElement("StatusId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId StatusId { get; set; }

        [BsonElement("StatusName"), BsonRepresentation(BsonType.String)]
        public string StatusName { get; set; } = string.Empty;
    }
}
