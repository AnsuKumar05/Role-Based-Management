using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace HotelManagementSystem.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value ?? string.Empty;

            // Only perform structured request logging on API routes
            if (!path.StartsWith("/api", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            var stopwatch = Stopwatch.StartNew();
            var method = context.Request.Method;

            try
            {
                await _next(context);
                stopwatch.Stop();

                var statusCode = context.Response.StatusCode;
                var elapsedMs = stopwatch.ElapsedMilliseconds;

                if (statusCode >= 500)
                {
                    _logger.LogError("HTTP {Method} {Path} failed with {StatusCode} in {ElapsedMs}ms", method, path, statusCode, elapsedMs);
                }
                else if (statusCode >= 400)
                {
                    _logger.LogWarning("HTTP {Method} {Path} responded with {StatusCode} in {ElapsedMs}ms", method, path, statusCode, elapsedMs);
                }
                else
                {
                    _logger.LogInformation("HTTP {Method} {Path} completed with {StatusCode} in {ElapsedMs}ms", method, path, statusCode, elapsedMs);
                }
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                var elapsedMs = stopwatch.ElapsedMilliseconds;
                _logger.LogError(ex, "HTTP {Method} {Path} unhandled exception after {ElapsedMs}ms: {ErrorMessage}", method, path, elapsedMs, ex.Message);
                throw;
            }
        }
    }
}
