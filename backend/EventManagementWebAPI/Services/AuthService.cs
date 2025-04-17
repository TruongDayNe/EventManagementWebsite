using EventManagementWebAPI.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace EventManagementWebAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> userManager;
        private readonly IConfiguration config;

        public AuthService(UserManager<AppUser> _userManager, IConfiguration _config)
        {
            userManager = _userManager;
            config = _config;
        }
        public async Task<bool> Register(AppUser user)
        {
            var appUser = new AppUser
            {
                UserName = user.UserName,
                Email = user.Email,
                Password = user.Password,
            };

            var result = await userManager.CreateAsync(appUser, user.Password);
            if (userManager.Options.SignIn.RequireConfirmedAccount)
            {
                // Send confirmation email
                // await userManager.SendEmailAsync(IdentityUser, "Confirm your account", "Confirmation link");
            }

            return result.Succeeded;
        }
        public async Task<LoginResponse> Login(AppUser user)
        {
            var response = new LoginResponse();
            if (string.IsNullOrEmpty(user.Email))
            {
                throw new ArgumentException("Email cannot be null or empty.", nameof(user.Email));
            }

            var appUser = await userManager.FindByEmailAsync(user.Email);
            if (appUser == null || !(await userManager.CheckPasswordAsync(appUser, user.Password)))
            {
                return response;
            }

            response.IsAuthenticated = true;
            response.Token = GenerateTokenString(appUser);
            response.RefreshToken = GenerateRefreshTokenString();

            appUser.RefreshToken = response.RefreshToken;
            appUser.RefreshTokenExpiry= DateTime.UtcNow.AddDays(2);
            await userManager.UpdateAsync(appUser);

            return response;
        }


        // JWT != Bearer Token
        public string GenerateTokenString(AppUser user)
        {
            IEnumerable<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, "Admin"),
            };

            var jwtKey = config.GetSection("JWT:Key").Value;
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT:Key configuration is missing or empty.");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            SigningCredentials signingCredentials = new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256Signature
            );

            var securityToken = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddSeconds(60),
                signingCredentials: signingCredentials,
                issuer: config.GetSection("JWT:Issuer").Value,
                audience: config.GetSection("JWT:Audience").Value
            );
            string token = new JwtSecurityTokenHandler().WriteToken(securityToken);
            return token;
        }
        public string GenerateRefreshTokenString()
        {
            var randomNumber = new byte[64];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
            }
            return Convert.ToBase64String(randomNumber);
        }

        public async Task<LoginResponse> RefreshToken(RefreshTokenModel model)
        {
            var principal = GetPrincipalFromExpiredToken(model.Token);
            var response = new LoginResponse();
            if (principal?.Identity?.Name is null)
            {
                return response;
            }

            var appUser = await userManager.FindByNameAsync(principal.Identity.Name);

            if (appUser == null || appUser.RefreshToken != model.RefreshToken || appUser.RefreshTokenExpiry > DateTime.UtcNow)
            {
                return response;
            }

            response.IsAuthenticated = true;
            response.Token = GenerateTokenString(appUser);
            response.RefreshToken = GenerateRefreshTokenString();

            appUser.RefreshToken = response.RefreshToken;
            appUser.RefreshTokenExpiry = DateTime.UtcNow.AddDays(2);
            await userManager.UpdateAsync(appUser);

            return response;
        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string? token)
        {
            var jwtKey = config.GetSection("JWT:Key").Value;
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT:Key configuration is missing or empty.");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            SigningCredentials signingCredentials = new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256Signature
            );

            var validationParameters = new TokenValidationParameters
            {
                IssuerSigningKey = securityKey,
                ValidateIssuerSigningKey = true,
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false // we want to validate the token even if it's expired
            };
            return new JwtSecurityTokenHandler()
                .ValidateToken(token, validationParameters, out SecurityToken validatedToken);
        }
    }
}
