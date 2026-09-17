namespace HotelManagementSystem.Infrastructure.Data.Configurations
{
    public class RoleMenuConfiguration : IEntityTypeConfiguration<RoleMenu>
    {
        public void Configure(EntityTypeBuilder<RoleMenu> builder)
        {
            builder.ToTable("role_menus");

            builder.HasKey(rm => new { rm.RoleId, rm.MenuId });

            builder.Property(rm => rm.CanView)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasOne(rm => rm.Role)
                .WithMany(r => r.RoleMenus)
                .HasForeignKey(rm => rm.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(rm => rm.Menu)
                .WithMany(m => m.RoleMenus)
                .HasForeignKey(rm => rm.MenuId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(rm => rm.MenuId);
        }
    }
}
