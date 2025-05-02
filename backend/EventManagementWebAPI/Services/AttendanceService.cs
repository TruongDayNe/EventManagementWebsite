using EventManagementWebAPI.Data;
using EventManagementWebAPI.Models;
using MongoDB.Driver;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public class AttendanceService : IAttendanceService
    {
        public IMongoCollection<Attendance> _attendances;
        public AttendanceService(AppDbContext context)
        {
            _attendances = context.Attendances;
        }

        public List<Attendance> GetAllAttendances()
        {
            return _attendances.Find(_ => true).ToList();
        }
        public List<Attendance> GetAttendancesByUserId(string userId)
        {
            return _attendances.Find(c => c.UserId == userId).ToList();
        }
        public List<Attendance> GetAttendancesByEventId(string eventId)
        {
            return _attendances.Find(c => c.EventId == eventId).ToList();
        }

        public async Task<bool> AddAttendance(Attendance attendance)
        {
            var existingAttendance = await _attendances.Find(e => e.UserId == attendance.UserId && e.EventId == attendance.EventId).FirstOrDefaultAsync();
            if (existingAttendance != null)
            {
                throw new Exception("Attendance already exists for this user and event.");
            }
            _attendances.InsertOne(attendance);
            return true;
        }
        public async Task<bool> DeleteAttendance(Attendance attendance)
        {

            var result = await _attendances.DeleteOneAsync(c => c.UserId == attendance.UserId && c.EventId == attendance.EventId);
            return result.DeletedCount > 0;
        }
    }
}
