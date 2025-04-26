using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventManagementWebAPI.Models;
using EventManagementWebAPI.Services;
using MongoDB.Bson;

namespace EventManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public IActionResult GetAllUsers()
        {
            var users = _userService.GetAllUsers().Result;
            if (users == null || users.Count() == 0)
            {
                return NotFound("No events found");
            }
            return Ok(users);
        }

        [HttpGet("{id}")]
        public IActionResult GetUserById([FromRoute] string id)
        {
            var user = _userService.GetUserById(id).Result;
            if (user == null)
            {
                return NotFound("User not found");
            }
            return Ok(user);
        }

        [HttpGet("{id}/Role")]
        public IActionResult GetUserRole(string id)
        {
            var userRole = _userService.GetUserRole(id).Result;
            return Ok(userRole);
        }

        [HttpPut("{id}/Name")]
        public IActionResult UpdateName(string id, [FromBody] string newName)
        {
            var user = _userService.GetUserById(id).Result;
            if (user == null)
            {
                return NotFound("User not found");
            }
            _userService.UpdateNameAsync(id, newName);
            return Ok("User name updated successfully");
        }

        [HttpPut("{id}/Address")]
        public IActionResult UpdateAddress(string id, [FromBody] string newAddress)
        {
            var user = _userService.GetUserById(id).Result;
            if (user == null)
            {
                return NotFound("User not found");
            }
            _userService.UpdateUserAddressAsync(id, newAddress);
            return Ok("User address updated successfully");
        }


    }
}
