using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagementSystem.Domain.Entities
{
    public class Room
    {
        public int RoomId { get; set; }

        [Required(ErrorMessage = "Room number is required")]
        [Display(Name = "Room Number")]
        public string RoomNumber { get; set; }

        [Required(ErrorMessage = "Room type is required")]
        [Display(Name = "Room Type")]
        public string RoomType { get; set; }

        public string SubType { get; set; }

        [Required(ErrorMessage = "Price is required")]
        [Range(1, 100000, ErrorMessage = "Price must be positive")]
        public double Price { get; set; }

        [Required(ErrorMessage = "Capacity is required")]
        [Range(1, 10, ErrorMessage = "Capacity must be between 1 and 10")]
        public int Capacity { get; set; }

        [Required(ErrorMessage = "Status is required")]
        public string Status { get; set; }

        public string Description { get; set; }

        public string Images { get; set; }

        public string Facility1 { get; set; } = "High-Speed Wi-Fi 6";
        public string Facility2 { get; set; } = "55\" 4K Smart TV";
        public string Facility3 { get; set; } = "Climate Air Conditioning";
        public string Facility4 { get; set; } = "24/7 Room Service";
        public string Facility5 { get; set; } = "Valet & Monitored Parking";

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? DeletedAt { get; set; }
    }
}
