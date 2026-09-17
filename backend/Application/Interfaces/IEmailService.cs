using System.Threading.Tasks;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Interfaces
{
    public interface IEmailService
    {
        Task<(bool success, string message)> SendOtpEmailAsync(string toEmail, string userName, string otpCode);
        Task<(bool success, string message)> SendWelcomeEmailAsync(string toEmail, string userName, string phone);
        Task<(bool success, string message)> SendBookingConfirmationEmailAsync(string toEmail, string userName, string phone, Booking booking, string invoiceHtml);
    }
}
