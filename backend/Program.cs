using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Application.Services;
using HotelManagementSystem.Domain.Constants;
using HotelManagementSystem.Infrastructure.Options;
using HotelManagementSystem.Infrastructure.Data;
using HotelManagementSystem.Infrastructure.Repositories;
using HotelManagementSystem.Infrastructure.Security;
using HotelManagementSystem.Middleware;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// 1. Configure Strongly-Typed Options
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("SmtpSettings"));

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtOptions>() ?? new JwtOptions();

// 2. Add DbContext with PostgreSQL connection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Register Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();
builder.Services.AddScoped<IMenuRepository, MenuRepository>();
builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
builder.Services.AddScoped<IMenuMasterRepository, MenuMasterRepository>();

// 4. Register Business & Security Services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IMenuMasterService, MenuMasterService>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionHandler>();

// 5. Add Controllers
builder.Services.AddControllers();

// 6. Configure Dynamic Policy-Based Authorization for all AppPermissions & Menus
builder.Services.AddAuthorization(options =>
{
    var permissionFields = typeof(AppPermissions).GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy);
    foreach (var field in permissionFields)
    {
        if (field.IsLiteral && !field.IsInitOnly && field.FieldType == typeof(string))
        {
            var permValue = (string)field.GetValue(null)!;
            options.AddPolicy(permValue, policy => policy.Requirements.Add(new PermissionRequirement(permValue)));
        }
    }

    var defaultMenus = new[] { "Dashboard", "Rooms", "Bookings", "Users", "Reports", "Food", "MenuMaster" };
    foreach (var menu in defaultMenus)
    {
        options.AddPolicy($"Menu.{menu}", policy => policy.Requirements.Add(new PermissionRequirement($"Menu.{menu}")));
    }
});

// 7. Add Swagger / OpenAPI Explorer with JWT Bearer Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Ansu Kumar Hotels & Luxury Suites API",
        Version = "v1",
        Description = "Comprehensive RESTful API for Ansu Kumar Hotels & Suites — Clean Architecture, JWT Authentication, and Policy-Based Authorization.",
        Contact = new OpenApiContact
        {
            Name = "Ansu Kumar Hotels Concierge & Engineering",
            Email = "reservations@ansukumarhotels.com"
        }
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token obtained from /api/auth/login or /api/auth/register."
    });

    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        }
    });
});

// 8. Configure Authentication (JWT Bearer as primary scheme + Cookie fallback)
var jwtKeyBytes = Encoding.UTF8.GetBytes(
    !string.IsNullOrWhiteSpace(jwtSettings.Secret) 
        ? jwtSettings.Secret 
        : "AnsuKumarHotels_SuperSecret_Jwt_SigningKey_2026_LuxuryResort#SecurityKey_MustBeLongEnough!"
);

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "JWT_OR_COOKIE";
    options.DefaultChallengeScheme = "JWT_OR_COOKIE";
})
.AddPolicyScheme("JWT_OR_COOKIE", "JWT_OR_COOKIE", options =>
{
    options.ForwardDefaultSelector = context =>
    {
        string authHeader = context.Request.Headers["Authorization"]!;
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return JwtBearerDefaults.AuthenticationScheme;
        }
        return CookieAuthenticationDefaults.AuthenticationScheme;
    };
})
.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.RequireHttpsMetadata = false; // Localhost dev
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(jwtKeyBytes),
        ValidateIssuer = !string.IsNullOrWhiteSpace(jwtSettings.Issuer),
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = !string.IsNullOrWhiteSpace(jwtSettings.Audience),
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnChallenge = context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            return context.Response.WriteAsync("{\"message\":\"Please sign in to confirm your booking.\"}");
        },
        OnForbidden = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            return context.Response.WriteAsync("{\"message\":\"Access denied. You do not have permission for this action.\"}");
        }
    };
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
{
    options.LoginPath = "/login.html";
    options.LogoutPath = "/api/auth/logout";
    options.AccessDeniedPath = "/login.html";
    options.ExpireTimeSpan = TimeSpan.FromHours(2);
    options.Events = new CookieAuthenticationEvents
    {
        OnRedirectToLogin = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                return context.Response.WriteAsync("{\"message\":\"Please sign in to confirm your booking.\"}");
            }
            context.Response.Redirect(context.RedirectUri);
            return Task.CompletedTask;
        },
        OnRedirectToAccessDenied = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                return context.Response.WriteAsync("{\"message\":\"Access denied. You do not have permission for this action.\"}");
            }
            context.Response.Redirect(context.RedirectUri);
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddDistributedMemoryCache();
builder.Services.AddMemoryCache();

builder.Services.AddSession(options => {
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// Enable Swagger and Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ansu Kumar Hotels API v1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "Ansu Kumar Hotels — API Documentation & Swagger UI";
});

// Serve default files (index.html) and static files from wwwroot with fresh cache headers
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        ctx.Context.Response.Headers["Pragma"] = "no-cache";
        ctx.Context.Response.Headers["Expires"] = "0";
    }
});

app.UseRouting();

// Production Request/Response Structured Logging Middleware
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.UseSession();

// Map API Controllers
app.MapControllers();

// SPA Fallback to index.html for client-side routing
app.MapFallbackToFile("index.html");

// Auto-create database, apply schema migrations, and execute modular seeders via DbInitializer
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        DbInitializer.Initialize(dbContext, logger, app.Environment.ContentRootPath);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database initialization failed: {Message}", ex.Message);
    }
}

app.Run();