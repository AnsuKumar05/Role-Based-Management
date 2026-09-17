using System;
using System.Threading.Tasks;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;

        public AuthService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User> RegisterAsync(User user, string password)
        {
            var trimmedEmail = user.Email.Trim().ToLower();
            if (await _userRepository.EmailExistsAsync(trimmedEmail))
            {
                throw new Exception("Email already exists.");
            }

            user.Email = trimmedEmail;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true;

            return await _userRepository.AddAsync(user);
        }

        public async Task<User> AuthenticateAsync(string email, string password)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return null;

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null) return null;

            if (!user.IsActive)
            {
                throw new Exception("User account is deactivated.");
            }

            bool isVerified = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            if (!isVerified) return null;

            return user;
        }

        public async Task<User> GetByIdAsync(int userId)
        {
            return await _userRepository.GetByIdAsync(userId);
        }

        public async Task<(string resetCode, string userName)> GenerateResetTokenAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new Exception("Email address is required.");
            }

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                throw new Exception("No account found with this email address.");
            }

            if (!user.IsActive)
            {
                throw new Exception("User account is deactivated. Please contact support.");
            }

            // Generate a secure 6-digit numeric reset verification code
            var resetCode = Random.Shared.Next(100000, 999999).ToString();

            user.ResetToken = resetCode;
            user.ResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);

            await _userRepository.UpdateAsync(user);
            return (resetCode, user.Name);
        }

        public async Task<bool> VerifyResetTokenAsync(string email, string token)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
            {
                throw new Exception("Email and OTP verification code are required.");
            }

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                throw new Exception("No account found with this email address.");
            }

            var trimmedToken = token.Trim();
            if (string.IsNullOrEmpty(user.ResetToken) || user.ResetToken != trimmedToken)
            {
                throw new Exception("Invalid OTP code. Please check your email or request a new OTP.");
            }

            if (!user.ResetTokenExpiry.HasValue || user.ResetTokenExpiry.Value < DateTime.UtcNow)
            {
                throw new Exception("The OTP code has expired. Please request a new OTP.");
            }

            return true;
        }

        public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
            {
                throw new Exception("Email and OTP verification code are required.");
            }

            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            {
                throw new Exception("New password must be at least 6 characters long.");
            }

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                throw new Exception("No account found with this email address.");
            }

            var trimmedToken = token.Trim();
            if (string.IsNullOrEmpty(user.ResetToken) || user.ResetToken != trimmedToken)
            {
                throw new Exception("Invalid or already used OTP. Please request a new OTP.");
            }

            if (!user.ResetTokenExpiry.HasValue || user.ResetTokenExpiry.Value < DateTime.UtcNow)
            {
                throw new Exception("The OTP code has expired. Please request a new OTP.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;

            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword))
            {
                throw new Exception("Current and new passwords are required.");
            }

            if (newPassword.Length < 6)
            {
                throw new Exception("New password must be at least 6 characters long.");
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            bool isCurrentValid = BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash);
            if (!isCurrentValid)
            {
                throw new Exception("Current password is incorrect.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _userRepository.UpdateAsync(user);
            return true;
        }
    }
}
