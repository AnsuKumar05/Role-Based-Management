using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(int id);
        Task<User> GetByEmailAsync(string email);
        Task<bool> EmailExistsAsync(string email);
        Task<User> AddAsync(User user);
        Task UpdateAsync(User user);
        Task<List<User>> GetAllUsersAsync(string search = null);
        Task<int> CountUsersAsync(string role = "User");
        Task<List<User>> GetRecentUsersAsync(int count = 5);
        Task SaveChangesAsync();
    }
}
