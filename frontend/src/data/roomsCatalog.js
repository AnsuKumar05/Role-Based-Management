// Comprehensive React Rooms Catalog
// Defines all 112 rooms (27 Luxury Suites & 85 Normal Suites) for display and DB persistence

export const TOP_TIER_SUITES = [
  {
    roomNumber: "1",
    roomType: "Executive Suite",
    subType: "Maharaja Presidential Suite",
    price: 18500,
    capacity: 4,
    status: "Available",
    images: "images/rooms/room-1-1.jpg,images/rooms/room-1-2.jpg,images/rooms/room-1-3.jpg,images/rooms/room-1-4.jpg",
    facility1: "Royal Private Heated Plunge Pool",
    facility2: "Dedicated 24/7 Butler & Chauffeur",
    facility3: "Panoramic Nilgiri Foothill Terrace",
    facility4: "Hand-Carved Teak 4-Poster King Bed",
    facility5: "Italian Calacatta Marble Jacuzzi",
    description: "The crown jewel of Ansu Kumar Hotels. 1,400 sq.ft of pure palatial grandeur with panoramic terrace vistas, antique brass chandeliers, personal butler service, and private plunge pool."
  },
  {
    roomNumber: "2",
    roomType: "Executive Suite",
    subType: "Imperial Royal Pavillion Suite",
    price: 16500,
    capacity: 4,
    status: "Available",
    images: "images/rooms/room-2-1.jpg,images/rooms/room-2-2.jpg,images/rooms/room-2-3.jpg,images/rooms/room-2-4.jpg",
    facility1: "Private Heated Infinity Plunge Pool",
    facility2: "Dedicated 24/7 Butler Service",
    facility3: "Terrace Garden with Daybed",
    facility4: "Bespoke Silk Drapery & Furnishings",
    facility5: "Dual Rain Showers & Soaking Tub",
    description: "Inspired by Rajasthani royal retreats, this 1,250 sq.ft pavilion features intricate jharokha lattice balconies, private open-air plunge pool, and panoramic garden views."
  },
  {
    roomNumber: "3",
    roomType: "Executive Suite",
    subType: "Kohinoor Grand Diamond Suite",
    price: 15500,
    capacity: 4,
    status: "Available",
    images: "images/rooms/room-3-1.jpg,images/rooms/room-3-2.jpg,images/rooms/room-3-3.jpg,images/rooms/room-3-4.jpg",
    facility1: "24-Karat Gold Accented Fixtures",
    facility2: "Private Wine & Champagne Cellar",
    facility3: "Dual Steam & Aromatherapy Shower",
    facility4: "Master King with 800-TC Egyptian Linens",
    facility5: "Private Dining Room for 6 Guests",
    description: "Named after the legendary gem, the Kohinoor Suite exudes understated brilliance with crystal lighting, hand-woven Kashmiri carpets, private dining hall, and sunset vistas."
  },
  {
    roomNumber: "4",
    roomType: "Executive Suite",
    subType: "Nawab Heritage Penthouse",
    price: 14500,
    capacity: 4,
    status: "Available",
    images: "images/rooms/room-4-1.jpg,images/rooms/room-4-2.jpg,images/rooms/room-4-3.jpg,images/rooms/room-4-4.jpg",
    facility1: "Private Skyline Observation Deck",
    facility2: "Dedicated Concierge & Butler",
    facility3: "Open-Air Hot Tub under Pergola",
    facility4: "Solid Rosewood Study & Library",
    facility5: "Bang & Olufsen Spatial Audio",
    description: "Occupying the top corner of the hotel tower, this penthouse offers 360-degree vistas across Coimbatore and the Western Ghats, complete with an open-air hot tub."
  },
  {
    roomNumber: "5",
    roomType: "Executive Suite",
    subType: "Viceroy Colonial Governor Suite",
    price: 13500,
    capacity: 4,
    status: "Available",
    images: "images/rooms/room-5-1.jpg,images/rooms/room-5-2.jpg,images/rooms/room-5-3.jpg,images/rooms/room-5-4.jpg",
    facility1: "Colonial Teakwood Veranda",
    facility2: "Freestanding Cast Iron Clawfoot Tub",
    facility3: "Artisanal Ceylon Tea Corner",
    facility4: "Handcrafted Writing Bureau",
    facility5: "Club Lounge Evening Canapés",
    description: "A tribute to early 20th-century classical architecture. High teak ceilings, arched corridors, brass ceiling fans, and vintage leather Chesterfield sofas."
  },
  {
    roomNumber: "6",
    roomType: "Executive Suite",
    subType: "Nilgiri Mist Valley Sanctuary",
    price: 13000,
    capacity: 3,
    status: "Available",
    images: "images/rooms/room-6-1.jpg,images/rooms/room-6-2.jpg,images/rooms/room-6-3.jpg,images/rooms/room-6-4.jpg",
    facility1: "Panoramic Mist Valley Balcony",
    facility2: "Fireplace with Hand-Cut Granite Mantle",
    facility3: "Botanical Herbal Steam En-Suite",
    facility4: "Hand-Spun Alpaca Throw Blankets",
    facility5: "Early Morning Tea & Pastry Service",
    description: "Perched high with undisturbed views of the blue mist rolling off the Western Ghats, featuring a warm granite fireplace, indoor botanical daybed, and heated stone floors."
  },
  {
    roomNumber: "7",
    roomType: "Executive Suite",
    subType: "Peacock Emerald Courtyard Suite",
    price: 12500,
    capacity: 3,
    status: "Available",
    images: "images/rooms/room-7-1.jpg,images/rooms/room-7-2.jpg,images/rooms/room-7-3.jpg,images/rooms/room-7-4.jpg",
    facility1: "Private Courtyard with Water Fountain",
    facility2: "Hand-Painted Fresco Ceilings",
    facility3: "Green Onyx Clad Bathroom",
    facility4: "Bespoke Velvet Divan Seating",
    facility5: "Complimentary Airport Mercedes Transfer",
    description: "Decorated in jewel tones of peacock teal and emerald green, this suite opens into an enchanting inner courtyard scented with jasmine and night-blooming frangipani."
  },
  {
    roomNumber: "8",
    roomType: "Executive Suite",
    subType: "Lotus Temple Water Pavilion Suite",
    price: 12000,
    capacity: 3,
    status: "Available",
    images: "images/rooms/room-8-1.jpg,images/rooms/room-8-2.jpg,images/rooms/room-8-3.jpg,images/rooms/room-8-4.jpg",
    facility1: "Suspended Deck Over Lily Pond",
    facility2: "Sunken Terrazzo Soaking Tub",
    facility3: "Zen Meditation & Yoga Corner",
    facility4: "Outdoor Rain Shower with Bamboo Screen",
    facility5: "Personalized Ayurvedic Bath Salts",
    description: "Built gently over the resort's tranquil lotus pond, this suite offers a sunken terrazzo tub looking onto water lilies, private yoga deck, and natural water fountain sounds."
  },
  {
    roomNumber: "9",
    roomType: "Executive Suite",
    subType: "Royal Malabar Sunset Penthouse",
    price: 11500,
    capacity: 3,
    status: "Available",
    images: "images/rooms/room-9-1.jpg,images/rooms/room-9-2.jpg,images/rooms/room-9-3.jpg,images/rooms/room-9-4.jpg",
    facility1: "West-Facing Sunset Panoramic Deck",
    facility2: "Private Sundowner Cocktail Station",
    facility3: "Walk-In Dressing Room with Vanity",
    facility4: "Smart Ambient Mood Lighting",
    facility5: "Pillow Menu with 7 Bespoke Choices",
    description: "Oriented due west to capture golden hour sunsets over the mountain ridgeline, with floor-to-ceiling glass, expansive teak deck, and private cocktail bar."
  },
  {
    roomNumber: "10",
    roomType: "Premium Room",
    subType: "Chola Dynasty Heritage Suite",
    price: 11000,
    capacity: 3,
    status: "Available",
    images: "images/rooms/room-10-1.jpg,images/rooms/room-10-2.jpg,images/rooms/room-10-3.jpg,images/rooms/room-10-4.jpg",
    facility1: "Hand-Carved Stone Temple Pillars",
    facility2: "Brass Water Vessels & Urli Décor",
    facility3: "Spacious Dressing Room with Safe",
    facility4: "Deep Oval Soaking Tub",
    facility5: "Traditional South Indian Welcome Thali",
    description: "Drawing inspiration from classical Dravidian temple craftsmanship, featuring carved stone pillars, rich bronze artifacts, and artisanal timber furniture."
  },
  {
    roomNumber: "11",
    roomType: "Premium Room",
    subType: "Sandalwood Botanical Garden Haven",
    price: 10500,
    capacity: 3,
    status: "Available",
    images: "images/rooms/room-11-1.jpg,images/rooms/room-11-2.jpg,images/rooms/room-11-3.jpg,images/rooms/room-11-4.jpg",
    facility1: "Direct Garden Access via French Doors",
    facility2: "Outdoor Teak Daybed Under Trellis",
    facility3: "Pure Mysore Sandalwood Toiletries",
    facility4: "Botanical Tea Tasting Hamper",
    facility5: "Heated Marble Floors in Bathroom",
    description: "Surrounded by centuries-old neem, sandalwood, and flowering bougainvillea trees. Step out from French doors directly into peaceful landscaped gardens."
  },
  {
    roomNumber: "12",
    roomType: "Premium Room",
    subType: "Amber Palace Shish Mahal Suite",
    price: 10000,
    capacity: 3,
    status: "Available",
    images: "images/rooms/room-12-1.jpg,images/rooms/room-12-2.jpg,images/rooms/room-12-3.jpg,images/rooms/room-12-4.jpg",
    facility1: "Thikri Convex Glass Inlay Art",
    facility2: "Regal Velvet Chaise Lounge",
    facility3: "Oversized Rain & Cascade Shower",
    facility4: "Complimentary High-Tea Experience",
    facility5: "Bespoke Royal Incense Ritual",
    description: "Showcasing authentic Thikri mirror inlay craftsmanship that shimmers under candle lanterns, paired with plush velvet seating and regal crimson textiles."
  },
  {
    roomNumber: "13",
    roomType: "Premium Room",
    subType: "Mughal Garden Oasis Suite",
    price: 9500,
    capacity: 3,
    status: "Available",
    images: "images/rooms/room-13-1.jpg,images/rooms/room-13-2.jpg,images/rooms/room-13-3.jpg,images/rooms/room-13-4.jpg",
    facility1: "Private Scented Rose Water Garden",
    facility2: "Carved White Makrana Marble Basin",
    facility3: "Hand-Block Printed Silk Linens",
    facility4: "Complimentary Chef's Evening Amuse",
    facility5: "Bluetooth Marshall Heritage Speaker",
    description: "Reflecting symmetrical Charbagh garden aesthetics with private scented rose bushes, flowing water channels, and pristine white marble accents."
  },
  {
    roomNumber: "14",
    roomType: "Premium Room",
    subType: "Zafraan Saffron Sunset Chamber",
    price: 9000,
    capacity: 3,
    status: "Available",
    images: "images/rooms/room-14-1.jpg,images/rooms/room-14-2.jpg,images/rooms/room-14-3.jpg,images/rooms/room-14-4.jpg",
    facility1: "West-Facing Golden Hour Balcony",
    facility2: "Kashmiri Walnut Wood Furnishings",
    facility3: "Saffron Kahwa Service on Request",
    facility4: "Double Rain Shower Enclosure",
    facility5: "Express Check-In & Check-Out",
    description: "Infused with rich saffron hues and warm walnut woodwork. Ideal for sunset enthusiasts with an open viewing balcony and evening tea ceremony."
  },
  {
    roomNumber: "15",
    roomType: "Premium Room",
    subType: "Royal Tanjore Artistry Suite",
    price: 8800,
    capacity: 3,
    status: "Available",
    images: "images/rooms/room-15-1.jpg,images/rooms/room-15-2.jpg,images/rooms/room-15-3.jpg,images/rooms/room-15-4.jpg",
    facility1: "Museum-Quality Tanjore Gold Foil Art",
    facility2: "Handcrafted Rosewood Poster Bed",
    facility3: "Deep Soak Marble Tub with Garden View",
    facility4: "Artisan Coffee Bar with French Press",
    facility5: "Nightly Gourmet Turndown Service",
    description: "Curated with authentic museum-quality 22-karat gold leaf Tanjore paintings, antique brass lamps, and plush silk furnishings."
  },
  {
    roomNumber: "16",
    roomType: "Premium Room",
    subType: "Kashmir Pashmina Luxury Chamber",
    price: 8500,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-16-1.jpg,images/rooms/room-16-2.jpg,images/rooms/room-16-3.jpg,images/rooms/room-16-4.jpg",
    facility1: "Authentic Cashmere Throws & Cushions",
    facility2: "Quiet Courtyard Garden Orientation",
    facility3: "Dimmable Architectural Halo Lighting",
    facility4: "Customized Memory Foam Pillow Bar",
    facility5: "Complimentary Daily Laundry Service",
    description: "Soft tactile textures, fine cashmere throws, and calm neutral tones create an oasis of restorative serenity and restful slumber."
  },
  {
    roomNumber: "17",
    roomType: "Premium Room",
    subType: "Ooty Tea Plantation Suite",
    price: 8200,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-17-1.jpg,images/rooms/room-17-2.jpg,images/rooms/room-17-3.jpg,images/rooms/room-17-4.jpg",
    facility1: "Spacious Planter's Cane Veranda",
    facility2: "Antique Brass Tea Bar with Kettle",
    facility3: "Fresh Floral Delivery Every Morning",
    facility4: "Oversized Rain Shower with Bench",
    facility5: "Complimentary High-Speed Wi-Fi 6",
    description: "Reminiscent of a high-altitude tea estate bungalow. Enjoy morning estate teas from cane plantation chairs overlooking rolling green grounds."
  },
  {
    roomNumber: "18",
    roomType: "Premium Room",
    subType: "Serene Jasmine Courtyard Bower",
    price: 8000,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-18-1.jpg,images/rooms/room-18-2.jpg,images/rooms/room-18-3.jpg,images/rooms/room-18-4.jpg",
    facility1: "Private Fragrant Jasmine Trellis",
    facility2: "Handmade Terracotta Tile Flooring",
    facility3: "Deep Freestanding Stone Bathtub",
    facility4: "Hand-Rolled Organic Incense Selection",
    facility5: "In-Room Gourmet Breakfast Basket",
    description: "A private ground-floor sanctuary wrapped in blooming jasmine vines, where the gentle murmur of courtyard water creates absolute peace."
  },
  {
    roomNumber: "19",
    roomType: "Premium Room",
    subType: "Gulmohar Canopy Terrace Suite",
    price: 7800,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-19-1.jpg,images/rooms/room-19-2.jpg,images/rooms/room-19-3.jpg,images/rooms/room-19-4.jpg",
    facility1: "Terrace Tucked in Scarlet Tree Blooms",
    facility2: "Outdoor Lounge Chairs & Table",
    facility3: "Spacious En-Suite with Double Vanity",
    facility4: "Smart Mirror with Weather & Time",
    facility5: "Complimentary Afternoon Refreshments",
    description: "Tucked directly into the vibrant scarlet canopy of flowering Gulmohar trees, offering private balcony seating immersed in nature."
  },
  {
    roomNumber: "20",
    roomType: "Deluxe Room",
    subType: "Mysore Teakwood Royal Haven",
    price: 7500,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-20-1.jpg,images/rooms/room-20-2.jpg,images/rooms/room-20-3.jpg,images/rooms/room-20-4.jpg",
    facility1: "Solid Mysore Teakwood Paneling",
    facility2: "Hand-Knotted Silk & Wool Rugs",
    facility3: "Marble Bathroom with Rain Shower",
    facility4: "Artisan Tea & Coffee Station",
    facility5: "24/7 Room Service & Valet",
    description: "Warm golden tones of solid Mysore teakwood create a soothing cocoon of luxury, paired with Italian marble and bespoke brass hardware."
  },
  {
    roomNumber: "21",
    roomType: "Deluxe Room",
    subType: "Coromandel Silk Corner Studio",
    price: 7200,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-21-1.jpg,images/rooms/room-21-2.jpg,images/rooms/room-21-3.jpg,images/rooms/room-21-4.jpg",
    facility1: "Dual-Aspect Corner Windows",
    facility2: "Handloom Raw Silk Wall Coverings",
    facility3: "Plush Reading Chaise with Task Light",
    facility4: "Soundproof Triple-Glazed Glazing",
    facility5: "Complimentary High-Speed Wi-Fi 6",
    description: "Bright dual-aspect corner suite bathed in gentle natural morning light, accented by authentic handloom Coromandel raw silk."
  },
  {
    roomNumber: "22",
    roomType: "Deluxe Room",
    subType: "Marwar Crimson Heritage Bower",
    price: 6900,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-22-1.jpg,images/rooms/room-22-2.jpg,images/rooms/room-22-3.jpg,images/rooms/room-22-4.jpg",
    facility1: "Deep Marwar Crimson Fabric Accents",
    facility2: "Hand-Carved Stone Wall Niches",
    facility3: "Walk-In Glass Enclosed Shower",
    facility4: "Electronic In-Room Laptop Safe",
    facility5: "Daily Turndown Treat by Pastry Chef",
    description: "Infused with the bold romance of Marwar desert royalty, rich crimson textiles, hand-carved stone niches, and warm amber ambient lighting."
  },
  {
    roomNumber: "23",
    roomType: "Deluxe Room",
    subType: "Chettinad Teak Architectural Studio",
    price: 6600,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-23-1.jpg,images/rooms/room-23-2.jpg,images/rooms/room-23-3.jpg,images/rooms/room-23-4.jpg",
    facility1: "Authentic Chettinad Teak Pillars",
    facility2: "Athangudi Geometric Floor Tiles",
    facility3: "Open Plan Heritage Dressing Area",
    facility4: "Custom Brass Ceiling Fan",
    facility5: "Complimentary South Indian Filter Coffee",
    description: "Features genuine antique Chettinad carved timber pillars, heritage Athangudi tiles, and spacious layout celebrating Tamil Nadu's architectural pinnacle."
  },
  {
    roomNumber: "24",
    roomType: "Deluxe Room",
    subType: "Deccan Plateau Sunset Studio",
    price: 6300,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-24-1.jpg,images/rooms/room-24-2.jpg,images/rooms/room-24-3.jpg,images/rooms/room-24-4.jpg",
    facility1: "West-Facing Golden Hour Window Nook",
    facility2: "Comfortable Velvet Armchairs",
    facility3: "Modern En-Suite with Rainfall Shower",
    facility4: "55\" 4K Smart Entertainment System",
    facility5: "Express Laundry & Dry Cleaning",
    description: "Warm natural earth tones and panoramic western window view, perfectly appointed for business travelers or couples seeking stylish comfort."
  },
  {
    roomNumber: "25",
    roomType: "Deluxe Room",
    subType: "Emerald Western Ghats Retreat",
    price: 5900,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-25-1.jpg,images/rooms/room-25-2.jpg,images/rooms/room-25-3.jpg,images/rooms/room-25-4.jpg",
    facility1: "Unobstructed Western Ghats Vista",
    facility2: "Plush King Bed with Duvet",
    facility3: "Natural Herbal Botanical Toiletries",
    facility4: "Work Desk with Universal USB Hub",
    facility5: "Complimentary Parking & Valet",
    description: "Framed by picturesque views of the lush green mountain slopes, featuring soft emerald fabrics and tranquil acoustic insulation."
  },
  {
    roomNumber: "26",
    roomType: "Deluxe Room",
    subType: "Narmada Riverstone Zen Sanctuary",
    price: 5500,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-26-1.jpg,images/rooms/room-26-2.jpg,images/rooms/room-26-3.jpg,images/rooms/room-26-4.jpg",
    facility1: "Polished Narmada Pebble Shower Floor",
    facility2: "Natural Bamboo & Linen Accents",
    facility3: "Japanese-Inspired Low Platform Bed",
    facility4: "Dimmable Ambient Sconce Lights",
    facility5: "Selection of Herbal Infusion Teas",
    description: "Designed around organic river stone elements, tactile smooth pebbles, and unadorned teakwood for mindful stillness and relaxation."
  },
  {
    roomNumber: "27",
    roomType: "Deluxe Room",
    subType: "Vedic Tranquility Courtyard Room",
    price: 5100,
    capacity: 2,
    status: "Available",
    images: "images/rooms/room-27-1.jpg,images/rooms/room-27-2.jpg,images/rooms/room-27-3.jpg,images/rooms/room-27-4.jpg",
    facility1: "Peaceful Internal Courtyard Outlook",
    facility2: "Copper Water Carafe & Glasses",
    facility3: "Bespoke Aromatherapy Essential Oils",
    facility4: "Rainfall Shower with Thermostatic Valve",
    facility5: "Complimentary Bottled Spring Water",
    description: "Harmonized to classical Vastu principles, promoting calm, balanced energy, restorative rest, and natural morning light."
  }
];

