using EventManagementWebAPI.Models;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public interface IStatusService
    {
        Task<bool> CreateStatusAsync(Status status);
        List<Status> GetAllStatuses();
        Status GetStatusById(ObjectId id);
    }
}