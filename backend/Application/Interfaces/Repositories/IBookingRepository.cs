using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces.Repositories
{
    public interface IBookingRepository
    {
        Task<Booking> GetByIdAsync(int id);
        Task<Booking> GetByIdWithDetailsAsync(int id);
        Task<List<Booking>> GetUserBookingsAsync(int userId);
        Task<List<Booking>> GetAllBookingsAsync(string query = null, string status = null);
        Task<List<Booking>> GetRecentBookingsAsync(int count = 5);
        Task<bool> HasOverlappingBookingsAsync(int roomId, DateTime checkIn, DateTime checkOut, int? ignoreBookingId = null);
        Task<bool> HasActiveBookingsForRoomAsync(int roomId, int? excludeBookingId = null);
        Task<bool> HasBookingStartingTodayAsync(int roomId, int excludeBookingId);
        Task<bool> TransactionIdExistsAsync(string transactionId, int excludeBookingId);
        Task<int> CountBookingsAsync(string status = null);
        Task<Booking> AddAsync(Booking booking);
        Task UpdateAsync(Booking booking);
        Task<IDbContextTransaction> BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.Serializable);
        Task SaveChangesAsync();
    }
}
