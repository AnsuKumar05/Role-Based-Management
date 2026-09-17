using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using HotelManagementSystem.Domain.Constants;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Infrastructure.Data
{
    public static class RolePermissionSeeder
    {
        public static void Seed(ApplicationDbContext dbContext, ILogger logger, string seedDataDir = null)
        {
            // Seed core roles if not already present
            var defaultRoles = new List<(string Name, string Description)>
            {
                (AppRoles.Admin, "Full system access, role management, user administration, and financial reports"),
                (AppRoles.Manager, "Daily hotel operations, staff supervision, pricing control, and reports"),
                (AppRoles.Staff, "Front desk reservations, check-ins, guest services, and housekeeping status"),
                (AppRoles.User, "Registered hotel guests, room browsing, and personal bookings")
            };

            foreach (var r in defaultRoles)
            {
                if (!dbContext.Roles.Any(x => x.Name.ToLower() == r.Name.ToLower()))
                {
                    dbContext.Roles.Add(new Role
                    {
                        Name = r.Name,
                        Description = r.Description,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            dbContext.SaveChanges();

            // Seed basic permissions if none exist
            if (!dbContext.Permissions.Any())
            {
                var corePermissions = new List<(string Name, string Category, string Description)>
                {
                    ("Dashboard.View", "Dashboard", "View analytical dashboard"),
                    ("Room.View", "Room Management", "View active room inventory"),
                    ("Room.Create", "Room Management", "Add new room to inventory"),
                    ("Room.Update", "Room Management", "Edit room details and pricing"),
                    ("Room.Delete", "Room Management", "Remove room from active inventory"),
                    ("Room.Restore", "Room Management", "Restore deleted rooms"),
                    ("Booking.View", "Booking Management", "View all guest reservations"),
                    ("Booking.Create", "Booking Management", "Create new reservation"),
                    ("Booking.Cancel", "Booking Management", "Cancel reservations"),
                    ("User.View", "User Management", "View registered users"),
                    ("User.Create", "User Management", "Create staff or manager accounts"),
                    ("User.Update", "User Management", "Edit user profiles"),
                    ("Role.View", "Role & Permissions", "View roles and granted permissions"),
                    ("Role.Manage", "Role & Permissions", "Modify role permission matrix"),
                    ("MenuMaster.View", "Menu Master", "View system menu hierarchy"),
                    ("MenuMaster.Manage", "Menu Master", "Configure menu access and routes"),
                    ("Reports.View", "Reports", "Access financial and occupancy reports"),
                    ("Food.View", "Gastronomy", "View gastronomy catalog"),
                    ("Food.Manage", "Gastronomy", "Add or edit menu dishes")
                };

                foreach (var p in corePermissions)
                {
                    dbContext.Permissions.Add(new Permission
                    {
                        Name = p.Name,
                        Category = p.Category,
                        Description = p.Description
                    });
                }
                dbContext.SaveChanges();

                // Grant all permissions to Admin role
                var adminRole = dbContext.Roles.FirstOrDefault(r => r.Name == AppRoles.Admin);
                if (adminRole != null)
                {
                    var allPerms = dbContext.Permissions.ToList();
                    foreach (var perm in allPerms)
                    {
                        dbContext.RolePermissions.Add(new RolePermission
                        {
                            RoleId = adminRole.RoleId,
                            PermissionId = perm.PermissionId
                        });
                    }
                    dbContext.SaveChanges();
                }
            }
        }
    }
}
