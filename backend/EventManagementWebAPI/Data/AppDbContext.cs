using MongoDB.Driver;
using Microsoft.Extensions.Options;
using EventManagementWebAPI.Models;

namespace EventManagementWebAPI.Data
{
    public class AppDbContext
    {
        private readonly IMongoDatabase _database;

        public AppDbContext(IOptions<MongoDbConfigs> settings)
        {
            var client = new MongoClient(settings.Value.AtlasURI);
            _database = client.GetDatabase(settings.Value.DatabaseName);
        }

        public IMongoCollection<AppUser> AppUsers => _database.GetCollection<AppUser>("AppUsers");
        public IMongoCollection<AppRole> AppRoles => _database.GetCollection<AppRole>("AppRoles");
        public IMongoCollection<AppUserRole> AppUserRoles => _database.GetCollection<AppUserRole>("AppUserRoles");
        public IMongoCollection<Event> Events => _database.GetCollection<Event>("Events");
        public IMongoCollection<EventImage> EventImages => _database.GetCollection<EventImage>("EventImages");
        public IMongoCollection<Attendance> Attendances => _database.GetCollection<Attendance>("Attendances");
        public IMongoCollection<Category> Categories => _database.GetCollection<Category>("Categories");
        public IMongoCollection<Checkin> Checkins => _database.GetCollection<Checkin>("Checkins");
        public IMongoCollection<Status> Statuses => _database.GetCollection<Status>("Statuses");

    }
}
