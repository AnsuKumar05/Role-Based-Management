using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HotelManagementSystem.Domain.Entities;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Infrastructure.Data;

namespace HotelManagementSystem.Infrastructure.Repositories
{
    public class MenuRepository : IMenuRepository
    {
        private readonly ApplicationDbContext _context;

        public MenuRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<MenuItem>> GetActiveMenuItemsAsync(string category = null)
        {
            var query = _context.MenuItems
                .AsNoTracking()
                .Where(m => !m.IsDeleted);

            if (!string.IsNullOrWhiteSpace(category) && category != "All")
            {
                query = query.Where(m => m.Category == category);
            }

            return await query.OrderBy(m => m.Name).ToListAsync();
        }

        public async Task<List<MenuItem>> GetAllMenuItemsAsync()
        {
            return await _context.MenuItems
                .AsNoTracking()
                .OrderBy(m => m.Name)
                .ToListAsync();
        }

        public async Task<List<MenuItem>> GetDeletedMenuItemsAsync()
        {
            return await _context.MenuItems
                .AsNoTracking()
                .Where(m => m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<MenuItem> GetByIdAsync(int id)
        {
            return await _context.MenuItems.FindAsync(id);
        }

        public async Task<MenuItem> AddAsync(MenuItem item)
        {
            _context.MenuItems.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task UpdateAsync(MenuItem item)
        {
            _context.MenuItems.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
