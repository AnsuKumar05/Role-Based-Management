using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Domain.Constants;

namespace HotelManagementSystem.Controllers
{
    [ApiController]
    [Route("api/admin/menu-master")]
    public class MenuMasterController : ControllerBase
    {
        private readonly IMenuMasterService _menuMasterService;
        private readonly ILogger<MenuMasterController> _logger;

        public MenuMasterController(
            IMenuMasterService menuMasterService,
            ILogger<MenuMasterController> logger)
        {
            _menuMasterService = menuMasterService;
            _logger = logger;
        }

        // GET: /api/admin/menu-master
        [HttpGet]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> GetAllMenus()
        {
            try
            {
                var menus = await _menuMasterService.GetAllMenusAsync();
                return Ok(menus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve menus in Menu Master.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: /api/admin/menu-master/{id}
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> GetMenuById(int id)
        {
            try
            {
                var menu = await _menuMasterService.GetMenuByIdAsync(id);
                if (menu == null)
                    return NotFound(new { message = $"Menu with ID {id} not found." });

                return Ok(menu);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve menu #{Id}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: /api/admin/menu-master
        [HttpPost]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> CreateMenu([FromBody] CreateMenuRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Name) || string.IsNullOrWhiteSpace(request?.DisplayName))
            {
                return BadRequest(new { message = "Menu Name and DisplayName are required." });
            }

            try
            {
                var created = await _menuMasterService.CreateMenuAsync(request);
                _logger.LogInformation("Admin created new Menu '{MenuName}' (ID: {Id})", created.Name, created.Id);
                return CreatedAtAction(nameof(GetMenuById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create menu '{MenuName}'", request.Name);
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: /api/admin/menu-master/{id}
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> UpdateMenu(int id, [FromBody] UpdateMenuRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Name) || string.IsNullOrWhiteSpace(request?.DisplayName))
            {
                return BadRequest(new { message = "Menu Name and DisplayName are required." });
            }

            try
            {
                var updated = await _menuMasterService.UpdateMenuAsync(id, request);
                if (updated == null)
                    return NotFound(new { message = $"Menu with ID {id} not found." });

                _logger.LogInformation("Admin updated Menu #{Id} ('{MenuName}')", id, updated.Name);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update menu #{Id}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: /api/admin/menu-master/{id}
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> DeleteMenu(int id)
        {
            try
            {
                bool deleted = await _menuMasterService.DeleteMenuAsync(id);
                if (!deleted)
                    return NotFound(new { message = $"Menu with ID {id} not found." });

                _logger.LogInformation("Admin deactivated Menu #{Id}", id);
                return Ok(new { success = true, message = "Menu deactivated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deactivate menu #{Id}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: /api/admin/menu-master/roles/{roleName}
        [HttpGet("roles/{roleName}")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> GetRoleMenus(string roleName)
        {
            try
            {
                var roleMenus = await _menuMasterService.GetRoleMenusAsync(roleName);
                return Ok(roleMenus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve menus for role '{RoleName}'", roleName);
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: /api/admin/menu-master/roles/{roleName}
        [HttpPut("roles/{roleName}")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> UpdateRoleMenus(string roleName, [FromBody] UpdateRoleMenusRequest request)
        {
            try
            {
                bool success = await _menuMasterService.UpdateRoleMenusAsync(roleName, request?.Menus ?? new List<RoleMenuAssignmentDto>());
                if (!success)
                {
                    return BadRequest(new { message = $"Role '{roleName}' not found or could not be updated." });
                }

                _logger.LogInformation("Admin updated menu permissions for role '{RoleName}' ({Count} items configured)",
                    roleName, request?.Menus?.Count ?? 0);

                return Ok(new
                {
                    success = true,
                    message = $"Menu access for role '{roleName}' updated and cache invalidated successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update menu access for role '{RoleName}'", roleName);
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: /api/admin/menu-master/matrix
        [HttpGet("matrix")]
        [Authorize(Roles = "Admin,Manager,Staff")]
        public async Task<IActionResult> GetRoleMenuMatrix()
        {
            try
            {
                var matrixResponse = await _menuMasterService.GetRoleMenuMatrixAsync();
                return Ok(new { roles = matrixResponse.Roles, allMenus = matrixResponse.AllMenus });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve role-menu matrix.");
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: /api/admin/menu-master/user-menus
        [HttpGet("user-menus")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUserMenus()
        {
            try
            {
                var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value 
                             ?? User.FindFirst("role")?.Value;

                if (string.IsNullOrEmpty(roleClaim))
                {
                    return Ok(new List<MenuDto>());
                }

                var menus = await _menuMasterService.GetUserMenusAsync(roleClaim);
                return Ok(menus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve current user navigation menus.");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
