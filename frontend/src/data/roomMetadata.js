// Dynamic Room Transformation Helpers & Presentation Metadata
// Single Source of Truth: Backend Database (PostgreSQL) via /api/rooms

export const ROOM_TYPE_METADATA = {
  "Deluxe Room": {
    title: "Deluxe Heritage Courtyard Sanctuary",
    roomType: "Deluxe Room",
    subType: "Deluxe Courtyard Sanctuary",
    tagline: "Relax in refined comfort, where every detail is designed for an unforgettable stay.",
    specs: { size: "420 sq.ft (39 m²)", bed: "Plush King Bedding", view: "Courtyard Garden View", capacity: "2 Guests" },
    facilities: ["High-Speed Wi-Fi 6", "55\" 4K Smart TV", "Climate Air Conditioning", "24/7 Room Service", "Valet & Monitored Parking"],
    gallery: [
      { url: "images/rooms/room-101-1.jpg", title: "Deluxe Master Bedroom", caption: "Warm teakwood paneling with Egyptian cotton linens, ambient lighting, and courtyard orientation." },
      { url: "images/rooms/room-101-2.jpg", title: "Calacatta Rain Shower", caption: "Italian marble en-suite bathroom with thermostatic rainfall glass shower and botanical toiletries." },
      { url: "images/rooms/room-101-3.jpg", title: "Reading & Tea Nook", caption: "Comfortable velvet armchair and handcrafted side table for peaceful morning coffee." },
      { url: "images/rooms/room-101-4.jpg", title: "Courtyard Garden Patio", caption: "Sunlit outdoor patio overlooking fragrant jasmine bushes." }
    ],
    fallback: "images/deluxe-room.jpg"
  },
  "Premium Room": {
    title: "Premium Royal Garden Sanctuary",
    roomType: "Premium Room",
    subType: "Premium King Garden Suite",
    tagline: "Sun-drenched luxury overlooking the resort gardens with a freestanding soaking tub and western sunset vistas.",
    specs: { size: "580 sq.ft (54 m²)", bed: "Handcrafted California King", view: "Botanical Garden & Sunset Vistas", capacity: "2-3 Guests" },
    facilities: ["High-Speed Wi-Fi 6", "65\" OLED 4K TV", "Deep Soaking Marble Tub", "24/7 Room Service", "Private Garden Balcony"],
    gallery: [
      { url: "images/rooms/room-201-1.jpg", title: "Premium Master Bedroom", caption: "Sunlit room with floor-to-ceiling glass doors opening onto private botanical terrace." },
      { url: "images/rooms/room-201-2.jpg", title: "Soaking Tub & Spa Bath", caption: "Freestanding oval bathtub with organic essential bath salts." },
      { url: "images/rooms/room-201-3.jpg", title: "Private Botanical Terrace", caption: "Outdoor teak lounge chairs surrounded by lush resort flora." },
      { url: "images/rooms/room-201-4.jpg", title: "Lounge Daybed Corner", caption: "Plush silk daybed with reading lamp and artisanal tea service." }
    ],
    fallback: "images/premium-room.jpg"
  },
  "Executive Suite": {
    title: "Executive Skyline Tower Penthouse",
    roomType: "Executive Suite",
    subType: "Executive Skyline Tower Suite",
    tagline: "Elevated sophistication featuring expansive skyline views, dedicated executive work desk, and club privileges.",
    specs: { size: "820 sq.ft (76 m²)", bed: "Grand Master King Suite", view: "Panoramic Skyline & Mountain Ridge", capacity: "2-4 Guests" },
    facilities: ["High-Speed Wi-Fi 6", "70\" 4K Smart TV", "Club Lounge Access", "Dedicated Butler Service", "Panoramic Observation Deck"],
    gallery: [
      { url: "images/rooms/room-301-1.jpg", title: "Executive Skyline Master Suite", caption: "High-floor suite with expansive glass windows overlooking the city." },
      { url: "images/rooms/room-301-2.jpg", title: "Noir Granite Master Bathroom", caption: "Deep dark marble jacuzzi soaking tub and walk-in rain shower." },
      { url: "images/rooms/room-301-3.jpg", title: "Executive Study & Workstation", caption: "Ergonomic leather chair, solid mahogany desk, and 70-inch 4K TV." },
      { url: "images/rooms/room-301-4.jpg", title: "Panoramic Observation Balcony", caption: "High-altitude private balcony with sunset views and twilight cocktail seating." }
    ],
    fallback: "images/executive-room.jpg"
  }
};

