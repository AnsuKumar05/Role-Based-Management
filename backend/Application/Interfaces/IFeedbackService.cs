using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Application.DTOs;

namespace HotelManagementSystem.Application.Interfaces
{
    public interface IFeedbackService
    {
        Task<FeedbackResponseDto> SubmitFeedbackAsync(int? userId, CreateFeedbackDto dto);
        Task<List<FeedbackResponseDto>> GetAllFeedbackAsync();
    }
}
