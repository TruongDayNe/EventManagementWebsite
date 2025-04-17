using MongoDB.EntityFrameworkCore;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace EventManagementWebAPI.Models
{
    [Collection("Events")]
    public class Event
    {
        public ObjectId Id { get; set; }

        [Required(ErrorMessage = "Event must have a name")]
        [Display(Name = "Event Name")]
        public string name { get; set; } = string.Empty;

        [Display(Name = "Event Status")]
        public ObjectId status { get; set; }

        [Display(Name = "Event Đescription")]
        public string description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Event must have an address")]
        [Display(Name = "Event Address")]
        public string address { get; set; } = "54 Nguyễn Lương Bằng";

        public double longitude = 16.073652710981197;
        public double latitude = 108.14986892217975;

        [Display(Name = "Event Host")]
        public ObjectId host { get; set; }

        [Required(ErrorMessage = "Event must have a start time")]
        [Display(Name = "Event Start Time")]
        public DateTime startTime { get; set; } = DateTime.Now.AddDays(7);

        [Required(ErrorMessage = "Event must have an end time")]
        [Display(Name = "Event End Time")]
        public DateTime endTime { get; set; } = DateTime.Now.AddDays(8);

        [Display(Name = "Event Creation Time")]
        public DateTime createAt { get; set; } = DateTime.Now;

        [Display(Name = "Start checkin time")]
        public DateTime startCheckin { get; set; } = DateTime.Now.AddDays(7);

        [Display(Name = "End checkin time")]
        public DateTime endCheckin { get; set; } = DateTime.Now.AddDays(7);



    }
}
