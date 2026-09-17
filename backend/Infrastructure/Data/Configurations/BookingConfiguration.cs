namespace HotelManagementSystem.Infrastructure.Data.Configurations
{
    public class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.ToTable("bookings");

            builder.HasKey(b => b.BookingId);

            builder.Property(b => b.GuestName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(b => b.CheckIn)
                .IsRequired();

            builder.Property(b => b.CheckOut)
                .IsRequired();

            builder.Property(b => b.NumberOfGuests)
                .IsRequired();

            builder.Property(b => b.TotalAmount)
                .IsRequired();

            builder.Property(b => b.BookingStatus)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            builder.Property(b => b.Package)
                .HasMaxLength(100)
                .HasDefaultValue("Stay");

            builder.Property(b => b.PaymentStatus)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            builder.Property(b => b.TransactionId)
                .HasMaxLength(255);

            builder.Property(b => b.CreatedAt);

            builder.Property(b => b.UpdatedAt);

            // Relationships
            builder.HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Room)
                .WithMany()
                .HasForeignKey(b => b.RoomId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            builder.HasIndex(b => b.UserId);
            builder.HasIndex(b => b.RoomId);
            builder.HasIndex(b => b.BookingStatus);
        }
    }
}
