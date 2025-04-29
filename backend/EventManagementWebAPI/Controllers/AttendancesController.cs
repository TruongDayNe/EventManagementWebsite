using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventManagementWebAPI.Models;
using EventManagementWebAPI.Services;
using MongoDB.Bson;

namespace EventManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendancesController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        public AttendancesController(IAttendanceService _ttendanceService)
        {           
            _attendanceService = _ttendanceService;
        }
        [HttpGet]
        public IActionResult GetAllAttendances()
        {
            var attendances = _attendanceService.GetAllAttendances();
            if (attendances == null || attendances.Count == 0)
            {
                return NotFound("No attendances found.");
            }
            return Ok(attendances);
        }
        [HttpGet("User/{userId}")]
        public IActionResult GetAttendanceByUserId(string userId)
        {
            var attendances = _attendanceService.GetAttendancesByUserId(userId);
            if (attendances == null || attendances.Count == 0)
            {
                return NotFound("No attendance found for this event.");
            }
            return Ok(attendances);
        }
        [HttpGet("Event/{eventId}")]
        public IActionResult GetAttendancesByEventId(string eventId)
        {
            var attendances = _attendanceService.GetAttendancesByEventId(eventId);
            if (attendances == null || attendances.Count == 0)
            {
                return NotFound("No attendance found for this event.");
            }
            return Ok(attendances);
        }
        [HttpPost]
        public async Task<IActionResult> AddAttendance([FromBody] Attendance attendance)
        {
            if (attendance == null)
            {
                return BadRequest("Attendance cannot be null.");
            }
            try
            {
                var result = await _attendanceService.AddAttendance(attendance);
                if (result)
                {
                    return CreatedAtAction(nameof(GetAttendancesByEventId), new { eventId = attendance.EventId }, attendance);
                }
                else
                {
                    return BadRequest("Failed to add attendance.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteAttendance([FromBody] Attendance attendance)
        {
            if (attendance == null)
            {
                return BadRequest("Attendance cannot be null.");
            }
            try
            {
                var result = await _attendanceService.DeleteAttendance(attendance);
                if (result)
                {
                    return Ok("Attendance deleted successfully.");
                }
                else
                {
                    return NotFound("Attendance not found.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}