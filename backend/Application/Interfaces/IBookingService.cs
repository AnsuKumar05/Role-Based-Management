using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;
using HotelManagementSystem.Application.DTOs;

namespace HotelManagementSystem.Application.Interfaces
{
    public interface IBookingService
    {
        Task<PriceCalculationResult> CalculatePriceAsync(int roomId, DateTime checkIn, DateTime checkOut, int numberOfGuests, string package);
        Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkIn, DateTime checkOut, int? ignoreBookingId = null);
        Task<Booking> CreateBookingAsync(Booking booking);
        Task<List<Booking>> GetUserBookingsAsync(int userId);
        Task<Booking> GetByIdAsync(int id);
        Task<bool> CancelBookingAsync(int bookingId, int userId, bool isAdmin = false);
        Task<Booking> ProcessPaymentAsync(int bookingId, int userId, string paymentMethod = "QR");
        Task<string> GetInvoiceHtmlAsync(int bookingId, int userId, bool isAdmin);
        Task<List<Booking>> AdminGetAllBookingsAsync(string queryStr = null, string status = null);
        Task<bool> AdminUpdateStatusAsync(int bookingId, string status);
        Task<Booking> UpdatePaymentStatusAsync(int bookingId, string paymentStatus, string bookingStatus, string transactionId);
    }
}
