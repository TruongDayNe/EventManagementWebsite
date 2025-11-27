using EventManagementWebAPI.Data;
using EventManagementWebAPI.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace EventManagementWebAPI.Services
{
    public class EventService : IEventService
    {
        private readonly IMongoCollection<Event> _events;
        private readonly IMongoCollection<Category> _categories;
        private readonly IMongoCollection<Status> _statuses;
        private readonly IMongoCollection<AppUser> _users;
        private readonly IMongoCollection<EventImage> _eventImages;
        
        private readonly IAmazonS3 _s3Client;
        private readonly S3Settings _s3Settings;

        public EventService(AppDbContext context, IAmazonS3 s3Client, IOptions<S3Settings> s3Settings)
        {
            _events = context.Events;
            _categories = context.Categories;
            _statuses = context.Statuses;
            _users = context.AppUsers;
            _eventImages = context.EventImages;
            _s3Client = s3Client;
            _s3Settings = s3Settings.Value;
        }

        // --- HÀM ĐÃ ĐƯỢC FIX LỖI ---
        public async Task<List<EventDetailDto>> GetAllEventDetailsAsync()
        {
            // 1. Lấy tất cả events
            var events = await _events.Find(_ => true).ToListAsync();
            if (!events.Any()) return new List<EventDetailDto>();

            // 2. Gom ID (Batching)
            
            // FIX: CategoryId trong Model là string [BsonRepresentation(ObjectId)]
            // -> Nên ta giữ nguyên list là string, không Parse sang ObjectId ở đây
            var categoryIds = events
                .Select(e => e.CategoryId)
                .Where(id => !string.IsNullOrEmpty(id))
                .Distinct()
                .ToList();

            // StatusId trong Model là ObjectId -> Cần Parse từ string sang ObjectId
            var statusIds = events
                .Select(e => e.StatusId)
                .Where(id => !string.IsNullOrEmpty(id))
                .Distinct()
                .Select(id => ObjectId.Parse(id))
                .ToList();
            
            // UserId trong Model là ObjectId -> Cần Parse từ string sang ObjectId
            var hostIds = events
                .Select(e => e.HostId)
                .Where(id => !string.IsNullOrEmpty(id))
                .Distinct()
                .Select(id => ObjectId.Parse(id))
                .ToList();

            var eventIds = events.Select(e => e.EventId).ToList();

            // 3. Thực hiện query song song
            
            // FIX: So sánh string với string (Driver tự động map sang ObjectId trong DB)
            var taskCategories = _categories.Find(c => categoryIds.Contains(c.CategoryId)).ToListAsync();
            
            // Status và User dùng ObjectId nên query bình thường
            var taskStatuses = _statuses.Find(s => statusIds.Contains(s.StatusId)).ToListAsync();
            var taskUsers = _users.Find(u => hostIds.Contains(u.UserId)).ToListAsync();
            
            var taskImages = _eventImages.Find(img => eventIds.Contains(img.EventId)).ToListAsync();

            await Task.WhenAll(taskCategories, taskStatuses, taskUsers, taskImages);

            var categories = await taskCategories;
            var statuses = await taskStatuses;
            var users = await taskUsers;
            var images = await taskImages;

            // 4. Tạo Dictionary để map dữ liệu
            var categoryMap = categories.ToDictionary(k => k.CategoryId, v => v.CategoryName);
            var statusMap = statuses.ToDictionary(k => k.StatusId.ToString(), v => v.StatusName);
            var userMap = users.ToDictionary(k => k.UserId.ToString(), v => v.UserName); // Lấy UserName hoặc Name tùy ý
            
            var imagesMap = images.GroupBy(img => img.EventId)
                                  .ToDictionary(g => g.Key, g => g.ToList());

            // 5. Ráp dữ liệu
            var result = events.Select(e => new EventDetailDto
            {
                EventId = e.EventId,
                EventName = e.EventName,
                Description = e.Description,
                Address = e.Address,
                StartTime = e.StartTime,
                EndTime = e.EndTime,
                StartCheckin = e.StartCheckin,
                EndCheckin = e.EndCheckin,
                CreateAt = e.CreateAt,
                Latitude = e.Latitude,
                Longitude = e.Longitude,

                // Lookup an toàn với ContainsKey
                CategoryName = categoryMap.ContainsKey(e.CategoryId) ? categoryMap[e.CategoryId] : "Unknown Category",
                StatusName = statusMap.ContainsKey(e.StatusId) ? statusMap[e.StatusId] : "Unknown Status",
                HostName = userMap.ContainsKey(e.HostId) ? userMap[e.HostId] : "Unknown Host",

                Images = imagesMap.ContainsKey(e.EventId) 
                    ? imagesMap[e.EventId].Select(img => new EventImageDto 
                    { 
                        ImageKey = img.ImageKey,
                        IsThumbnail = img.IsThumbnail,
                        Url = GeneratePresignedUrl(img.ImageKey) 
                    }).ToList() 
                    : new List<EventImageDto>()
            }).ToList();

            return result;
        }

        private string GeneratePresignedUrl(string key)
        {
            if (string.IsNullOrEmpty(key)) return "";
            try
            {
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = _s3Settings.BucketName,
                    Key = key,
                    Verb = HttpVerb.GET,
                    Expires = DateTime.UtcNow.AddMinutes(60)
                };
                return _s3Client.GetPreSignedURL(request);
            }
            catch
            {
                return "";
            }
        }

        // --- CÁC HÀM KHÁC GIỮ NGUYÊN NHƯ CŨ ---
        public List<Event> GetAllEvents()
        {
            return _events.Find(_ => true).ToList();
        }

        public Event? GetEventById(ObjectId id)
        {
            return _events.Find(e => new ObjectId(e.EventId) == id).FirstOrDefault();
        }

        public async Task<CreateEventResult> CreateEventAsync(Event newEvent)
        {
            var result = new CreateEventResult();

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

            if (result.Errors.Count > 0)
            {
                result.Succeeded = false;
                return result;
            }

            await _events.InsertOneAsync(newEvent);
            result.Succeeded = true;
            return result;
        }

        private double GetDistanceInKm(double lat1, double lng1, double lat2, double lng2)
        {
            const double R = 6371; 
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
                e => new ObjectId(e.EventId) == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEventDateAsync(string eventId, DateTime newEventDate)
        {
            var e = await _events.Find(ev => new ObjectId(ev.EventId) == ObjectId.Parse(eventId)).FirstOrDefaultAsync();
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
                e => new ObjectId(e.EventId) == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEventCategoryAsync(string eventId, string newCategory)
        {
            var update = Builders<Event>.Update.Set(e => new ObjectId(e.CategoryId), ObjectId.Parse(newCategory));
            var result = await _events.UpdateOneAsync(
                e => new ObjectId(e.EventId) == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEventDescriptionAsync(string eventId, string newEventDescription)
        {
            var update = Builders<Event>.Update.Set(e => e.Description, newEventDescription);
            var result = await _events.UpdateOneAsync(
                e => new ObjectId(e.EventId) == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEventStatusAsync(string eventId, string newEventStatus)
        {
            var update = Builders<Event>.Update.Set(e => new ObjectId(e.StatusId), ObjectId.Parse(newEventStatus));
            var result = await _events.UpdateOneAsync(
                e => new ObjectId(e.EventId) == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateStartTimeAsync(string eventId, string newStartTime)
        {
            if (!DateTime.TryParse(newStartTime, out var parsedTime))
                return false;

            var update = Builders<Event>.Update.Set(e => e.StartTime, parsedTime);
            var result = await _events.UpdateOneAsync(
                e => new ObjectId(e.EventId) == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEndTimeAsync(string eventId, string newEndTime)
        {
            if (!DateTime.TryParse(newEndTime, out var parsedTime))
                return false;

            var update = Builders<Event>.Update.Set(e => e.EndTime, parsedTime);
            var result = await _events.UpdateOneAsync(
                e => new ObjectId(e.EventId) == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateStartCheckinAsync(string eventId, string newStartCheckin)
        {
            if (!DateTime.TryParse(newStartCheckin, out var parsedTime))
                return false;

            var update = Builders<Event>.Update.Set(e => e.StartCheckin, parsedTime);
            var result = await _events.UpdateOneAsync(
                e => new ObjectId(e.EventId) == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEndCheckinAsync(string eventId, string newEndCheckin)
        {
            if (!DateTime.TryParse(newEndCheckin, out var parsedTime))
                return false;

            var update = Builders<Event>.Update.Set(e => e.EndCheckin, parsedTime);
            var result = await _events.UpdateOneAsync(
                e => new ObjectId(e.EventId) == ObjectId.Parse(eventId), update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }
    }
}