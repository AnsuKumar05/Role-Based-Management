using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using HotelManagementSystem.Application.Interfaces;

namespace HotelManagementSystem.Controllers
{
    [ApiController]
    [Route("api/menu")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;
        private readonly ILogger<MenuController> _logger;

        public MenuController(IMenuService menuService, ILogger<MenuController> logger)
        {
            _menuService = menuService;
            _logger = logger;
        }

        // GET /api/menu
        [HttpGet]
        public async Task<IActionResult> GetMenu([FromQuery] string category = null)
        {
            try
            {
                var items = await _menuService.GetMenuAsync(category);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve menu for category {Category}", category);
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/menu/sync - Stores / syncs menu items directly from React into PostgreSQL
        [HttpPost("sync")]
        public async Task<IActionResult> SyncMenu(
            [FromBody] System.Collections.Generic.List<MenuSyncItemDto> items,
            [FromServices] HotelManagementSystem.Infrastructure.Data.ApplicationDbContext dbContext)
        {
            if (items == null || items.Count == 0)
            {
                return BadRequest(new { message = "No menu items provided for synchronization." });
            }

            try
            {
                int addedCount = 0;
                int updatedCount = 0;

                foreach (var item in items)
                {
                    if (string.IsNullOrWhiteSpace(item.Name)) continue;

                    var trimmedName = item.Name.Trim();
                    var existing = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
                        dbContext.MenuItems, m => m.Name.ToLower() == trimmedName.ToLower());

                    var diet = !string.IsNullOrWhiteSpace(item.DietType) ? item.DietType : (!string.IsNullOrWhiteSpace(item.Diet) ? item.Diet : "Veg");
                    var desc = !string.IsNullOrWhiteSpace(item.Description) ? item.Description : (!string.IsNullOrWhiteSpace(item.Desc) ? item.Desc : "");
                    var img = !string.IsNullOrWhiteSpace(item.ImageUrl) ? item.ImageUrl : (!string.IsNullOrWhiteSpace(item.Image) ? item.Image : "");

                    if (existing == null)
                    {
                        dbContext.MenuItems.Add(new HotelManagementSystem.Domain.Entities.MenuItem
                        {
                            Name = trimmedName,
                            Category = string.IsNullOrWhiteSpace(item.Category) ? "Vegetarian" : item.Category.Trim(),
                            Price = item.Price,
                            DietType = diet,
                            Tag = item.Tag?.Trim(),
                            Description = desc,
                            ImageUrl = img,
                            IsDeleted = false,
                            CreatedAt = DateTime.UtcNow
                        });
                        addedCount++;
                    }
                    else
                    {
                        existing.Category = string.IsNullOrWhiteSpace(item.Category) ? existing.Category : item.Category.Trim();
                        existing.Price = item.Price > 0 ? item.Price : existing.Price;
                        existing.DietType = diet;
                        existing.Tag = item.Tag?.Trim() ?? existing.Tag;
                        existing.Description = desc;
                        existing.ImageUrl = img;
                        existing.IsDeleted = false;
                        updatedCount++;
                    }
                }

                await dbContext.SaveChangesAsync();
                _menuService.InvalidateCache();

                _logger.LogInformation("Menu sync completed from React: {Added} added, {Updated} updated.", addedCount, updatedCount);
                var total = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(dbContext.MenuItems);

                return Ok(new
                {
                    message = "Gastronomy menu catalog stored in database successfully.",
                    added = addedCount,
                    updated = updatedCount,
                    totalCount = total
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to synchronize menu items from React.");
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class MenuSyncItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public double Price { get; set; }
        public string Diet { get; set; }
        public string DietType { get; set; }
        public string Tag { get; set; }
        public string Desc { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }
        public string ImageUrl { get; set; }
    }
}
