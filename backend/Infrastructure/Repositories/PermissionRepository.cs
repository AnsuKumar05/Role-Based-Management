using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Constants;
using HotelManagementSystem.Domain.Entities;
using HotelManagementSystem.Infrastructure.Data;

namespace HotelManagementSystem.Infrastructure.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(15);

        public PermissionRepository(ApplicationDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<List<string>> GetPermissionsByRoleAsync(string roleName)
        {
            if (string.IsNullOrWhiteSpace(roleName))
                return new List<string>();

            var trimmedRole = roleName.Trim();
            var cacheKey = $"role_permissions_{trimmedRole.ToLowerInvariant()}";

            if (_cache.TryGetValue(cacheKey, out List<string> cachedPermissions))
            {
                return cachedPermissions;
            }

            // Admin always has all permissions
            if (trimmedRole.Equals(AppRoles.Admin, StringComparison.OrdinalIgnoreCase))
            {
                var allPermissions = await _context.Permissions
                    .AsNoTracking()
                    .Select(p => p.Name)
                    .ToListAsync();

                _cache.Set(cacheKey, allPermissions, CacheDuration);
                return allPermissions;
            }

            var permissions = await _context.RolePermissions
                .AsNoTracking()
                .Where(rp => rp.Role.Name.ToLower() == trimmedRole.ToLower())
                .Select(rp => rp.Permission.Name)
                .ToListAsync();

            _cache.Set(cacheKey, permissions, CacheDuration);
            return permissions;
        }

        public async Task<bool> HasPermissionAsync(string roleName, string permissionName)
        {
            if (string.IsNullOrWhiteSpace(roleName) || string.IsNullOrWhiteSpace(permissionName))
                return false;

            // Admin has unconditional access to all permissions
            if (roleName.Equals(AppRoles.Admin, StringComparison.OrdinalIgnoreCase))
                return true;

            var permissions = await GetPermissionsByRoleAsync(roleName);
            return permissions.Contains(permissionName, StringComparer.OrdinalIgnoreCase);
        }

        public async Task<List<Role>> GetAllRolesWithPermissionsAsync()
        {
            return await _context.Roles
                .AsNoTracking()
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .ToListAsync();
        }

        public async Task<List<Permission>> GetAllPermissionsAsync()
        {
            const string cacheKey = "all_permissions";
            if (_cache.TryGetValue(cacheKey, out List<Permission> cached))
            {
                return cached;
            }

            var perms = await _context.Permissions
                .AsNoTracking()
                .OrderBy(p => p.Category)
                .ThenBy(p => p.Name)
                .ToListAsync();

            _cache.Set(cacheKey, perms, CacheDuration);
            return perms;
        }

        public async Task<Dictionary<string, List<string>>> GetRolePermissionMatrixAsync()
        {
            const string matrixCacheKey = "role_permission_matrix";
            if (_cache.TryGetValue(matrixCacheKey, out Dictionary<string, List<string>> cachedMatrix))
            {
                return cachedMatrix;
            }

            var roles = await _context.Roles
                .AsNoTracking()
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .ToListAsync();

            var matrix = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);
            var allPermissionNames = await _context.Permissions
                .AsNoTracking()
                .Select(p => p.Name)
                .ToListAsync();

            foreach (var role in roles)
            {
                if (role.Name.Equals(AppRoles.Admin, StringComparison.OrdinalIgnoreCase))
                {
                    matrix[role.Name] = allPermissionNames;
                }
                else
                {
                    matrix[role.Name] = role.RolePermissions
                        .Where(rp => rp.Permission != null)
                        .Select(rp => rp.Permission.Name)
                        .ToList();
                }
            }

            _cache.Set(matrixCacheKey, matrix, CacheDuration);
            return matrix;
        }

        public async Task<bool> UpdateRolePermissionsAsync(string roleName, List<string> permissionNames)
        {
            if (string.IsNullOrWhiteSpace(roleName))
                return false;

            var trimmedRole = roleName.Trim();
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.Name.ToLower() == trimmedRole.ToLower());

            if (role == null)
                return false;

            // If Admin, permissions are already universally granted, but we still allow syncing
            var targetPermissionNames = permissionNames ?? new List<string>();
            var targetPermissions = await _context.Permissions
                .Where(p => targetPermissionNames.Contains(p.Name))
                .ToListAsync();

            var targetPermissionIds = targetPermissions.Select(p => p.PermissionId).ToHashSet();
            var toRemove = role.RolePermissions.Where(rp => !targetPermissionIds.Contains(rp.PermissionId)).ToList();
            if (toRemove.Count > 0)
            {
                _context.RolePermissions.RemoveRange(toRemove);
            }

            var existingPermissionIds = role.RolePermissions.Select(rp => rp.PermissionId).ToHashSet();
            foreach (var perm in targetPermissions)
            {
                if (!existingPermissionIds.Contains(perm.PermissionId))
                {
                    _context.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.RoleId,
                        PermissionId = perm.PermissionId
                    });
                }
            }

            await _context.SaveChangesAsync();
            InvalidatePermissionCache(trimmedRole);
            return true;
        }

        public void InvalidatePermissionCache(string roleName = null)
        {
            _cache.Remove("role_permission_matrix");
            _cache.Remove("all_permissions");

            if (!string.IsNullOrWhiteSpace(roleName))
            {
                _cache.Remove($"role_permissions_{roleName.Trim().ToLowerInvariant()}");
            }
            else
            {
                _cache.Remove($"role_permissions_admin");
                _cache.Remove($"role_permissions_manager");
                _cache.Remove($"role_permissions_staff");
                _cache.Remove($"role_permissions_user");
            }
        }
    }
}
