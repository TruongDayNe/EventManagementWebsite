using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace EventManagementWebAPI.Models
{
    [Collection("AppUsers")]
    public class AppUser
    {
        [BsonId]
        [BsonElement("UserId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId UserId { get; set; } = ObjectId.GenerateNewId();

        [BsonElement("UserName"), BsonRepresentation(BsonType.String)]
        public string UserName { get; set; } = string.Empty;

        [BsonElement("Email"), BsonRepresentation(BsonType.String)]
        public string Email { get; set; } = string.Empty;

        [BsonElement("PasswordHashed"), BsonRepresentation(BsonType.String)]
        public string PasswordHashed { get; set; } = string.Empty;

        [BsonElement("PhoneNumber"), BsonRepresentation(BsonType.String)]
        public string PhoneNumber { get; set; } = string.Empty;

        [BsonElement("Address"), BsonRepresentation(BsonType.String)]
        public string Address { get; set; } = string.Empty;

        [BsonElement("EmailConfirmed"), BsonRepresentation(BsonType.Boolean)]
        public bool EmailConfirmed { get; set; } = false;

        [BsonElement("CreateAt"), BsonRepresentation(BsonType.DateTime)]
        public DateOnly CreateAt { get; set; } = DateOnly.FromDateTime(DateTime.Now);

        [BsonElement("RefreshToken"), BsonRepresentation(BsonType.String)]
        public string? RefreshToken { get; set; }

        [BsonElement("RefreshTokenExpiry"), BsonRepresentation(BsonType.DateTime)]
        public DateTime? RefreshTokenExpiry{ get; set; }
    }
}
