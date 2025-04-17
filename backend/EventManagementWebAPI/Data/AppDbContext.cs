using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using EventManagementWebAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.EntityFrameworkCore.Extensions;

namespace EventManagementWebAPI.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions options) : base(options) { }

        public DbSet<Event> Events { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<Checkin> Checkins { get; set; }
        public DbSet<EventImage> EventImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AppUser>().ToCollection("AspNetUsers");
            modelBuilder.Entity<Event>().ToCollection("Events");
            modelBuilder.Entity<Attendance>().ToCollection("Attendances");
            modelBuilder.Entity<Category>().ToCollection("Categories");
            modelBuilder.Entity<Status>().ToCollection("Statuses");
            modelBuilder.Entity<Checkin>().ToCollection("Checkins");
            modelBuilder.Entity<EventImage>().ToCollection("EventImages");
        }
    }

}
