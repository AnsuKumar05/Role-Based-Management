using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagementSystem.Application.DTOs
{
    public class CreateFeedbackDto
    {
        [Range(1, 5, ErrorMessage = "Room rating must be between 1 and 5")]
        public int RoomRating { get; set; } = 5;

        [Range(1, 5, ErrorMessage = "Food rating must be between 1 and 5")]
        public int FoodRating { get; set; } = 5;

        [Range(1, 5, ErrorMessage = "Facilities rating must be between 1 and 5")]
        public int FacilitiesRating { get; set; } = 5;

        [Range(1, 5, ErrorMessage = "Service rating must be between 1 and 5")]
        public int ServiceRating { get; set; } = 5;

        public string Comments { get; set; }
    }

    public class FeedbackResponseDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string GuestName { get; set; }
        public string GuestEmail { get; set; }
        public int RoomRating { get; set; }
        public int FoodRating { get; set; }
        public int FacilitiesRating { get; set; }
        public int ServiceRating { get; set; }
        public double AverageRating { get; set; }
        public string Comments { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
