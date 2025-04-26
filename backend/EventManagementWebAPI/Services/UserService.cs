using EventManagementWebAPI.Models;
using Microsoft.Extensions.Configuration;
using EventManagementWebAPI.Data;
using MongoDB.Driver;

namespace EventManagementWebAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IMongoCollection<AppUser> _users;
        private readonly IMongoCollection<AppRole> _roles;
        private readonly IMongoCollection<AppUserRole> _userRoles;

        public UserService(IConfiguration config, AppDbContext dbContext)
        {
            _users = dbContext.AppUsers;
            _roles = dbContext.AppRoles;
            _userRoles = dbContext.AppUserRoles;
        }
        public async Task<List<AppUser>> GetAllUsers()
        {
            return await _users.Find(_ => true).ToListAsync();
        }

        public async Task<AppUser?> GetUserByEmail(string email)
        {
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }
        public async Task<AppUser?> GetUserById(string userId)
        {
            return await _users.Find(u => u.UserId.ToString() == userId).FirstOrDefaultAsync();
        }

        public async Task<AppUser?> GetUserByUserName(string userName)
        {
            return await _users.Find(u => u.UserName == userName).FirstOrDefaultAsync();
        }

        public async Task<bool> AssignRoleToUserAsync(string userId, string roleName)
        {
            var role = await _roles.Find(r => r.RoleName == roleName).FirstOrDefaultAsync();
            if (role == null) return false;

            // Xóa tất cả các vai trò cũ của người dùng
            await _userRoles.DeleteManyAsync(ur => ur.UserId == userId);

            // Gán vai trò mới
            await _userRoles.InsertOneAsync(new AppUserRole
            {
                UserId = userId,
                RoleId = role.RoleId
            });

            return true;
        }



        public async Task<CreateUserResult> CreateUserAsync(AppUser user, string password)
        {
            var result = new CreateUserResult();

            // Kiểm tra username/email đã tồn tại
            var existingUser = await _users.Find(u => u.UserName == user.UserName || u.Email == user.Email).FirstOrDefaultAsync();
            if (existingUser != null) 
            {
                if (existingUser.UserName == user.UserName)
                    result.Errors.Add("Username đã tồn tại.");
                if (existingUser.Email == user.Email)
                    result.Errors.Add("Email đã tồn tại.");
                return result;
            }

            // Kiểm tra mật khẩu (tùy bạn customize thêm)
            if (string.IsNullOrWhiteSpace(password) || password.Length < 6)
            {
                result.Errors.Add("Mật khẩu phải có ít nhất 6 ký tự.");
                return result;
            }

            // Mã hóa mật khẩu
            user.PasswordHashed = BCrypt.Net.BCrypt.HashPassword(password);

            await _users.InsertOneAsync(user);
            result.Succeeded = true;

            return result;
        }

        public async Task<string> GetUserRole(string userId)
        {
            var userRole = await _userRoles.Find(ur => ur.UserId == userId).FirstOrDefaultAsync();
            if (userRole == null) return string.Empty;

            var role = await _roles.Find(r => r.RoleId == userRole.RoleId).FirstOrDefaultAsync();
            return role?.RoleName ?? string.Empty;
        }


        public async Task<bool> RemoveRoleFromUserAsync(string userId, string roleName)
        {
            var role = await _roles.Find(r => r.RoleName == roleName).FirstOrDefaultAsync();
            if (role == null) return false;

            var deleteResult = await _userRoles.DeleteOneAsync(ur => ur.UserId == userId && ur.RoleId == role.RoleId);
            return deleteResult.DeletedCount > 0;
        }

        public Task<bool> UpdateUserAddressAsync(string userId, string newAddress)
        {
            var user = _users.Find(u => u.UserId.ToString() == userId).FirstOrDefault();
            if (user == null) return Task.FromResult(false);
            user.Address = newAddress;
            var update = Builders<AppUser>.Update.Set(u => u.Address, newAddress);
            var result = _users.UpdateOne(u => u.UserId.ToString() == userId, update);
            return Task.FromResult(result.IsAcknowledged && result.ModifiedCount > 0);
        }


        public async Task<bool> UpdateUserEmailAsync(string userId, string newEmail)
        {
            if (string.IsNullOrWhiteSpace(newEmail))
                return false;

            // Kiểm tra email đã tồn tại chưa
            var existing = await _users.Find(u => u.Email == newEmail).FirstOrDefaultAsync();
            if (existing != null)
                return false;

            var update = Builders<AppUser>.Update.Set(u => u.Email, newEmail);
            var result = await _users.UpdateOneAsync(u => u.UserId.ToString() == userId, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateUserNameAsync(string userId, string newUserName)
        {
            if (string.IsNullOrWhiteSpace(newUserName))
                return false;

            var existing = await _users.Find(u => u.UserName == newUserName).FirstOrDefaultAsync();
            if (existing != null)
                return false;

            var update = Builders<AppUser>.Update.Set(u => u.UserName, newUserName);
            var result = await _users.UpdateOneAsync(u => u.UserId.ToString() == userId, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateUserPasswordAsync(string userId, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
                return false;

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
            var update = Builders<AppUser>.Update.Set(u => u.PasswordHashed, hashedPassword);
            var result = await _users.UpdateOneAsync(u => u.UserId.ToString() == userId, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateUserPhoneNumberAsync(string userId, string newPhoneNumber)
        {
            if (string.IsNullOrWhiteSpace(newPhoneNumber))
                return false;

            var update = Builders<AppUser>.Update.Set(u => u.PhoneNumber, newPhoneNumber);
            var result = await _users.UpdateOneAsync(u => u.UserId.ToString() == userId, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateUserRefreshToken(string userId, string refreshToken)
        {
            var update = Builders<AppUser>.Update.Set(u => u.RefreshToken, refreshToken);
            var result = await _users.UpdateOneAsync(u => u.UserId.ToString() == userId, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateUserRefreshTokenExpiry(string userId, DateTime refreshTokenExpiry)
        {
            var update = Builders<AppUser>.Update.Set(u => u.RefreshTokenExpiry, refreshTokenExpiry);
            var result = await _users.UpdateOneAsync(u => u.UserId.ToString() == userId, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }
    }
}
