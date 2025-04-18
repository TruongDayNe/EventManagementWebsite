using EventManagementWebAPI.Data;
using EventManagementWebAPI.Models;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public class EventService : IEventService
    {
        private readonly AppDbContext _context;
        public EventService(AppDbContext context)
        {
            _context = context;
        }
        public List<Event> GetAllEvents()
        {
            var events = _context.Events.ToList();
            if (events.Count == 0)
            {
                return new List<Event>();
            }
            return events;
        }
        public Event? GetEventById(ObjectId id)
        {
            return _context.Events.FirstOrDefault(e => e.EventId == id);
        }
        public void CreateEvent(Event newEvent)
        {
            if (newEvent != null)
            {
                _context.Events.Add(newEvent);
                _context.SaveChanges();
            }
        }
        public void DeleteEvent(Event eventToDeletion)
        {
            var eventDelete = _context.Events.FirstOrDefault(e => e.EventId == eventToDeletion.EventId);
            if (eventDelete != null)
            {
                _context.Events.Remove(eventToDeletion);
                _context.SaveChanges();
            }
            else
            {
                throw new Exception("Event not found");
            }
        }
        public void UpdateEvent(ObjectId eventId, Event updatedEvent)
        {
            var eventToUpdate = _context.Events.FirstOrDefault(e => e.EventId == eventId);
            if (eventToUpdate != null)
            {
                eventToUpdate.EventName = updatedEvent.EventName;
                eventToUpdate.StatusId = updatedEvent.StatusId;
                eventToUpdate.Description = updatedEvent.Description;
                eventToUpdate.Address = updatedEvent.Address;
                eventToUpdate.Longitude = updatedEvent.Longitude;
                eventToUpdate.Latitude = updatedEvent.Latitude;
                eventToUpdate.HostId = updatedEvent.HostId;
                eventToUpdate.StartTime = updatedEvent.StartTime;
                eventToUpdate.EndTime = updatedEvent.EndTime;
                eventToUpdate.CreateAt = updatedEvent.CreateAt;
                eventToUpdate.StartCheckin = updatedEvent.StartCheckin;
                eventToUpdate.EndCheckin = updatedEvent.EndCheckin;
                _context.Events.Update(eventToUpdate);
                _context.SaveChanges();
            }
            else
            {
                throw new Exception("Event not found");
            }
        }

    }
}
