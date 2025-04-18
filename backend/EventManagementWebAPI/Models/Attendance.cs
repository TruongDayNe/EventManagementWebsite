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
        public ObjectId AttendanceId { get; set; }

        [BsonElement("EventId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId EventId { get; set; }

        [BsonElement("UserId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId UserId { get; set; }

        [BsonElement("AttendanceTime"), BsonRepresentation(BsonType.DateTime)]
        public DateTime AttendanceTime { get; set; }
    }
}
