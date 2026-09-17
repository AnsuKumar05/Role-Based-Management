using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces
{
    public interface IRoomService
    {
        Task<List<Room>> GetActiveRoomsAsync(string roomNumber = null, string roomType = null, string status = null, double? minPrice = null, double? maxPrice = null, int? minCapacity = null);
        Task<List<Room>> GetDeletedRoomsAsync();
        Task<Room> GetByIdAsync(int id);
        Task<Room> AddRoomAsync(Room room);
        Task<Room> UpdateRoomAsync(Room room);
        Task<bool> SoftDeleteAsync(int id);
        Task<bool> PermanentDeleteAsync(int id);
        Task<bool> RestoreAsync(int id);
        void InvalidateCache();
    }
}
