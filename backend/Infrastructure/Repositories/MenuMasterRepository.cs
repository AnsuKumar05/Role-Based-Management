using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Constants;
using HotelManagementSystem.Domain.Entities;
using HotelManagementSystem.Infrastructure.Data;

namespace HotelManagementSystem.Infrastructure.Repositories
{
    public class MenuMasterRepository : IMenuMasterRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(15);

        public MenuMasterRepository(ApplicationDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<List<Menu>> GetAllMenusAsync()
        {
            const string cacheKey = "menu_master_all";
            if (_cache.TryGetValue(cacheKey, out List<Menu> cached))
            {
                return cached;
            }

            var menus = await _context.Menus
                .AsNoTracking()
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.Id)
                .ToListAsync();

            _cache.Set(cacheKey, menus, CacheDuration);
            return menus;
        }

        public async Task<Menu> GetMenuByIdAsync(int id)
        {
            return await _context.Menus.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<Menu> CreateMenuAsync(Menu menu)
        {
            _context.Menus.Add(menu);
            await _context.SaveChangesAsync();

            // By default, grant view access to Admin
            var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name.ToLower() == AppRoles.Admin.ToLower());
            if (adminRole != null)
            {
                _context.RoleMenus.Add(new RoleMenu
                {
                    RoleId = adminRole.RoleId,
                    MenuId = menu.Id,
                    CanView = true
                });
                await _context.SaveChangesAsync();
            }

            InvalidateMenuCache();
            return menu;
        }

        public async Task<Menu> UpdateMenuAsync(int id, Menu menu)
        {
            var existing = await _context.Menus.FirstOrDefaultAsync(m => m.Id == id);
            if (existing == null) return null;

            existing.DisplayName = menu.DisplayName;
            existing.Route = menu.Route;
            existing.Icon = menu.Icon;
            existing.Module = menu.Module;
            existing.DisplayOrder = menu.DisplayOrder;
            existing.IsActive = menu.IsActive;
            existing.ParentId = menu.ParentId;

            await _context.SaveChangesAsync();
            InvalidateMenuCache();
            return existing;
        }

        public async Task<bool> DeleteMenuAsync(int id)
        {
            var existing = await _context.Menus.FirstOrDefaultAsync(m => m.Id == id);
            if (existing == null) return false;

            // Soft-deactivate menu rather than hard cascade deleting to preserve audit history
            existing.IsActive = false;
            await _context.SaveChangesAsync();
            InvalidateMenuCache();
            return true;
        }

        public async Task<List<Menu>> GetMenusByRoleAsync(string roleName)
        {
            if (string.IsNullOrWhiteSpace(roleName))
                return new List<Menu>();

            var trimmedRole = roleName.Trim();
            var cacheKey = $"role_user_menus_{trimmedRole.ToLowerInvariant()}";
            if (_cache.TryGetValue(cacheKey, out List<Menu> cached))
            {
                return cached;
            }

            // Admin has access to all active menus
            if (trimmedRole.Equals(AppRoles.Admin, StringComparison.OrdinalIgnoreCase))
            {
                var allActiveMenus = await _context.Menus
                    .AsNoTracking()
                    .Where(m => m.IsActive)
                    .OrderBy(m => m.DisplayOrder)
                    .ThenBy(m => m.Id)
                    .ToListAsync();

                _cache.Set(cacheKey, allActiveMenus, CacheDuration);
                return allActiveMenus;
            }

            var allowedMenuIds = await _context.RoleMenus
                .AsNoTracking()
                .Where(rm => rm.Role.Name.ToLower() == trimmedRole.ToLower() && rm.CanView)
                .Select(rm => rm.MenuId)
                .ToListAsync();

            var roleMenus = await _context.Menus
                .AsNoTracking()
                .Where(m => m.IsActive && allowedMenuIds.Contains(m.Id))
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.Id)
                .ToListAsync();

