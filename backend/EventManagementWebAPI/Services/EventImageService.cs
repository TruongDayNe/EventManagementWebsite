using EventManagementWebAPI.Data;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using EventManagementWebAPI.Models;
using System.ComponentModel.DataAnnotations;

namespace EventManagementWebAPI.Services
{
    public class EventImageService : IEventImageService
    {
        IMongoCollection<EventImage> _eventImageCollection;
        public EventImageService(AppDbContext context)
        {
            _eventImageCollection = context.EventImages;
        }

        public List<EventImage> GetAllEventImages()
        {
            return _eventImageCollection.Find(_ => true).ToList();
        }

        public List<EventImage> GetEventImages(string eventId)
        {
            var filter = Builders<EventImage>.Filter.Eq("EventId", eventId);
            var eventImage = _eventImageCollection.Find(filter).ToList();
            if (eventImage == null || eventImage.Count == 0)
            {
                return null;
            }
            return eventImage;
        }

        public async Task<bool> AddEventImageAsync(EventImage eventImage)
        {
            try
            {
                await _eventImageCollection.InsertOneAsync(eventImage);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating event image: {ex.Message}");
                return false;
            }
        }
    }
}
