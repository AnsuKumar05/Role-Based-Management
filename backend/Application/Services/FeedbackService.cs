using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepository _feedbackRepository;
        private readonly IUserRepository _userRepository;

        public FeedbackService(IFeedbackRepository feedbackRepository, IUserRepository userRepository)
        {
            _feedbackRepository = feedbackRepository;
            _userRepository = userRepository;
        }

        public async Task<FeedbackResponseDto> SubmitFeedbackAsync(int? userId, CreateFeedbackDto dto)
        {
            var user = userId.HasValue ? await _userRepository.GetByIdAsync(userId.Value) : null;

            int roomR = dto.RoomRating > 0 ? dto.RoomRating : 5;
            int foodR = dto.FoodRating > 0 ? dto.FoodRating : 5;
            int facR = dto.FacilitiesRating > 0 ? dto.FacilitiesRating : 5;
            int servR = dto.ServiceRating > 0 ? dto.ServiceRating : 5;

            double avg = Math.Round((roomR + foodR + facR + servR) / 4.0, 1);

            var feedback = new Feedback
            {
                UserId = userId,
                GuestName = user?.Name,
                GuestEmail = user?.Email,
                RoomRating = roomR,
                FoodRating = foodR,
                FacilitiesRating = facR,
                ServiceRating = servR,
                AverageRating = avg,
                Comments = dto.Comments?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            var created = await _feedbackRepository.AddAsync(feedback);

            return new FeedbackResponseDto
            {
                Id = created.Id,
                UserId = created.UserId,
                GuestName = created.GuestName,
                GuestEmail = created.GuestEmail,
                RoomRating = created.RoomRating,
                FoodRating = created.FoodRating,
                FacilitiesRating = created.FacilitiesRating,
                ServiceRating = created.ServiceRating,
                AverageRating = created.AverageRating,
                Comments = created.Comments,
                CreatedAt = created.CreatedAt
            };
        }

        public async Task<List<FeedbackResponseDto>> GetAllFeedbackAsync()
        {
            var list = await _feedbackRepository.GetAllAsync();
            return list.Select(f => new FeedbackResponseDto
            {
                Id = f.Id,
                UserId = f.UserId,
                GuestName = f.GuestName,
                GuestEmail = f.GuestEmail,
                RoomRating = f.RoomRating,
                FoodRating = f.FoodRating,
                FacilitiesRating = f.FacilitiesRating,
                ServiceRating = f.ServiceRating,
                AverageRating = f.AverageRating,
                Comments = f.Comments,
                CreatedAt = f.CreatedAt
            }).ToList();
        }
    }
}
