
public interface IRoleService
{
    Task CreateRoleAsync(string roleName);
    Task<bool> RoleExistsAsync(string roleName);
}