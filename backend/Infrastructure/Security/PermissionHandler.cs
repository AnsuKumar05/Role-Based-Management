using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Constants;

namespace HotelManagementSystem.Infrastructure.Security
{
    public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IPermissionRepository _permissionRepository;
        private readonly IMenuMasterRepository _menuMasterRepository;

        public PermissionHandler(
            IPermissionRepository permissionRepository,
            IMenuMasterRepository menuMasterRepository)
        {
            _permissionRepository = permissionRepository;
            _menuMasterRepository = menuMasterRepository;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context, 
            PermissionRequirement requirement)
        {
            if (context.User?.Identity == null || !context.User.Identity.IsAuthenticated)
            {
                return;
            }

            var roleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value 
                         ?? context.User.FindFirst("role")?.Value;

            if (string.IsNullOrEmpty(roleClaim))
            {
                return;
            }

            // 1. Administrator has universal security access across all menus and permissions
            if (roleClaim.Equals(AppRoles.Admin, StringComparison.OrdinalIgnoreCase))
            {
                context.Succeed(requirement);
                return;
            }

            var requiredPermission = requirement.Permission?.Trim() ?? string.Empty;

            // 2. Direct Menu Access Policy Check (e.g. "Menu.Rooms", "Menu.Reports", "Menu.Users")
            if (requiredPermission.StartsWith("Menu.", StringComparison.OrdinalIgnoreCase) && 
                !requiredPermission.Equals(AppPermissions.MenuRead, StringComparison.OrdinalIgnoreCase) &&
                !requiredPermission.Equals(AppPermissions.MenuCreate, StringComparison.OrdinalIgnoreCase) &&
                !requiredPermission.Equals(AppPermissions.MenuUpdate, StringComparison.OrdinalIgnoreCase) &&
                !requiredPermission.Equals(AppPermissions.MenuDelete, StringComparison.OrdinalIgnoreCase) &&
                !requiredPermission.Equals(AppPermissions.MenuRestore, StringComparison.OrdinalIgnoreCase) &&
                !requiredPermission.Equals(AppPermissions.MenuUploadMedia, StringComparison.OrdinalIgnoreCase))
            {
                var menuName = requiredPermission.Substring(5);
                bool hasMenu = await _menuMasterRepository.HasMenuAccessAsync(roleClaim, menuName);
                if (hasMenu)
                {
                    context.Succeed(requirement);
                }
                return;
            }

            // 3. For hotel guests (User role): permissions are governed directly by role_permissions (not Admin Menu Master)
            if (roleClaim.Equals(AppRoles.User, StringComparison.OrdinalIgnoreCase))
            {
                bool hasUserPerm = await _permissionRepository.HasPermissionAsync(roleClaim, requiredPermission);
                if (hasUserPerm)
                {
                    context.Succeed(requirement);
                }
                return;
            }

            // 4. Staff / Manager: Module-level Menu Master verification for Granular Permissions
            var associatedModule = ResolveModuleForPermission(requiredPermission);
            if (!string.IsNullOrEmpty(associatedModule))
            {
                bool canAccessModule = await _menuMasterRepository.HasMenuAccessAsync(roleClaim, associatedModule);
                if (!canAccessModule)
                {
                    // Access to this module has been revoked in Menu Master for this role -> Deny (403)
                    return;
                }

                // Menu Master governs access: if granted in Menu Master, succeed requirement
                context.Succeed(requirement);
                return;
            }

            // 5. Granular Permission verification from Database / Cache
            bool hasPermission = await _permissionRepository.HasPermissionAsync(roleClaim, requiredPermission);
            if (hasPermission)
            {
                context.Succeed(requirement);
            }
        }

        private static string ResolveModuleForPermission(string permission)
        {
            if (string.IsNullOrWhiteSpace(permission)) return null;

            if (permission.StartsWith("Room.", StringComparison.OrdinalIgnoreCase) || 
                permission.StartsWith("Rooms.", StringComparison.OrdinalIgnoreCase))
                return "Rooms";

            if (permission.StartsWith("Booking.", StringComparison.OrdinalIgnoreCase) || 
                permission.StartsWith("Bookings.", StringComparison.OrdinalIgnoreCase))
                return "Bookings";

            if (permission.StartsWith("User.", StringComparison.OrdinalIgnoreCase) || 
                permission.StartsWith("Users.", StringComparison.OrdinalIgnoreCase))
                return "Users";

            if (permission.StartsWith("Report.", StringComparison.OrdinalIgnoreCase) || 
                permission.StartsWith("Reports.", StringComparison.OrdinalIgnoreCase))
                return "Reports";

            if (permission.StartsWith("Menu.", StringComparison.OrdinalIgnoreCase))
                return "Menu"; // Gastronomy Menu

            if (permission.StartsWith("Dashboard.", StringComparison.OrdinalIgnoreCase))
                return "Dashboard";

            if (permission.StartsWith("MenuMaster.", StringComparison.OrdinalIgnoreCase))
                return "MenuMaster";

            return null;
        }
    }
}
