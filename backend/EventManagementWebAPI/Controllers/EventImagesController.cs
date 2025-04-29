using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventManagementWebAPI.Models;
using EventManagementWebAPI.Services;

namespace EventManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventImagesController : ControllerBase
    {
        private readonly IEventImageService _eventImageService;
        public EventImagesController(IEventImageService eventImageService)
        {
            _eventImageService = eventImageService;
        }
        [HttpGet]
        public IActionResult GetAllEventImages()
        {
            var eventImages = _eventImageService.GetAllEventImages();
            if (eventImages == null || eventImages.Count == 0)
            {
                return NotFound("No event images found");
            }
            return Ok(eventImages);
        }
        [HttpGet("{eventId}")]
        public IActionResult GetEventImage(string eventId)
        {
            var eventImage = _eventImageService.GetEventImages(eventId);
            if (eventImage == null)
            {
                return NotFound("No images for this event");
            }
            return Ok(eventImage);
        }
        [HttpPost]
        public async Task<IActionResult> CreateEventImage([FromBody] EventImage eventImage)
        {
            var result = await _eventImageService.AddEventImageAsync(eventImage);
            if (!result)
            {
                return BadRequest("Error creating event image");
            }
            return CreatedAtAction(nameof(GetEventImage), new { eventId = eventImage.EventId }, eventImage);
        }
    }
}
