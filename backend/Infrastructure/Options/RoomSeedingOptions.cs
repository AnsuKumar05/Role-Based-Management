using System.Collections.Generic;

namespace HotelManagementSystem.Infrastructure.Options
{
    public class RoomSeedingOptions
    {
        public List<TopTierSuiteSeedOption> TopTierSuites { get; set; } = new();
        public List<NormalCategorySeedOption> NormalCategories { get; set; } = new();
    }

    public class TopTierSuiteSeedOption
    {
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomType { get; set; } = string.Empty;
        public string SubType { get; set; } = string.Empty;
        public double Price { get; set; }
        public int Capacity { get; set; } = 2;
        public string Description { get; set; } = string.Empty;
        public string Images { get; set; } = string.Empty;
        public string Facility1 { get; set; } = string.Empty;
        public string Facility2 { get; set; } = string.Empty;
        public string Facility3 { get; set; } = string.Empty;
        public string Facility4 { get; set; } = string.Empty;
        public string Facility5 { get; set; } = string.Empty;
    }

    public class NormalCategorySeedOption
    {
        public string CategoryName { get; set; } = string.Empty;
        public int StartRoomNumber { get; set; }
        public int Count { get; set; }
        public double MinPrice { get; set; }
        public double MaxPrice { get; set; }
        public string DefaultImage { get; set; } = string.Empty;
        public List<SubtypeSeedOption> Subtypes { get; set; } = new();
        public List<string> Facility1Options { get; set; } = new();
        public List<string> Facility2Options { get; set; } = new();
        public List<string> Facility3Options { get; set; } = new();
        public List<string> Facility4Options { get; set; } = new();
        public List<string> Facility5Options { get; set; } = new();
    }

    public class SubtypeSeedOption
    {
        public string Name { get; set; } = string.Empty;
        public int Capacity { get; set; } = 2;
        public string Description { get; set; } = string.Empty;
    }
}
