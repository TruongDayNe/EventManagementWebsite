using EventManagementWebAPI.Data;
using EventManagementWebAPI.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace EventManagementWebAPI.Services
{
    public class EventService : IEventService
    {
        private readonly IMongoCollection<Event> _events;

        public EventService(AppDbContext context)
        {
            _events = context.Events;
        }

        public List<Event> GetAllEvents()
        {
            return _events.Find(_ => true).ToList();
        }

        public Event? GetEventById(ObjectId id)
        {
            return _events.Find(e => e.EventId == id).FirstOrDefault();
        }

        public async Task<CreateEventResult> CreateEventAsync(Event newEvent)
        {
            var result = new CreateEventResult();

            // Check trùng tên sự kiện
            var existingName = await _events.Find(e => e.EventName == newEvent.EventName).FirstOrDefaultAsync();
            if (existingName != null)
            {
                result.Errors.Add("Sự kiện với tên này đã tồn tại.");
            }

            // Tìm các sự kiện trong bán kính 1km
            var allEvents = GetAllEvents();
            foreach (var e in allEvents)
            {
                double distance = GetDistanceInKm(e.Latitude, e.Longitude, newEvent.Latitude, newEvent.Longitude);
                bool isTimeOverlap = newEvent.StartTime < e.EndTime && newEvent.EndTime > e.StartTime;

                if (distance <= 1.0)
                {
                    if (isTimeOverlap)
                        result.Errors.Add("Trùng địa điểm và khung giờ với một sự kiện khác.");
                }
                else if (isTimeOverlap && e.HostId == newEvent.HostId)
                {
                    result.Errors.Add("Người tổ chức đã có sự kiện khác trong cùng khung giờ.");
                }
            }

            // Nếu có lỗi thì trả về
            if (result.Errors.Count > 0)
            {
                result.Succeeded = false;
                return result;
            }

            // Tạo sự kiện nếu hợp lệ
            await _events.InsertOneAsync(newEvent);
            result.Succeeded = true;
            return result;
        }

        private double GetDistanceInKm(double lat1, double lng1, double lat2, double lng2)
        {
            const double R = 6371; // bán kính trái đất (km)
            var dLat = ToRadians(lat2 - lat1);
            var dLng = ToRadians(lng2 - lng1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double deg) => deg * (Math.PI / 180);  


        public void DeleteEvent(Event eventToDeletion)
        {
            _events.DeleteOne(e => e.EventId == eventToDeletion.EventId);
        }

        public async Task<bool> UpdateEventNameAsync(string eventId, string newEventName)
        {
            var update = Builders<Event>.Update.Set(e => e.EventName, newEventName);
            var result = await _events.UpdateOneAsync(
                e => e.EventId == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEventDateAsync(string eventId, DateTime newEventDate)
        {
            var e = await _events.Find(ev => ev.EventId == ObjectId.Parse(eventId)).FirstOrDefaultAsync();
            if (e == null) return false;

            var updatedStart = new DateTime(newEventDate.Year, newEventDate.Month, newEventDate.Day,
                                            e.StartTime.Hour, e.StartTime.Minute, e.StartTime.Second);

            var updatedEnd = new DateTime(newEventDate.Year, newEventDate.Month, newEventDate.Day,
                                          e.EndTime.Hour, e.EndTime.Minute, e.EndTime.Second);

            var update = Builders<Event>.Update
                .Set(ev => ev.StartTime, updatedStart)
                .Set(ev => ev.EndTime, updatedEnd);

            var result = await _events.UpdateOneAsync(ev => ev.EventId == e.EventId, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEventLocationAsync(string eventId, double newLat, double newLng)
        {
            var update = Builders<Event>.Update
                .Set(e => e.Latitude, newLat)
                .Set(e => e.Longitude, newLng);

            var result = await _events.UpdateOneAsync(
                e => e.EventId == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEventCategoryAsync(string eventId, string newCategory)
        {
            var update = Builders<Event>.Update.Set(e => new ObjectId(e.CategoryId), ObjectId.Parse(newCategory));
            var result = await _events.UpdateOneAsync(
                e => e.EventId == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEventDescriptionAsync(string eventId, string newEventDescription)
        {
            var update = Builders<Event>.Update.Set(e => e.Description, newEventDescription);
            var result = await _events.UpdateOneAsync(
                e => e.EventId == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEventStatusAsync(string eventId, string newEventStatus)
        {
            var update = Builders<Event>.Update.Set(e => new ObjectId(e.StatusId), ObjectId.Parse(newEventStatus));
            var result = await _events.UpdateOneAsync(
                e => e.EventId == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateStartTimeAsync(string eventId, string newStartTime)
        {
            if (!DateTime.TryParse(newStartTime, out var parsedTime))
                return false;

            var update = Builders<Event>.Update.Set(e => e.StartTime, parsedTime);
            var result = await _events.UpdateOneAsync(
                e => e.EventId == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEndTimeAsync(string eventId, string newEndTime)
        {
            if (!DateTime.TryParse(newEndTime, out var parsedTime))
                return false;

            var update = Builders<Event>.Update.Set(e => e.EndTime, parsedTime);
            var result = await _events.UpdateOneAsync(
                e => e.EventId == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateStartCheckinAsync(string eventId, string newStartCheckin)
        {
            if (!DateTime.TryParse(newStartCheckin, out var parsedTime))
                return false;

            var update = Builders<Event>.Update.Set(e => e.StartCheckin, parsedTime);
            var result = await _events.UpdateOneAsync(
                e => e.EventId == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEndCheckinAsync(string eventId, string newEndCheckin)
        {
            if (!DateTime.TryParse(newEndCheckin, out var parsedTime))
                return false;

            var update = Builders<Event>.Update.Set(e => e.EndCheckin, parsedTime);
            var result = await _events.UpdateOneAsync(
                e => e.EventId == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }


    }
}
