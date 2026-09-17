using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces;

namespace HotelManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;
        private readonly ILogger<FeedbackController> _logger;

        public FeedbackController(IFeedbackService feedbackService, ILogger<FeedbackController> logger)
        {
            _feedbackService = feedbackService;
            _logger = logger;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> SubmitFeedback([FromBody] CreateFeedbackDto dto)
        {
            try
            {
                int? userId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out int id) ? id : null;
                var feedback = await _feedbackService.SubmitFeedbackAsync(userId, dto);
                return Ok(new { message = "Feedback submitted successfully.", feedback });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to submit feedback.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllFeedback()
        {
            try
            {
                var list = await _feedbackService.GetAllFeedbackAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve feedbacks.");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
