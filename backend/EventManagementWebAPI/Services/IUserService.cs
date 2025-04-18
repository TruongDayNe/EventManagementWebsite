using EventManagementWebAPI.Models;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public interface IUserService
    {
        List<AppUser> GetAllUsers();
        AppUser? GetUserById(string userId);
        // if need CRUD
        //void CreateEvent(Event newEvent);
        //void UpdateEvent(ObjectId eventId, Event updatedEvent);
        //void DeleteEvent(Event eventToDeletion);
    }
}
