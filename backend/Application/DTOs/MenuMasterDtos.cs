using System.Collections.Generic;

namespace HotelManagementSystem.Application.DTOs
{
    public class MenuDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int? ParentId { get; set; }
        public string Module { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public List<MenuDto> SubMenus { get; set; } = new();
    }

    public class CreateMenuRequest
    {
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int? ParentId { get; set; }
        public string Module { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateMenuRequest
    {
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int? ParentId { get; set; }
        public string Module { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class RoleMenuAssignmentDto
    {
        public int MenuId { get; set; }
        public string MenuName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool CanView { get; set; } = true;
    }

    public class UpdateRoleMenusRequest
    {
        public List<RoleMenuAssignmentDto> Menus { get; set; } = new();
    }

    public class RoleMenuMatrixResponse
    {
        public Dictionary<string, List<RoleMenuAssignmentDto>> Roles { get; set; } = new();
        public List<MenuDto> AllMenus { get; set; } = new();
    }
}
