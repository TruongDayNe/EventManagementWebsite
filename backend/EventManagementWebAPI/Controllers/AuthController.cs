using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventManagementWebAPI.Models;
using EventManagementWebAPI.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace EventManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService _authService)
        {
            authService = _authService;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var user = new AppUser
            {
                UserName = model.UserName,
                Email = model.Email,
            };

            var result = await authService.Register(user, model.Password!);
            if (result)
                return Ok(new { message = "User registered successfully" });

            return BadRequest(new { message = "User registration failed" });
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await authService.Login(model.Email!, model.Password!);
            if (result.IsAuthenticated)
                return Ok(result);

            return Unauthorized(new { message = "Login failed" });
        }

        [HttpPost("RefreshToken")]
        public async Task<IActionResult> RefreshToken(RefreshTokenModel model)
        {
            var loginResult = await authService.RefreshToken(model);
            if (loginResult.IsAuthenticated)
            {
                return Ok(loginResult);
            }

            return Unauthorized();
        }
    }
}