// Helper to generate the remaining 85 suites across the 3 normal categories (total 112 rooms)
export function getGeneratedNormalSuites() {
  const suites = [];

  // Deluxe Rooms: 28 to 72 (45 rooms)
  for (let num = 28; num <= 72; num++) {
    suites.push({
      roomNumber: String(num),
      roomType: "Deluxe Room",
      subType: `Deluxe Courtyard Sanctuary (Unit ${num})`,
      price: 2400,
      capacity: 2,
      status: "Available",
      images: "images/rooms/room-101-1.jpg,images/rooms/room-101-2.jpg,images/rooms/room-101-3.jpg,images/rooms/room-101-4.jpg",
      facility1: "High-Speed Wi-Fi 6",
      facility2: "55\" 4K Smart TV",
      facility3: "Climate Air Conditioning",
      facility4: "24/7 Room Service",
      facility5: "Valet & Monitored Parking",
      description: "Warm teakwood paneling with plush King bedding, Calacatta marble rain shower, tea nook, and courtyard garden orientation."
    });
  }

  // Premium Rooms: 73 to 92 (20 rooms)
  for (let num = 73; num <= 92; num++) {
    suites.push({
      roomNumber: String(num),
      roomType: "Premium Room",
      subType: `Premium Royal Garden Suite (Unit ${num})`,
      price: 3600,
      capacity: 3,
      status: "Available",
      images: "images/rooms/room-201-1.jpg,images/rooms/room-201-2.jpg,images/rooms/room-201-3.jpg,images/rooms/room-201-4.jpg",
      facility1: "High-Speed Wi-Fi 6",
      facility2: "65\" OLED 4K TV",
      facility3: "Deep Soaking Marble Tub",
      facility4: "24/7 Room Service",
      facility5: "Private Garden Balcony",
      description: "Sun-drenched luxury overlooking the resort gardens with a freestanding soaking tub, California King bedding, and private botanical terrace."
    });
  }

  // Executive Suites: 93 to 112 (20 rooms)
  for (let num = 93; num <= 112; num++) {
    suites.push({
      roomNumber: String(num),
      roomType: "Executive Suite",
      subType: `Executive Skyline Tower Penthouse (Unit ${num})`,
      price: 4800,
      capacity: 4,
      status: "Available",
      images: "images/rooms/room-301-1.jpg,images/rooms/room-301-2.jpg,images/rooms/room-301-3.jpg,images/rooms/room-301-4.jpg",
      facility1: "High-Speed Wi-Fi 6",
      facility2: "70\" 4K Smart TV",
      facility3: "Club Lounge Access",
      facility4: "Dedicated Butler Service",
      facility5: "Panoramic Observation Deck",
      description: "Elevated sophistication featuring expansive skyline views, dedicated executive mahogany workstation, noir granite jacuzzi, and club privileges."
    });
  }

  return suites;
}

// Complete 112 Room Catalog for React
export function getRoomsCatalog() {
  return [...TOP_TIER_SUITES, ...getGeneratedNormalSuites()];
}

// Sync helper: stores React catalog into backend PostgreSQL database
export async function syncRoomsToDb(roomsList = null) {
  const rooms = roomsList || getRoomsCatalog();
  try {
    const res = await fetch('/api/rooms/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rooms)
    });
    if (res.ok) {
      const data = await res.json();
      console.log('Rooms synchronized to PostgreSQL database successfully:', data);
      return { success: true, data };
    } else {
      const err = await res.text();
      console.warn('Room sync response was not OK:', err);
      return { success: false, error: err };
    }
  } catch (err) {
    console.error('Failed to sync rooms to database:', err);
    return { success: false, error: err.message };
  }
}
