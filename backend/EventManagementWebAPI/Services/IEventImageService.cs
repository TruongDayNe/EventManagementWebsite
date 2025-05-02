using EventManagementWebAPI.Models;

namespace EventManagementWebAPI.Services
{
    public interface IEventImageService
    {
        Task<bool> AddEventImageAsync(EventImage eventImage);
        List<EventImage> GetAllEventImages();
        List<EventImage> GetEventImages(string eventId);
    }
}