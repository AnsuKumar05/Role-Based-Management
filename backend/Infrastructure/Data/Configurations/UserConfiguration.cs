namespace HotelManagementSystem.Infrastructure.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("users");

            builder.HasKey(u => u.UserId);

            builder.Property(u => u.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(u => u.PasswordHash)
                .IsRequired();

            builder.Property(u => u.Phone)
                .HasMaxLength(50);

            builder.Property(u => u.Role)
                .HasMaxLength(50)
                .HasDefaultValue("User");

            builder.Property(u => u.IsActive)
                .ValueGeneratedNever();

            builder.Property(u => u.ResetToken)
                .HasMaxLength(255);

            builder.Property(u => u.ResetTokenExpiry);

            builder.Property(u => u.CreatedAt);

            builder.HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}
