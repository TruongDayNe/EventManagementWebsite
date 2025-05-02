using EventManagementWebAPI.Models;
using EventManagementWebAPI.Data;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public interface IEventService
    {
        List<Event> GetAllEvents();
        Event? GetEventById(ObjectId id);
        Task<CreateEventResult> CreateEventAsync(Event newEvent);
        void DeleteEvent(Event eventToDeletion);
        Task<bool> UpdateEventNameAsync(string eventId, string newEventName);
        Task<bool> UpdateEventDateAsync(string eventId, DateTime newEventDate);
        Task<bool> UpdateEventLocationAsync(string eventId, double newLat, double newLng);
        Task<bool> UpdateEventCategoryAsync(string eventId, string newCategory);
        Task<bool> UpdateEventDescriptionAsync(string eventId, string newEventDescription);
        Task<bool> UpdateEventStatusAsync(string eventId, string newEventStatus);
        Task<bool> UpdateStartTimeAsync(string eventId, string newStartTime);
        Task<bool> UpdateEndTimeAsync(string eventId, string newEndTime);
        Task<bool> UpdateStartCheckinAsync(string eventId, string newStartCheckin);
        Task<bool> UpdateEndCheckinAsync(string eventId, string newEndCheckin);


    }
}
