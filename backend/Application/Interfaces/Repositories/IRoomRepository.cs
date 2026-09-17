using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces.Repositories
{
    public interface IRoomRepository
    {
        Task<List<Room>> GetActiveRoomsAsync(string roomNumber = null, string roomType = null, string status = null, double? minPrice = null, double? maxPrice = null, int? minCapacity = null);
        Task<List<Room>> GetDeletedRoomsAsync();
        Task<Room> GetByIdAsync(int id);
        Task<Room> GetByRoomNumberAsync(string roomNumber);
        Task<bool> RoomNumberExistsAsync(string roomNumber, int? excludeRoomId = null);
        Task<Room> AddAsync(Room room);
        Task UpdateAsync(Room room);
        Task<int> CountRoomsAsync(bool isDeleted, string status = null);
        Task DeletePermanentlyAsync(Room room);
        Task SaveChangesAsync();
    }
}
