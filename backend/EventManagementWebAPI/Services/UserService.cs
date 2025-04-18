using EventManagementWebAPI.Models;
using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<AppUser> userManager;
        private readonly IConfiguration config;
        public UserService(UserManager<AppUser> _userManager, IConfiguration _config)
        {
            userManager = _userManager;
            config = _config;
        }
        public List<AppUser> GetAllUsers()
        {
            var users = userManager.Users.ToList();
            if (users.Count == 0)
            {
                return new List<AppUser>();
            }
            return users;
        }
        public AppUser? GetUserById(string userId)
        {
            return userManager.Users.FirstOrDefault(u => u.Id == userId);
        }

    }
}
