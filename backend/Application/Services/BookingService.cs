using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IRoomService _roomService;

        public BookingService(IBookingRepository bookingRepository, IRoomRepository roomRepository, IRoomService roomService)
        {
            _bookingRepository = bookingRepository;
            _roomRepository = roomRepository;
            _roomService = roomService;
        }

        private static (double rate, string displayName, double foodSubtotal, double travelSubtotal) GetPackageInfo(string package, int nights, int guests)
        {
            var raw = package?.Trim() ?? "Stay";
            var normalized = raw.ToLowerInvariant().Replace(" ", "").Replace("+", "").Replace("&", "").Replace("and", "");

            double rate = 0;
            string displayName = "Stay";
            double food = 0;
            double travel = 0;

            if (normalized == "food")
            {
                rate = 1000;
                displayName = "Food";
                food = 1000 * nights * guests;
            }
            else if (normalized == "stayfood" || normalized == "stay+food")
            {
                rate = 1000;
                displayName = "Stay + Food";
                food = 1000 * nights * guests;
            }
            else if (normalized.Contains("travel") || normalized.Contains("tour") || normalized == "stayfoodpooltravel" || normalized == "allinclusive")
            {
                rate = 2500;
                displayName = "Stay + Food + Tour & Travel";
                food = 1000 * nights * guests;
                travel = 1500 * nights * guests;
            }
            else
            {
                rate = 0;
                displayName = "Stay";
            }

            return (rate, displayName, food, travel);
        }

        public async Task<PriceCalculationResult> CalculatePriceAsync(int roomId, DateTime checkIn, DateTime checkOut, int numberOfGuests, string package)
        {
            if (roomId <= 0)
            {
                throw new Exception("Invalid room ID.");
            }

            var room = await _roomRepository.GetByIdAsync(roomId);
            if (room == null || room.IsDeleted)
            {
                throw new Exception("Room not found.");
            }

            int nights = (checkOut.Date - checkIn.Date).Days;
            if (nights <= 0) nights = 1;

            int guests = numberOfGuests > 0 ? numberOfGuests : 1;

            var (packagePerNightPerGuest, packageDisplayName, foodSubtotal, travelSubtotal) = GetPackageInfo(package, nights, guests);

            double roomTariff = room.Price;
            double roomSubtotal = roomTariff * nights;
            double packageSubtotal = packagePerNightPerGuest * nights * guests;
            double grandTotal = roomSubtotal + packageSubtotal;

            return new PriceCalculationResult
            {
                RoomId = room.RoomId,
                RoomNumber = room.RoomNumber,
                RoomType = room.RoomType,
                PricePerNight = roomTariff,
                Nights = nights,
                Guests = guests,
                Package = packageDisplayName,
                PackageName = packageDisplayName,
                PackageRatePerNightPerGuest = packagePerNightPerGuest,
                RoomSubtotal = roomSubtotal,
                FoodSubtotal = foodSubtotal,
                PoolSubtotal = 0,
                TravelSubtotal = travelSubtotal,
                PackageSubtotal = packageSubtotal,
                GrandTotal = grandTotal
            };
        }

        public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkIn, DateTime checkOut, int? ignoreBookingId = null)
        {
            bool hasOverlap = await _bookingRepository.HasOverlappingBookingsAsync(roomId, checkIn, checkOut, ignoreBookingId);
            return !hasOverlap;
        }

        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            using (var transaction = await _bookingRepository.BeginTransactionAsync(System.Data.IsolationLevel.Serializable))
            {
                try
                {
                    var room = await _roomRepository.GetByIdAsync(booking.RoomId);
                    if (room == null || room.IsDeleted)
                    {
                        throw new Exception("Room not found or has been deleted.");
                    }

                    if (room.Status == "Maintenance")
                    {
                        throw new Exception("Room is currently under maintenance and cannot be booked.");
                    }

                    if (booking.CheckIn.Date < DateTime.Today)
                    {
                        throw new Exception("Check-in date cannot be in the past.");
                    }

                    if (booking.CheckOut.Date <= booking.CheckIn.Date)
                    {
                        throw new Exception("Check-out date must be after check-in date.");
                    }

                    bool available = await IsRoomAvailableAsync(booking.RoomId, booking.CheckIn, booking.CheckOut);
                    if (!available)
                    {
                        throw new Exception("Room is not available for the selected dates.");
                    }

                    int nights = (booking.CheckOut.Date - booking.CheckIn.Date).Days;
                    if (nights <= 0) nights = 1;

                    int guests = booking.NumberOfGuests > 0 ? booking.NumberOfGuests : 1;
                    var (packagePerNightPerGuest, packageDisplayName, _, _) = GetPackageInfo(booking.Package, nights, guests);

                    booking.Package = packageDisplayName;
                    double roomCost = room.Price * nights;
                    double packageCost = packagePerNightPerGuest * nights * guests;
                    booking.TotalAmount = roomCost + packageCost;
                    
                    booking.BookingStatus = "Confirmed";
                    booking.PaymentStatus = "Pending";
                    booking.CreatedAt = DateTime.UtcNow;

                    // Immediately mark the room as Occupied so it no longer appears in available booking dropdowns
                    room.Status = "Occupied";
                    await _roomRepository.UpdateAsync(room);

                    await _bookingRepository.AddAsync(booking);

                    await transaction.CommitAsync();

                    _roomService.InvalidateCache();
                    return booking;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }

        public async Task<List<Booking>> GetUserBookingsAsync(int userId)
        {
            return await _bookingRepository.GetUserBookingsAsync(userId);
        }

        public async Task<Booking> GetByIdAsync(int id)
        {
            return await _bookingRepository.GetByIdWithDetailsAsync(id);
        }

        public async Task<bool> CancelBookingAsync(int bookingId, int userId, bool isAdmin = false)
        {
            var booking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId);
            if (booking == null) return false;

            if (!isAdmin && booking.UserId != userId)
            {
                throw new Exception("Access Denied: You cannot cancel another user's booking.");
            }

            if (booking.BookingStatus == "CheckedIn" || booking.BookingStatus == "CheckedOut" || booking.BookingStatus == "Cancelled")
            {
                throw new Exception($"Cannot cancel booking in '{booking.BookingStatus}' state.");
            }

            booking.BookingStatus = "Cancelled";
            booking.UpdatedAt = DateTime.UtcNow;

            // Free the room status back to Available if no other active booking
            if (booking.Room != null)
            {
                bool hasOtherActive = await _bookingRepository.HasActiveBookingsForRoomAsync(booking.RoomId, bookingId);
                if (!hasOtherActive)
                {
                    booking.Room.Status = "Available";
                    await _roomRepository.UpdateAsync(booking.Room);
                }
            }

            await _bookingRepository.UpdateAsync(booking);
            _roomService.InvalidateCache();
            return true;
        }

        public async Task<Booking> ProcessPaymentAsync(int bookingId, int userId, string paymentMethod = "QR")
        {
            var booking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId);
            if (booking == null)
            {
                throw new Exception("Booking not found.");
            }

            if (booking.UserId != userId)
            {
                throw new UnauthorizedAccessException("Access Denied: You can only pay for your own booking.");
            }

            if (booking.PaymentStatus == "Paid")
            {
                throw new Exception("Booking is already paid.");
            }

            // Securely recalculate/validate the final amount on the C# backend before payment
            if (booking.Room == null)
            {
                throw new Exception("Associated room could not be loaded.");
            }

            int nights = (booking.CheckOut.Date - booking.CheckIn.Date).Days;
            if (nights <= 0) nights = 1;

            int guests = booking.NumberOfGuests > 0 ? booking.NumberOfGuests : 1;
            var (packagePerNightPerGuest, _, _, _) = GetPackageInfo(booking.Package, nights, guests);

            double expectedRoomCost = booking.Room.Price * nights;
            double expectedPackageCost = packagePerNightPerGuest * nights * guests;
            double expectedTotal = expectedRoomCost + expectedPackageCost;

            if (Math.Abs(booking.TotalAmount - expectedTotal) > 0.01)
            {
                throw new Exception("Security Warning: Price tampering detected. Total amount mismatch.");
            }

            string methodPrefix = (paymentMethod ?? "UPI").ToUpperInvariant() switch
            {
                "CASH" => "CASH",
                "CARD" => "CARD",
                _ => "UPI"
            };
            string txnId = $"{methodPrefix}-{Random.Shared.Next(100000, 999999)}{Random.Shared.Next(1000, 9999)}";

            string finalPayStatus = string.Equals(paymentMethod, "Cash", StringComparison.OrdinalIgnoreCase) ? "Pending" : "Paid";
            string finalBookingStatus = "Confirmed";

            var updated = await UpdatePaymentStatusAsync(bookingId, finalPayStatus, finalBookingStatus, txnId);
            if (updated == null)
            {
                throw new Exception("Failed to update payment status.");
            }

            return updated;
        }

        public async Task<string> GetInvoiceHtmlAsync(int bookingId, int userId, bool isAdmin)
        {
            var booking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId);
            if (booking == null)
            {
                return null;
            }

            if (booking.UserId != userId && !isAdmin)
            {
                throw new UnauthorizedAccessException("Access Denied: You cannot view another user's invoice.");
            }

            int nights = (booking.CheckOut.Date - booking.CheckIn.Date).Days;
            if (nights <= 0) nights = 1;

            int guests = booking.NumberOfGuests > 0 ? booking.NumberOfGuests : 1;
            var (packagePerNightPerGuest, packageDisplayName, _, _) = GetPackageInfo(booking.Package, nights, guests);
            double roomSubtotal = (booking.Room?.Price ?? 0) * nights;
            double packageSubtotal = packagePerNightPerGuest * nights * guests;

            var html = $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <title>Invoice - Booking #{booking.BookingId}</title>
    <style>
        body {{ font-family: 'Outfit', sans-serif; color: #2C2C2B; padding: 40px; background-color: #FFF; }}
        .invoice-box {{ max-width: 800px; margin: auto; padding: 30px; border: 1px solid #E6E1DA; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }}
        .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #C5A85C; padding-bottom: 20px; margin-bottom: 20px; }}
        .logo {{ font-size: 24px; font-weight: bold; font-family: 'Playfair Display', serif; text-transform: uppercase; }}
        .logo span {{ color: #C5A85C; }}
        .invoice-title {{ font-size: 28px; color: #1A2530; font-family: 'Playfair Display', serif; }}
        .details-table {{ width: 100%; border-collapse: collapse; margin-bottom: 30px; }}
        .details-table td {{ padding: 8px; vertical-align: top; }}
        .items-table {{ width: 100%; border-collapse: collapse; margin-bottom: 30px; }}
        .items-table th {{ background-color: #F5EFEB; text-align: left; padding: 12px; font-weight: bold; border: 1px solid #E6E1DA; }}
        .items-table td {{ padding: 12px; border: 1px solid #E6E1DA; }}
        .total-box {{ float: right; width: 300px; border-top: 2px solid #C5A85C; padding-top: 10px; margin-top: 20px; }}
        .total-row {{ display: flex; justify-content: space-between; padding: 5px 0; font-size: 15px; }}
        .grand-total {{ font-size: 18px; font-weight: bold; color: #C26D4D; }}
        .footer {{ text-align: center; margin-top: 50px; font-size: 12px; color: #6B7280; border-top: 1px solid #E6E1DA; padding-top: 20px; }}
        .btn-print {{ display: block; width: 120px; margin: 20px auto 0 auto; padding: 10px; background-color: #C5A85C; color: #FFF; text-align: center; text-decoration: none; font-weight: bold; border-radius: 2px; }}
        @media print {{ .btn-print {{ display: none; }} body {{ padding: 0; }} .invoice-box {{ border: none; box-shadow: none; }} }}
    </style>
</head>
<body>
    <div class=""invoice-box"">
        <div class=""header"">
            <div>
                <div class=""logo"">👑 ANSU KUMAR <span>HOTELS</span></div>
                <p style=""font-size: 12px; color: #6B7280; margin: 5px 0 0 0;"">Where Indian Hospitality Meets Modern Comfort</p>
            </div>
            <div style=""text-align: right;"">
                <div class=""invoice-title"">INVOICE</div>
                <p style=""margin: 5px 0;""><strong>Booking ID:</strong> #{booking.BookingId}</p>
                <p style=""margin: 5px 0;""><strong>Date:</strong> {booking.CreatedAt.ToLocalTime().ToString("dd MMM yyyy")}</p>
            </div>
        </div>

        <table class=""details-table"">
            <tr>
                <td style=""width: 50%;"">
                    <strong>Billed To:</strong><br>
                    {booking.GuestName}<br>
                    User Email: {booking.User?.Email ?? "N/A"}<br>
                </td>
                <td style=""width: 50%; text-align: right;"">
                    <strong>Hotel Address:</strong><br>
                    102 Palace Orchard Boulevard<br>
                    Avinashi Road, Coimbatore - 641018<br>
                    Tamil Nadu, India
                </td>
            </tr>
        </table>

        <table class=""details-table"" style=""background-color: #FCFAF6; border: 1px solid #E6E1DA; margin-bottom: 30px;"">
            <tr>
                <td><strong>Room Type:</strong> {booking.Room?.RoomType ?? "N/A"}</td>
                <td><strong>Room Number:</strong> {booking.Room?.RoomNumber ?? "N/A"}</td>
                <td><strong>Guests:</strong> {booking.NumberOfGuests}</td>
            </tr>
            <tr>
                <td><strong>Check-In:</strong> {booking.CheckIn.ToString("dd MMM yyyy")}</td>
                <td><strong>Check-Out:</strong> {booking.CheckOut.ToString("dd MMM yyyy")}</td>
                <td><strong>Nights:</strong> {nights}</td>
            </tr>
        </table>

        <table class=""items-table"">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Rate</th>
                    <th>Nights / Qty</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Room Charge ({booking.Room?.RoomType ?? "Room"})</td>
                    <td>₹{(booking.Room != null ? booking.Room.Price : 0):N2}</td>
                    <td>{nights}</td>
                    <td>₹{roomSubtotal:N2}</td>
                </tr>
                {(packagePerNightPerGuest > 0 ? $@"
                <tr>
                    <td>Package Service ({packageDisplayName})</td>
                    <td>₹{packagePerNightPerGuest:N2} × {guests} guest(s)</td>
                    <td>{nights}</td>
                    <td>₹{packageSubtotal:N2}</td>
                </tr>" : "")}
            </tbody>
        </table>

        <div style=""overflow: hidden;"">
            <div class=""total-box"">
                <div class=""total-row"">
                    <span>Room Total:</span>
                    <span>₹{roomSubtotal:N2}</span>
                </div>
                <div class=""total-row"">
                    <span>Package Services:</span>
                    <span>₹{packageSubtotal:N2}</span>
                </div>
                <div class=""total-row grand-total"" style=""margin-top: 10px; border-top: 1px solid #E6E1DA; padding-top: 10px;"">
                    <span>Grand Total:</span>
                    <span>₹{booking.TotalAmount:N2}</span>
                </div>
                <div class=""total-row"" style=""margin-top: 10px; font-size: 13px;"">
                    <span>Payment Status:</span>
                    <span style=""color: {(booking.PaymentStatus == "Paid" ? "#27AE60" : "#C0392B")}; font-weight: bold;"">{booking.PaymentStatus.ToUpper()}</span>
                </div>
                {(booking.TransactionId != null ? $@"
                <div class=""total-row"" style=""font-size: 11px; color: #6B7280; flex-direction: column;"">
                    <span style=""font-weight: bold; margin-bottom: 2px;"">Transaction Reference:</span>
                    <span style=""word-break: break-all;"">{booking.TransactionId}</span>
                </div>" : "")}
            </div>
        </div>

        <div class=""footer"">
            <p>Thank you for choosing ANSU KUMAR HOTELS. We wish you a comfortable stay!</p>
            <p>&copy; 2026 ANSU KUMAR HOTELS & Spa. All Rights Reserved.</p>
        </div>
    </div>
    
    <a href=""#"" class=""btn-print"" onclick=""window.print(); return false;"">Print Invoice</a>
</body>
</html>
";

            return html;
        }

        public async Task<List<Booking>> AdminGetAllBookingsAsync(string queryStr = null, string status = null)
        {
            return await _bookingRepository.GetAllBookingsAsync(queryStr, status);
        }

        public async Task<bool> AdminUpdateStatusAsync(int bookingId, string status)
        {
            var booking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId);
            if (booking == null) return false;

            if (status == "Cancelled")
            {
                booking.PaymentStatus = "Refunded";
            }
            booking.UpdatedAt = DateTime.UtcNow;
            await _bookingRepository.UpdateAsync(booking);

            if (booking.Room != null)
            {
                if (status == "CheckedIn" || status == "Confirmed" || status == "Pending")
                {
                    booking.Room.Status = "Occupied";
                    await _roomRepository.UpdateAsync(booking.Room);
                }
                else if (status == "CheckedOut" || status == "Cancelled")
                {
                    bool hasOtherActive = await _bookingRepository.HasActiveBookingsForRoomAsync(booking.RoomId, bookingId);
                    booking.Room.Status = hasOtherActive ? "Occupied" : "Available";
                    await _roomRepository.UpdateAsync(booking.Room);
                }
            }

            _roomService.InvalidateCache();
            return true;
        }

        public async Task<Booking> UpdatePaymentStatusAsync(int bookingId, string paymentStatus, string bookingStatus, string transactionId)
        {
            var booking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId);
            if (booking == null) return null;

            // Prevent payment replay attacks: verify transaction ID is not used by another booking
            if (!string.IsNullOrEmpty(transactionId))
            {
                bool txnExists = await _bookingRepository.TransactionIdExistsAsync(transactionId, bookingId);
                if (txnExists)
                {
                    throw new Exception("Security Error: Duplicate transaction reference or replay attack detected.");
                }
            }

            booking.PaymentStatus = paymentStatus;
            booking.BookingStatus = bookingStatus;
            booking.TransactionId = transactionId;
            booking.UpdatedAt = DateTime.UtcNow;

            if (booking.Room != null)
            {
                if (bookingStatus == "CheckedIn" || bookingStatus == "Confirmed" || paymentStatus == "Paid")
                {
                    booking.Room.Status = "Occupied";
                    await _roomRepository.UpdateAsync(booking.Room);
                }
            }

            await _bookingRepository.UpdateAsync(booking);
            _roomService.InvalidateCache();
            return booking;
        }
    }
}
