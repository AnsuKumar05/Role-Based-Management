using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Constants;

namespace HotelManagementSystem.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IRoomService _roomService;
        private readonly IMenuService _menuService;
        private readonly IPermissionRepository _permissionRepository;
        private readonly IMemoryCache _cache;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IAdminService adminService, 
            IRoomService roomService, 
            IMenuService menuService,
            IPermissionRepository permissionRepository,
            IMemoryCache cache,
            ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _roomService = roomService;
            _menuService = menuService;
            _permissionRepository = permissionRepository;
            _cache = cache;
            _logger = logger;
        }

        // GET /api/admin/dashboard
        [HttpGet("dashboard")]
        [Authorize(Policy = AppPermissions.DashboardRead)]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var dashboard = await _adminService.GetDashboardAsync();
                return Ok(new
                {
                    stats = new
                    {
                        totalRooms = dashboard.Stats.TotalRooms,
                        availableRooms = dashboard.Stats.AvailableRooms,
                        occupiedRooms = dashboard.Stats.OccupiedRooms,
                        maintenanceRooms = dashboard.Stats.MaintenanceRooms,
                        totalBookings = dashboard.Stats.TotalBookings,
                        pendingBookings = dashboard.Stats.PendingBookings,
                        confirmedBookings = dashboard.Stats.ConfirmedBookings,
                        totalUsers = dashboard.Stats.TotalUsers,
                        deletedRooms = dashboard.Stats.DeletedRooms
                    },
                    recentBookings = dashboard.RecentBookings,
                    recentUsers = dashboard.RecentUsers
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load admin dashboard.");
                return BadRequest(new { message = ex.Message });
            }
        }
        
        [HttpGet("rooms/deleted")]
        [Authorize(Policy = AppPermissions.RoomDelete)]
        public async Task<IActionResult> GetDeletedRooms()
        {
            try
            {
                var rooms = await _roomService.GetDeletedRoomsAsync();
                return Ok(rooms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve deleted rooms.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/admin/rooms/{id}/restore
        [HttpPut("rooms/{id}/restore")]
        [Authorize(Policy = AppPermissions.RoomRestore)]
        public async Task<IActionResult> RestoreRoom(int id)
        {
            try
            {
                bool restored = await _roomService.RestoreAsync(id);
                if (!restored)
                {
                    return NotFound(new { message = "Room not found." });
                }
                _logger.LogInformation("Admin restored room ID {RoomId}", id);
                return Ok(new { message = "Room restored successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to restore room ID {RoomId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/admin/rooms/{id}/permanent
        [HttpDelete("rooms/{id}/permanent")]
        [Authorize(Policy = AppPermissions.RoomDelete)]
        public async Task<IActionResult> PermanentDeleteRoom(int id)
        {
            try
            {
                bool deleted = await _roomService.PermanentDeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { message = "Room not found." });
                }
                _logger.LogInformation("Admin permanently deleted room ID {RoomId}", id);
                return Ok(new { message = "Room permanently removed." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to permanently delete room ID {RoomId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/admin/bookings
        [HttpGet("bookings")]
        [Authorize(Policy = AppPermissions.BookingRead)]
        public async Task<IActionResult> GetBookings([FromQuery] string query = null, [FromQuery] string status = null)
        {
            try
            {
                var bookings = await _adminService.GetBookingsAsync(query, status);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve bookings.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/admin/bookings/{id}/status
        [HttpPut("bookings/{id}/status")]
        [Authorize(Policy = AppPermissions.BookingUpdateStatus)]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                bool updated = await _adminService.UpdateBookingStatusAsync(id, request.Status, request.PaymentStatus, request.PaymentMethod);
                if (!updated)
                {
                    return NotFound(new { message = "Booking not found." });
                }

                _cache.Remove("admin_reports_summary");
                _logger.LogInformation("Admin updated booking #{BookingId} status to {Status}, payment status to {PaymentStatus}", id, request.Status, request.PaymentStatus);
                return Ok(new { message = "Booking updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update booking status for #{BookingId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/admin/users
        [HttpGet("users")]
        [Authorize(Policy = AppPermissions.UserRead)]
        public async Task<IActionResult> GetUsers([FromQuery] string search = null)
        {
            try
            {
                var users = await _adminService.GetUsersAsync(search);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve users list.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/admin/users/{id}
        [HttpPut("users/{id}")]
        [Authorize(Policy = AppPermissions.UserUpdate)]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateRequest request)
        {
            try
            {
                var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int currentUserId = !string.IsNullOrEmpty(currentUserIdStr) ? int.Parse(currentUserIdStr) : 0;

                var updated = await _adminService.UpdateUserAsync(id, request, currentUserId);
                if (updated == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                _logger.LogInformation("Admin updated user ID {UserId}: {Name}, Role: {Role}, Active: {IsActive}", id, updated.Name, updated.Role, updated.IsActive);
                return Ok(new { success = true, message = "User account updated successfully.", user = updated });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update user ID {UserId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/admin/users/{id}/activate
        [HttpPut("users/{id}/activate")]
        [Authorize(Policy = AppPermissions.UserActivate)]
        public async Task<IActionResult> ActivateUser(int id)
        {
            try
            {
                var activated = await _adminService.ActivateUserAsync(id);
                if (!activated)
                {
                    return NotFound(new { message = "User not found." });
                }

                _logger.LogInformation("Admin activated user ID {UserId}", id);
                return Ok(new { message = "User activated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to activate user ID {UserId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/admin/users/{id}/deactivate
        [HttpPut("users/{id}/deactivate")]
        [Authorize(Policy = AppPermissions.UserDeactivate)]
        public async Task<IActionResult> DeactivateUser(int id)
        {
            try
            {
                var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int currentUserId = !string.IsNullOrEmpty(currentUserIdStr) ? int.Parse(currentUserIdStr) : 0;

                var deactivated = await _adminService.DeactivateUserAsync(id, currentUserId);
                if (!deactivated)
                {
                    return NotFound(new { message = "User not found." });
                }

                _logger.LogInformation("Admin deactivated user ID {UserId}", id);
                return Ok(new { message = "User deactivated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deactivate user ID {UserId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/admin/upload-room-images
        [HttpPost("upload-room-images")]
        [Authorize(Policy = AppPermissions.RoomUploadMedia)]
        public async Task<IActionResult> UploadRoomImages([FromForm] List<IFormFile> files)
        {
            try
            {
                if (files == null || files.Count == 0)
                {
                    if (Request.HasFormContentType && Request.Form.Files.Count > 0)
                    {
                        files = Request.Form.Files.ToList();
                    }
                    else
                    {
                        return BadRequest(new { message = "No image files provided." });
                    }
                }

                var uploadedPaths = new List<string>();
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "rooms");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                foreach (var file in files)
                {
                    if (file != null && file.Length > 0)
                    {
                        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                        if (ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp")
                        {
                            continue;
                        }

                        var rawName = Path.GetFileNameWithoutExtension(file.FileName)
                            .Replace(" ", "-")
                            .Replace("_", "-");
                        var uniqueFileName = $"room-custom-{DateTime.UtcNow.Ticks}-{rawName}{ext}";
                        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        uploadedPaths.Add($"images/rooms/{uniqueFileName}");
                    }
                }

                if (uploadedPaths.Count == 0)
                {
                    return BadRequest(new { message = "No valid image files (JPG/PNG/WEBP) were processed." });
                }

                _logger.LogInformation("Uploaded {Count} room images", uploadedPaths.Count);
                return Ok(new { success = true, paths = uploadedPaths, message = $"{uploadedPaths.Count} image(s) uploaded successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload room images.");
                return BadRequest(new { message = $"Upload failed: {ex.Message}" });
            }
        }

        // POST /api/admin/upload-image (Single file upload fallback)
        [HttpPost("upload-image")]
        [Authorize(Policy = AppPermissions.RoomUploadMedia)]
        public async Task<IActionResult> UploadSingleImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            return await UploadRoomImages(new List<IFormFile> { file });
        }

        // ==========================================
        // GASTRONOMY MENU MANAGEMENT ENDPOINTS
        // ==========================================

        // GET /api/admin/menu
        [HttpGet("menu")]
        [Authorize(Policy = AppPermissions.MenuRead)]
        public async Task<IActionResult> GetAdminMenu()
        {
            try
            {
                var items = await _menuService.GetAdminMenuAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve admin menu items.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/admin/menu
        [HttpPost("menu")]
        [Authorize(Policy = AppPermissions.MenuCreate)]
        public async Task<IActionResult> AddMenuItem([FromBody] MenuItemCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Dish name is required." });
            }

            try
            {
                var created = await _menuService.AddMenuItemAsync(dto);
                _logger.LogInformation("Admin added new menu item: {Name} (Category: {Category})", created.Name, created.Category);
                return Ok(new { success = true, message = "Dish added to gastronomy catalog successfully.", item = created });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add menu item.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/admin/menu/{id}
        [HttpPut("menu/{id}")]
        [Authorize(Policy = AppPermissions.MenuUpdate)]
        public async Task<IActionResult> EditMenuItem(int id, [FromBody] MenuItemCreateDto dto)
        {
            try
            {
                var updated = await _menuService.UpdateMenuItemAsync(id, dto);
                if (updated == null)
                {
                    return NotFound(new { message = "Menu item not found." });
                }

                _logger.LogInformation("Admin updated menu item ID {Id}: {Name}", id, updated.Name);
                return Ok(new { success = true, message = "Dish details updated successfully.", item = updated });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to edit menu item ID {Id}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/admin/menu/{id}
        [HttpDelete("menu/{id}")]
        [Authorize(Policy = AppPermissions.MenuDelete)]
        public async Task<IActionResult> DeleteMenuItem(int id)
        {
            try
            {
                var success = await _menuService.DeleteMenuItemAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Menu item not found." });
                }

                _logger.LogInformation("Admin deleted menu item ID {Id}", id);
                return Ok(new { success = true, message = "Dish removed from active gastronomy menu." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete menu item ID {Id}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/admin/menu/{id}/delete
        [HttpPut("menu/{id}/delete")]
        [Authorize(Policy = AppPermissions.MenuDelete)]
        public async Task<IActionResult> SoftDeleteMenuItem(int id)
        {
            return await DeleteMenuItem(id);
        }

        // GET /api/admin/menu/deleted
        [HttpGet("menu/deleted")]
        [Authorize(Policy = AppPermissions.MenuDelete)]
        public async Task<IActionResult> GetDeletedAdminMenu()
        {
            try
            {
                var items = await _menuService.GetDeletedMenuAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve deleted menu items.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/admin/menu/{id}/restore
        [HttpPut("menu/{id}/restore")]
        [Authorize(Policy = AppPermissions.MenuRestore)]
        public async Task<IActionResult> RestoreMenuItem(int id)
        {
            try
            {
                var item = await _menuService.RestoreMenuItemAsync(id);
                if (item == null)
                {
                    return NotFound(new { message = "Menu item not found." });
                }

                _logger.LogInformation("Admin restored menu item ID {Id}: {Name}", id, item.Name);
                return Ok(new { success = true, message = "Dish restored to active gastronomy catalog successfully.", item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to restore menu item ID {Id}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/admin/upload-food-image
        [HttpPost("upload-food-image")]
        [Authorize(Policy = AppPermissions.MenuUploadMedia)]
        public async Task<IActionResult> UploadFoodImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No image file provided." });
            }

            try
            {
                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp")
                {
                    return BadRequest(new { message = "Invalid file type. Please select a JPG, PNG, or WebP image." });
                }

                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "food");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var rawName = Path.GetFileNameWithoutExtension(file.FileName)
                    .Replace(" ", "-")
                    .Replace("_", "-");
                var uniqueFileName = $"food-custom-{DateTime.UtcNow.Ticks}-{rawName}{ext}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativePath = $"images/food/{uniqueFileName}";
                _logger.LogInformation("Food image uploaded successfully: {Path}", relativePath);
                return Ok(new { success = true, path = relativePath, message = "Food photo uploaded successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload food image.");
                return BadRequest(new { message = $"Upload failed: {ex.Message}" });
            }
        }

        // ==========================================
        // EXCEL / CSV REPORT EXPORT ENDPOINT
        // ==========================================

        // GET /api/admin/reports
        [HttpGet("reports")]
        [Authorize(Policy = AppPermissions.ReportExport)]
        public async Task<IActionResult> GetReportsSummary()
        {
            try
            {
                const string cacheKey = "admin_reports_summary";
                if (_cache.TryGetValue(cacheKey, out object cached))
                {
                    return Ok(cached);
                }

                var bookings = await _adminService.GetAllBookingsForExportAsync();
                var result = new
                {
                    totalBookings = bookings.Count,
                    totalRevenue = bookings.Sum(b => b.TotalAmount),
                    recentExportRecords = bookings.Take(50)
                };

                _cache.Set(cacheKey, result, TimeSpan.FromSeconds(60));
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load reports summary.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/admin/bookings/export-excel
        // GET /api/admin/reports/export
        [HttpGet("bookings/export-excel")]
        [HttpGet("reports/export")]
        [Authorize(Policy = AppPermissions.ReportExport)]
        public async Task<IActionResult> ExportBookingsExcel()
        {
            try
            {
                var bookings = await _adminService.GetAllBookingsForExportAsync();

                var builder = new System.Text.StringBuilder();
                // UTF-8 BOM for Microsoft Excel compatibility
                builder.Append('\uFEFF');

                // Header row
                builder.AppendLine("Booking ID,Guest Name,Email,Phone,Room Number,Suite Type,Package,Check-In Date,Check-Out Date,Guests,Total Amount (INR),Reservation Status,Payment Status,Transaction ID,Booking Date");

                foreach (var b in bookings)
                {
                    var guestName = EscapeCsv(b.GuestName ?? b.User?.Name ?? "Guest");
                    var email = EscapeCsv(b.User?.Email ?? "");
                    var phone = EscapeCsv(b.User?.Phone ?? "");
                    var roomNum = b.Room?.RoomNumber ?? "";
                    var roomType = EscapeCsv(b.Room?.RoomType ?? "");
                    var package = EscapeCsv(b.Package ?? "Stay");
                    var checkIn = b.CheckIn.ToString("yyyy-MM-dd");
                    var checkOut = b.CheckOut.ToString("yyyy-MM-dd");
                    var guests = b.NumberOfGuests;
                    var total = b.TotalAmount.ToString("F2");
                    var status = EscapeCsv(b.BookingStatus ?? "Pending");
                    var payStatus = EscapeCsv(b.PaymentStatus ?? "Pending");
                    var txnId = EscapeCsv(b.TransactionId ?? "N/A");
                    var createdAt = b.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");

                    builder.AppendLine($"{b.BookingId},{guestName},{email},{phone},{roomNum},{roomType},{package},{checkIn},{checkOut},{guests},{total},{status},{payStatus},{txnId},{createdAt}");
                }

                var bytes = System.Text.Encoding.UTF8.GetBytes(builder.ToString());
                var fileName = $"AnsuKumarHotels_Reservations_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
                _logger.LogInformation("Exported reservations CSV report with {Count} records", bookings.Count);
                return File(bytes, "text/csv; charset=utf-8", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export bookings CSV report.");
                return BadRequest(new { message = $"Export failed: {ex.Message}" });
            }
        }

        private static string EscapeCsv(string field)
        {
            if (string.IsNullOrEmpty(field)) return "\"\"";
            if (field.Contains(",") || field.Contains("\"") || field.Contains("\n") || field.Contains("\r"))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }
            return $"\"{field}\"";
        }

        // ==========================================
        // DYNAMIC RBAC ROLE & PERMISSIONS ENDPOINTS
        // ==========================================

        // GET /api/admin/roles/permissions
        [HttpGet("roles/permissions")]
        [Authorize(Policy = AppPermissions.UserRead)]
        public async Task<IActionResult> GetRolePermissions()
        {
            try
            {
                var matrix = await _permissionRepository.GetRolePermissionMatrixAsync();
                var allPermissions = await _permissionRepository.GetAllPermissionsAsync();

                var groupedPermissions = allPermissions
                    .GroupBy(p => p.Category)
                    .Select(g => new PermissionCategoryGroupDto
                    {
                        Category = g.Key,
                        Permissions = g.Select(p => new PermissionItemDto
                        {
                            Name = p.Name,
                            Description = p.Description
                        }).ToList()
                    })
                    .ToList();

                return Ok(new RolePermissionsMatrixResponse
                {
                    Roles = matrix,
                    Permissions = groupedPermissions
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve role permission matrix.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/admin/roles/{roleName}/permissions
        [HttpPut("roles/{roleName}/permissions")]
        [Authorize(Policy = AppPermissions.UserUpdate)]
        public async Task<IActionResult> UpdateRolePermissions(string roleName, [FromBody] UpdateRolePermissionsRequest request)
        {
            if (string.IsNullOrWhiteSpace(roleName))
            {
                return BadRequest(new { message = "Role name is required." });
            }

            try
            {
                var success = await _permissionRepository.UpdateRolePermissionsAsync(roleName, request?.Permissions ?? new List<string>());
                if (!success)
                {
                    return NotFound(new { message = $"Role '{roleName}' not found." });
                }

                _logger.LogInformation("Admin updated permissions for role '{RoleName}' ({Count} permissions granted)", roleName, request?.Permissions?.Count ?? 0);
                return Ok(new { success = true, message = $"Permissions for role '{roleName}' updated successfully in PostgreSQL database." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update permissions for role '{RoleName}'", roleName);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
