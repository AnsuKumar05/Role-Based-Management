using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces.Repositories
{
    public interface IPermissionRepository
    {
        Task<List<string>> GetPermissionsByRoleAsync(string roleName);
        Task<bool> HasPermissionAsync(string roleName, string permissionName);
        Task<List<Role>> GetAllRolesWithPermissionsAsync();
        Task<List<Permission>> GetAllPermissionsAsync();
        Task<Dictionary<string, List<string>>> GetRolePermissionMatrixAsync();
        Task<bool> UpdateRolePermissionsAsync(string roleName, List<string> permissionNames);
        void InvalidatePermissionCache(string roleName = null);
    }
}
