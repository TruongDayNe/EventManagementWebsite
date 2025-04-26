using EventManagementWebAPI.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace EventManagementWebAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration config;
        private readonly IUserService userService;

        public AuthService(IConfiguration _config, IUserService _userService)
        {
            config = _config;
            userService = _userService;
        }

        public async Task<bool> Register(AppUser user, string password)
        {
            var result = await userService.CreateUserAsync(user, password);
            if (!result.Succeeded) return false;

            return await userService.AssignRoleToUserAsync(user.UserId.ToString()!, "Attendant");
        }

        public async Task<LoginResponse> Login(string email, string password)
        {
            var response = new LoginResponse();

            var existingUser = await userService.GetUserByEmail(email);
            if (existingUser == null) return response;

            if (!BCrypt.Net.BCrypt.Verify(password, existingUser.PasswordHashed))
                return response;

            response.IsAuthenticated = true;
            response.Token = await GenerateTokenString(existingUser);
            response.RefreshToken = GenerateRefreshTokenString();

            // Lưu refresh token
            existingUser.RefreshToken = response.RefreshToken;

            await userService.UpdateUserRefreshToken(existingUser.UserId.ToString()!, existingUser.RefreshToken); // Lưu refresh token
            await userService.UpdateUserRefreshTokenExpiry(existingUser.UserId.ToString()!, DateTime.UtcNow.AddDays(2)); // Lưu refresh token expiry

            return response;
        }

        public async Task<string> GenerateTokenString(AppUser user)
        {
            var role = await userService.GetUserRole(user.UserId.ToString()!);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()!),
                new Claim(ClaimTypes.GivenName, user.Name),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["JWT:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: config["JWT:Issuer"],
                audience: config["JWT:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshTokenString()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public async Task<LoginResponse> RefreshToken(RefreshTokenModel model)
        {
            var response = new LoginResponse();
            var principal = GetPrincipalFromExpiredToken(model.Token);

            var email = principal?.Identities.FirstOrDefault()?.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) 
            {
                Console.WriteLine($"Email is empty");
                return response;
            }

            var user = await userService.GetUserByEmail(email);
            if (user == null)
            {
                Console.WriteLine($"User not found");
                return response;
            }
            if (user.RefreshToken != model.RefreshToken)
            {
               Console.WriteLine($"Refresh token mismatch");
                return response;
            }
            if ( user.RefreshTokenExpiry < DateTime.UtcNow)
            {
                Console.WriteLine($"Refresh token expired");
                return response;
            }

            response.IsAuthenticated = true;
            response.Token = await GenerateTokenString(user);
            response.RefreshToken = GenerateRefreshTokenString();

            user.RefreshToken = response.RefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(2);
            //await userService.UpdateUserPasswordAsync(user.UserId.ToString()!, user.PasswordHashed);

            await userService.UpdateUserRefreshToken(user.UserId.ToString()!, user.RefreshToken); // Lưu refresh token
            await userService.UpdateUserRefreshTokenExpiry(user.UserId.ToString()!, DateTime.UtcNow.AddDays(2)); // Lưu refresh token expiry

            return response;
        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string? token)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["JWT:Key"]!));
            var tokenValidationParams = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false // cho phép token hết hạn
            };

            return new JwtSecurityTokenHandler().ValidateToken(token, tokenValidationParams, out _);
        }
    }
}
