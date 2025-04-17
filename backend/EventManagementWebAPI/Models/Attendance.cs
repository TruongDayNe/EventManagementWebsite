using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.EntityFrameworkCore;

namespace EventManagementWebAPI.Models
{
    [Collection("Attendances")]
    public class Attendance
    {
        public ObjectId AttendanceId { get; set; }
        public ObjectId EventId { get; set; }
        public ObjectId UserId { get; set; }
        public DateTime AttendanceTime { get; set; }
    }
}
