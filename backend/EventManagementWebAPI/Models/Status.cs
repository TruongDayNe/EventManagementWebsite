using MongoDB.Bson;
using MongoDB.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace EventManagementWebAPI.Models
{
    [Collection("Status")]
    public class Status
    {
        public ObjectId Id { get; set; }
        public string status { get; set; } = string.Empty;
    }
}
