namespace HotelManagementSystem.Infrastructure.Data.Configurations
{
    public class MenuConfiguration : IEntityTypeConfiguration<Menu>
    {
        public void Configure(EntityTypeBuilder<Menu> builder)
        {
            builder.ToTable("menus");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(m => m.Name)
                .IsUnique();

            builder.Property(m => m.DisplayName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(m => m.Route)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(m => m.Icon)
                .HasMaxLength(100);

            builder.Property(m => m.Module)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(m => m.DisplayOrder)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(m => m.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasOne(m => m.Parent)
                .WithMany(m => m.SubMenus)
                .HasForeignKey(m => m.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
