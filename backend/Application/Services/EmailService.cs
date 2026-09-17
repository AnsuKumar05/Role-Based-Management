using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Domain.Entities;
using HotelManagementSystem.Infrastructure.Options;

namespace HotelManagementSystem.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly SmtpOptions _smtpOptions;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<SmtpOptions> smtpOptions, ILogger<EmailService> logger)
        {
            _smtpOptions = smtpOptions?.Value ?? new SmtpOptions();
            _logger = logger;
        }

        private async Task<(bool success, string message)> DeliverEmailAsync(string toEmail, string userName, string subject, string htmlContent)
        {
            var smtpHost = _smtpOptions.Host?.Trim() ?? "smtp.gmail.com";
            var smtpPort = _smtpOptions.Port > 0 ? _smtpOptions.Port : 587;
            var senderEmail = _smtpOptions.SenderEmail?.Trim();
            var senderName = _smtpOptions.SenderName?.Trim() ?? "Ansu Kumar Hotels";
            var username = _smtpOptions.Username?.Trim();
            var password = _smtpOptions.Password?.Trim();

            if (string.IsNullOrWhiteSpace(username) || !username.Contains("@"))
            {
                username = senderEmail;
            }

            if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(senderEmail) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                var msg = "SMTP email credentials are not configured in appsettings.json. Please configure Host, SenderEmail, Username, and Password under 'SmtpSettings'.";
                _logger.LogWarning("{Message}", msg);
                return (false, msg);
            }

            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(senderName, senderEmail));
                message.To.Add(new MailboxAddress(userName ?? "Valued Guest", toEmail));
                message.Subject = subject;
                message.Date = DateTimeOffset.Now;

                // Plain text fallback for high deliverability
                var plainText = System.Text.RegularExpressions.Regex.Replace(htmlContent, "<[^>]+>", " ")
                    .Replace("&nbsp;", " ")
                    .Replace("&copy;", "©")
                    .Trim();

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = htmlContent,
                    TextBody = plainText
                };

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                client.Timeout = 20000;
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                client.CheckCertificateRevocation = false;

                var socketOption = (smtpPort == 465) ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
                await client.ConnectAsync(smtpHost, smtpPort, socketOption);
                await client.AuthenticateAsync(username, password);
                var sendResult = await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email '{Subject}' dispatched successfully to {Email} (Server Response: {Response})", subject, toEmail, sendResult);
                return (true, "Email sent successfully.");
            }
            catch (Exception ex)
            {
                var errorMsg = $"SMTP send error: {ex.Message}";
                _logger.LogError(ex, "Failed to send email '{Subject}' to {Email}.", subject, toEmail);
                return (false, errorMsg);
            }
        }

        public async Task<(bool success, string message)> SendOtpEmailAsync(string toEmail, string userName, string otpCode)
        {
            var html = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <style>
                    body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #FCFAF6; margin: 0; padding: 20px; color: #2C2C2B; }}
                    .container {{ max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E6E1DA; border-top: 4px solid #C5A85C; border-radius: 6px; padding: 35px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }}
                    .logo {{ text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #1A2530; margin-bottom: 25px; }}
                    .logo span {{ color: #C5A85C; }}
                    .otp-card {{ background: linear-gradient(135deg, #FCFAF6 0%, #F5EFEB 100%); border: 1px dashed #C5A85C; border-radius: 6px; padding: 20px; text-align: center; margin: 25px 0; }}
                    .otp-code {{ font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1A2530; font-family: monospace; }}
                    .footer {{ text-align: center; font-size: 12px; color: #6B7280; margin-top: 25px; border-top: 1px solid #E6E1DA; padding-top: 15px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='logo'>👑 ANSU KUMAR <span>HOTELS</span></div>
                    <h2 style='color: #1A2530; font-size: 20px; margin-top: 0;'>Password Reset OTP</h2>
                    <p>Dear <strong>{userName}</strong>,</p>
                    <p>We received a request to reset your password for your Ansu Kumar Hotels account. Please use the following One-Time Password (OTP) to complete your verification:</p>
                    
                    <div class='otp-card'>
                        <div style='font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;'>Your Verification OTP</div>
                        <div class='otp-code'>{otpCode}</div>
                        <div style='font-size: 12px; color: #C26D4D; margin-top: 6px;'>Valid for 15 minutes only</div>
                    </div>

                    <p style='font-size: 13.5px; color: #6B7280;'>If you did not request this password reset, please ignore this email or contact our guest support immediately. Your account remains secure.</p>
                    
                    <div class='footer'>
                        &copy; 2026 Ansu Kumar Hotels & Spa. Coimbatore, Tamil Nadu, India.
                    </div>
                </div>
            </body>
            </html>";

            return await DeliverEmailAsync(toEmail, userName, "Password Reset OTP - Ansu Kumar Hotels", html);
        }

        public async Task<(bool success, string message)> SendWelcomeEmailAsync(string toEmail, string userName, string phone)
        {
            var targetPhone = !string.IsNullOrWhiteSpace(phone) ? phone.Trim() : "8124337117";

            var html = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <style>
                    body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #FCFAF6; margin: 0; padding: 20px; color: #2C2C2B; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E6E1DA; border-top: 4px solid #C5A85C; border-radius: 8px; padding: 35px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }}
                    .logo {{ text-align: center; font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #1A2530; margin-bottom: 20px; }}
                    .logo span {{ color: #C5A85C; }}
                    .welcome-banner {{ background: linear-gradient(135deg, #06302B 0%, #0D4E46 100%); color: #FFFFFF; padding: 25px; border-radius: 6px; text-align: center; margin-bottom: 25px; }}
                    .welcome-banner h2 {{ margin: 0 0 8px 0; font-size: 22px; color: #FFFFFF; font-weight: 700; }}
                    .welcome-banner p {{ margin: 0; font-size: 14px; color: #E6E1DA; }}
                    .facility-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }}
                    .facility-item {{ background: #FCFAF6; border: 1px solid #E6E1DA; border-radius: 6px; padding: 12px 14px; font-size: 13px; color: #2C2C2B; }}
                    .facility-item strong {{ color: #06302B; display: block; margin-bottom: 3px; font-size: 13.5px; }}
                    .btn-book {{ display: inline-block; background-color: #D97706; color: #FFFFFF !important; text-decoration: none; font-weight: bold; padding: 12px 28px; border-radius: 4px; margin-top: 20px; font-size: 14px; }}
                    .footer {{ text-align: center; font-size: 12px; color: #6B7280; margin-top: 30px; border-top: 1px solid #E6E1DA; padding-top: 18px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='logo'>👑 ANSU KUMAR <span>HOTELS</span></div>
                    
                    <div class='welcome-banner'>
                        <h2>Welcome to Luxury & Warmth</h2>
                        <p>Where Indian Hospitality Meets Modern Comfort</p>
                    </div>

                    <p>Dear <strong>{userName}</strong>,</p>
                    <p>We are delighted to welcome you as a valued guest of <strong>Ansu Kumar Hotels</strong>. Your account has been registered successfully with registered email <strong>{toEmail}</strong> and mobile <strong>{targetPhone}</strong>.</p>
                    
                    <h3 style='color: #06302B; font-size: 17px; margin-top: 25px; border-bottom: 2px solid #C5A85C; padding-bottom: 6px;'>
                        👑 Experience Our 5-Star Resort Facilities
                    </h3>

                    <div class='facility-grid'>
                        <div class='facility-item'>
                            <strong>🛌 3 Luxury Suite Categories</strong>
                            Deluxe Rooms, Premium Verandahs & Presidential Executive Suites with Egyptian cotton & rainfall baths.
                        </div>
                        <div class='facility-item'>
                            <strong>🍽️ Fine Gastronomy</strong>
                            Darbar Hall royal clay oven tandoors, Courtyard Bistro, Café Ansu & The Nilgiri Sunset Lounge.
                        </div>
                        <div class='facility-item'>
                            <strong>🏊 Pool & Ayurvedic Spa</strong>
                            Temperature-regulated courtyard pool with private cabanas and authentic Kerala Panchakarma therapies.
                        </div>
                        <div class='facility-item'>
                            <strong>🩺 24/7 Medical & Health</strong>
                            Doctor-on-Call suite visits, automated external defibrillators (AED), oxygen kits & hospital priority liaison.
                        </div>
                        <div class='facility-item'>
                            <strong>🚗 Valet & EV Monitored Parking</strong>
                            Multi-level CCTV surveillance and fast Level-2 EV charging stations with 24/7 attendants.
                        </div>
                        <div class='facility-item'>
                            <strong>⚡ 100% Power & Fiber Wi-Fi 6</strong>
                            Heavy-duty generator backup ensuring zero downtime with high-speed Wi-Fi across the resort.
                        </div>
                    </div>

                    <p style='font-size: 13.5px; color: #53716B; margin-top: 15px;'>
                        Whether you are planning an executive business stay, a romantic getaway, or a grand royal celebration, our 24/7 concierge is at your service.
                    </p>

                    <div style='text-align: center; margin: 25px 0;'>
                        <a href='http://localhost:5000/rooms' class='btn-book'>Explore Rooms & Reserve Your Stay</a>
                    </div>

                    <div class='footer'>
                        <strong>Palace Concierge Desk:</strong> +91 81243 37117 / +91 99988 87770<br>
                        102 Palace Orchard Boulevard, Avinashi Road, Coimbatore, Tamil Nadu 641018<br>
                        &copy; 2026 Ansu Kumar Hotels & Spa. All Rights Reserved.
                    </div>
                </div>
            </body>
            </html>";

            return await DeliverEmailAsync(toEmail, userName, $"👑 Welcome to Ansu Kumar Hotels, {userName}! Your Luxury Account is Active", html);
        }

        public async Task<(bool success, string message)> SendBookingConfirmationEmailAsync(string toEmail, string userName, string phone, Booking booking, string invoiceHtml)
        {
            var nights = (booking.CheckOut.Date - booking.CheckIn.Date).Days;
            if (nights <= 0) nights = 1;

            var roomInfo = booking.Room != null ? $"Room {booking.Room.RoomNumber} ({booking.Room.RoomType})" : "Luxury Suite";

            var html = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <style>
                    body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #FCFAF6; margin: 0; padding: 20px; color: #2C2C2B; }}
                    .container {{ max-width: 650px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E6E1DA; border-top: 4px solid #C5A85C; border-radius: 8px; padding: 35px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }}
                    .logo {{ text-align: center; font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #1A2530; margin-bottom: 20px; }}
                    .logo span {{ color: #C5A85C; }}
                    .confirm-banner {{ background: linear-gradient(135deg, #06302B 0%, #0D4E46 100%); color: #FFFFFF; padding: 22px; border-radius: 6px; text-align: center; margin-bottom: 25px; }}
                    .confirm-banner h2 {{ margin: 0 0 6px 0; font-size: 22px; color: #FFFFFF; }}
                    .confirm-banner p {{ margin: 0; font-size: 14px; color: #E6E1DA; }}
                    .booking-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                    .booking-table td {{ padding: 10px 12px; border: 1px solid #E6E1DA; font-size: 13.5px; }}
                    .booking-table td.header {{ background-color: #F5EFEB; font-weight: bold; color: #06302B; width: 35%; }}
                    .invoice-section {{ margin-top: 30px; border-top: 2px dashed #C5A85C; padding-top: 20px; }}
                    .footer {{ text-align: center; font-size: 12px; color: #6B7280; margin-top: 30px; border-top: 1px solid #E6E1DA; padding-top: 18px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='logo'>👑 ANSU KUMAR <span>HOTELS</span></div>
                    
                    <div class='confirm-banner'>
                        <h2>🎉 Reservation Confirmed!</h2>
                        <p>Booking ID: #{booking.BookingId} • We look forward to welcoming you</p>
                    </div>

                    <p>Dear <strong>{userName}</strong>,</p>
                    <p>Thank you for choosing <strong>Ansu Kumar Hotels</strong>. Your reservation has been confirmed with the details below:</p>
                    
                    <table class='booking-table'>
                        <tr>
                            <td class='header'>Booking Reference</td>
                            <td><strong>#{booking.BookingId}</strong></td>
                        </tr>
                        <tr>
                            <td class='header'>Primary Guest</td>
                            <td>{booking.GuestName}</td>
                        </tr>
                        <tr>
                            <td class='header'>Suite / Room</td>
                            <td>{(booking.Room != null ? $"Room {booking.Room.RoomNumber} ({booking.Room.RoomType})" : "Luxury Suite")}</td>
                        </tr>
                        <tr>
                            <td class='header'>Check-In Date</td>
                            <td><strong>{booking.CheckIn:dddd, dd MMMM yyyy}</strong> (from 2:00 PM)</td>
                        </tr>
                        <tr>
                            <td class='header'>Check-Out Date</td>
                            <td><strong>{booking.CheckOut:dddd, dd MMMM yyyy}</strong> (until 11:00 AM)</td>
                        </tr>
                        <tr>
                            <td class='header'>Duration & Guests</td>
                            <td>{nights} Night(s) • {booking.NumberOfGuests} Guest(s)</td>
                        </tr>
                        <tr>
                            <td class='header'>Experience Package</td>
                            <td>{booking.Package}</td>
                        </tr>
                        <tr>
                            <td class='header'>Payment Status</td>
                            <td><strong style='color: {(booking.PaymentStatus == "Paid" ? "#059669" : "#D97706")};'>{booking.PaymentStatus.ToUpper()}</strong> {(string.IsNullOrEmpty(booking.TransactionId) ? "" : $" (Ref: {booking.TransactionId})")}</td>
                        </tr>
                        <tr>
                            <td class='header'>Total Amount</td>
                            <td><strong style='font-size: 16px; color: #EA580C;'>₹{booking.TotalAmount:N2}</strong></td>
                        </tr>
                    </table>

                    <div class='invoice-section'>
                        <h3 style='color: #06302B; font-size: 17px; margin-top: 0;'>📄 Official Guest Invoice</h3>
                        {(string.IsNullOrWhiteSpace(invoiceHtml) ? "<p>Your official invoice is available in your account.</p>" : invoiceHtml)}
                    </div>

                    <div class='footer'>
                        <strong>Need Assistance with Airport Transfers or Special Requests?</strong><br>
                        Palace Concierge Helpline: <strong>+91 81243 37117 / +91 99988 87770</strong><br>
                        102 Palace Orchard Boulevard, Avinashi Road, Coimbatore, Tamil Nadu 641018<br>
                        &copy; 2026 Ansu Kumar Hotels & Spa. All Rights Reserved.
                    </div>
                </div>
            </body>
            </html>";

            return await DeliverEmailAsync(toEmail, userName, $"🏨 Booking Confirmed #{booking.BookingId} - Ansu Kumar Hotels", html);
        }
    }
}
