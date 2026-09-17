using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HotelManagementSystem.Domain.Entities;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Infrastructure.Data;

namespace HotelManagementSystem.Infrastructure.Repositories
{
    public class RoomRepository : IRoomRepository
    {
        private readonly ApplicationDbContext _context;

        public RoomRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Room>> GetActiveRoomsAsync(string roomNumber = null, string roomType = null, string status = null, double? minPrice = null, double? maxPrice = null, int? minCapacity = null)
        {
            var query = _context.Rooms
                .AsNoTracking()
                .Where(r => !r.IsDeleted);

            if (!string.IsNullOrWhiteSpace(roomNumber))
            {
                query = query.Where(r => r.RoomNumber.Contains(roomNumber));
            }

            if (!string.IsNullOrWhiteSpace(roomType) && roomType != "All")
            {
                var rt = roomType.ToLower().Trim();
                query = query.Where(r => 
                    r.RoomType.ToLower().Contains(rt) || 
                    rt.Contains(r.RoomType.ToLower()) ||
                    (!string.IsNullOrEmpty(r.SubType) && (r.SubType.ToLower().Contains(rt) || rt.Contains(r.SubType.ToLower()))));
            }

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
            {
                query = query.Where(r => r.Status == status);
            }

            if (minCapacity.HasValue && minCapacity.Value > 0)
            {
                query = query.Where(r => r.Capacity >= minCapacity.Value);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(r => r.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(r => r.Price <= maxPrice.Value);
            }

            var list = await query.ToListAsync();
            return list.OrderBy(r => int.TryParse(r.RoomNumber, out var n) ? n : 999999).ToList();
        }

        public async Task<List<Room>> GetDeletedRoomsAsync()
        {
            return await _context.Rooms
                .AsNoTracking()
                .Where(r => r.IsDeleted)
                .OrderByDescending(r => r.DeletedAt)
                .ToListAsync();
        }

        public async Task<Room> GetByIdAsync(int id)
        {
            return await _context.Rooms.FirstOrDefaultAsync(r => r.RoomId == id);
        }

        public async Task<Room> GetByRoomNumberAsync(string roomNumber)
        {
            return await _context.Rooms.FirstOrDefaultAsync(r => r.RoomNumber == roomNumber);
        }

        public async Task<bool> RoomNumberExistsAsync(string roomNumber, int? excludeRoomId = null)
        {
            var query = _context.Rooms.Where(r => r.RoomNumber == roomNumber);
            if (excludeRoomId.HasValue)
            {
                query = query.Where(r => r.RoomId != excludeRoomId.Value);
            }
            return await query.AnyAsync();
        }

        public async Task<Room> AddAsync(Room room)
        {
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task UpdateAsync(Room room)
        {
            _context.Rooms.Update(room);
            await _context.SaveChangesAsync();
        }

        public async Task DeletePermanentlyAsync(Room room)
        {
            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
        }

        public async Task<int> CountRoomsAsync(bool isDeleted, string status = null)
        {
            var query = _context.Rooms.Where(r => r.IsDeleted == isDeleted);
            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(r => r.Status == status);
            }
            return await query.CountAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
