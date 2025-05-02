using MongoDB.Bson.Serialization.Attributes;
using MongoDB.EntityFrameworkCore;
using MongoDB.Bson;

namespace EventManagementWebAPI.Models
{
    [Collection("AppRoles")]
    public class AppRole
    {
        [BsonId]
        [BsonElement("RoleId"), BsonRepresentation(BsonType.ObjectId)]
        public string RoleId { get; set; } = string.Empty;
        [BsonElement("RoleName"), BsonRepresentation(BsonType.String)]
        public string RoleName { get; set; } = string.Empty;
    }
}
