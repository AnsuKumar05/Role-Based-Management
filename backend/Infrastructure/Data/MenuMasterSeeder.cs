using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Infrastructure.Data
{
    public static class MenuMasterSeeder
    {
        public static void Seed(ApplicationDbContext dbContext, ILogger logger, string seedDataDir = null)
        {
            if (dbContext.Menus.Any())
            {
                return;
            }

            var defaultMenus = new List<Menu>
            {
                new() { Name = "Dashboard", DisplayName = "Executive Dashboard", Route = "/admin#dashboard", Icon = "chart-line", Module = "Dashboard", DisplayOrder = 1, IsActive = true },
                new() { Name = "Rooms", DisplayName = "Rooms & Suites", Route = "/admin#rooms", Icon = "bed", Module = "RoomManagement", DisplayOrder = 2, IsActive = true },
                new() { Name = "Bookings", DisplayName = "Reservations & Bookings", Route = "/admin#bookings", Icon = "calendar-check", Module = "BookingManagement", DisplayOrder = 3, IsActive = true },
                new() { Name = "Users", DisplayName = "User Management", Route = "/admin#users", Icon = "users", Module = "UserManagement", DisplayOrder = 4, IsActive = true },
                new() { Name = "Food", DisplayName = "Gastronomy & Dining", Route = "/admin#food", Icon = "utensils", Module = "Gastronomy", DisplayOrder = 5, IsActive = true },
                new() { Name = "Permissions", DisplayName = "Role & Permission Matrix", Route = "/admin#permissions", Icon = "shield-alt", Module = "RolePermissions", DisplayOrder = 6, IsActive = true },
                new() { Name = "MenuMaster", DisplayName = "Menu Master Configuration", Route = "/admin#menu-master", Icon = "sitemap", Module = "MenuMaster", DisplayOrder = 7, IsActive = true }
            };

            dbContext.Menus.AddRange(defaultMenus);
            dbContext.SaveChanges();

            // Setup default role menus for Admin role
            var adminRole = dbContext.Roles.FirstOrDefault(r => r.Name == "Admin");
            if (adminRole != null)
            {
                foreach (var menu in defaultMenus)
                {
                    dbContext.RoleMenus.Add(new RoleMenu
                    {
                        RoleId = adminRole.RoleId,
                        MenuId = menu.Id,
                        CanView = true
                    });
                }
                dbContext.SaveChanges();
            }
        }
    }
}