            _cache.Set(cacheKey, roleMenus, CacheDuration);
            return roleMenus;
        }

        public async Task<Dictionary<string, List<RoleMenuAssignmentDto>>> GetRoleMenuMatrixAsync()
        {
            const string matrixCacheKey = "menu_master_matrix";
            if (_cache.TryGetValue(matrixCacheKey, out Dictionary<string, List<RoleMenuAssignmentDto>> cachedMatrix))
            {
                return cachedMatrix;
            }

            var roles = await _context.Roles
                .AsNoTracking()
                .ToListAsync();

            var allMenus = await _context.Menus
                .AsNoTracking()
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.Id)
                .ToListAsync();

            var roleMenus = await _context.RoleMenus
                .AsNoTracking()
                .ToListAsync();

            var matrix = new Dictionary<string, List<RoleMenuAssignmentDto>>(StringComparer.OrdinalIgnoreCase);

            foreach (var role in roles)
            {
                var list = new List<RoleMenuAssignmentDto>();
                foreach (var menu in allMenus)
                {
                    bool canView = false;
                    if (role.Name.Equals(AppRoles.Admin, StringComparison.OrdinalIgnoreCase))
                    {
                        canView = true;
                    }
                    else
                    {
                        var mapping = roleMenus.FirstOrDefault(rm => rm.RoleId == role.RoleId && rm.MenuId == menu.Id);
                        canView = mapping?.CanView ?? false;
                    }

                    list.Add(new RoleMenuAssignmentDto
                    {
                        MenuId = menu.Id,
                        MenuName = menu.Name,
                        DisplayName = menu.DisplayName,
                        Module = menu.Module,
                        Route = menu.Route,
                        Icon = menu.Icon,
                        DisplayOrder = menu.DisplayOrder,
                        CanView = canView
                    });
                }
                matrix[role.Name] = list;
            }

            _cache.Set(matrixCacheKey, matrix, CacheDuration);
            return matrix;
        }

        public async Task<bool> UpdateRoleMenusAsync(string roleName, List<RoleMenuAssignmentDto> assignments)
        {
            if (string.IsNullOrWhiteSpace(roleName)) return false;

            var trimmedRole = roleName.Trim();
            var role = await _context.Roles
                .Include(r => r.RoleMenus)
                .FirstOrDefaultAsync(r => r.Name.ToLower() == trimmedRole.ToLower());

            if (role == null) return false;

            var targetAssignments = assignments ?? new List<RoleMenuAssignmentDto>();
            var targetMenuIds = targetAssignments.Select(a => a.MenuId).ToHashSet();

            // 1. Remove obsolete mappings that are no longer in target
            var toRemove = role.RoleMenus.Where(rm => !targetMenuIds.Contains(rm.MenuId)).ToList();
            if (toRemove.Count > 0)
            {
                _context.RoleMenus.RemoveRange(toRemove);
            }

            // 2. Update existing mappings in place or add missing ones without PK tracking collision
            foreach (var assignment in targetAssignments)
            {
                var existing = role.RoleMenus.FirstOrDefault(rm => rm.MenuId == assignment.MenuId);
                if (existing != null)
                {
                    existing.CanView = assignment.CanView;
                }
                else
                {
                    _context.RoleMenus.Add(new RoleMenu
                    {
                        RoleId = role.RoleId,
                        MenuId = assignment.MenuId,
                        CanView = assignment.CanView
                    });
                }
            }

            await _context.SaveChangesAsync();
            InvalidateMenuCache(trimmedRole);
            return true;
        }

        public async Task<bool> HasMenuAccessAsync(string roleName, string moduleOrMenuName)
        {
            if (string.IsNullOrWhiteSpace(roleName) || string.IsNullOrWhiteSpace(moduleOrMenuName))
                return false;

            var trimmedRole = roleName.Trim();
            var trimmedModule = moduleOrMenuName.Trim();

            // Admin always has universal menu access
            if (trimmedRole.Equals(AppRoles.Admin, StringComparison.OrdinalIgnoreCase))
                return true;

            var cacheKey = $"has_menu_access_{trimmedRole.ToLowerInvariant()}_{trimmedModule.ToLowerInvariant()}";
            if (_cache.TryGetValue(cacheKey, out bool cachedResult))
            {
                return cachedResult;
            }

            var hasAccess = await _context.RoleMenus
                .AsNoTracking()
                .AnyAsync(rm =>
                    rm.Role.Name.ToLower() == trimmedRole.ToLower() &&
                    rm.CanView &&
                    rm.Menu.IsActive &&
                    (rm.Menu.Name.ToLower() == trimmedModule.ToLower() ||
                     rm.Menu.Module.ToLower() == trimmedModule.ToLower()));

            _cache.Set(cacheKey, hasAccess, CacheDuration);
            return hasAccess;
        }

        public void InvalidateMenuCache(string roleName = null)
        {
            _cache.Remove("menu_master_all");
            _cache.Remove("menu_master_matrix");

            if (!string.IsNullOrWhiteSpace(roleName))
            {
                var lower = roleName.Trim().ToLowerInvariant();
                _cache.Remove($"role_user_menus_{lower}");
                // Clear common module access keys
                foreach (var mod in new[] { "dashboard", "rooms", "bookings", "users", "reports", "food", "menu", "menumaster", "permissions" })
                {
                    _cache.Remove($"has_menu_access_{lower}_{mod}");
                }
            }
            else
            {
                foreach (var r in new[] { "admin", "manager", "staff", "user" })
                {
                    _cache.Remove($"role_user_menus_{r}");
                    foreach (var mod in new[] { "dashboard", "rooms", "bookings", "users", "reports", "food", "menu", "menumaster", "permissions" })
                    {
                        _cache.Remove($"has_menu_access_{r}_{mod}");
                    }
                }
            }
        }
    }
}
