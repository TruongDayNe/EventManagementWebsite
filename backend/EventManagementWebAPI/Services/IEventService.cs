using EventManagementWebAPI.Models;
using EventManagementWebAPI.Data;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public interface IEventService
    {
        List<Event> GetAllEvents();
        Event? GetEventById(ObjectId id);
        void CreateEvent(Event newEvent);
        void UpdateEvent(ObjectId eventId, Event updatedEvent);
        void DeleteEvent(Event eventToDeletion);
    }
}
