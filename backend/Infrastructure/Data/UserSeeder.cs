using System;
using System.Linq;
using Microsoft.Extensions.Logging;
using HotelManagementSystem.Domain.Constants;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Infrastructure.Data
{
    public static class UserSeeder
    {
        public static void Seed(ApplicationDbContext dbContext, ILogger logger, string seedDataDir = null)
        {
            void SeedUserIfNotExists(string name, string email, string password, string role, string phone)
            {
                var user = dbContext.Users.FirstOrDefault(u => u.Email.ToLower() == email.ToLower());
                if (user == null)
                {
                    user = new User
                    {
                        Name = name,
                        Email = email,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                        Role = role,
                        Phone = phone,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    dbContext.Users.Add(user);
                    dbContext.SaveChanges();
                    logger.LogInformation("{Email} ({Role}) seeded successfully.", email, role);
                }
                else
                {
                    user.Name = name;
                    user.Role = role;
                    user.Phone = phone;
                    user.IsActive = true;
                    dbContext.SaveChanges();
                }
            }

            // Seed default administrator and manager accounts if not present
            SeedUserIfNotExists("System Administrator", "admin@example.com", "Admin@123", AppRoles.Admin, "8124337117");
            SeedUserIfNotExists("Operations Manager", "manager@example.com", "Manager@123", AppRoles.Manager, "8124337118");
            SeedUserIfNotExists("Front Desk Staff", "staff@example.com", "Staff@123", AppRoles.Staff, "8124337119");
            SeedUserIfNotExists("Ansu Kumar", "ansukumar5207@gmail.com", "Admin@123", AppRoles.User, "8124337117");
        }
    }
}
