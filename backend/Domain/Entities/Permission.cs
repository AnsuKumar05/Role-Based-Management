using System.Collections.Generic;

namespace HotelManagementSystem.Domain.Entities
{
    public class Permission
    {
        public int PermissionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
