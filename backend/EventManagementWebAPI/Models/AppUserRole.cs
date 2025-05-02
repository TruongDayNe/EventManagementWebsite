using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using MongoDB.EntityFrameworkCore;
using System.Xml.Serialization;

namespace EventManagementWebAPI.Models
{
    [Collection("AppUserRoles")]
    public class AppUserRole
    {
        [BsonId]
        [BsonElement("AppUserRoleId"), BsonRepresentation(BsonType.ObjectId)]
        public ObjectId AppUserRoleId { get; set; } = ObjectId.GenerateNewId();

        [BsonElement("UserId"),BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
        [BsonElement("RoleId"), BsonRepresentation(BsonType.ObjectId)]
        public string RoleId { get; set; } = string.Empty;
    }
}
