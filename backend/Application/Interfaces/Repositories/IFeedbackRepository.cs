using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces.Repositories
{
    public interface IFeedbackRepository
    {
        Task<Feedback> AddAsync(Feedback feedback);
        Task<List<Feedback>> GetAllAsync();
        Task SaveChangesAsync();
    }
}
