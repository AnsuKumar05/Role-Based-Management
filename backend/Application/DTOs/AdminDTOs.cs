using System;
using System.Collections.Generic;

namespace HotelManagementSystem.Application.DTOs
{
    public class UpdateStatusRequest
    {
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
        public string PaymentMethod { get; set; }
    }

    public class UserUpdateRequest
    {
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class AdminDashboardStats
    {
        public int TotalRooms { get; set; }
        public int AvailableRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public int MaintenanceRooms { get; set; }
        public int TotalBookings { get; set; }
        public int PendingBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int TotalUsers { get; set; }
        public int DeletedRooms { get; set; }
    }

    public class AdminRecentBooking
    {
        public int BookingId { get; set; }
        public string GuestName { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public double TotalAmount { get; set; }
        public string BookingStatus { get; set; }
        public string RoomNumber { get; set; }
        public string RoomType { get; set; }
    }

    public class AdminRecentUser
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AdminDashboardResult
    {
        public AdminDashboardStats Stats { get; set; }
        public List<AdminRecentBooking> RecentBookings { get; set; }
        public List<AdminRecentUser> RecentUsers { get; set; }
    }

    public class AdminBookingResult
    {
        public int BookingId { get; set; }
        public string GuestName { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int NumberOfGuests { get; set; }
        public double TotalAmount { get; set; }
        public string BookingStatus { get; set; }
        public string Package { get; set; }
        public string PaymentStatus { get; set; }
        public string TransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string RoomNumber { get; set; }
        public string RoomType { get; set; }
        public string UserEmail { get; set; }
    }

    public class AdminUserResult
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateRolePermissionsRequest
    {
        public List<string> Permissions { get; set; } = new();
    }

    public class RolePermissionsMatrixResponse
    {
        public Dictionary<string, List<string>> Roles { get; set; } = new();
        public List<PermissionCategoryGroupDto> Permissions { get; set; } = new();
    }

    public class PermissionCategoryGroupDto
    {
        public string Category { get; set; } = string.Empty;
        public List<PermissionItemDto> Permissions { get; set; } = new();
    }

    public class PermissionItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
