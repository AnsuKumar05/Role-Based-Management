using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;
using HotelManagementSystem.Application.DTOs;

namespace HotelManagementSystem.Application.Interfaces
{
    public interface IMenuService
    {
        Task<List<MenuItem>> GetMenuAsync(string category = null);
        Task<List<MenuItem>> GetAdminMenuAsync();
        Task<List<MenuItem>> GetDeletedMenuAsync();
        Task<MenuItem> AddMenuItemAsync(MenuItemCreateDto dto);
        Task<MenuItem> UpdateMenuItemAsync(int id, MenuItemCreateDto dto);
        Task<bool> DeleteMenuItemAsync(int id);
        Task<MenuItem> RestoreMenuItemAsync(int id);
        void InvalidateCache();
    }
}
