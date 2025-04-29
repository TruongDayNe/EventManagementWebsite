using EventManagementWebAPI.Models;

namespace EventManagementWebAPI.Services
{
    public interface IAttendanceService
    {
        Task<bool> AddAttendance(Attendance attendance);
        List<Attendance> GetAllAttendances();
        List<Attendance> GetAttendancesByEventId(string eventId);
        List<Attendance> GetAttendancesByUserId(string userId);
        Task<bool> DeleteAttendance(Attendance attendance);
    }
}