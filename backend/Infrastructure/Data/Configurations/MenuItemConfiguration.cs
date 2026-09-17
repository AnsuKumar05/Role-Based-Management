namespace HotelManagementSystem.Infrastructure.Data.Configurations
{
    public class MenuItemConfiguration : IEntityTypeConfiguration<MenuItem>
    {
        public void Configure(EntityTypeBuilder<MenuItem> builder)
        {
            builder.ToTable("menu_items");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.Name)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(m => m.Category)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(m => m.Price)
                .IsRequired();

            builder.Property(m => m.DietType)
                .HasMaxLength(100);

            builder.Property(m => m.Tag)
                .HasMaxLength(100);

            builder.Property(m => m.Description)
                .HasColumnType("text");

            builder.Property(m => m.ImageUrl)
                .HasColumnType("text");

            builder.Property(m => m.IsDeleted)
                .HasDefaultValue(false);

            builder.Property(m => m.CreatedAt);

            builder.HasIndex(m => new { m.IsDeleted, m.Category });
        }
    }
}
