using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
