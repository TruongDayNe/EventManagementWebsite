using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using MongoDB.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace EventManagementWebAPI.Models
{
    [Collection("AppUsers")]
    public class AppUser : IdentityUser
    {

        [Required(ErrorMessage = "User must have a name")]
        [Display(Name = "User Name")]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "User must have a password")]
        [Display(Name = "User password")]
        public string Password { get; set; } = string.Empty;

        [Display(Name = "User Address")]
        public string Address { get; set; } = string.Empty;

        public DateOnly CreateAt { get; set; } = DateOnly.FromDateTime(DateTime.Now);
        
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiry{ get; set; }
    }
}
