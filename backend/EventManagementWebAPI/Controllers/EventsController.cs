using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventManagementWebAPI.Models;
using EventManagementWebAPI.Services;
using MongoDB.Bson;

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
        public IActionResult CreateEvent([FromBody] Event newEvent)
        {
            if (newEvent == null)
            {
                return BadRequest("Invalid event data");
            }
            _eventService.CreateEvent(newEvent);
            return CreatedAtAction(nameof(GetEventById), new { id = newEvent.EventId }, newEvent);
        }
        [HttpPut("Update/{id}")]
        public IActionResult UpdateEvent(string id, [FromBody] Event updatedEvent)
        {
            if (updatedEvent == null)
            {
                return BadRequest("Invalid event data");
            }

            var eventId = new ObjectId(id);
            var existingEvent = _eventService.GetEventById(eventId);
            if (existingEvent == null)
            {
                return NotFound("Event not found");
            }

            _eventService.UpdateEvent(eventId, updatedEvent);
            return NoContent();
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
    }
}
