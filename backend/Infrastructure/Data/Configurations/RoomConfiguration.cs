namespace HotelManagementSystem.Infrastructure.Data.Configurations
{
    public class RoomConfiguration : IEntityTypeConfiguration<Room>
    {
        public void Configure(EntityTypeBuilder<Room> builder)
        {
            builder.ToTable("rooms");

            builder.HasKey(r => r.RoomId);

            builder.Property(r => r.RoomNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(r => r.RoomType)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(r => r.SubType)
                .HasMaxLength(255);

            builder.Property(r => r.Price)
                .IsRequired();

            builder.Property(r => r.Capacity)
                .HasDefaultValue(2);

            builder.Property(r => r.Status)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(r => r.Description)
                .HasColumnType("text");

            builder.Property(r => r.Images)
                .HasColumnType("text");

            builder.Property(r => r.Facility1)
                .HasMaxLength(255)
                .HasDefaultValue("High-Speed Wi-Fi 6");

            builder.Property(r => r.Facility2)
                .HasMaxLength(255)
                .HasDefaultValue("55\" 4K Smart TV");

            builder.Property(r => r.Facility3)
                .HasMaxLength(255)
                .HasDefaultValue("Climate Air Conditioning");

            builder.Property(r => r.Facility4)
                .HasMaxLength(255)
                .HasDefaultValue("24/7 Room Service");

            builder.Property(r => r.Facility5)
                .HasMaxLength(255)
                .HasDefaultValue("Valet & Monitored Parking");

            builder.Property(r => r.IsDeleted)
                .ValueGeneratedNever();

            builder.Property(r => r.CreatedAt);

            builder.Property(r => r.UpdatedAt);

            builder.Property(r => r.DeletedAt);

            builder.HasIndex(r => r.RoomNumber)
                .IsUnique();

            builder.HasIndex(r => new { r.IsDeleted, r.Status });
        }
    }
}
