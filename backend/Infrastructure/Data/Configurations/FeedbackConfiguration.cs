namespace HotelManagementSystem.Infrastructure.Data.Configurations
{
    public class FeedbackConfiguration : IEntityTypeConfiguration<Feedback>
    {
        public void Configure(EntityTypeBuilder<Feedback> builder)
        {
            builder.ToTable("feedbacks");

            builder.HasKey(f => f.Id);

            builder.Property(f => f.Id)
                .HasColumnName("id");

            builder.Property(f => f.UserId)
                .HasColumnName("userid");

            builder.Property(f => f.GuestName)
                .HasColumnName("guestname")
                .HasMaxLength(255);

            builder.Property(f => f.GuestEmail)
                .HasColumnName("guestemail")
                .HasMaxLength(255);

            builder.Property(f => f.RoomRating)
                .HasColumnName("roomrating")
                .HasDefaultValue(5);

            builder.Property(f => f.FoodRating)
                .HasColumnName("foodrating")
                .HasDefaultValue(5);

            builder.Property(f => f.FacilitiesRating)
                .HasColumnName("facilitiesrating")
                .HasDefaultValue(5);

            builder.Property(f => f.ServiceRating)
                .HasColumnName("servicerating")
                .HasDefaultValue(5);

            builder.Property(f => f.AverageRating)
                .HasColumnName("averagerating")
                .HasDefaultValue(5.0);

            builder.Property(f => f.Comments)
                .HasColumnName("comments")
                .HasColumnType("text");

            builder.Property(f => f.CreatedAt)
                .HasColumnName("createdat");

            builder.HasIndex(f => f.CreatedAt);
        }
    }
}
