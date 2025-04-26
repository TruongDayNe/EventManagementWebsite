using EventManagementWebAPI.Models;

namespace EventManagementWebAPI.Services
{
    public interface IAuthService
    {
        Task<bool> Register(AppUser user, string password);
        Task<LoginResponse> Login(string email, string password);
        Task<string> GenerateTokenString(AppUser user);
        string GenerateRefreshTokenString();
        Task<LoginResponse> RefreshToken(RefreshTokenModel model);
    }
}