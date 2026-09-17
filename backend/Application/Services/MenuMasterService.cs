using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Services
{
    public class MenuMasterService : IMenuMasterService
    {
        private readonly IMenuMasterRepository _menuMasterRepository;

        public MenuMasterService(IMenuMasterRepository menuMasterRepository)
        {
            _menuMasterRepository = menuMasterRepository;
        }

        public async Task<List<MenuDto>> GetAllMenusAsync()
        {
            var menus = await _menuMasterRepository.GetAllMenusAsync();
            return menus.Select(MapToDto).ToList();
        }

        public async Task<MenuDto> GetMenuByIdAsync(int id)
        {
            var menu = await _menuMasterRepository.GetMenuByIdAsync(id);
            return menu != null ? MapToDto(menu) : null;
        }

        public async Task<MenuDto> CreateMenuAsync(CreateMenuRequest request)
        {
            var entity = new Menu
            {
                Name = request.Name.Trim(),
                DisplayName = request.DisplayName.Trim(),
                Route = request.Route.Trim(),
                Icon = request.Icon?.Trim() ?? string.Empty,
                ParentId = request.ParentId,
                Module = request.Module.Trim(),
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive
            };

            var created = await _menuMasterRepository.CreateMenuAsync(entity);
            return MapToDto(created);
        }

        public async Task<MenuDto> UpdateMenuAsync(int id, UpdateMenuRequest request)
        {
            var entity = new Menu
            {
                Name = request.Name.Trim(),
                DisplayName = request.DisplayName.Trim(),
                Route = request.Route.Trim(),
                Icon = request.Icon?.Trim() ?? string.Empty,
                ParentId = request.ParentId,
                Module = request.Module.Trim(),
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive
            };

            var updated = await _menuMasterRepository.UpdateMenuAsync(id, entity);
            return updated != null ? MapToDto(updated) : null;
        }

        public async Task<bool> DeleteMenuAsync(int id)
        {
            return await _menuMasterRepository.DeleteMenuAsync(id);
        }

        public async Task<List<MenuDto>> GetUserMenusAsync(string roleName)
        {
            var menus = await _menuMasterRepository.GetMenusByRoleAsync(roleName);
            return menus.Select(MapToDto).ToList();
        }

        public async Task<List<RoleMenuAssignmentDto>> GetRoleMenusAsync(string roleName)
        {
            var matrix = await _menuMasterRepository.GetRoleMenuMatrixAsync();
            if (matrix.TryGetValue(roleName, out var assignments))
            {
                return assignments;
            }
            return new List<RoleMenuAssignmentDto>();
        }

        public async Task<RoleMenuMatrixResponse> GetRoleMenuMatrixAsync()
        {
            var rolesMatrix = await _menuMasterRepository.GetRoleMenuMatrixAsync();
            var allMenus = await _menuMasterRepository.GetAllMenusAsync();

            return new RoleMenuMatrixResponse
            {
                Roles = rolesMatrix,
                AllMenus = allMenus.Select(MapToDto).ToList()
            };
        }

        public async Task<bool> UpdateRoleMenusAsync(string roleName, List<RoleMenuAssignmentDto> assignments)
        {
            return await _menuMasterRepository.UpdateRoleMenusAsync(roleName, assignments);
        }

        public async Task<bool> HasMenuAccessAsync(string roleName, string moduleOrMenuName)
        {
            return await _menuMasterRepository.HasMenuAccessAsync(roleName, moduleOrMenuName);
        }

        private static MenuDto MapToDto(Menu menu)
        {
            return new MenuDto
            {
                Id = menu.Id,
                Name = menu.Name,
                DisplayName = menu.DisplayName,
                Route = menu.Route,
                Icon = menu.Icon,
                ParentId = menu.ParentId,
                Module = menu.Module,
                DisplayOrder = menu.DisplayOrder,
                IsActive = menu.IsActive,
                SubMenus = menu.SubMenus?.Select(MapToDto).ToList() ?? new List<MenuDto>()
            };
        }
    }
}
