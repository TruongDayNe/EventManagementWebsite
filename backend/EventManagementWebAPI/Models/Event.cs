﻿using MongoDB.EntityFrameworkCore;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson.Serialization.Attributes;

namespace EventManagementWebAPI.Models
{
    [Collection("Events")]
    public class Event
    {
        [BsonId]
        [BsonElement("EventId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId EventId { get; set; }

        [Required(ErrorMessage = "Event must have a name")]
        [BsonElement("EventName"), BsonRepresentation(BsonType.String)]
        public string EventName { get; set; } = string.Empty;

        [BsonElement("CategoryId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId CategoryId { get; set; } = ObjectId.Empty;

        [BsonElement("StatusId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId StatusId { get; set; } = ObjectId.Empty;

        [BsonElement("Description"), BsonRepresentation(BsonType.String)]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Event must have an address")]
        [BsonElement("Address"), BsonRepresentation(BsonType.String)]   
        public string Address { get; set; } = "54 Nguyễn Lương Bằng";

        [BsonElement("Longitude"), BsonRepresentation(BsonType.Double)]
        public double Longitude = 16.073652710981197;

        [BsonElement("Latitude"), BsonRepresentation(BsonType.Double)]
        public double Latitude = 108.14986892217975;

        [BsonElement("HostId"), BsonRepresentation(BsonType.String)]
        public string HostId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Event must have a start time")]
        [BsonElement("StartTime"), BsonRepresentation(BsonType.DateTime)]
        public DateTime StartTime { get; set; } = DateTime.Now.AddDays(7);

        [Required(ErrorMessage = "Event must have an end time")]
        [BsonElement("EndTime"), BsonRepresentation(BsonType.DateTime)]
        public DateTime EndTime { get; set; } = DateTime.Now.AddDays(8);

        [BsonElement("CreateAt"), BsonRepresentation(BsonType.DateTime)]
        public DateTime CreateAt { get; set; } = DateTime.Now;

        [BsonElement("StartCheckin"), BsonRepresentation(BsonType.DateTime)]
        public DateTime StartCheckin { get; set; } = DateTime.Now.AddDays(7);

        [BsonElement("EndCheckin"), BsonRepresentation(BsonType.DateTime)]
        public DateTime EndCheckin { get; set; } = DateTime.Now.AddDays(7);



    }
}
