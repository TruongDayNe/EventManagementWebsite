using MongoDB.Bson;
using MongoDB.EntityFrameworkCore;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel;

namespace EventManagementWebAPI.Models
{
    [Collection("Checkins")]
    public class Checkin
    {
        public ObjectId Id { get; set; }
        public ObjectId AttendeeId { get; set; }
        public ObjectId EventId { get; set; }
        public DateTime AttendAt { get; set; }
    }
}
