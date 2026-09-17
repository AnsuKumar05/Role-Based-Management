using System;
using Microsoft.Extensions.Logging;

namespace HotelManagementSystem.Infrastructure.Data
{
    public static class MenuSeeder
    {
        // Gastronomy food catalog is maintained and displayed directly in React, and stored in the database via /api/menu/sync
        public static void Seed(ApplicationDbContext dbContext, ILogger logger, string seedDataDir = null)
        {
            // Backend no longer hardcodes dishes or reads external JSON files.
            // React displays the food menu and stores/syncs it to the database via API.
        }
    }
}
