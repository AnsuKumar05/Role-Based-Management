namespace HotelManagementSystem.Domain.Entities
{
    public class RoleMenu
    {
        public int RoleId { get; set; }
        public virtual Role Role { get; set; } = null!;

        public int MenuId { get; set; }
        public virtual Menu Menu { get; set; } = null!;

        public bool CanView { get; set; } = true;
    }
}
