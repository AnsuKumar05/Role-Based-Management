using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagementSystem.Domain.Entities
{
    public class Feedback
    {
        public int Id { get; set; }

        public int? UserId { get; set; }

        public string GuestName { get; set; }

        public string GuestEmail { get; set; }

        public int RoomRating { get; set; } = 5;

        public int FoodRating { get; set; } = 5;

        public int FacilitiesRating { get; set; } = 5;

        public int ServiceRating { get; set; } = 5;

        public double AverageRating { get; set; } = 5.0;

        public string Comments { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
