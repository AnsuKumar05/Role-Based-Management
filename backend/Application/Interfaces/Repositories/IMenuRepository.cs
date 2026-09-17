using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces.Repositories
{
    public interface IMenuRepository
    {
        Task<List<MenuItem>> GetActiveMenuItemsAsync(string category = null);
        Task<List<MenuItem>> GetAllMenuItemsAsync();
        Task<List<MenuItem>> GetDeletedMenuItemsAsync();
        Task<MenuItem> GetByIdAsync(int id);
        Task<MenuItem> AddAsync(MenuItem item);
        Task UpdateAsync(MenuItem item);
        Task SaveChangesAsync();
    }
}
