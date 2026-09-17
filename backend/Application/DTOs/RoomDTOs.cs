using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagementSystem.Application.DTOs
{
    public class RoomCreateDto
    {
        [Required(ErrorMessage = "Room number is required")]
        public string RoomNumber { get; set; }

        [Required(ErrorMessage = "Room type is required")]
        public string RoomType { get; set; }

        public string SubType { get; set; }

        [Range(1, 100000, ErrorMessage = "Price must be greater than zero")]
        public double Price { get; set; }

        [Range(1, 10, ErrorMessage = "Capacity must be between 1 and 10")]
        public int Capacity { get; set; }

        public string Status { get; set; } = "Available";
        public string Images { get; set; }
        public string Facility1 { get; set; }
        public string Facility2 { get; set; }
        public string Facility3 { get; set; }
        public string Facility4 { get; set; }
        public string Facility5 { get; set; }
        public string Description { get; set; }
    }

    public class RoomUpdateDto : RoomCreateDto
    {
        public int RoomId { get; set; }
    }

    public class RoomFilterDto
    {
        public string RoomNumber { get; set; }
        public string RoomType { get; set; }
        public string Status { get; set; }
        public double? MinPrice { get; set; }
        public double? MaxPrice { get; set; }
        public int? Capacity { get; set; }
    }

    public class RoomResponseDto
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; }
        public string RoomType { get; set; }
        public string SubType { get; set; }
        public double Price { get; set; }
        public int Capacity { get; set; }
        public string Status { get; set; }
        public string Images { get; set; }
        public string Facility1 { get; set; }
        public string Facility2 { get; set; }
        public string Facility3 { get; set; }
        public string Facility4 { get; set; }
        public string Facility5 { get; set; }
        public string Description { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
