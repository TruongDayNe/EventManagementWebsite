using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EventManagementWebAPI.Models
{
    public class EventDetailDto
    {
        // Copy các property từ Event gốc
        public string EventId { get; set; }
        public string EventName { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime StartCheckin { get; set; }
        public DateTime EndCheckin { get; set; }
        public DateTime CreateAt { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        // Các field bổ sung (Flatten data)
        public string CategoryName { get; set; } = "Unknown";
        public string HostName { get; set; } = "Unknown";
        public string StatusName { get; set; } = "Unknown";

        // Danh sách ảnh kèm URL
        public List<EventImageDto> Images { get; set; } = new List<EventImageDto>();
    }

    public class EventImageDto
    {
        public string ImageKey { get; set; }
        public bool IsThumbnail { get; set; }
        public string Url { get; set; } // Presigned URL
    }
}