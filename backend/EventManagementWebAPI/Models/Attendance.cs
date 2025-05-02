using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.EntityFrameworkCore;

namespace EventManagementWebAPI.Models
{
    [Collection("Attendances")]
    public class Attendance
    {
        [BsonId]
        [BsonElement("AttendanceId"),BsonRepresentation(BsonType.ObjectId)]
        public ObjectId AttendanceId { get; set; } = ObjectId.GenerateNewId();

        [BsonElement("EventId"), BsonRepresentation(BsonType.String)]
        public string EventId { get; set; } = string.Empty;

        [BsonElement("UserId"), BsonRepresentation(BsonType.String)]
        public string UserId { get; set; } = string.Empty;

        [BsonElement("AttendanceTime"), BsonRepresentation(BsonType.DateTime)]
        public DateTime AttendanceTime { get; set; } = DateTime.UtcNow;
    }
}
