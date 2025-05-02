using EventManagementWebAPI.Data;
using EventManagementWebAPI.Models;
using MongoDB.Driver;

public class RoleService : IRoleService
{
    private readonly IMongoCollection<AppRole> _roles;

    public RoleService(IConfiguration config, AppDbContext context)
    {
        _roles = context.AppRoles;
    }

    public async Task<bool> RoleExistsAsync(string roleName)
    {
        return await _roles.Find(r => r.RoleName == roleName).AnyAsync();
    }

    public async Task CreateRoleAsync(string roleName)
    {
        var newRole = new AppRole { RoleName = roleName };
        await _roles.InsertOneAsync(newRole);
    }
}
