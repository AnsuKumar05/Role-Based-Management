using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagementSystem.Application.DTOs
{
    public class MenuItemDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Dish name is required")]
        public string Name { get; set; }

        public string Category { get; set; } = "Vegetarian";
        [Range(1, 100000, ErrorMessage = "Price must be greater than zero")]
        public double Price { get; set; }

        public string DietType { get; set; }
        public string Tag { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MenuItemCreateDto
    {
        [Required(ErrorMessage = "Dish name is required")]
        public string Name { get; set; }

        public string Category { get; set; } = "Vegetarian";

        [Range(1, 100000, ErrorMessage = "Price must be greater than zero")]
        public double Price { get; set; }

        public string DietType { get; set; }
        public string Tag { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
    }
}
