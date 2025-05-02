using EventManagementWebAPI.Data;
using EventManagementWebAPI.Models;
using MongoDB.Driver;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public class StatusService : IStatusService
    {
        public IMongoCollection<Status> _statuses;
        public StatusService(AppDbContext context)
        {
            _statuses = context.Statuses;
        }

        public List<Status> GetAllStatuses()
        {
            return _statuses.Find(_ => true).ToList();
        }
        public Status GetStatusById(ObjectId id)
        {
            return _statuses.Find(c => c.StatusId == id).FirstOrDefault();
        }

        public async Task<bool> CreateStatusAsync(Status status)
        {
            var existingName = await _statuses.Find(e => e.StatusName == status.StatusName).FirstOrDefaultAsync();
            if (existingName != null)
            {
                Console.WriteLine("Status with this name already exists.");
                return false;
            }
            _statuses.InsertOne(status);
            return true;
        }

    }
}
