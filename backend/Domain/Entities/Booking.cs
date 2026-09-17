using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagementSystem.Domain.Entities
{
    public class Booking
    {
        public int BookingId { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int RoomId { get; set; }
        public Room Room { get; set; }

        [Required(ErrorMessage = "Guest name is required")]
        [Display(Name = "Guest Name")]
        public string GuestName { get; set; }

        [Required(ErrorMessage = "Check-in date is required")]
        [Display(Name = "Check-In Date")]
        public DateTime CheckIn { get; set; }

        [Required(ErrorMessage = "Check-out date is required")]
        [Display(Name = "Check-Out Date")]
        public DateTime CheckOut { get; set; }

        [Required(ErrorMessage = "Number of guests is required")]
        [Range(1, 10, ErrorMessage = "Number of guests must be between 1 and 10")]
        [Display(Name = "Number of Guests")]
        public int NumberOfGuests { get; set; }

        [Display(Name = "Total Amount")]
        public double TotalAmount { get; set; }

        public string BookingStatus { get; set; } = "Pending";

        public string Package { get; set; } = "Stay";

        public string PaymentStatus { get; set; } = "Pending";

        public string TransactionId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
