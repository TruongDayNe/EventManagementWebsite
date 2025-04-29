using MongoDB.Driver;
using System.Text;
using EventManagementWebAPI.Models;
using EventManagementWebAPI.Services;
using EventManagementWebAPI.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Amazon.S3;
using Microsoft.Extensions.Options;
using DotNetEnv;
using Amazon.Runtime;
using Amazon.SecurityToken.Model;
using Amazon.SecurityToken;

var builder = WebApplication.CreateBuilder(args);

// Load MongoDB config
var mongoDbConfigs = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbConfigs>()
    ?? throw new Exception("Missing MongoDbSettings");

builder.Services.Configure<MongoDbConfigs>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<AppDbContext>();

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IStatusService, StatusService>();
builder.Services.AddScoped<IEventImageService, EventImageService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:5173", "https://localhost:5173")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<S3Settings>(builder.Configuration.GetSection("S3Settings"));

builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var s3Settings = sp.GetRequiredService<IOptions<S3Settings>>().Value;

    var config = new AmazonS3Config
    {

        RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(s3Settings.Region)
    };
    return new AmazonS3Client(config);
});

var app = builder.Build();

// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("CorsPolicy");
// app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

//app.MapGet("/", () => "EventManagementWebAPI is running!");

using (var scope = app.Services.CreateScope())
{
    var roleService = scope.ServiceProvider.GetRequiredService<IRoleService>();

    string[] roles = { "Admin", "Organizer", "Attendant" };

    foreach (var role in roles)
    {
        if (!await roleService.RoleExistsAsync(role))
        {
            await roleService.CreateRoleAsync(role);
            Console.WriteLine($"Seeded role: {role}");
        }
    }
}


app.Run();
