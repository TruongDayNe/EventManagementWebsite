using MongoDB.Driver;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using EventManagementWebAPI.Data;
using EventManagementWebAPI.Services;
using EventManagementWebAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Add mongoDb services
var mapMongoDbSettings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>() 
    ?? throw new Exception("MongoDbSettings section is missing in appsettings.json");

builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

var mongoClient = new MongoClient(mapMongoDbSettings.AtlasURI);

builder.Services.AddDbContext<AppDbContext>(options =>
options.UseMongoDB(mongoClient, mapMongoDbSettings.DatabaseName));

// log AtlasURI and dbname 
Console.WriteLine($"MongoDB Atlas URI: {mapMongoDbSettings.AtlasURI}");
Console.WriteLine($"MongoDB Database Name: {mapMongoDbSettings.DatabaseName}");

try
{
    // Simple ping test
    mongoClient.GetDatabase(mapMongoDbSettings.DatabaseName)
        .RunCommand<MongoDB.Bson.BsonDocument>(new MongoDB.Bson.BsonDocument("ping", 1));
    Console.WriteLine("Successfully connected to MongoDB Atlas!");
}
catch (Exception ex)
{
    Console.WriteLine($"MongoDB connection test failed: {ex.Message}");
}

// identity
builder.Services.AddIdentity<AppUser,IdentityRole>(options => 
    {
        options.SignIn.RequireConfirmedAccount = false; //turn on later

        //pwd options
        options.Password.RequireDigit = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireLowercase = false;
        options.Password.RequiredLength = 0;
        options.Password.RequiredUniqueChars = 0;

        options.User.RequireUniqueEmail = false;
     })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

var clientId = builder.Configuration["Authentication:Google:ClientId"];
var clientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
{
    throw new InvalidOperationException("Google authentication credentials are missing.");
}
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddGoogle(option =>
    {
        option.ClientId = clientId;
        option.ClientSecret = clientSecret;
        option.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    } 
    )
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration.GetSection("JWT:Issuer").Value,
            ValidAudience = builder.Configuration.GetSection("JWT:Audience").Value,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration.GetSection("JWT:Key").Value ?? throw new InvalidOperationException("JWT Key is missing")))
        };
    });

builder.Services.AddTransient<IAuthService, AuthService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder =>
        {
            builder.AllowAnyMethod()
                   .AllowAnyHeader()
                   .WithOrigins("http://localhost:5173");
        });
});
builder.Services.AddControllers();

builder.Services.AddOpenApi();

builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");

app.UseHttpsRedirection();

//app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
