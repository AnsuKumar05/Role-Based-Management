using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagementSystem.Application.DTOs
{
    public class BookingRequest
    {
        [Required]
        public int RoomId { get; set; }

        [Required(ErrorMessage = "Guest name is required")]
        public string GuestName { get; set; }

        public string Phone { get; set; }

        [Required]
        public DateTime CheckIn { get; set; }

        [Required]
        public DateTime CheckOut { get; set; }

        [Range(1, 10, ErrorMessage = "Number of guests must be between 1 and 10")]
        public int NumberOfGuests { get; set; }

        public string Package { get; set; }
    }

    public class PriceCalculationRequest
    {
        [Required]
        public int RoomId { get; set; }

        [Required]
        public DateTime CheckIn { get; set; }

        [Required]
        public DateTime CheckOut { get; set; }

        public int NumberOfGuests { get; set; }
        public string Package { get; set; }
    }

    public class PriceCalculationResult
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; }
        public string RoomType { get; set; }
        public double PricePerNight { get; set; }
        public int Nights { get; set; }
        public int Guests { get; set; }
        public string Package { get; set; }
        public string PackageName { get; set; }
        public double PackageRatePerNightPerGuest { get; set; }
        public double RoomSubtotal { get; set; }
        public double FoodSubtotal { get; set; }
        public double PoolSubtotal { get; set; }
        public double TravelSubtotal { get; set; }
        public double PackageSubtotal { get; set; }
        public double GrandTotal { get; set; }
    }

    public class PaymentRequest
    {
        public string PaymentMethod { get; set; } = "QR"; // "QR" | "UPI"
    }

    public class BookingResponseDto
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public string GuestName { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int NumberOfGuests { get; set; }
        public double TotalAmount { get; set; }
        public string BookingStatus { get; set; }
        public string PaymentStatus { get; set; }
        public string Package { get; set; }
        public string TransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string RoomNumber { get; set; }
        public string RoomType { get; set; }
    }
}
