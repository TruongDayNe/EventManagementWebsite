using MongoDB.Bson;
using MongoDB.EntityFrameworkCore;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel;

namespace EventManagementWebAPI.Models
{
    [Collection("Checkins")]
    public class Checkin
    {
        [BsonId]
        [BsonElement("CheckinId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId CheckinId { get; set; }

        [BsonElement("AttendeeId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId AttendeeId { get; set; }

        [BsonElement("EventId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId EventId { get; set; }
        [BsonElement("CheckinAt"), BsonRepresentation(BsonType.DateTime)]
        public DateTime CheckinAt { get; set; }
    }
}
