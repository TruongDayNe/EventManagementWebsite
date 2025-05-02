using EventManagementWebAPI.Models;
using MongoDB.Bson;

namespace EventManagementWebAPI.Services
{
    public interface IUserService
    {
        Task<List<AppUser>> GetAllUsers();
        Task<AppUser?> GetUserById(string userId);
        Task<AppUser?> GetUserByUserName(string userName);
        Task<AppUser?> GetUserByEmail(string email);
        Task<bool> UpdateNameAsync(string userId, string newName);
        Task<bool> UpdateUserNameAsync(string userId, string newUserName);   
        Task<bool> UpdateUserEmailAsync(string userId, string newEmail);
        Task<bool> UpdateUserPasswordAsync(string userId, string newPassword);
        Task<bool> UpdateUserPhoneNumberAsync(string userId, string newPhoneNumber);
        Task<bool> UpdateUserAddressAsync(string userId, string newAddress);
        Task<CreateUserResult> CreateUserAsync(AppUser user, string password); // Hash the pwd
        Task<string> GetUserRole(string userId);
        Task<bool> AssignRoleToUserAsync(string userId, string roleName); 
        Task<bool> RemoveRoleFromUserAsync(string userId, string roleName);
        Task<bool> UpdateUserRefreshToken(string userId, string refreshToken);
        Task<bool> UpdateUserRefreshTokenExpiry(string userId, DateTime refreshTokenExpiry);
    }
}
