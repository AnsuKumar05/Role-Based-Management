using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Application.DTOs;

namespace HotelManagementSystem.Application.Interfaces
{
    public interface IMenuMasterService
    {
        Task<List<MenuDto>> GetAllMenusAsync();
        Task<MenuDto> GetMenuByIdAsync(int id);
        Task<MenuDto> CreateMenuAsync(CreateMenuRequest request);
        Task<MenuDto> UpdateMenuAsync(int id, UpdateMenuRequest request);
        Task<bool> DeleteMenuAsync(int id);
        Task<List<MenuDto>> GetUserMenusAsync(string roleName);
        Task<List<RoleMenuAssignmentDto>> GetRoleMenusAsync(string roleName);
        Task<RoleMenuMatrixResponse> GetRoleMenuMatrixAsync();
        Task<bool> UpdateRoleMenusAsync(string roleName, List<RoleMenuAssignmentDto> assignments);
        Task<bool> HasMenuAccessAsync(string roleName, string moduleOrMenuName);
    }
}
