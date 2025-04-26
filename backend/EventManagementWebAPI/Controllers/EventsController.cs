using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventManagementWebAPI.Models;
using EventManagementWebAPI.Services;
using MongoDB.Bson;
using MongoDB.Driver;


namespace EventManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        public EventsController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpGet]
        public IActionResult GetAllEvents()
        {
            var events = _eventService.GetAllEvents();
            if (events == null || events.Count == 0)
            {
                return NotFound("No events found");
            }
            return Ok(events);
        }

        [HttpGet("{id}")]
        public IActionResult GetEventById(string id)
        {
            var eventId = new ObjectId(id);
            var eventDetails = _eventService.GetEventById(eventId);
            if (eventDetails == null)
            {
                return NotFound("Event not found");
            }
            return Ok(eventDetails);
        }
        [HttpPost("Create")]
        public async Task<IActionResult> CreateEvent([FromBody] Event newEvent)
        {
            var result = await _eventService.CreateEventAsync(newEvent);
            if (!result.Succeeded)
                return BadRequest(result.Errors);
            return Ok("Sự kiện đã được tạo thành công.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteEvent(string id)
        {
            var eventId = new ObjectId(id);
            var eventToDelete = _eventService.GetEventById(eventId);
            if (eventToDelete == null)
            {
                return NotFound("Event not found");
            }
            _eventService.DeleteEvent(eventToDelete);
            return NoContent();
        }

        [HttpPut("{id}/UpdateName")]
        public async Task<IActionResult> UpdateEventName(string id, string newName)
        {
            var success = await _eventService.UpdateEventNameAsync(id, newName);
            return success ? Ok("Tên sự kiện đã được cập nhật.") : NotFound("Không tìm thấy sự kiện.");
        }

        [HttpPut("{id}/UpdateDate")]
        public async Task<IActionResult> UpdateEventDate(string id, DateTime newDate)
        {
            var success = await _eventService.UpdateEventDateAsync(id, newDate);
            return success ? Ok("Ngày sự kiện đã được cập nhật.") : NotFound("Không tìm thấy sự kiện.");
        }

        [HttpPut("{id}/UpdateLocation")]
        public async Task<IActionResult> UpdateEventLocation(string id, double newLat, double newLng)
        {
            var success = await _eventService.UpdateEventLocationAsync(id, newLat, newLng);
            return success ? Ok("Địa điểm sự kiện đã được cập nhật.") : NotFound("Không tìm thấy sự kiện.");
        }

        [HttpPut("{id}/UpdateCategory")]
        public async Task<IActionResult> UpdateEventCategory(string id, string newCategoryId)
        {
            var success = await _eventService.UpdateEventCategoryAsync(id, newCategoryId);
            return success ? Ok("Danh mục sự kiện đã được cập nhật.") : NotFound("Không tìm thấy sự kiện.");
        }

        [HttpPut("{id}/UpdateDescription")]
        public async Task<IActionResult> UpdateEventDescription(string id, string newDescription)
        {
            var success = await _eventService.UpdateEventDescriptionAsync(id, newDescription);
            return success ? Ok("Mô tả sự kiện đã được cập nhật.") : NotFound("Không tìm thấy sự kiện.");
        }

        [HttpPut("{id}/UpdateStatus")]
        public async Task<IActionResult> UpdateEventStatus(string id, string newStatusId)
        {
            var success = await _eventService.UpdateEventStatusAsync(id, newStatusId);
            return success ? Ok("Trạng thái sự kiện đã được cập nhật.") : NotFound("Không tìm thấy sự kiện.");
        }

        [HttpPut("{id}/UpdateStartTime")]
        public async Task<IActionResult> UpdateStartTime(string id, string newStartTime)
        {
            var success = await _eventService.UpdateStartTimeAsync(id, newStartTime);
            return success ? Ok("Thời gian bắt đầu đã được cập nhật.") : BadRequest("Cập nhật thất bại.");
        }

        [HttpPut("{id}/UpdateEndTime")]
        public async Task<IActionResult> UpdateEndTime(string id, string newEndTime)
        {
            var success = await _eventService.UpdateEndTimeAsync(id, newEndTime);
            return success ? Ok("Thời gian kết thúc đã được cập nhật.") : BadRequest("Cập nhật thất bại.");
        }

        [HttpPut("{id}/UpdateStartCheckin")]
        public async Task<IActionResult> UpdateStartCheckin(string id, string newStartCheckin)
        {
            var success = await _eventService.UpdateStartCheckinAsync(id, newStartCheckin);
            return success ? Ok("Thời gian bắt đầu check-in đã được cập nhật.") : BadRequest("Cập nhật thất bại.");
        }

        [HttpPut("{id}/UpdateEndCheckin")]
        public async Task<IActionResult> UpdateEndCheckin(string id, string newEndCheckin)
        {
            var success = await _eventService.UpdateEndCheckinAsync(id, newEndCheckin);
            return success ? Ok("Thời gian kết thúc check-in đã được cập nhật.") : BadRequest("Cập nhật thất bại.");
        }

    }
}
