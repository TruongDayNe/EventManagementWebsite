using EventManagementWebAPI.Models;

namespace EventManagementWebAPI.Services
{
    public interface IAuthService
    {
        Task<bool> Register(AppUser user);
        Task<LoginResponse> Login(AppUser user);
        string GenerateTokenString(AppUser user);
        string GenerateRefreshTokenString();
        Task<LoginResponse> RefreshToken(RefreshTokenModel model);
    }
}