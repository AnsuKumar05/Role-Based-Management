using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Services
{
    public class RoomService : IRoomService
    {
        private readonly IRoomRepository _roomRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IMemoryCache _cache;

        private static CancellationTokenSource _roomCacheCts = new();
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

        public RoomService(IRoomRepository roomRepository, IBookingRepository bookingRepository, IMemoryCache cache)
        {
            _roomRepository = roomRepository;
            _bookingRepository = bookingRepository;
            _cache = cache;
        }

        public void InvalidateCache()
        {
            var oldCts = Interlocked.Exchange(ref _roomCacheCts, new CancellationTokenSource());
            try
            {
                oldCts.Cancel();
                oldCts.Dispose();
            }
            catch (ObjectDisposedException) { }
        }

        public async Task<List<Room>> GetActiveRoomsAsync(string roomNumber = null, string roomType = null, string status = null, double? minPrice = null, double? maxPrice = null, int? minCapacity = null)
        {
            var cacheKey = $"rooms_active_{roomNumber}_{roomType}_{status}_{minPrice}_{maxPrice}_{minCapacity}";

            if (_cache.TryGetValue(cacheKey, out List<Room> cachedRooms))
            {
                return cachedRooms;
            }

            var rooms = await _roomRepository.GetActiveRoomsAsync(roomNumber, roomType, status, minPrice, maxPrice, minCapacity);

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(CacheDuration)
                .AddExpirationToken(new CancellationChangeToken(_roomCacheCts.Token));

            _cache.Set(cacheKey, rooms, cacheOptions);
            return rooms;
        }

        public async Task<List<Room>> GetDeletedRoomsAsync()
        {
            return await _roomRepository.GetDeletedRoomsAsync();
        }

        public async Task<Room> GetByIdAsync(int id)
        {
            var cacheKey = $"room_id_{id}";

            if (_cache.TryGetValue(cacheKey, out Room cachedRoom))
            {
                return cachedRoom;
            }

            var room = await _roomRepository.GetByIdAsync(id);
            if (room != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(CacheDuration)
                    .AddExpirationToken(new CancellationChangeToken(_roomCacheCts.Token));

                _cache.Set(cacheKey, room, cacheOptions);
            }

            return room;
        }

        public async Task<Room> AddRoomAsync(Room room)
        {
            if (await _roomRepository.RoomNumberExistsAsync(room.RoomNumber))
            {
                throw new Exception("Room number already exists.");
            }

            room.IsDeleted = false;
            room.CreatedAt = DateTime.UtcNow;
            var created = await _roomRepository.AddAsync(room);
            InvalidateCache();
            return created;
        }

        public async Task<Room> UpdateRoomAsync(Room room)
        {
            var existing = await _roomRepository.GetByIdAsync(room.RoomId);
            if (existing == null) throw new Exception("Room not found.");

            if (existing.RoomNumber != room.RoomNumber && await _roomRepository.RoomNumberExistsAsync(room.RoomNumber, room.RoomId))
            {
                throw new Exception("Room number already exists.");
            }

            existing.RoomNumber = room.RoomNumber;
            existing.RoomType = room.RoomType;
            existing.SubType = room.SubType;
            existing.Price = room.Price;
            existing.Capacity = room.Capacity;
            existing.Status = room.Status;
            existing.Description = room.Description;
            existing.Images = room.Images;
            existing.Facility1 = room.Facility1;
            existing.Facility2 = room.Facility2;
            existing.Facility3 = room.Facility3;
            existing.Facility4 = room.Facility4;
            existing.Facility5 = room.Facility5;
            existing.UpdatedAt = DateTime.UtcNow;

            await _roomRepository.UpdateAsync(existing);
            InvalidateCache();
            return existing;
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null) return false;

            // Check if there are active bookings currently in CheckedIn or Confirmed status
            var activeBookings = await _bookingRepository.HasActiveBookingsForRoomAsync(id);
            if (activeBookings)
            {
                throw new Exception("Cannot delete a room with active bookings.");
            }

            room.IsDeleted = true;
            room.DeletedAt = DateTime.UtcNow;
            room.Status = "Maintenance"; // Automatically switch to maintenance when soft deleted
            await _roomRepository.UpdateAsync(room);
            InvalidateCache();
            return true;
        }

        public async Task<bool> PermanentDeleteAsync(int id)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null) return false;

            var activeBookings = await _bookingRepository.HasActiveBookingsForRoomAsync(id);
            if (activeBookings)
            {
                throw new Exception("Cannot permanently delete a room with active bookings.");
            }

            await _roomRepository.DeletePermanentlyAsync(room);
            InvalidateCache();
            return true;
        }

        public async Task<bool> RestoreAsync(int id)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null) return false;

            room.IsDeleted = false;
            room.DeletedAt = null;
            room.Status = "Available"; // Set it back to available on restoration
            await _roomRepository.UpdateAsync(room);
            InvalidateCache();
            return true;
        }
    }
}
