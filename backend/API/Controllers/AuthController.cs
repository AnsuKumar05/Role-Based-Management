using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Constants;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IEmailService _emailService;
        private readonly IJwtService _jwtService;
        private readonly IPermissionRepository _permissionRepository;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService, 
            IEmailService emailService, 
            IJwtService jwtService,
            IPermissionRepository permissionRepository,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _emailService = emailService;
            _jwtService = jwtService;
            _permissionRepository = permissionRepository;
            _logger = logger;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Name) || 
                string.IsNullOrWhiteSpace(request?.Email) || 
                string.IsNullOrWhiteSpace(request?.Password))
            {
                return BadRequest(new { message = "Name, Email, and Password are required." });
            }

            var user = new User
            {
                Name = request.Name.Trim(),
                Email = request.Email.Trim(),
                Phone = request.Phone?.Trim(),
                Role = "User" // Default role
            };

            try
            {
                var registeredUser = await _authService.RegisterAsync(user, request.Password);
                _logger.LogInformation("User registration successful for {Email} (User ID: {UserId})", registeredUser.Email, registeredUser.UserId);

                // Send happy registration welcome email with overall facilities
                try
                {
                    await _emailService.SendWelcomeEmailAsync(registeredUser.Email, registeredUser.Name, registeredUser.Phone);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Welcome email could not be dispatched to {Email}", registeredUser.Email);
                }

                // Generate JWT Bearer Token
                var token = _jwtService.GenerateToken(registeredUser);

                // Create User Claims & Sign In with Cookie for backward compatibility
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, registeredUser.UserId.ToString()),
                    new Claim(ClaimTypes.Name, registeredUser.Name),
                    new Claim(ClaimTypes.Email, registeredUser.Email),
                    new Claim(ClaimTypes.Role, registeredUser.Role)
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(2)
                };

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);
                
                HttpContext.Session.SetInt32("UserId", registeredUser.UserId);
                HttpContext.Session.SetString("UserName", registeredUser.Name);
                if (registeredUser.Role == "Admin")
                {
                    HttpContext.Session.SetInt32("AdminId", registeredUser.UserId);
                    HttpContext.Session.SetString("AdminName", registeredUser.Name);
                }

                var permissions = await _permissionRepository.GetPermissionsByRoleAsync(registeredUser.Role);

                _logger.LogInformation("User registered and issued JWT token: {Email} (Role: {Role})", registeredUser.Email, registeredUser.Role);

                return Ok(new { 
                    message = "Registration successful. You are now logged in.", 
                    token = token,
                    tokenType = "Bearer",
                    user = new { 
                        userId = registeredUser.UserId, 
                        name = registeredUser.Name, 
                        email = registeredUser.Email, 
                        role = registeredUser.Role,
                        phone = registeredUser.Phone,
                        permissions = permissions
                    } 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration failed for email {Email}", request.Email);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Email) || string.IsNullOrWhiteSpace(request?.Password))
            {
                return BadRequest(new { message = "Email and Password are required." });
            }

            try
            {
                var user = await _authService.AuthenticateAsync(request.Email, request.Password);
                if (user == null)
                {
                    _logger.LogWarning("Authentication failed for email: {Email}", request.Email);
                    return BadRequest(new { message = "Invalid email or password." });
                }

                // Generate JWT Bearer Token
                var token = _jwtService.GenerateToken(user);

                // Create User Claims & Cookie Sign In
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(2)
                };

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);
                
                // Set Session for backwards compatibility
                HttpContext.Session.SetInt32("UserId", user.UserId);
                HttpContext.Session.SetString("UserName", user.Name);
                if (user.Role == "Admin")
                {
                    HttpContext.Session.SetInt32("AdminId", user.UserId);
                    HttpContext.Session.SetString("AdminName", user.Name);
                }

                var permissions = await _permissionRepository.GetPermissionsByRoleAsync(user.Role);

                _logger.LogInformation("User authenticated successfully with JWT token: {Email} (Role: {Role})", user.Email, user.Role);

                return Ok(new { 
                    message = "Login successful.", 
                    token = token,
                    tokenType = "Bearer",
                    user = new { 
                        userId = user.UserId, 
                        name = user.Name, 
                        email = user.Email, 
                        role = user.Role,
                        phone = user.Phone,
                        permissions = permissions
                    } 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login exception for email: {Email}", request.Email);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            HttpContext.Session.Clear();
            _logger.LogInformation("User logged out");
            return Ok(new { message = "Logout successful." });
        }

        [HttpGet("me")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCurrentUser()
        {
            if (User?.Identity == null || !User.Identity.IsAuthenticated)
            {
                return Ok(new { authenticated = false });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Ok(new { authenticated = false });
            }

            var user = await _authService.GetByIdAsync(int.Parse(userIdClaim));
            if (user == null)
            {
                return Ok(new { authenticated = false });
            }

            var permissions = await _permissionRepository.GetPermissionsByRoleAsync(user.Role);

            return Ok(new { 
                authenticated = true,
                userId = user.UserId, 
                name = user.Name, 
                email = user.Email, 
                role = user.Role,
                phone = user.Phone,
                createdAt = user.CreatedAt,
                permissions = permissions
            });
        }

        [HttpGet("test-email")]
        [AllowAnonymous]
        public async Task<IActionResult> TestEmail([FromQuery] string email = "ansukumar2007510@gmail.com")
        {
            try
            {
                var (isSent, sendMsg) = await _emailService.SendOtpEmailAsync(email, "Ansu Kumar", "999888");
                if (isSent)
                {
                    return Ok(new { success = true, message = $"Test email sent successfully to {email}." });
                }
                else
                {
                    return BadRequest(new { success = false, message = $"Test email failed: {sendMsg}" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Test email error for {Email}", email);
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Email))
            {
                return BadRequest(new { message = "Email address is required." });
            }

            var trimmedEmail = request.Email.Trim();
            if (!System.Net.Mail.MailAddress.TryCreate(trimmedEmail, out _))
            {
                return BadRequest(new { message = "Please enter a valid email address." });
            }

            try
            {
                var (resetCode, userName) = await _authService.GenerateResetTokenAsync(trimmedEmail);
                
                // Send OTP to user's email address
                var (isSent, _) = await _emailService.SendOtpEmailAsync(trimmedEmail, userName, resetCode);
                
                _logger.LogInformation("Password reset OTP generated for {Email} (Delivered: {IsSent})", trimmedEmail, isSent);

                return Ok(new
                {
                    message = "A 6-digit verification code has been dispatched to your email address. Please check your inbox.",
                    email = trimmedEmail,
                    userName = userName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Forgot password request failed for {Email}", trimmedEmail);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("verify-reset-code")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyResetCode([FromBody] VerifyResetCodeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Email) || string.IsNullOrWhiteSpace(request?.Code))
            {
                return BadRequest(new { message = "Email and OTP verification code are required." });
            }

            try
            {
                await _authService.VerifyResetTokenAsync(request.Email.Trim(), request.Code.Trim());
                _logger.LogInformation("OTP verification successful for {Email}", request.Email);
                return Ok(new { message = "OTP verified successfully. You may now set your new password." });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "OTP verification failed for {Email}", request.Email);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Email) || 
                string.IsNullOrWhiteSpace(request?.Code) || 
                string.IsNullOrWhiteSpace(request?.NewPassword))
            {
                return BadRequest(new { message = "Email, OTP verification code, and new password are required." });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "New password must be at least 6 characters long." });
            }

            try
            {
                await _authService.ResetPasswordAsync(request.Email.Trim(), request.Code.Trim(), request.NewPassword);
                _logger.LogInformation("Password reset completed successfully for {Email}", request.Email);
                return Ok(new { message = "Your password has been successfully reset. Please login with your new password." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Password reset failed for {Email}", request.Email);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("change-password")]
        [Authorize(Policy = AppPermissions.ProfileUpdate)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { message = "User ID claim missing from token." });
            }

            if (string.IsNullOrWhiteSpace(request?.CurrentPassword) || string.IsNullOrWhiteSpace(request?.NewPassword))
            {
                return BadRequest(new { message = "Current password and new password are required." });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "New password must be at least 6 characters long." });
            }

            try
            {
                int userId = int.Parse(userIdClaim);
                await _authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
                _logger.LogInformation("User ID {UserId} changed password successfully", userId);
                return Ok(new { message = "Your password has been changed successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Change password failed for user ID {UserId}", userIdClaim);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
