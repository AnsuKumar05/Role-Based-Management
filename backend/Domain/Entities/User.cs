using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagementSystem.Domain.Entities
{
    public class User
    {
        public int UserId { get; set; }

        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public string Phone { get; set; }

        public string Role { get; set; } = "User"; // User, Admin, Manager, Staff

        public bool IsActive { get; set; } = true;

        public string ResetToken { get; set; }

        public DateTime? ResetTokenExpiry { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
