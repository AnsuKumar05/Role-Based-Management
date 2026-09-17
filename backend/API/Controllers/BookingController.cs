using System;
using System.Security.Claims;
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
    [Route("api/bookings")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IEmailService _emailService;
        private readonly IAuthService _authService;
        private readonly ILogger<BookingController> _logger;

        public BookingController(
            IBookingService bookingService, 
            IEmailService emailService, 
            IAuthService authService,
            ILogger<BookingController> logger)
        {
            _bookingService = bookingService;
            _emailService = emailService;
            _authService = authService;
            _logger = logger;
        }

        // POST /api/bookings/calculate
        [HttpPost("calculate")]
        [AllowAnonymous]
        public async Task<IActionResult> CalculatePrice([FromBody] PriceCalculationRequest request)
        {
            if (request == null || request.RoomId <= 0)
            {
                return BadRequest(new { message = "Invalid room ID." });
            }

            try
            {
                var result = await _bookingService.CalculatePriceAsync(
                    request.RoomId, 
                    request.CheckIn, 
                    request.CheckOut, 
                    request.NumberOfGuests, 
                    request.Package
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                if (ex.Message == "Room not found.")
                {
                    return NotFound(new { message = ex.Message });
                }
                _logger.LogError(ex, "Failed to calculate booking price for room ID {RoomId}", request.RoomId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/bookings
        [HttpPost]
        [Authorize(Policy = AppPermissions.BookingCreate)]
        public async Task<IActionResult> CreateBooking([FromBody] BookingRequest request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized(new { message = "User not identified." });
            }

            int userId = int.Parse(userIdStr);

            if (string.IsNullOrWhiteSpace(request?.GuestName))
            {
                return BadRequest(new { message = "Guest name is required." });
            }

            if (request.CheckIn.Date < DateTime.Today)
            {
                return BadRequest(new { message = "Check-in date cannot be in the past." });
            }

            if (request.CheckOut.Date <= request.CheckIn.Date)
            {
                return BadRequest(new { message = "Check-out date must be after check-in date." });
            }

            if (request.NumberOfGuests <= 0 || request.NumberOfGuests > 10)
            {
                return BadRequest(new { message = "Number of guests must be between 1 and 10." });
            }

            var booking = new Booking
            {
                UserId = userId,
                RoomId = request.RoomId,
                GuestName = request.GuestName.Trim(),
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                NumberOfGuests = request.NumberOfGuests,
                Package = request.Package
            };

            try
            {
                var created = await _bookingService.CreateBookingAsync(booking);
                _logger.LogInformation("Booking created successfully: #{BookingId} for User ID {UserId}", created.BookingId, userId);
                return Ok(new { message = "Booking created successfully.", bookingId = created.BookingId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create booking for User ID {UserId}, Room ID {RoomId}", userId, request.RoomId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/bookings/my
        [HttpGet("my")]
        [Authorize(Policy = AppPermissions.BookingReadOwn)]
        public async Task<IActionResult> GetMyBookings()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized(new { message = "User not identified." });
            }

            int userId = int.Parse(userIdStr);
            try
            {
                var bookings = await _bookingService.GetUserBookingsAsync(userId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve bookings for User ID {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/bookings/{id}
        [HttpGet("{id}")]
        [Authorize(Policy = AppPermissions.BookingRead)]
        public async Task<IActionResult> GetBookingById(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdStr);

            try
            {
                var booking = await _bookingService.GetByIdAsync(id);
                if (booking == null)
                {
                    return NotFound(new { message = "Booking not found." });
                }

                bool isStaffOrAdmin = userRole == "Admin" || userRole == "Manager" || userRole == "Staff";
                if (booking.UserId != userId && !isStaffOrAdmin)
                {
                    return Forbid(); // Cannot view another user's booking unless admin, manager, or staff
                }

                return Ok(booking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve booking #{BookingId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/bookings/{id}/cancel
        [HttpPut("{id}/cancel")]
        [Authorize(Policy = AppPermissions.BookingCancel)]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdStr);
            bool isStaffOrAdmin = userRole == "Admin" || userRole == "Manager" || userRole == "Staff";

            try
            {
                bool success = await _bookingService.CancelBookingAsync(id, userId, isStaffOrAdmin);
                if (!success)
                {
                    return NotFound(new { message = "Booking not found." });
                }

                _logger.LogInformation("Booking #{BookingId} cancelled by User ID {UserId}", id, userId);
                return Ok(new { message = "Booking cancelled successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to cancel booking #{BookingId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/bookings/{id}/pay
        [HttpPost("{id}/pay")]
        [Authorize(Policy = AppPermissions.BookingPayment)]
        public async Task<IActionResult> ProcessPayment(int id, [FromBody] PaymentRequest request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized(new { message = "User not identified." });
            }

            int userId = int.Parse(userIdStr);

            try
            {
                var updated = await _bookingService.ProcessPaymentAsync(id, userId, request?.PaymentMethod ?? "QR");
                _logger.LogInformation("Payment confirmed for booking #{BookingId} (Txn: {TxnId})", id, updated.TransactionId);

                // Send confirmation email with full invoice HTML
                try
                {
                    var bookingWithDetails = await _bookingService.GetByIdAsync(id);
                    var invoiceHtml = await _bookingService.GetInvoiceHtmlAsync(id, userId, false);
                    var user = await _authService.GetByIdAsync(userId);

                    var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? user?.Email;
                    var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? user?.Name ?? bookingWithDetails?.GuestName ?? "Valued Guest";
                    var userPhone = user?.Phone;

                    if (!string.IsNullOrEmpty(userEmail) && bookingWithDetails != null)
                    {
                        await _emailService.SendBookingConfirmationEmailAsync(userEmail, userName, userPhone, bookingWithDetails, invoiceHtml);
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Could not dispatch booking confirmation email for booking #{BookingId}", id);
                }

                return Ok(new { message = "Payment processed successfully.", transactionId = updated.TransactionId });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                if (ex.Message == "Booking not found.")
                {
                    return NotFound(new { message = ex.Message });
                }
                _logger.LogError(ex, "Payment processing failed for booking #{BookingId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/bookings/{id}/invoice
        [HttpGet("{id}/invoice")]
        [Authorize(Policy = AppPermissions.BookingInvoice)]
        public async Task<IActionResult> GetInvoice(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdStr);
            bool isStaffOrAdmin = userRole == "Admin" || userRole == "Manager" || userRole == "Staff";

            try
            {
                var html = await _bookingService.GetInvoiceHtmlAsync(id, userId, isStaffOrAdmin);
                if (html == null)
                {
                    return NotFound(new { message = "Booking not found." });
                }

                return Content(html, "text/html");
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve invoice for booking #{BookingId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