/**
 * Extracts non-empty facilities from a database room entity
 */
export function getRoomFacilities(room) {
  if (!room) return ["High-Speed Wi-Fi 6", "55\" 4K Smart TV", "Climate Air Conditioning", "24/7 Room Service", "Valet Parking"];
  
  const facilities = [];
  for (let i = 1; i <= 5; i++) {
    const f = room[`facility${i}`] || room[`Facility${i}`];
    if (f && typeof f === 'string' && f.trim().length > 0) {
      facilities.push(f.trim());
    }
  }

  return facilities.length > 0
    ? facilities
    : ["High-Speed Wi-Fi 6", "55\" 4K Smart TV", "Climate Air Conditioning", "24/7 Room Service", "Valet Parking"];
}

/**
 * Parses image gallery paths from a database room entity
 */
export function getRoomGallery(room) {
  if (!room) return [];

  const rawImages = room.images || room.Images;
  const roomTitle = room.subType || room.SubType || room.roomType || room.RoomType || 'Luxury Suite';

  if (rawImages && typeof rawImages === 'string' && rawImages.trim().length > 0) {
    const urls = rawImages.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (urls.length > 0) {
      return urls.map((url, idx) => ({
        url: url,
        title: `${roomTitle} — Photo ${idx + 1}`,
        caption: `${roomTitle} (Room ${room.roomNumber || room.RoomNumber || ''}) — Perspective ${idx + 1}`
      }));
    }
  }

  // Fallback to room type default image
  const typeKey = String(room.roomType || room.RoomType || 'Deluxe Room').trim();
  const fallbackMeta = ROOM_TYPE_METADATA[typeKey] || ROOM_TYPE_METADATA["Deluxe Room"];
  return fallbackMeta.gallery;
}

/**
 * Constructs specifications from a database room entity
 */
export function getRoomSpecs(room) {
  if (!room) {
    return { size: "420 sq.ft (39 m²)", bed: "Plush King Bed", view: "Courtyard View", capacity: "2 Guests" };
  }

  const capacity = room.capacity || room.Capacity || 2;
  const roomType = String(room.roomType || room.RoomType || 'Deluxe Room');
  
  let size = "420 sq.ft (39 m²)";
  let bed = "Plush King Bed";
  let view = "Courtyard View";

  if (roomType.includes("Premium")) {
    size = "580 sq.ft (54 m²)";
    bed = "California King";
    view = "Botanical Garden View";
  } else if (roomType.includes("Executive")) {
    size = "820 sq.ft (76 m²)";
    bed = "Grand Master King Suite";
    view = "Panoramic Skyline View";
  }

  return {
    size,
    bed,
    view,
    capacity: `${capacity} Guest${capacity > 1 ? 's' : ''}`
  };
}

/**
 * Returns complete presentation metadata for a room dynamically from the API/database entity
 */
export function getRoomMeta(roomType, roomNumber, roomObj) {
  const typeKey = String(roomType || (roomObj?.roomType || roomObj?.RoomType) || 'Deluxe Room').trim();
  
  // Base metadata template for the category
  const baseMeta = JSON.parse(JSON.stringify(
    ROOM_TYPE_METADATA[typeKey] || 
    ROOM_TYPE_METADATA["Deluxe Room"]
  ));

  if (roomObj) {
    const subTitle = roomObj.subType || roomObj.SubType;
    if (subTitle && String(subTitle).trim().length > 0) {
      baseMeta.subType = subTitle.trim();
      baseMeta.title = subTitle.trim();
    }

    if (roomObj.description || roomObj.Description) {
      baseMeta.tagline = roomObj.description || roomObj.Description;
    }

    baseMeta.facilities = getRoomFacilities(roomObj);
    baseMeta.gallery = getRoomGallery(roomObj);
    baseMeta.specs = getRoomSpecs(roomObj);
    if (baseMeta.gallery.length > 0) {
      baseMeta.fallback = baseMeta.gallery[0].url;
    }
  }

  return baseMeta;
}

