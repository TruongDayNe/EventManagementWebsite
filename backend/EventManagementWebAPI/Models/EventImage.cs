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
        public ObjectId EventImageId { get; set; } = ObjectId.GenerateNewId();
        [BsonElement("ImageKey"), BsonRepresentation(BsonType.String)]
        public string ImageKey { get; set; } = string.Empty;
        [BsonElement("EventId"), BsonRepresentation(BsonType.String)]
        
        public string EventId { get; set; } = string.Empty;
        [BsonElement("IsThumbnail"), BsonRepresentation(BsonType.Boolean)]
        public bool IsThumbnail { get; set; } = false;

    }
}
