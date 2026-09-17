using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;
using HotelManagementSystem.Application.DTOs;

namespace HotelManagementSystem.Application.Interfaces
{
    public interface IAdminService
    {
        Task<AdminDashboardResult> GetDashboardAsync();
        Task<List<AdminBookingResult>> GetBookingsAsync(string query = null, string status = null);
        Task<List<Booking>> GetAllBookingsForExportAsync();
        Task<bool> UpdateBookingStatusAsync(int id, string status, string paymentStatus, string paymentMethod = null);
        Task<List<AdminUserResult>> GetUsersAsync(string search = null);
        Task<AdminUserResult> UpdateUserAsync(int id, UserUpdateRequest request, int currentUserId);
        Task<bool> ActivateUserAsync(int id);
        Task<bool> DeactivateUserAsync(int id, int currentUserId);
    }
}
