using MongoDB.Bson;
using MongoDB.EntityFrameworkCore;
using MongoDB.Bson.Serialization.Attributes;

namespace EventManagementWebAPI.Models
{
    [Collection("EventImages")]
    public class EventImage
    {
        [BsonId]
        [BsonElement("EventImageId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId EventImageId { get; set; }
        [BsonElement("ImageUrl"), BsonRepresentation(BsonType.String)]
        public string ImageUrl { get; set; } = string.Empty;
        [BsonElement("EventId"), BsonRepresentation(BsonType.ObjectId)]
        
        public ObjectId EventId { get; set; }
        [BsonElement("IsThumbnail"), BsonRepresentation(BsonType.Boolean)]
        public bool IsThumbnail = false;
        
    }
}
