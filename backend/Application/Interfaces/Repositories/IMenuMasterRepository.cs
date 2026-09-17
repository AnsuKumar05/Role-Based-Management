using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces.Repositories
{
    public interface IMenuMasterRepository
    {
        Task<List<Menu>> GetAllMenusAsync();
        Task<Menu> GetMenuByIdAsync(int id);
        Task<Menu> CreateMenuAsync(Menu menu);
        Task<Menu> UpdateMenuAsync(int id, Menu menu);
        Task<bool> DeleteMenuAsync(int id);
        Task<List<Menu>> GetMenusByRoleAsync(string roleName);
        Task<Dictionary<string, List<RoleMenuAssignmentDto>>> GetRoleMenuMatrixAsync();
        Task<bool> UpdateRoleMenusAsync(string roleName, List<RoleMenuAssignmentDto> assignments);
        Task<bool> HasMenuAccessAsync(string roleName, string moduleOrMenuName);
        void InvalidateMenuCache(string roleName = null);
    }
}
