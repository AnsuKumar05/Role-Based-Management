using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(User user, string password);
        Task<User> AuthenticateAsync(string email, string password);
        Task<User> GetByIdAsync(int userId);
        Task<(string resetCode, string userName)> GenerateResetTokenAsync(string email);
        Task<bool> VerifyResetTokenAsync(string email, string token);
        Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    }
}
