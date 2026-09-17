using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HotelManagementSystem.Domain.Entities;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Infrastructure.Data;

namespace HotelManagementSystem.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return null;
            var trimmedEmail = email.Trim().ToLower();
            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == trimmedEmail);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            var trimmedEmail = email.Trim().ToLower();
            return await _context.Users.AnyAsync(u => u.Email.ToLower() == trimmedEmail);
        }

        public async Task<User> AddAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<List<User>> GetAllUsersAsync(string search = null)
        {
            var query = _context.Users.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower().Trim();
                query = query.Where(u => u.Name.ToLower().Contains(search) || u.Email.ToLower().Contains(search));
            }

            return await query
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> CountUsersAsync(string role = null)
        {
            if (string.IsNullOrWhiteSpace(role) || role == "All")
            {
                return await _context.Users.CountAsync();
            }
            var trimmedRole = role.ToLower().Trim();
            return await _context.Users.CountAsync(u => u.Role.ToLower() == trimmedRole);
        }

        public async Task<List<User>> GetRecentUsersAsync(int count = 5)
        {
            return await _context.Users
                .AsNoTracking()
                .OrderByDescending(u => u.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
