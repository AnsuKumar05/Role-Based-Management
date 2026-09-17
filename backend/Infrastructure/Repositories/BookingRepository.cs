using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using HotelManagementSystem.Domain.Entities;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Infrastructure.Data;

namespace HotelManagementSystem.Infrastructure.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ApplicationDbContext _context;

        public BookingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Booking> GetByIdAsync(int id)
        {
            return await _context.Bookings.FindAsync(id);
        }

        public async Task<Booking> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.BookingId == id);
        }

        public async Task<List<Booking>> GetUserBookingsAsync(int userId)
        {
            return await _context.Bookings
                .AsNoTracking()
                .Include(b => b.Room)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetAllBookingsAsync(string query = null, string status = null)
        {
            var queryable = _context.Bookings
                .AsNoTracking()
                .Include(b => b.Room)
                .Include(b => b.User)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query))
            {
                var q = query.ToLower().Trim();
                queryable = queryable.Where(b => 
                    b.GuestName.ToLower().Contains(q) || 
                    b.BookingId.ToString() == q ||
                    (b.Room != null && b.Room.RoomNumber.Contains(q)) ||
                    (b.User != null && b.User.Email.ToLower().Contains(q))
                );
            }

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
            {
                queryable = queryable.Where(b => b.BookingStatus == status);
            }

            return await queryable
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetRecentBookingsAsync(int count = 5)
        {
            return await _context.Bookings
                .AsNoTracking()
                .Include(b => b.Room)
                .Include(b => b.User)
                .OrderByDescending(b => b.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<bool> HasOverlappingBookingsAsync(int roomId, DateTime checkIn, DateTime checkOut, int? ignoreBookingId = null)
        {
            var query = _context.Bookings
                .Where(b => b.RoomId == roomId && b.BookingStatus != "Cancelled");

            if (ignoreBookingId.HasValue)
            {
                query = query.Where(b => b.BookingId != ignoreBookingId.Value);
            }

            return await query.AnyAsync(b => checkIn < b.CheckOut && checkOut > b.CheckIn);
        }

        public async Task<bool> HasActiveBookingsForRoomAsync(int roomId, int? excludeBookingId = null)
        {
            var query = _context.Bookings.Where(b => b.RoomId == roomId && 
                b.BookingStatus != "Cancelled" && 
                b.BookingStatus != "CheckedOut" &&
                b.PaymentStatus != "Refunded" &&
                (b.BookingStatus == "CheckedIn" || (b.BookingStatus == "Confirmed" && b.CheckIn.Date <= DateTime.Today && b.CheckOut.Date > DateTime.Today)));

            if (excludeBookingId.HasValue)
            {
                query = query.Where(b => b.BookingId != excludeBookingId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> HasBookingStartingTodayAsync(int roomId, int excludeBookingId)
        {
            return await _context.Bookings.AnyAsync(b => 
                b.RoomId == roomId && 
                b.BookingId != excludeBookingId &&
                b.BookingStatus != "Cancelled" &&
                b.BookingStatus != "CheckedOut" &&
                b.PaymentStatus != "Refunded" &&
                (b.BookingStatus == "Confirmed" || b.BookingStatus == "CheckedIn") &&
                b.CheckIn.Date <= DateTime.Today &&
                b.CheckOut.Date > DateTime.Today);
        }

        public async Task<bool> TransactionIdExistsAsync(string transactionId, int excludeBookingId)
        {
            if (string.IsNullOrWhiteSpace(transactionId)) return false;
            return await _context.Bookings.AnyAsync(b => b.TransactionId == transactionId && b.BookingId != excludeBookingId);
        }

        public async Task<int> CountBookingsAsync(string status = null)
        {
            var query = _context.Bookings.AsQueryable();
            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(b => b.BookingStatus == status);
            }
            return await query.CountAsync();
        }

        public async Task<Booking> AddAsync(Booking booking)
        {
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task UpdateAsync(Booking booking)
        {
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.Serializable)
        {
            return await _context.Database.BeginTransactionAsync(isolationLevel);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
