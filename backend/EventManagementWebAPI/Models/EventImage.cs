using MongoDB.Bson;
using MongoDB.EntityFrameworkCore;
using MongoDB.Bson.Serialization.Attributes;

namespace EventManagementWebAPI.Models
{
    [Collection("EventImages")]
    public class EventImage
    {
        public ObjectId Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public ObjectId EventId { get; set; }
        public bool IsThumbnail = false;
        
    }
}
