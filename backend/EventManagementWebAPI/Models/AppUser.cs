using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace EventManagementWebAPI.Models
{
    [Collection("AppUsers")]
    public class AppUser : IdentityUser
    {
        [BsonElement("Name"), BsonRepresentation(BsonType.String)]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "User must have a password")]
        [BsonElement("Password"), BsonRepresentation(BsonType.String)]
        public string Password { get; set; } = string.Empty;

        [BsonElement("Address"), BsonRepresentation(BsonType.String)]
        public string Address { get; set; } = string.Empty;

        [BsonElement("CreateAt"), BsonRepresentation(BsonType.DateTime)]
        public DateOnly CreateAt { get; set; } = DateOnly.FromDateTime(DateTime.Now);

        [BsonElement("RefreshToken"), BsonRepresentation(BsonType.String)]
        public string? RefreshToken { get; set; }

        [BsonElement("RefreshTokenExpiry"), BsonRepresentation(BsonType.DateTime)]
        public DateTime? RefreshTokenExpiry{ get; set; }
    }
}
