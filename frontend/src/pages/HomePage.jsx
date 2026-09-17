import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer, FloatingRoomGallery } from '../components/common';
import { ROOM_TYPE_METADATA, getFoodCatalog, syncFoodCatalogToDb, getRoomMeta } from '../data/roomMetadata';

export default function HomePage() {
  const [activeMenuTab, setActiveMenuTab] = useState('veg'); // 'veg' | 'nonveg' | 'dessert'
  const [foodCatalog, setFoodCatalog] = useState(() => getFoodCatalog());

  useEffect(() => {
    // Dynamic Fetch from PostgreSQL Database via /api/menu
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map(d => ({
              id: d.id || d.Id,
              name: d.name || d.Name,
              category: d.category || d.Category,
              price: d.price || d.Price,
              diet: d.dietType || d.DietType || 'Veg',
              tag: d.tag || d.Tag,
              desc: d.description || d.Description,
              image: d.imageUrl || d.ImageUrl || 'images/food/paneer-butter-masala.jpg'
            }));
            setFoodCatalog(formatted);
            return;
          } else {
            // If DB is empty, use React catalog to show and immediately store in DB!
            const catalog = getFoodCatalog();
            setFoodCatalog(catalog);
            syncFoodCatalogToDb(catalog);
            return;
          }
        }
      } catch (e) {
        // Fallback to React food catalog if offline
      }
      setFoodCatalog(getFoodCatalog());
    };
    fetchMenu();
  }, []);
  const [galleryState, setGalleryState] = useState({
    isOpen: false,
    photos: [],
    title: '',
    roomId: null,
    price: 0
  });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  const openGalleryForRoom = (roomNumber, roomType, price) => {
    const meta = getRoomMeta(roomType, roomNumber);
    if (meta && meta.gallery) {
      setGalleryState({
        isOpen: true,
        photos: meta.gallery,
        title: (roomNumber ? `Room ${roomNumber} — ` : '') + (meta.subType || meta.title || roomType),
        roomId: null,
        price: price
      });
    }
  };

  const openGalleryForType = (roomType, price) => {
    const meta = ROOM_TYPE_METADATA[roomType] || ROOM_TYPE_METADATA['Deluxe Room'];
    if (meta && meta.gallery) {
      setGalleryState({
        isOpen: true,
        photos: meta.gallery,
        title: meta.title,
        roomId: null,
        price: price
      });
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('Thank you for subscribing to Ansu Kumar Hotels exclusive privileges!');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterStatus(''), 5000);
  };

  const vegDishes = foodCatalog.filter(d => d.category === 'Vegetarian');
  const nonVegDishes = foodCatalog.filter(d => d.category === 'Non-Vegetarian');
  const dessertDishes = foodCatalog.filter(d => d.category === 'Desserts & Drinks' || d.category === 'Desserts' || d.category === 'Beverages');

  return (
    <div>
      <Header />

      {/* Floating Gallery Lightbox */}
      <FloatingRoomGallery
        isOpen={galleryState.isOpen}
        onClose={() => setGalleryState(prev => ({ ...prev, isOpen: false }))}
        photos={galleryState.photos}
        roomTitle={galleryState.title}
        roomId={galleryState.roomId}
        price={galleryState.price}
      />

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-overlay"></div>
        <img
          src="/images/hero-exterior.jpg"
          className="hero-img"
          alt="Ansu Kumar Hotels Luxury Palace Resort Exterior"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80';
          }}
        />
        <div className="hero-content">
          <h1 style={{ color: '#FFF' }}>Ansu Kumar Hotels</h1>
          <div className="hero-tagline">Where Indian Hospitality Meets Modern Comfort</div>
          <p className="hero-desc">
            Experience refined comfort, warm Indian hospitality and thoughtfully designed spaces across 3 distinct room categories for serene stays, royal celebrations and authentic gastronomic journeys.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/rooms" className="btn btn-primary" style={{ padding: '13px 30px', fontSize: '13.5px' }}>
              Explore Rooms & Suites
            </Link>
            <Link to="/rooms" className="btn btn-secondary" style={{ padding: '13px 30px', borderColor: '#FFF', color: '#FFF', fontSize: '13.5px' }}>
              Check Real-Time Availability
            </Link>
          </div>
        </div>
      </main>

      {/* About Section */}
      <section className="section container" id="about">
        <div className="split-layout">
          <div className="split-text">
            <div style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px', marginBottom: '10px' }}>
              Welcome to Ansu Kumar Hotels
            </div>
            <h3>An Indian Stay, Thoughtfully Reimagined</h3>
            <p>
              Nestled in the vibrant heart of Coimbatore, Ansu Kumar Hotels seamlessly marries state-of-the-art modern comforts with the timeless richness of traditional Indian hospitality. From the auspicious traditional welcome upon arrival to our bespoke round-the-clock concierge, every moment is crafted to envelop you in warmth.
            </p>
            <p>
              Our boutique resort architecture is inspired by heritage courtyard layouts, incorporating spacious sunlit spaces, Egyptian cotton linens, Italian marble rainfall showers, and artisanal dining celebrating authentic regional flavours.
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '25px', flexWrap: 'wrap' }}>
              <Link to="/rooms" className="btn btn-primary">
                Discover Suites
              </Link>
              <a
                href="#facilities"
                className="btn btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('facilities')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Amenities
              </a>
            </div>
          </div>
          <div className="split-image">
            <img
              src="/images/about-courtyard.jpg"
              alt="Boutique Indian Hotel Courtyard"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
        </div>
      </section>

      {/* 3 Main Featured Room Categories Showcase */}
      <section className="section section-cream" id="rooms">
        <div className="container">
          <div className="section-header">
            <div style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1.5px', marginBottom: '8px' }}>
              Sanctuaries of Rest
            </div>
            <h2>
              3 Luxury Room <span>Categories</span>
            </h2>
            <p>
              Indulge in spaces designed for quiet luxury, curated with bespoke teakwood details, Egyptian cotton linens, Italian marble bathrooms, and 5 included luxury facilities.
            </p>
          </div>

          <div className="room-grid">
            {/* 1. Deluxe Room */}
            <div className="room-card luxury-room-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div
                className="room-img-container"
                onClick={() => openGalleryForRoom('101', 'Deluxe Room', 4500)}
                style={{ cursor: 'pointer' }}
                title="Click to view 4 unique photos"
              >
                <img
                  src="/images/deluxe-room.jpg"
                  alt="Deluxe Room Sanctuary"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/rooms/room-101-1.jpg';
                  }}
                />
                <div className="room-img-overlay">
                  <span className="view-gallery-pill">
                    <i className="fa-solid fa-camera"></i> View Photos (4 Photos)
                  </span>
                </div>
                <span className="room-badge available">● Available</span>
                <span className="room-capacity-badge">
                  <i className="fa-solid fa-user-group" style={{ marginRight: '4px' }}></i> 2 Guests
                </span>
              </div>
              <div className="room-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div className="room-card-header">
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-terracotta)', textTransform: 'uppercase' }}>
                      Category 1 • Courtyard Wing
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'var(--primary-color)' }}>
                      Deluxe Room
                    </h3>
                  </div>
                </div>
                <p className="room-tagline-text" style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--accent-gold)', margin: '6px 0 10px 0', fontWeight: 500 }}>
                  "Relax in refined comfort, where every detail is designed for an unforgettable stay."
                </p>
                <p className="room-desc" style={{ fontSize: '13.5px', color: 'var(--text-charcoal)', lineHeight: 1.6 }}>
                  Warm teakwood interiors with plush king bedding, Italian thermostatic rain shower, and quiet garden orientation.
                </p>

                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  5 Key Facilities Included:
                </div>
                <div className="room-amenities" style={{ marginBottom: '20px', gap: '6px' }}>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Wi-Fi 6</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> 55" 4K TV</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Climate AC</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Room Service</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Valet Parking</span>
                </div>
                <div className="room-card-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => openGalleryForRoom('101', 'Deluxe Room', 4500)}
                    style={{ width: '100%', textAlign: 'center', fontSize: '12px', padding: '10px 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600, boxSizing: 'border-box' }}
                  >
                    <i className="fa-solid fa-camera"></i> View Photos
                  </button>
                  <Link
                    to="/rooms?roomType=Deluxe%20Room"
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center', fontSize: '12px', padding: '10px 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, boxSizing: 'border-box' }}
                  >
                    Book Deluxe
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Premium Room */}
            <div className="room-card luxury-room-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div
                className="room-img-container"
                onClick={() => openGalleryForRoom('201', 'Premium Room', 6500)}
                style={{ cursor: 'pointer' }}
                title="Click to view 4 unique photos"
              >
                <img
                  src="/images/premium-room.jpg"
                  alt="Premium Room Sanctuary"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/rooms/room-201-1.jpg';
                  }}
                />
                <div className="room-img-overlay">
                  <span className="view-gallery-pill">
                    <i className="fa-solid fa-camera"></i> View Photos (4 Photos)
                  </span>
                </div>
                <span className="room-badge available">● Available</span>
                <span className="room-capacity-badge">
                  <i className="fa-solid fa-user-group" style={{ marginRight: '4px' }}></i> 2-3 Guests
                </span>
              </div>
              <div className="room-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div className="room-card-header">
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-terracotta)', textTransform: 'uppercase' }}>
                      Category 2 • Garden Wing
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'var(--primary-color)' }}>
                      Premium Room
                    </h3>
                  </div>
                </div>
                <p className="room-tagline-text" style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--accent-gold)', margin: '6px 0 10px 0', fontWeight: 500 }}>
                  "An oasis of tranquil luxury featuring bespoke teak furnishings, garden vistas, and a hand-crafted marble bath."
                </p>
                <p className="room-desc" style={{ fontSize: '13.5px', color: 'var(--text-charcoal)', lineHeight: 1.6 }}>
                  An oasis of tranquil luxury featuring bespoke teak furnishings, sweeping botanical garden vistas, private garden balcony, and deep soaking tub.
                </p>

                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  5 Key Facilities Included:
                </div>
                <div className="room-amenities" style={{ marginBottom: '20px', gap: '6px' }}>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Wi-Fi 6</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> 65" OLED TV</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Marble Tub</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Room Service</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Garden Balcony</span>
                </div>
                <div className="room-card-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => openGalleryForRoom('201', 'Premium Room', 6500)}
                    style={{ width: '100%', textAlign: 'center', fontSize: '12px', padding: '10px 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600, boxSizing: 'border-box' }}
                  >
                    <i className="fa-solid fa-camera"></i> View Photos
                  </button>
                  <Link
                    to="/rooms?roomType=Premium%20Room"
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center', fontSize: '12px', padding: '10px 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, boxSizing: 'border-box' }}
                  >
                    Book Premium
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Executive Suite */}
            <div className="room-card luxury-room-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div
                className="room-img-container"
                onClick={() => openGalleryForRoom('301', 'Executive Suite', 8500)}
                style={{ cursor: 'pointer' }}
                title="Click to view 4 unique photos"
              >
                <img
                  src="/images/executive-room.jpg"
                  alt="Executive Suite Sanctuary"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/rooms/room-301-1.jpg';
                  }}
                />
                <div className="room-img-overlay">
                  <span className="view-gallery-pill">
                    <i className="fa-solid fa-camera"></i> View Photos (4 Photos)
                  </span>
                </div>
                <span className="room-badge available">● Available</span>
                <span className="room-capacity-badge">
                  <i className="fa-solid fa-user-group" style={{ marginRight: '4px' }}></i> 2-5 Guests
                </span>
              </div>
              <div className="room-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div className="room-card-header">
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-terracotta)', textTransform: 'uppercase' }}>
                      Category 3 • Skyline Tower Wing
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'var(--primary-color)' }}>
                      Executive Suite
                    </h3>
                  </div>
                </div>
                <p className="room-tagline-text" style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--accent-gold)', margin: '6px 0 10px 0', fontWeight: 500 }}>
                  "Elevated sophistication featuring expansive skyline views, dedicated work suite, and exclusive club lounge privileges."
                </p>
                <p className="room-desc" style={{ fontSize: '13.5px', color: 'var(--text-charcoal)', lineHeight: 1.6 }}>
                  Elevated sophistication featuring expansive skyline views, dedicated executive workstation, Nespresso machine, Noir marble master bath, and club lounge access.
                </p>

                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  5 Key Facilities Included:
                </div>
                <div className="room-amenities" style={{ marginBottom: '20px', gap: '6px' }}>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Wi-Fi 6</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> 70" 4K TV</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Club Lounge</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Butler Service</span>
                  <span className="amenity-tag"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Observation Deck</span>
                </div>
                <div className="room-card-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => openGalleryForRoom('301', 'Executive Suite', 8500)}
                    style={{ width: '100%', textAlign: 'center', fontSize: '12px', padding: '10px 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600, boxSizing: 'border-box' }}
                  >
                    <i className="fa-solid fa-camera"></i> View Photos
                  </button>
                  <Link
                    to="/rooms?roomType=Executive%20Suite"
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center', fontSize: '12px', padding: '10px 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, boxSizing: 'border-box' }}
                  >
                    Book Executive
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dining & Cuisine Section */}
      <section className="section" id="dining">
        <div className="container">
          <div className="section-header">
            <div style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1.5px', marginBottom: '8px' }}>
              Epicurean Excellence
            </div>
            <h2>
              Authentic Fine <span>Gastronomy</span>
            </h2>
            <p>
              Experience authentic regional flavors, time-honored slow-cooking traditions, and contemporary international delights crafted by our master chefs.
            </p>
          </div>

          {/* 4 Main Restaurant Venues */}
          <div className="dining-grid" style={{ marginBottom: '50px' }}>
            <div className="dining-card">
              <div className="dining-img">
                <img
                  src="/images/gourmet-dining.jpg"
                  alt="Darbar Fine Indian Dining"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="dining-info">
                <span className="dining-tag">Royal Indian Dining</span>
                <h3>Darbar Hall</h3>
                <p>Authentic North Indian & Awadhi cuisine cooked in traditional clay tandoors with signature slow-dum biryanis and artisan breads.</p>
                <div className="dining-timing-pill">
                  <span><i className="fa-regular fa-clock" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> 12:30 PM – 11:30 PM</span>
                </div>
              </div>
            </div>

            <div className="dining-card">
              <div className="dining-img">
                <img
                  src="/images/courtyard-dining.jpg"
                  alt="The Courtyard Garden Bistro"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="dining-info">
                <span className="dining-tag">Alfresco & South Indian</span>
                <h3>The Courtyard Bistro</h3>
                <p>Authentic Chettinad and South Indian specialties, fresh filter coffee, crispy ghee roast dosas, and coastal seafood delicacies.</p>
                <div className="dining-timing-pill">
                  <span><i className="fa-regular fa-clock" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> 7:00 AM – 11:00 PM</span>
                </div>
              </div>
            </div>

            <div className="dining-card">
              <div className="dining-img">
                <img
                  src="/images/evening-resort.jpg"
                  alt="The Nilgiri Sunset Lounge"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="dining-info">
                <span className="dining-tag">Sunset Tapas & Spirits</span>
                <h3>The Nilgiri Lounge</h3>
                <p>Panoramic sunset vistas, artisanal craft cocktails, fine single malts, and small-plate royal appetizers under starlit skies.</p>
                <div className="dining-timing-pill">
                  <span><i className="fa-regular fa-clock" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> 4:00 PM – 12:00 AM</span>
                </div>
              </div>
            </div>

            <div className="dining-card">
              <div className="dining-img">
                <img
                  src="/images/food/rose-milk.jpg"
                  alt="Café Ansu Artisanal Bakery"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="dining-info">
                <span className="dining-tag">Artisanal Bakery & Café</span>
                <h3>Café Ansu</h3>
                <p>Single-origin Coimbatore estate filter coffee, French Viennoiserie, freshly baked butter croissants, and high-tea platters.</p>
                <div className="dining-timing-pill">
                  <span><i className="fa-regular fa-clock" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> 6:30 AM – 10:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 20-Item Culinary Menu */}
          <div className="menu-showcase-section" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '10px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1.5px', marginBottom: '6px' }}>
                Curated Gastronomy
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--primary-color)' }}>
                Signature <span>Culinary Menu</span>
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '8px auto 0 auto', fontSize: '14px', lineHeight: 1.6 }}>
                Handcrafted by our master culinary team with fresh organic herbs, farm-fresh produce, and authentic heritage spices.
              </p>
            </div>

            {/* Menu Tabs */}
            <div className="menu-tabs">
              <button
                className={`menu-tab-btn ${activeMenuTab === 'veg' ? 'active' : ''}`}
                onClick={() => setActiveMenuTab('veg')}
              >
                <i className="fa-solid fa-leaf" style={{ color: '#27AE60', marginRight: '6px' }}></i> Vegetarian ({vegDishes.length} Dishes)
              </button>
              <button
                className={`menu-tab-btn ${activeMenuTab === 'nonveg' ? 'active' : ''}`}
                onClick={() => setActiveMenuTab('nonveg')}
              >
                <i className="fa-solid fa-drumstick-bite" style={{ color: '#E74C3C', marginRight: '6px' }}></i> Non-Vegetarian ({nonVegDishes.length} Dishes)
              </button>
              <button
                className={`menu-tab-btn ${activeMenuTab === 'dessert' ? 'active' : ''}`}
                onClick={() => setActiveMenuTab('dessert')}
              >
                <i className="fa-solid fa-ice-cream" style={{ color: '#9B59B6', marginRight: '6px' }}></i> Desserts & Drinks ({dessertDishes.length} Delicacies)
              </button>
            </div>

            {/* Vegetarian Grid */}
            {activeMenuTab === 'veg' && (
              <div className="menu-grid" style={{ display: 'grid' }}>
                {vegDishes.map((dish, idx) => (
                  <div key={idx} className="menu-item-card">
                    <div className="menu-item-img-box">
                      <img
                        src={dish.image && (dish.image.startsWith('data:') || dish.image.startsWith('http') || dish.image.startsWith('/')) ? dish.image : `/${dish.image}`}
                        alt={dish.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/deluxe-room.jpg';
                        }}
                      />
                      <span className="menu-diet-badge veg">{dish.diet}</span>
                      {dish.tag && <span className="menu-chef-tag">{dish.tag}</span>}
                    </div>
                    <div className="menu-item-content">
                      <div className="menu-item-header">
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--primary-color)', margin: 0, flex: 1, minWidth: 0 }}>
                          {dish.name}
                        </h4>
                        <span className="menu-item-price">₹{dish.price}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 0 }}>
                        {dish.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Non-Vegetarian Grid */}
            {activeMenuTab === 'nonveg' && (
              <div className="menu-grid" style={{ display: 'grid' }}>
                {nonVegDishes.map((dish, idx) => (
                  <div key={idx} className="menu-item-card">
                    <div className="menu-item-img-box">
                      <img
                        src={dish.image && (dish.image.startsWith('data:') || dish.image.startsWith('http') || dish.image.startsWith('/')) ? dish.image : `/${dish.image}`}
                        alt={dish.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/deluxe-room.jpg';
                        }}
                      />
                      <span className="menu-diet-badge nonveg">{dish.diet}</span>
                      {dish.tag && <span className="menu-chef-tag">{dish.tag}</span>}
                    </div>
                    <div className="menu-item-content">
                      <div className="menu-item-header">
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--primary-color)', margin: 0, flex: 1, minWidth: 0 }}>
                          {dish.name}
                        </h4>
                        <span className="menu-item-price">₹{dish.price}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 0 }}>
                        {dish.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Desserts Grid */}
            {activeMenuTab === 'dessert' && (
              <div className="menu-grid" style={{ display: 'grid' }}>
                {dessertDishes.map((dish, idx) => (
                  <div key={idx} className="menu-item-card">
                    <div className="menu-item-img-box">
                      <img
                        src={dish.image && (dish.image.startsWith('data:') || dish.image.startsWith('http') || dish.image.startsWith('/')) ? dish.image : `/${dish.image}`}
                        alt={dish.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/deluxe-room.jpg';
                        }}
                      />
                      <span className="menu-diet-badge dessert sweet">{dish.diet}</span>
                      {dish.tag && <span className="menu-chef-tag">{dish.tag}</span>}
                    </div>
                    <div className="menu-item-content">
                      <div className="menu-item-header">
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--primary-color)', margin: 0, flex: 1, minWidth: 0 }}>
                          {dish.name}
                        </h4>
                        <span className="menu-item-price">₹{dish.price}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 0 }}>
                        {dish.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 24/7 Medical & Healthcare Section */}
      <section className="section section-cream" id="medical">
        <div className="container">
          <div className="section-header" style={{ marginBottom: '45px' }}>
            <div style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1.5px', marginBottom: '8px' }}>
              Care & Peace of Mind
            </div>
            <h2>
              24/7 Medical & <span>Healthcare</span>
            </h2>
            <p>
              Your health and safety are our highest priorities. Ansu Kumar Hotels features round-the-clock First Aid assistance, on-call specialist physicians, and rapid hospital liaison for all resident guests.
            </p>
          </div>

          <div className="luxury-facility-grid">
            {/* 1. Doctor-on-Call */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
                  alt="Doctor-on-Call & Suite Consultations"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-user-doctor" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>Doctor-on-Call</h4>
                </div>
                <p>Immediate specialist physician visits and health consultations directly to your private suite around the clock.</p>
                <span className="facility-card-badge">
                  <i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> 24/7 Suite Visits
                </span>
              </div>
            </div>

            {/* 2. Hospital Liaison */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
                  alt="Hospital Liaison & Priority Ambulance"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-truck-medical" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>Hospital Liaison</h4>
                </div>
                <p>Priority ambulance dispatch and official partner tie-ups with premier multi-speciality city hospitals.</p>
                <span className="facility-card-badge">
                  <i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Emergency Response
                </span>
              </div>
            </div>

            {/* 3. Pharmacy Concierge */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="https://images.unsplash.com/photo-1586015555751-63c299c855a9?auto=format&fit=crop&w=800&q=80"
                  alt="Pharmacy Concierge & Medicine Delivery"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-prescription-bottle-medical" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>Pharmacy Concierge</h4>
                </div>
                <p>Doorstep delivery for essential prescribed medications, emergency supplies, and infant healthcare essentials.</p>
                <span className="facility-card-badge">
                  <i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Doorstep Delivery
                </span>
              </div>
            </div>

            {/* 4. Emergency First Aid & Oxygen */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80"
                  alt="First Aid Desk & Oxygen Support"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-kit-medical" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>First Aid & Oxygen</h4>
                </div>
                <p>Equipped with automated external defibrillators (AED), oxygen support kits, and certified on-site first responders.</p>
                <span className="facility-card-badge">
                  <i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> AED & Oxygen Kits
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Hotline Contact Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '35px', flexWrap: 'wrap' }}>
            <a href="tel:+918124337117" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '13.5px' }}>
              <i className="fa-solid fa-phone-volume"></i> Emergency Medical Hotline: +91 8124337117
            </a>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
              <i className="fa-solid fa-circle-check" style={{ color: '#10B981' }}></i> 24 Hours Active On-Premise
            </span>
          </div>
        </div>
      </section>

      {/* Facilities & Amenities Section */}
      <section className="section" id="facilities">
        <div className="container">
          <div className="section-header">
            <div style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1.5px', marginBottom: '8px' }}>
              World-Class Comfort
            </div>
            <h2>
              Resort <span>Facilities</span>
            </h2>
            <p>
              Thoughtfully curated amenities crafted for seamless executive stays, royal family vacations, and holistic wellness retreats.
            </p>
          </div>

          <div className="luxury-facility-grid">
            {/* 1. Pool */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="/images/pool.jpg"
                  alt="Courtyard Pool & Cabanas"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-person-swimming" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>Courtyard Pool</h4>
                </div>
                <p>Temperature-regulated outdoor swimming pool surrounded by tropical palm cabanas, sun lounges, and poolside beverages.</p>
                <span className="facility-card-badge"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Outdoor Cabanas</span>
              </div>
            </div>

            {/* 2. Spa */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="/images/spa-wellness.jpg"
                  alt="Ayurvedic Wellness Spa"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-spa" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>Ayurvedic Wellness Spa</h4>
                </div>
                <p>Holistic herbal therapies, steam baths, aroma rejuvenation, and authentic Kerala Panchakarma treatments.</p>
                <span className="facility-card-badge"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Holistic Healing</span>
              </div>
            </div>

            {/* 3. Concierge & Lobby */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="/images/lobby.jpg"
                  alt="24/7 Guest Concierge & Grand Lobby"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-bell-concierge" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>24/7 Guest Concierge</h4>
                </div>
                <p>Round-the-clock bespoke assistance for travel itineraries, Nilgiri tea excursions, airport transfers, and reservations.</p>
                <span className="facility-card-badge"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> 24/7 Available</span>
              </div>
            </div>

            {/* 4. In-Room Dining */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="/images/gourmet-dining.jpg"
                  alt="24/7 Gourmet In-Room Dining"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-utensils" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>Gourmet In-Room Dining</h4>
                </div>
                <p>Exquisite regional Indian and continental delicacies delivered fresh to your suite with silver service at any hour.</p>
                <span className="facility-card-badge"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Silver Service</span>
              </div>
            </div>

            {/* 5. Valet Parking */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="/images/parking-lot.jpg"
                  alt="Valet & EV Monitored Parking"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-square-parking" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>Valet & EV Parking</h4>
                </div>
                <p>Complimentary multi-level monitored valet parking with CCTV surveillance and fast Level-2 EV charging stations.</p>
                <span className="facility-card-badge"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Level-2 EV Fast</span>
              </div>
            </div>

            {/* 6. Evening Courtyard */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="/images/evening-resort.jpg"
                  alt="Sunset Courtyard & Evening Lounge"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-moon" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>Evening Courtyard</h4>
                </div>
                <p>Serene open-air courtyard with ambient lantern lighting, traditional flute recitals, and tranquil fountain seating.</p>
                <span className="facility-card-badge"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Heritage Vibe</span>
              </div>
            </div>

            {/* 7. Doctor on Call */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="/images/medical-facility.jpg"
                  alt="Doctor-on-Call & Medical Care"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-kit-medical" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>Doctor-on-Call & First Aid</h4>
                </div>
                <p>24/7 medical response on premise, on-call doctor visits, and priority coordination with Coimbatore multispecialty hospitals.</p>
                <span className="facility-card-badge"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> 24/7 On-Call</span>
              </div>
            </div>

            {/* 8. Power & Wi-Fi */}
            <div className="luxury-facility-card">
              <div className="facility-card-img">
                <img
                  src="/images/hero-exterior.jpg"
                  alt="100% Uninterrupted Power & Wi-Fi 6"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="facility-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-bolt" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}></i>
                  <h4 style={{ margin: 0 }}>100% Power & Wi-Fi 6</h4>
                </div>
                <p>Heavy-duty generator backup ensuring zero interruption to climate control or ultra-fast fiber Wi-Fi 6 everywhere.</p>
                <span className="facility-card-badge"><i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Zero Downtime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Royal Banquets & Events Section */}
      <section className="section container" id="events">
        <div className="split-layout">
          <div className="split-image">
            <img
              src="/images/banquet.jpg"
              alt="Royal Banquet Hall at Ansu Kumar Hotels"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
          <div className="split-text">
            <div style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px', marginBottom: '10px' }}>
              Celebrations of Grandeur
            </div>
            <h3>Royal Banquets & Corporate Galas</h3>
            <p>
              Host your grand weddings, milestone celebrations, and high-level business summits in our pillarless banquet halls accommodating up to 600 guests.
            </p>
            <p>
              Our dedicated event planning concierge manages bespoke floral arrangements, state-of-the-art audiovisual setups, and curated gastronomic multi-course menus.
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '25px', flexWrap: 'wrap' }}>
              <Link to="/booking" className="btn btn-primary">
                Plan Your Event
              </Link>
              <a href="tel:+918124337117" className="btn btn-secondary">
                <i className="fa-solid fa-phone"></i> Inquire via Concierge
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Testimonials Section */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header">
            <div style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1.5px', marginBottom: '8px' }}>
              Guest Stories
            </div>
            <h2>
              Reflections of <span>Hospitality</span>
            </h2>
            <p>Read what our discerning guests say about their memorable stays and royal celebrations.</p>
          </div>

          <div className="room-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'stretch' }}>
            <div className="room-card" style={{ padding: '32px', background: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', borderRadius: '8px', boxShadow: 'var(--shadow-subtle)' }}>
              <div>
                <div style={{ color: 'var(--accent-gold)', marginBottom: '14px', fontSize: '15px' }}>
                  <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i>
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--text-charcoal)', lineHeight: 1.7, marginBottom: '24px', fontSize: '14px' }}>
                  "An unforgettable experience in Coimbatore. The Courtyard Sanctuary was breathtaking, and the authentic dining at Darbar Hall was simply world-class. Truly traditional warmth with 5-star elegance."
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: 'auto', paddingTop: '12px' }}>
                <div style={{ width: '44px', height: '44px', minWidth: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #B45309)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)' }}>
                  R
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '15px' }}>Rajesh Sundaram</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stayed in Executive Skyline Suite</div>
                </div>
              </div>
            </div>

            <div className="room-card" style={{ padding: '32px', background: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', borderRadius: '8px', boxShadow: 'var(--shadow-subtle)' }}>
              <div>
                <div style={{ color: 'var(--accent-gold)', marginBottom: '14px', fontSize: '15px' }}>
                  <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i>
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--text-charcoal)', lineHeight: 1.7, marginBottom: '24px', fontSize: '14px' }}>
                  "We celebrated our 25th anniversary here. The private verandah, deep soaking marble tub, and personalized hospitality made our weekend magical. Thank you to the entire staff!"
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: 'auto', paddingTop: '12px' }}>
                <div style={{ width: '44px', height: '44px', minWidth: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #C2410C)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)' }}>
                  P
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '15px' }}>Priya & Karthik</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stayed in Premium Garden Pavilion</div>
                </div>
              </div>
            </div>

            <div className="room-card" style={{ padding: '32px', background: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', borderRadius: '8px', boxShadow: 'var(--shadow-subtle)' }}>
              <div>
                <div style={{ color: 'var(--accent-gold)', marginBottom: '14px', fontSize: '15px' }}>
                  <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i> <i className="fa-solid fa-star"></i>
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--text-charcoal)', lineHeight: 1.7, marginBottom: '24px', fontSize: '14px' }}>
                  "As an executive traveler, the high-speed fiber Wi-Fi 6 and the ergonomic dedicated workstation were flawless. Quiet, peaceful, and perfectly positioned in the city."
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: 'auto', paddingTop: '12px' }}>
                <div style={{ width: '44px', height: '44px', minWidth: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #EA580C)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)' }}>
                  A
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '15px' }}>Anita Deshmukh</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Corporate Executive Stay</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Interactive Contact Section */}
      <section className="section container" id="contact">
        <div className="section-header">
          <div style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1.5px', marginBottom: '8px' }}>
            Reach Out & Visit
          </div>
          <h2>
            Prime Coimbatore <span>Location</span>
          </h2>
          <p>
            Conveniently situated on Avinashi Road, just 15 minutes from Coimbatore International Airport (CJB) and Coimbatore Junction Railway Station.
          </p>
        </div>

        <div className="contact-map-grid">
          <div style={{ background: 'var(--bg-ivory)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--primary-color)', marginBottom: '16px' }}>
                Palace Concierge Desk
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: 'var(--text-charcoal)' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--primary-color)', marginBottom: '3px' }}>
                    <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-gold)', marginRight: '6px' }}></i> Address:
                  </strong>
                  102 Palace Orchard Boulevard, Avinashi Road, Coimbatore, Tamil Nadu 641018, India
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--primary-color)', marginBottom: '3px' }}>
                    <i className="fa-solid fa-phone" style={{ color: 'var(--accent-gold)', marginRight: '6px' }}></i> Direct Phone:
                  </strong>
                  <a href="tel:+918124337117" style={{ color: 'inherit', textDecoration: 'none' }}>+91 81243 37117 / +91 99988 87770</a>
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--primary-color)', marginBottom: '3px' }}>
                    <i className="fa-solid fa-envelope" style={{ color: 'var(--accent-gold)', marginRight: '6px' }}></i> Email Inquiries:
                  </strong>
                  <a href="mailto:reservations@ansukumarhotels.com" style={{ color: 'inherit', textDecoration: 'none' }}>reservations@ansukumarhotels.com</a>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
              <Link to="/booking" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                Reserve Your Stay Now
              </Link>
            </div>
          </div>

          <div style={{ borderRadius: '6px', overflow: 'hidden', minHeight: '340px', border: '1px solid var(--border-color)', height: '100%' }}>
            <iframe
              title="Ansu Kumar Hotels Google Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125322.44173111956!2d76.884832!3d11.0168445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f971cb5%3A0x2fc1c81e183ed282!2sCoimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '340px', width: '100%', height: '100%', display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="newsletter-section">
        <div className="container" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
            Exclusive Privileges
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', marginBottom: '10px' }}>
            Join the Ansu Kumar Circle
          </h3>
          <p style={{ fontSize: '14.5px', marginBottom: '25px' }}>
            Receive seasonal tariff privileges, gastronomic invitations, and complimentary suite upgrades directly in your inbox.
          </p>

          {newsletterStatus && (
            <div className="alert alert-success" style={{ marginBottom: '15px' }}>
              {newsletterStatus}
            </div>
          )}

          <form onSubmit={handleNewsletterSubmit} className="newsletter-form" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="form-control"
              style={{ flex: '1 1 280px', height: '46px', maxWidth: '400px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 26px', height: '46px' }}>
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
