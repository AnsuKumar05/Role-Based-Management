using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Domain.Constants;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Controllers
{
    [ApiController]
    [Route("api/rooms")]
    public class RoomController : ControllerBase
    {
        private readonly IRoomService _roomService;
        private readonly ILogger<RoomController> _logger;

        public RoomController(IRoomService roomService, ILogger<RoomController> logger)
        {
            _roomService = roomService;
            _logger = logger;
        }

        // GET /api/rooms
        [HttpGet]
        public async Task<IActionResult> GetRooms(
            [FromQuery] string roomNumber = null, 
            [FromQuery] string roomType = null, 
            [FromQuery] string status = null, 
            [FromQuery] double? minPrice = null, 
            [FromQuery] double? maxPrice = null,
            [FromQuery] int? capacity = null)
        {
            try
            {
                var rooms = await _roomService.GetActiveRoomsAsync(roomNumber, roomType, status, minPrice, maxPrice, capacity);
                return Ok(rooms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve active rooms.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/rooms/search
        [HttpGet("search")]
        public async Task<IActionResult> SearchRooms(
            [FromQuery] string roomNumber = null, 
            [FromQuery] string roomType = null, 
            [FromQuery] string status = null, 
            [FromQuery] double? minPrice = null, 
            [FromQuery] double? maxPrice = null,
            [FromQuery] int? capacity = null)
        {
            return await GetRooms(roomNumber, roomType, status, minPrice, maxPrice, capacity);
        }

        // GET /api/rooms/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoomById(int id)
        {
            try
            {
                var room = await _roomService.GetByIdAsync(id);
                if (room == null || room.IsDeleted)
                {
                    return NotFound(new { message = "Room not found." });
                }
                return Ok(room);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve room with ID {RoomId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/rooms (Requires Room.Create permission)
        [HttpPost]
        [Authorize(Policy = AppPermissions.RoomCreate)]
        public async Task<IActionResult> AddRoom([FromBody] RoomCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var room = new Room
                {
                    RoomNumber = dto.RoomNumber.Trim(),
                    RoomType = dto.RoomType.Trim(),
                    SubType = dto.SubType?.Trim(),
                    Price = dto.Price,
                    Capacity = dto.Capacity > 0 ? dto.Capacity : 2,
                    Status = string.IsNullOrWhiteSpace(dto.Status) ? "Available" : dto.Status.Trim(),
                    Images = dto.Images,
                    Facility1 = dto.Facility1,
                    Facility2 = dto.Facility2,
                    Facility3 = dto.Facility3,
                    Facility4 = dto.Facility4,
                    Facility5 = dto.Facility5,
                    Description = dto.Description
                };

                var created = await _roomService.AddRoomAsync(room);
                _logger.LogInformation("Room created: {RoomNumber} ({RoomType})", created.RoomNumber, created.RoomType);
                return CreatedAtAction(nameof(GetRoomById), new { id = created.RoomId }, new { message = "Room created successfully.", room = created });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create room.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/rooms/{id} (Requires Room.Update permission)
        [HttpPut("{id}")]
        [Authorize(Policy = AppPermissions.RoomUpdate)]
        public async Task<IActionResult> EditRoom(int id, [FromBody] RoomUpdateDto dto)
        {
            if (dto.RoomId > 0 && id != dto.RoomId)
            {
                return BadRequest(new { message = "Room ID mismatch." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var room = new Room
                {
                    RoomId = id,
                    RoomNumber = dto.RoomNumber.Trim(),
                    RoomType = dto.RoomType.Trim(),
                    SubType = dto.SubType?.Trim(),
                    Price = dto.Price,
                    Capacity = dto.Capacity > 0 ? dto.Capacity : 2,
                    Status = string.IsNullOrWhiteSpace(dto.Status) ? "Available" : dto.Status.Trim(),
                    Images = dto.Images,
                    Facility1 = dto.Facility1,
                    Facility2 = dto.Facility2,
                    Facility3 = dto.Facility3,
                    Facility4 = dto.Facility4,
                    Facility5 = dto.Facility5,
                    Description = dto.Description
                };

                var updated = await _roomService.UpdateRoomAsync(room);
                _logger.LogInformation("Room updated ID {RoomId}: {RoomNumber}", id, updated.RoomNumber);
                return Ok(new { message = "Room updated successfully.", room = updated });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update room ID {RoomId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/rooms/{id} (Requires Room.Delete permission)
        [HttpDelete("{id}")]
        [Authorize(Policy = AppPermissions.RoomDelete)]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            try
            {
                bool deleted = await _roomService.SoftDeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { message = "Room not found." });
                }
                _logger.LogInformation("Soft-deleted room ID {RoomId}", id);
                return Ok(new { message = "Room archived successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete room ID {RoomId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/rooms/{id}/permanent (Requires Room.Delete permission)
        [HttpDelete("{id}/permanent")]
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
                _logger.LogInformation("Permanently deleted room ID {RoomId}", id);
                return Ok(new { message = "Room permanently removed." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to permanently delete room ID {RoomId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/rooms/{id}/delete (Requires Room.Delete permission)
        [HttpPut("{id}/delete")]
        [Authorize(Policy = AppPermissions.RoomDelete)]
        public async Task<IActionResult> SoftDeleteRoom(int id)
        {
            return await DeleteRoom(id);
        }

        // PUT /api/rooms/{id}/restore (Requires Room.Restore permission)
        [HttpPut("{id}/restore")]
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

        // POST /api/rooms/sync - Stores / syncs rooms catalog directly from React into PostgreSQL
        [HttpPost("sync")]
        public async Task<IActionResult> SyncRooms(
            [FromBody] System.Collections.Generic.List<RoomSyncItemDto> rooms,
            [FromServices] HotelManagementSystem.Infrastructure.Data.ApplicationDbContext dbContext)
        {
            if (rooms == null || rooms.Count == 0)
            {
                return BadRequest(new { message = "No rooms provided for synchronization." });
            }

            try
            {
                int addedCount = 0;
                int updatedCount = 0;

                foreach (var r in rooms)
                {
                    if (string.IsNullOrWhiteSpace(r.RoomNumber)) continue;

                    var trimmedNumber = r.RoomNumber.Trim();
                    var existing = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
                        dbContext.Rooms, x => x.RoomNumber == trimmedNumber);

                    if (existing == null)
                    {
                        dbContext.Rooms.Add(new Room
                        {
                            RoomNumber = trimmedNumber,
                            RoomType = string.IsNullOrWhiteSpace(r.RoomType) ? "Deluxe Room" : r.RoomType.Trim(),
                            SubType = r.SubType?.Trim(),
                            Price = r.Price,
                            Capacity = r.Capacity > 0 ? r.Capacity : 2,
                            Status = string.IsNullOrWhiteSpace(r.Status) ? "Available" : r.Status.Trim(),
                            Images = r.Images,
                            Facility1 = r.Facility1,
                            Facility2 = r.Facility2,
                            Facility3 = r.Facility3,
                            Facility4 = r.Facility4,
                            Facility5 = r.Facility5,
                            Description = r.Description,
                            IsDeleted = false
                        });
                        addedCount++;
                    }
                    else
                    {
                        existing.RoomType = string.IsNullOrWhiteSpace(r.RoomType) ? existing.RoomType : r.RoomType.Trim();
                        existing.SubType = r.SubType?.Trim() ?? existing.SubType;
                        existing.Price = r.Price > 0 ? r.Price : existing.Price;
                        existing.Capacity = r.Capacity > 0 ? r.Capacity : existing.Capacity;
                        existing.Status = string.IsNullOrWhiteSpace(r.Status) ? existing.Status : r.Status.Trim();
                        existing.Images = !string.IsNullOrWhiteSpace(r.Images) ? r.Images : existing.Images;
                        existing.Facility1 = r.Facility1 ?? existing.Facility1;
                        existing.Facility2 = r.Facility2 ?? existing.Facility2;
                        existing.Facility3 = r.Facility3 ?? existing.Facility3;
                        existing.Facility4 = r.Facility4 ?? existing.Facility4;
                        existing.Facility5 = r.Facility5 ?? existing.Facility5;
                        existing.Description = r.Description ?? existing.Description;
                        existing.IsDeleted = false;
                        updatedCount++;
                    }
                }

                await dbContext.SaveChangesAsync();

                _logger.LogInformation("Rooms sync completed from React: {Added} added, {Updated} updated.", addedCount, updatedCount);
                var total = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(dbContext.Rooms, x => !x.IsDeleted);

                return Ok(new
                {
                    message = "Rooms catalog stored in database successfully.",
                    added = addedCount,
                    updated = updatedCount,
                    totalCount = total
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to synchronize rooms from React.");
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class RoomSyncItemDto
    {
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomType { get; set; } = string.Empty;
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
    }
}
