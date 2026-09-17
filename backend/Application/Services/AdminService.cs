using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IRoomRepository _roomRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IUserRepository _userRepository;
        private readonly IBookingService _bookingService;
        private readonly IRoomService _roomService;
        private readonly IMemoryCache _cache;

        public AdminService(
            IRoomRepository roomRepository, 
            IBookingRepository bookingRepository, 
            IUserRepository userRepository, 
            IBookingService bookingService, 
            IRoomService roomService,
            IMemoryCache cache)
        {
            _roomRepository = roomRepository;
            _bookingRepository = bookingRepository;
            _userRepository = userRepository;
            _bookingService = bookingService;
            _roomService = roomService;
            _cache = cache;
        }

        public async Task<AdminDashboardResult> GetDashboardAsync()
        {
            const string cacheKey = "admin_dashboard_summary";
            if (_cache.TryGetValue(cacheKey, out AdminDashboardResult cached))
            {
                return cached;
            }

            var totalRooms = await _roomRepository.CountRoomsAsync(isDeleted: false);
            var availableRooms = await _roomRepository.CountRoomsAsync(isDeleted: false, status: "Available");
            var occupiedRooms = await _roomRepository.CountRoomsAsync(isDeleted: false, status: "Occupied");
            var maintenanceRooms = await _roomRepository.CountRoomsAsync(isDeleted: false, status: "Maintenance");

            var totalBookings = await _bookingRepository.CountBookingsAsync();
            var pendingBookings = await _bookingRepository.CountBookingsAsync("Pending");
            var confirmedBookings = await _bookingRepository.CountBookingsAsync("Confirmed");

            var totalUsers = await _userRepository.CountUsersAsync();
            var deletedRooms = await _roomRepository.CountRoomsAsync(isDeleted: true);

            var recentBookingsRaw = await _bookingRepository.GetRecentBookingsAsync(5);
            var recentBookings = recentBookingsRaw.Select(b => new AdminRecentBooking
            {
                BookingId = b.BookingId,
                GuestName = b.GuestName,
                CheckIn = b.CheckIn,
                CheckOut = b.CheckOut,
                TotalAmount = b.TotalAmount,
                BookingStatus = b.BookingStatus,
                RoomNumber = b.Room != null ? b.Room.RoomNumber : "N/A",
                RoomType = b.Room != null ? b.Room.RoomType : "N/A"
            }).ToList();

            var recentUsersRaw = await _userRepository.GetRecentUsersAsync(5);
            var recentUsers = recentUsersRaw.Select(u => new AdminRecentUser
            {
                UserId = u.UserId,
                Name = u.Name,
                Email = u.Email,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            }).ToList();

            var result = new AdminDashboardResult
            {
                Stats = new AdminDashboardStats
                {
                    TotalRooms = totalRooms,
                    AvailableRooms = availableRooms,
                    OccupiedRooms = occupiedRooms,
                    MaintenanceRooms = maintenanceRooms,
                    TotalBookings = totalBookings,
                    PendingBookings = pendingBookings,
                    ConfirmedBookings = confirmedBookings,
                    TotalUsers = totalUsers,
                    DeletedRooms = deletedRooms
                },
                RecentBookings = recentBookings,
                RecentUsers = recentUsers
            };

            _cache.Set(cacheKey, result, TimeSpan.FromSeconds(30));
            return result;
        }

        public async Task<List<AdminBookingResult>> GetBookingsAsync(string query = null, string status = null)
        {
            var bookings = await _bookingRepository.GetAllBookingsAsync(query, status);
            return bookings.Select(b => new AdminBookingResult
            {
                BookingId = b.BookingId,
                GuestName = b.GuestName,
                CheckIn = b.CheckIn,
                CheckOut = b.CheckOut,
                NumberOfGuests = b.NumberOfGuests,
                TotalAmount = b.TotalAmount,
                BookingStatus = b.BookingStatus,
                Package = b.Package,
                PaymentStatus = b.PaymentStatus,
                TransactionId = b.TransactionId,
                CreatedAt = b.CreatedAt,
                RoomNumber = b.Room != null ? b.Room.RoomNumber : "N/A",
                RoomType = b.Room != null ? b.Room.RoomType : "N/A",
                UserEmail = b.User != null ? b.User.Email : "N/A"
            }).ToList();
        }

        public async Task<List<Booking>> GetAllBookingsForExportAsync()
        {
            return await _bookingRepository.GetAllBookingsAsync();
        }

        public async Task<bool> UpdateBookingStatusAsync(int id, string status, string paymentStatus, string paymentMethod = null)
        {
            var booking = await _bookingRepository.GetByIdWithDetailsAsync(id);
            if (booking == null)
            {
                return false;
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                booking.BookingStatus = status;
            }

            if (!string.IsNullOrWhiteSpace(paymentStatus))
            {
                booking.PaymentStatus = paymentStatus;
            }

            if (!string.IsNullOrWhiteSpace(paymentMethod))
            {
                booking.TransactionId = paymentMethod;
            }

            if (booking.BookingStatus == "Cancelled" && (string.IsNullOrWhiteSpace(paymentStatus) || paymentStatus == "Pending"))
            {
                booking.PaymentStatus = "Refunded";
            }
            else if (booking.PaymentStatus == "Refunded" && booking.BookingStatus != "CheckedOut")
            {
                booking.BookingStatus = "Cancelled";
            }

            booking.UpdatedAt = DateTime.UtcNow;
            await _bookingRepository.UpdateAsync(booking);

            if (booking.Room != null)
            {
                if (booking.BookingStatus == "Cancelled" || booking.BookingStatus == "CheckedOut" || booking.PaymentStatus == "Refunded")
                {
                    bool hasOtherActive = await _bookingRepository.HasActiveBookingsForRoomAsync(booking.RoomId, id);
                    booking.Room.Status = hasOtherActive ? "Occupied" : "Available";
                    await _roomRepository.UpdateAsync(booking.Room);
                }
                else if (booking.BookingStatus == "CheckedIn" || booking.BookingStatus == "Confirmed" || booking.PaymentStatus == "Paid")
                {
                    booking.Room.Status = "Occupied";
                    await _roomRepository.UpdateAsync(booking.Room);
                }
            }

            _roomService.InvalidateCache();
            _cache.Remove("admin_dashboard_summary");
            _cache.Remove("admin_reports_summary");
            return true;
        }

        public async Task<List<AdminUserResult>> GetUsersAsync(string search = null)
        {
            var users = await _userRepository.GetAllUsersAsync(search);
            return users.Select(u => new AdminUserResult
            {
                UserId = u.UserId,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                Phone = u.Phone,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            }).ToList();
        }

        public async Task<AdminUserResult> UpdateUserAsync(int id, UserUpdateRequest request, int currentUserId)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                user.Name = request.Name.Trim();
            }

            if (request.Phone != null)
            {
                user.Phone = request.Phone.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                if (currentUserId == id && request.Role != "Admin")
                {
                    throw new Exception("You cannot demote your own administrative account role.");
                }
                user.Role = request.Role.Trim();
            }

            if (request.IsActive.HasValue)
            {
                if (currentUserId == id && !request.IsActive.Value)
                {
                    throw new Exception("You cannot deactivate your own administrative account.");
                }
                user.IsActive = request.IsActive.Value;
            }

            await _userRepository.UpdateAsync(user);
            _cache.Remove("admin_dashboard_summary");

            return new AdminUserResult
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                Phone = user.Phone,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<bool> ActivateUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return false;
            }

            user.IsActive = true;
            await _userRepository.UpdateAsync(user);
            _cache.Remove("admin_dashboard_summary");
            return true;
        }

        public async Task<bool> DeactivateUserAsync(int id, int currentUserId)
        {
            if (currentUserId == id)
            {
                throw new Exception("You cannot deactivate your own administrative account.");
            }

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return false;
            }

            user.IsActive = false;
            await _userRepository.UpdateAsync(user);
            _cache.Remove("admin_dashboard_summary");
            return true;
        }
    }
}
