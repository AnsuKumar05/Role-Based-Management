using System;
using Microsoft.Extensions.Logging;

namespace HotelManagementSystem.Infrastructure.Data
{
    public static class RoomSeeder
    {
        // Rooms catalog is maintained and displayed directly in React, and stored in the database via /api/rooms/sync
        public static void Seed(ApplicationDbContext dbContext, ILogger logger, string seedDataDir = null)
        {
            // Backend no longer hardcodes rooms or reads external JSON files.
            // React displays the room catalog and stores/syncs it to the database via API.
        }
    }
}
