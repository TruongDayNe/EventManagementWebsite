using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventManagementWebAPI.Models;
using EventManagementWebAPI.Services;
using Microsoft.AspNetCore.Authentication;

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
        public async Task<IActionResult> Register(AppUser user)
        {
            if (await authService.Register(user))
            {
                return Ok(new { message = "User registered successfully" });
            }
            return BadRequest(new { message = "User registration failed" });
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(AppUser user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var loginResponse = await authService.Login(user);
            if (loginResponse.IsAuthenticated)
            {
                return Ok(loginResponse);    
            }    
            return Unauthorized("Login failed");
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