export const FOOD_ITEMS_CATALOG = [
  { name: "Paneer Butter Masala", category: "Vegetarian", price: 420, diet: "Veg", image: "images/food/paneer-butter-masala.jpg", tag: "Chef's Special", desc: "Fresh artisan cottage cheese cubes simmered in a slow-cooked ripe tomato and butter gravy with kasoori methi." },
  { name: "Royal Dal Makhani", category: "Vegetarian", price: 380, diet: "Veg", image: "images/food/dal-makhani.jpg", tag: null, desc: "Whole black lentils slow-cooked overnight for 18 hours over charcoal embers with fresh churned white butter and cream." },
  { name: "Subz Dum Biryani", category: "Vegetarian", price: 450, diet: "Veg", image: "images/food/subz-biryani.jpg", tag: "Signature", desc: "Fragrant long-grain aged basmati rice layered with seasonal organic vegetables, Kashmiri saffron, and fresh mint." },
  { name: "Kashmiri Malai Kofta", category: "Vegetarian", price: 460, diet: "Veg", image: "images/food/malai-kofta.jpg", tag: null, desc: "Melt-in-mouth cottage cheese and dried fruit dumplings simmered in a velvety sweet cashew nut gravy." },
  { name: "Steamed Idly & Sambar", category: "Vegetarian", price: 240, diet: "South Heritage", image: "images/food/idly-sambar.jpg", tag: "Breakfast Favorite", desc: "Piping-hot fluffy steamed rice & lentil cakes served with drumstick vegetable sambar, fresh coconut chutney, and spicy tomato dip." },
  { name: "Ghee Roast Masala Dosa", category: "Vegetarian", price: 280, diet: "South Special", image: "images/food/masala-dosa.jpg", tag: null, desc: "Golden crisp fermented rice crepe roasted in pure cow ghee, filled with mustard-tempered spiced potato mash." },
  { name: "Tandoori Paneer Tikka", category: "Vegetarian", price: 410, diet: "Clay Oven", image: "images/food/paneer-tikka.jpg", tag: null, desc: "Charcoal-grilled cottage cheese and bell peppers marinated in hung spiced yogurt and crushed carom seeds." },
  { name: "Palak Paneer Royale", category: "Vegetarian", price: 430, diet: "Veg", image: "images/food/palak-paneer.jpg", tag: null, desc: "Fresh farm spinach puree tempered with garlic, roasted cumin, and soft hand-churned paneer batons." },
  { name: "Classic Butter Chicken", category: "Non-Vegetarian", price: 540, diet: "Non-Veg", image: "images/food/butter-chicken.jpg", tag: "Masterpiece", desc: "Charcoal-smoked tandoori chicken simmered in a silky sun-ripened tomato, cashew nut, and dairy butter makhani gravy." },
  { name: "Hyderabadi Dum Biryani", category: "Non-Vegetarian", price: 580, diet: "Non-Veg", image: "images/food/hyderabadi-biryani.jpg", tag: "Signature", desc: "Succulent farm-fresh chicken marinated in royal spices, slow-cooked under dough seal with saffron-scented basmati rice." },
  { name: "Charcoal Chicken Tikka", category: "Non-Vegetarian", price: 490, diet: "Clay Oven", image: "images/food/chicken-tikka.jpg", tag: null, desc: "Tender boneless chicken morsels steeped overnight in Greek yogurt, Kashmiri deghi chili, and roasted garam masala." },
  { name: "Tandoori Pomfret Fish", category: "Non-Vegetarian", price: 680, diet: "Seafood", image: "images/food/tandoori-fish.jpg", tag: "Coastal Special", desc: "Whole fresh silver pomfret fish marinated in coastal herbs, curry leaves, and lemon, roasted crisp in charcoal tandoor." },
  { name: "Mutton Rogan Josh", category: "Non-Vegetarian", price: 650, diet: "Non-Veg", image: "images/food/rogan-josh.jpg", tag: null, desc: "Slow-braised tender lamb shanks cooked in a rich aromatic gravy flavored with Kashmiri maval petals and fennel." },
  { name: "Chettinad Pepper Chicken", category: "Non-Vegetarian", price: 520, diet: "Non-Veg", image: "images/food/chettinad-chicken.jpg", tag: "Southern Pride", desc: "Authentic fiery Tamil Nadu specialty prepared with fresh roasted black peppercorns, curry leaves, and coconut paste." },
  { name: "Royal Seekh Kebab", category: "Non-Vegetarian", price: 560, diet: "Clay Oven", image: "images/food/seekh-kebab.jpg", tag: null, desc: "Finely minced seasoned lamb skewers infused with fresh mint, coriander, and rose petals, charred over flaming coals." },
  { name: "Malabar Prawn Moilee", category: "Non-Vegetarian", price: 690, diet: "Seafood", image: "images/food/prawn-moilee.jpg", tag: "Coastal Catch", desc: "Fresh Arabian Sea king prawns gently poached in a fragrant coconut milk broth with ginger, green chilies, and curry leaves." },
  { name: "Saffron Shahi Tukda", category: "Desserts & Drinks", price: 320, diet: "Royal Sweet", image: "images/food/shahi-tukda.jpg", tag: "Gold Leaf", desc: "Crispy golden brioche steeped in saffron syrup, layered with thick condensed rabri, pistachio slivers, and 24K silver leaf." },
  { name: "Warm Gulab Jamun & Kulfi", category: "Desserts & Drinks", price: 290, diet: "Royal Sweet", image: "images/food/gulab-jamun.jpg", tag: "Chef's Pairing", desc: "Delicate evaporated milk dumplings infused with green cardamom syrup, paired with artisanal malai pistachio kulfi." },
  { name: "Royal Rose Milk", category: "Desserts & Drinks", price: 220, diet: "Chilled Drink", image: "images/food/rose-milk.jpg", tag: "Refreshing", desc: "Farm-fresh chilled whole milk delicately blended with organic Damask rose petal syrup, basil seeds, and crushed pistachios." },
  { name: "Dark Roast Filter Coffee", category: "Desserts & Drinks", price: 180, diet: "Heritage Brew", image: "images/food/filter-coffee.jpg", tag: "South Pride", desc: "Signature South Indian chicory blend slow-dripped in brass filters, frothed with boiled whole milk in a traditional dabarah." }
];

export function getFoodCatalog() {
  try {
    const saved = localStorage.getItem('hotel_gastronomy_catalog');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading food catalog from localStorage:', e);
  }
  return FOOD_ITEMS_CATALOG;
}

export function saveFoodCatalog(items) {
  try {
    localStorage.setItem('hotel_gastronomy_catalog', JSON.stringify(items));
  } catch (e) {
    console.warn('Error saving food catalog to localStorage:', e);
  }
}

// Sync helper: stores React food catalog into backend PostgreSQL database
export async function syncFoodCatalogToDb(itemsList = null) {
  const items = itemsList || FOOD_ITEMS_CATALOG;
  try {
    const res = await fetch('/api/menu/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(items)
    });
    if (res.ok) {
      const data = await res.json();
      console.log('Food catalog synchronized to PostgreSQL database successfully:', data);
      return { success: true, data };
    } else {
      const err = await res.text();
      console.warn('Food sync response was not OK:', err);
      return { success: false, error: err };
    }
  } catch (err) {
    console.error('Failed to sync food catalog to database:', err);
    return { success: false, error: err.message };
  }
}
