import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header, Footer, FloatingRoomGallery, RoomDetailsModal } from '../components/common';
import { getRoomMeta, ROOM_TYPE_METADATA } from '../data/roomMetadata';
import { getRoomsCatalog, syncRoomsToDb } from '../data/roomsCatalog';

export default function RoomsPage() {
  const [rooms, setRooms] = useState(() => getRoomsCatalog());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Suites'); // 'Suites' | 'Top Tier'
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('All'); // 'All' | '1000-3000' | '3100-4000' | '4100-5000' | '5200-10000'
  const [sortOrder, setSortOrder] = useState('price-asc'); // 'price-asc' | 'price-desc' | 'room-asc'
  const [normalSuitesTab, setNormalSuitesTab] = useState('All'); // 'All' | 'Deluxe' | 'Premium' | 'Executive'

  // Top-Tier pagination
  const [topTierPage, setTopTierPage] = useState(1);
  const TOP_TIER_PAGE_SIZE = 12;

  // Modal states
  const [galleryState, setGalleryState] = useState({
    isOpen: false,
    photos: [],
    title: '',
    roomId: null,
    price: 0,
    initialIndex: 0
  });

  const [detailsModalState, setDetailsModalState] = useState({
    isOpen: false,
    room: null
  });

  const location = useLocation();
  const navigate = useNavigate();

  const isTopTierRoom = (room) => {
    if (!room) return false;
    const num = parseInt(room.roomNumber || room.RoomNumber || '0', 10);
    const imgs = String(room.images || room.Images || '');
    const price = Number(room.price || room.Price || 0);
    return (num >= 1 && num <= 27) || (imgs.trim().length > 0 && imgs.includes(',')) || price >= 5100;
  };

  // Parse URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('roomType');
    if (typeParam) {
      if (typeParam.toLowerCase().includes('top')) {
        setActiveTab('Top Tier');
      } else if (typeParam.toLowerCase().includes('deluxe')) {
        setActiveTab('Suites');
        setNormalSuitesTab('Deluxe');
      } else if (typeParam.toLowerCase().includes('premium')) {
        setActiveTab('Suites');
        setNormalSuitesTab('Premium');
      } else if (typeParam.toLowerCase().includes('executive')) {
        setActiveTab('Suites');
        setNormalSuitesTab('Executive');
      } else if (typeParam.toLowerCase().includes('suite')) {
        setActiveTab('Suites');
      }
    }
  }, [location.search]);

  // Load rooms from API or fallback to React catalog and sync to DB
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setError('');
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        const loadedRooms = Array.isArray(data) ? data : [];
        if (loadedRooms.length > 0) {
          setRooms(loadedRooms);
        } else {
          // If database is empty, display from React catalog and store into PostgreSQL
          const defaultCatalog = getRoomsCatalog();
          setRooms(defaultCatalog);
          syncRoomsToDb(defaultCatalog);
        }
      } else {
        setRooms(getRoomsCatalog());
      }
    } catch (err) {
      console.warn('Rooms API unavailable, displaying React catalog:', err);
      setRooms(getRoomsCatalog());
    }
  };

  const openGallery = (roomNumber, roomType, price, roomId, roomObj, initialIndex = 0) => {
    const meta = getRoomMeta(roomType, roomNumber, roomObj);
    if (meta && meta.gallery) {
      const displayTitle = (roomNumber ? `Room ${roomNumber} — ` : '') + (meta.subType || meta.title || roomType);
      setGalleryState({
        isOpen: true,
        photos: meta.gallery,
        title: displayTitle,
        roomId: roomId,
        price: price,
        initialIndex: initialIndex
      });
    }
  };

  const openCategoryPhoto = (categoryName) => {
    const meta = ROOM_TYPE_METADATA[categoryName] || ROOM_TYPE_METADATA['Deluxe Room'];
    if (meta && meta.gallery) {
      setGalleryState({
        isOpen: true,
        photos: meta.gallery,
        title: `${categoryName} — Complete Suite View`,
        roomId: null,
        price: 0,
        initialIndex: 0
      });
    }
  };

  const openDetails = (room) => {
    setDetailsModalState({
      isOpen: true,
      room: room
    });
  };

  // Separate rooms into Top-Tier (27) and Normal Suites (85)
  const topTierRoomsList = rooms.filter(isTopTierRoom);
  const normalRoomsList = rooms.filter((r) => !isTopTierRoom(r));

  // Normal category subsets
  const normalDeluxeRooms = normalRoomsList.filter((r) => String(r.roomType || r.RoomType).toLowerCase().includes('deluxe'));
  const normalPremiumRooms = normalRoomsList.filter((r) => String(r.roomType || r.RoomType).toLowerCase().includes('premium'));
  const normalExecutiveRooms = normalRoomsList.filter((r) => String(r.roomType || r.RoomType).toLowerCase().includes('executive'));

  // Sort & Search filtered top tier list
  const getFilteredTopTierRooms = () => {
    let list = [...topTierRoomsList];

    // Price range filter
    if (priceFilter === '5200-10000') {
      list = list.filter((r) => (r.price || r.Price || 0) >= 5200 && (r.price || r.Price || 0) <= 10000);
    } else if (priceFilter === '1000-3000') {
      list = list.filter((r) => (r.price || r.Price || 0) >= 1000 && (r.price || r.Price || 0) <= 3000);
    } else if (priceFilter === '3100-4000') {
      list = list.filter((r) => (r.price || r.Price || 0) >= 3100 && (r.price || r.Price || 0) <= 4000);
    } else if (priceFilter === '4100-5000') {
      list = list.filter((r) => (r.price || r.Price || 0) >= 4100 && (r.price || r.Price || 0) <= 5000);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((r) => {
        const num = String(r.roomNumber || r.RoomNumber || '').toLowerCase();
        const type = String(r.roomType || r.RoomType || '').toLowerCase();
        const sub = String(r.subType || r.SubType || '').toLowerCase();
        const desc = String(r.description || r.Description || '').toLowerCase();
        const pr = String(r.price || r.Price || '');
        return num.includes(q) || type.includes(q) || sub.includes(q) || desc.includes(q) || pr.includes(q);
      });
    }

    // Sort order
    if (sortOrder === 'price-asc') {
      list.sort((a, b) => (a.price || a.Price || 0) - (b.price || b.Price || 0));
    } else if (sortOrder === 'price-desc') {
      list.sort((a, b) => (b.price || b.Price || 0) - (a.price || a.Price || 0));
    } else if (sortOrder === 'room-asc') {
      list.sort((a, b) => String(a.roomNumber || a.RoomNumber).localeCompare(String(b.roomNumber || b.RoomNumber), undefined, { numeric: true }));
    }
    return list;
  };

  const filteredTopTier = getFilteredTopTierRooms();

  // Reset top tier pagination on filter changes
  useEffect(() => {
    setTopTierPage(1);
  }, [searchQuery, priceFilter, sortOrder]);

  // Categories configuration for Normal Suites
  const categoriesList = [
    {
      id: 'Deluxe',
      name: 'Deluxe Room',
      image: 'images/deluxe-room.jpg',
      priceRange: '₹1,000 - ₹3,000 / night',
      minPrice: 1000,
      maxPrice: 3000,
      rooms: normalDeluxeRooms
    },
    {
      id: 'Premium',
      name: 'Premium Room',
      image: 'images/premium-room.jpg',
      priceRange: '₹3,100 - ₹4,000 / night',
      minPrice: 3100,
      maxPrice: 4000,
      rooms: normalPremiumRooms
    },
    {
      id: 'Executive',
      name: 'Executive Suite',
      image: 'images/executive-room.jpg',
      priceRange: '₹4,100 - ₹5,000 / night',
      minPrice: 4100,
      maxPrice: 5000,
      rooms: normalExecutiveRooms
    }
  ];

  // Get active category sections based on filters and sorting
  const getDisplayCategories = () => {
    let cats = [...categoriesList];

    // Filter by tab
    if (normalSuitesTab !== 'All') {
      cats = cats.filter((c) => c.id === normalSuitesTab);
    }

    // Filter by price range
    if (priceFilter === '1000-3000') {
      cats = cats.filter((c) => c.id === 'Deluxe');
    } else if (priceFilter === '3100-4000') {
      cats = cats.filter((c) => c.id === 'Premium');
    } else if (priceFilter === '4100-5000') {
      cats = cats.filter((c) => c.id === 'Executive');
    } else if (priceFilter === '5200-10000') {
      cats = [];
    }

    // Sort order for categories
    if (sortOrder === 'price-desc') {
      cats.sort((a, b) => b.maxPrice - a.maxPrice);
    } else {
      cats.sort((a, b) => a.minPrice - b.minPrice);
    }

    return cats;
  };

  const displayCategories = getDisplayCategories();

  // Helper for Top-Tier Pagination (Using only Font Awesome icons)
  const renderPagination = (totalCount, currentPage, setPage, pageSize) => {
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    if (totalPages <= 1) return null;

    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
      pages.push(
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`page-btn ${p === currentPage ? 'active' : ''}`}
          style={{
            padding: '6px 12px',
            margin: '0 3px',
            borderRadius: '4px',
            border: p === currentPage ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
            background: p === currentPage ? 'var(--accent-gold)' : 'var(--bg-ivory)',
            color: p === currentPage ? '#FFF' : 'var(--primary-color)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {p}
        </button>
      );
    }

    return (
      <div className="rooms-pagination-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '30px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage <= 1}
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: '12px', opacity: currentPage <= 1 ? 0.5 : 1, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-chevron-left"></i> Prev
        </button>
        {pages}
        <button
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage >= totalPages}
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: '12px', opacity: currentPage >= totalPages ? 0.5 : 1, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          Next <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    );
  };

  // Render Top-Tier Room Card (Individual with multi-image gallery and pure font-awesome icons)
  const renderTopTierRoomCard = (room) => {
    const rId = room.roomId !== undefined ? room.roomId : room.RoomId;
    const rNumber = room.roomNumber !== undefined ? room.roomNumber : room.RoomNumber;
    const rType = room.roomType !== undefined ? room.roomType : room.RoomType;
    const rSubType = room.subType || room.SubType || '';
    const rPrice = room.price !== undefined ? room.price : room.Price;
    const rStatus = room.status !== undefined ? room.status : room.Status;
    const rCapacity = room.capacity !== undefined ? room.capacity : room.Capacity || 2;
    const rDesc = room.description !== undefined ? room.description : room.Description;

    const meta = getRoomMeta(rType, rNumber, room);
    const gallery = meta.gallery || [];
    const primaryPhoto = gallery[0] ? gallery[0].url : meta.fallback || '/images/deluxe-room.jpg';
    const photoCount = gallery.length;
    const displayTitle = rSubType || meta.title || rType;

    const statusClass = rStatus ? rStatus.toLowerCase() : 'available';
    const isAvailable = rStatus === 'Available';

    return (
      <div
        key={rId}
        className="room-card luxury-room-card top-tier-room-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          border: '2px solid var(--accent-gold)',
          boxShadow: '0 8px 24px rgba(197, 168, 92, 0.15)'
        }}
      >
        <div
          className="room-img-container"
          onClick={() => openGallery(rNumber, rType, rPrice, rId, room)}
          style={{ cursor: 'pointer' }}
          title={`Click to view all photos for Room ${rNumber}`}
        >
          <img
            src={primaryPhoto.startsWith('/') ? primaryPhoto : `/${primaryPhoto}`}
            alt={`${displayTitle} - Room ${rNumber}`}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = meta.fallback.startsWith('/') ? meta.fallback : `/${meta.fallback}`;
            }}
          />
          <div className="room-img-overlay">
            <span className="view-gallery-pill">
              <i className="fa-solid fa-camera" style={{ marginRight: '4px' }}></i> View Photos ({photoCount} Photos)
            </span>
          </div>
          <span className={`room-badge ${statusClass}`}>
            {isAvailable ? (
              <>
                <i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }}></i> Available
              </>
            ) : rStatus === 'Occupied' ? (
              <>
                <i className="fa-solid fa-lock" style={{ marginRight: '4px' }}></i> Occupied
              </>
            ) : (
              <>
                <i className="fa-solid fa-wrench" style={{ marginRight: '4px' }}></i> Maintenance
              </>
            )}
          </span>
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'linear-gradient(135deg, #C5A85C 0%, #8A6D2B 100%)',
              color: '#FFF',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              zIndex: 2
            }}
          >
            <i className="fa-solid fa-crown" style={{ marginRight: '4px' }}></i> Top Tier Suite
          </span>
          <span className="room-capacity-badge">
            <i className="fa-solid fa-user-group" style={{ marginRight: '4px' }}></i> {rCapacity} Guests
          </span>
        </div>

        <div className="room-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div className="room-card-header">
            <div>
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {rType} • Room #{rNumber}
              </div>
              <h3
                style={{
                  marginTop: '2px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px',
                  color: 'var(--primary-color)'
                }}
              >
                {displayTitle}
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="room-price">₹{Number(rPrice).toLocaleString('en-IN')}</span>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                per night + taxes
              </span>
            </div>
          </div>

          <p
            className="room-tagline-text"
            style={{
              fontStyle: 'italic',
              fontSize: '13px',
              color: 'var(--accent-gold)',
              margin: '6px 0 10px 0',
              fontWeight: 500
            }}
          >
            "{meta.tagline}"
          </p>

          <p
            className="room-desc"
            style={{
              fontSize: '13.5px',
              color: 'var(--text-charcoal)',
              lineHeight: 1.6,
              marginBottom: '14px'
            }}
          >
            {rDesc || meta.tagline}
          </p>

          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '6px',
              letterSpacing: '0.5px'
            }}
          >
            Included Facilities (5 Perks):
          </div>
          <div className="room-amenities" style={{ marginBottom: '20px', gap: '6px' }}>
            {(meta.facilities || []).slice(0, 5).map((f, idx) => (
              <span key={idx} className="amenity-tag" style={{ fontSize: '11.5px' }}>
                <i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i>{' '}
                {f}
              </span>
            ))}
          </div>

          <div className="room-card-footer">
            <button
              className="btn btn-secondary"
              onClick={() => openGallery(rNumber, rType, rPrice, rId, room)}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '12px',
                padding: '10px 6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: 600,
                boxSizing: 'border-box'
              }}
            >
              <i className="fa-solid fa-camera"></i> View Photos
            </button>

            {isAvailable ? (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/booking?roomId=${rId}`)}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '12px',
                  padding: '10px 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  boxSizing: 'border-box'
                }}
              >
                <i className="fa-solid fa-calendar-check"></i> Book and Stay
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => openDetails(room)}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '12px',
                  padding: '10px 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  boxSizing: 'border-box',
                  opacity: 0.7
                }}
              >
                <i className="fa-solid fa-lock"></i> Booked (Occupied)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Category Section Card (Complete 4-Photo View + Direct Category Booking Redirection - Medium Sized)
  const renderNormalCategorySection = (categoryObj) => {
    const categoryName = categoryObj.name;
    const imagePath = categoryObj.image;
    const priceRange = categoryObj.priceRange;
    const roomsArray = categoryObj.rooms;

    const meta = ROOM_TYPE_METADATA[categoryName] || ROOM_TYPE_METADATA['Deluxe Room'];
    const availableRooms = roomsArray.filter((r) => (r.status || r.Status) === 'Available');
    const photoCount = (meta.gallery || []).length;
    const subTypeOptions = meta.subTypes || [];

    return (
      <div
        key={categoryName}
        className="category-section-card"
      >
        <div className="category-card-grid">
          {/* Section Complete Image & Lightbox Trigger */}
          <div
            className="category-card-img-wrap"
            onClick={() => openCategoryPhoto(categoryName)}
            title={`Click to view all ${photoCount} complete photos for ${categoryName}`}
          >
            <img
              src={`/${imagePath}`}
              alt={`${categoryName} Suite Collection`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/deluxe-room.jpg';
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(26, 37, 48, 0.85) 0%, rgba(26, 37, 48, 0.2) 60%)',
                pointerEvents: 'none'
              }}
            ></div>
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
              <span
                style={{
                  background: 'var(--accent-terracotta)',
                  color: '#FFF',
                  padding: '4px 9px',
                  borderRadius: '3px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px'
                }}
              >
                {categoryName} Collection ({roomsArray.length} Units)
              </span>
            </div>
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 2, color: '#FFF' }}>
              <div style={{ fontSize: '11.5px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {availableRooms.length} of {roomsArray.length} Rooms Available
              </div>
              <div style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', fontWeight: 600, margin: '1px 0 5px 0', color: '#FFF' }}>
                {priceRange}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openCategoryPhoto(categoryName);
                }}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  color: '#FFF',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <i className="fa-solid fa-camera"></i> View Photos ({photoCount})
              </button>
            </div>
          </div>

          {/* Section Info, Options & Direct Redirection CTA */}
          <div className="category-card-body">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                <div>
                  <h3 className="category-card-title">
                    {categoryName}
                  </h3>
                  <p className="category-card-tagline">
                    "{meta.tagline}"
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tariff</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {priceRange}
                  </div>
                </div>
              </div>

              {/* Suite Specifications */}
              {meta.specs && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  <span className="category-spec-pill">
                    <i className="fa-solid fa-ruler-combined" style={{ color: 'var(--accent-gold)' }}></i> {meta.specs.size}
                  </span>
                  <span className="category-spec-pill">
                    <i className="fa-solid fa-bed" style={{ color: 'var(--accent-gold)' }}></i> {meta.specs.bed}
                  </span>
                  <span className="category-spec-pill">
                    <i className="fa-solid fa-users" style={{ color: 'var(--accent-gold)' }}></i> {meta.specs.capacity}
                  </span>
                </div>
              )}

              {/* 5 Included Facilities */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {(meta.facilities || []).slice(0, 5).map((f, idx) => (
                    <span key={idx} className="category-amenity-tag">
                      <i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)' }}></i> {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Available Subtype Options */}
              {subTypeOptions.length > 0 && (
                <div className="category-variations-box">
                  <div className="category-variations-title">
                    <i className="fa-solid fa-layer-group" style={{ marginRight: '5px', color: 'var(--accent-terracotta)' }}></i> Available Room Variations:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {subTypeOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        className="category-variation-btn"
                        onClick={() => navigate(`/booking?roomType=${encodeURIComponent(categoryName)}`)}
                        title={`Click to book ${opt} in ${categoryName}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Redirect Booking Action */}
            <div className="category-reservation-card">
              <div>
                <div className="category-reservation-title">
                  {categoryName} • {priceRange}
                </div>
                <div className="category-reservation-desc">
                  {availableRooms.length} units ready to book instantly
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => openCategoryPhoto(categoryName)}
                  style={{ padding: '7px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <i className="fa-solid fa-camera"></i> 4 Photos
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/booking?roomType=${encodeURIComponent(categoryName)}`)}
                  style={{ padding: '7px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <i className="fa-solid fa-calendar-check"></i> Book {categoryName}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header />

      {/* Floating Lightbox Gallery */}
      <FloatingRoomGallery
        isOpen={galleryState.isOpen}
        onClose={() => setGalleryState((prev) => ({ ...prev, isOpen: false }))}
        photos={galleryState.photos}
        roomTitle={galleryState.title}
        roomId={galleryState.roomId}
        price={galleryState.price}
        initialIndex={galleryState.initialIndex}
      />

      {/* Room Details Modal */}
      <RoomDetailsModal
        isOpen={detailsModalState.isOpen}
        onClose={() => setDetailsModalState({ isOpen: false, room: null })}
        room={detailsModalState.room}
        onOpenGallery={(photos, title, roomId, price, index) => {
          setGalleryState({
            isOpen: true,
            photos,
            title,
            roomId,
            price,
            initialIndex: index
          });
        }}
      />

      {/* Subpage Banner */}
      <section
        style={{
          background: "linear-gradient(rgba(26, 37, 48, 0.85), rgba(26, 37, 48, 0.9)), url('/images/hero-exterior.jpg') center/cover",
          padding: '65px 20px',
          textAlign: 'center',
          color: '#FFF'
        }}
      >
        <div className="container">
          <div
            style={{
              color: 'var(--accent-gold)',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '8px'
            }}
          >
            Curated Accommodations
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '42px', marginBottom: '12px', color: '#FFF' }}>
            Rooms & Suites Catalogue
          </h1>
          <p
            style={{
              maxWidth: '650px',
              margin: '0 auto',
              color: 'var(--text-light-cream)',
              fontSize: '15px',
              lineHeight: 1.6
            }}
          >
            Explore our 3 signature guest accommodation categories with complete 4-photo section views alongside our separate bespoke Top-Tier Luxury Suites.
          </p>
        </div>
      </section>

      {/* Primary Section Switcher Tabs (Suites and Top-Tier kept completely separate) */}
      <section className="container" style={{ marginTop: '30px', marginBottom: '15px' }}>
        <div className="section-switch-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={() => {
              setActiveTab('Suites');
              setPriceFilter('All');
            }}
            className={`btn ${activeTab === 'Suites' ? 'btn-primary' : 'btn-secondary'} section-switch-btn`}
            style={{ padding: '10px 24px', fontSize: '13.5px', borderRadius: '25px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fa-solid fa-bed"></i> Suites Collection (85 Accommodations • ₹1,000 - ₹5,000)
          </button>
          <button
            onClick={() => {
              setActiveTab('Top Tier');
              setPriceFilter('All');
            }}
            className={`btn ${activeTab === 'Top Tier' ? 'btn-primary' : 'btn-secondary'} section-switch-btn`}
            style={{ padding: '10px 24px', fontSize: '13.5px', borderRadius: '25px', borderColor: 'var(--accent-gold)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fa-solid fa-crown" style={{ color: 'var(--accent-gold)' }}></i> Top-Tier Luxury Suites (27 Suites • ₹5,200 - ₹10,000)
          </button>
        </div>

        {/* Search, Price Filter & Sort Controls */}
        <div className="rooms-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'var(--bg-ivory)', padding: '14px 20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {/* Keyword Search */}
          <div className="rooms-filter-search" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px', maxWidth: '380px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--accent-gold)' }}></i>
            <input
              type="text"
              placeholder="Search by Room #, Subtype, or Facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                fontSize: '13px',
                background: 'var(--bg-card)',
                color: 'var(--text-charcoal)'
              }}
            />
          </div>

          {/* Dynamic Price Range Filter */}
          <div className="rooms-filter-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-filter" style={{ marginRight: '4px' }}></i> Price Range:
            </span>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                fontSize: '13px',
                background: 'var(--bg-card)',
                color: 'var(--text-charcoal)'
              }}
            >
              <option value="All">All Price Ranges</option>
              <option value="1000-3000">₹1,000 - ₹3,000 (Deluxe Tier)</option>
              <option value="3100-4000">₹3,100 - ₹4,000 (Premium Tier)</option>
              <option value="4100-5000">₹4,100 - ₹5,000 (Executive Tier)</option>
              <option value="5200-10000">₹5,200 - ₹10,000 (Top-Tier Luxury)</option>
            </select>
          </div>

          {/* Dynamic Sort Order */}
          <div className="rooms-filter-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-arrow-down-short-wide" style={{ marginRight: '4px' }}></i> Sort By:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                fontSize: '13px',
                background: 'var(--bg-card)',
                color: 'var(--text-charcoal)'
              }}
            >
              <option value="price-asc">Price: Low to High (₹1,000 →)</option>
              <option value="price-desc">Price: High to Low (₹10,000 →)</option>
              <option value="room-asc">Room Number (Ascending)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="section container" style={{ paddingTop: '15px', paddingBottom: '70px' }}>
        {error && <div className="alert alert-danger" style={{ marginBottom: '25px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '50px 20px' }}>
            <div
              className="spinner-gold"
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(197,168,92,0.2)',
                borderTopColor: 'var(--accent-gold)',
                borderRadius: '50%',
                margin: '0 auto 15px auto',
                animation: 'spin 0.8s linear infinite'
              }}
            ></div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--primary-color)' }}>
              Curating luxury rooms & suites...
            </p>
          </div>
        ) : (
          <div>
            {/* ============================================================ */}
            {/* 1. SUITES COLLECTION (85 ROOMS - 3 SIGNATURE CATEGORIES)     */}
            {/* ============================================================ */}
            {activeTab === 'Suites' && !searchQuery && (
              <div style={{ marginBottom: '55px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <i className="fa-solid fa-bed" style={{ marginRight: '6px' }}></i> Standard Guest Accommodations
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--primary-color)', margin: '4px 0 0 0' }}>
                      Suites Collection ({normalRoomsList.length} Accommodations • ₹1,000 – ₹5,000)
                    </h2>
                  </div>

                  {/* Category Filter Pills inside Suites */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setNormalSuitesTab('All'); setPriceFilter('All'); }}
                      className={`btn ${normalSuitesTab === 'All' && priceFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      All 3 Categories
                    </button>
                    <button
                      onClick={() => { setNormalSuitesTab('Deluxe'); setPriceFilter('All'); }}
                      className={`btn ${normalSuitesTab === 'Deluxe' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      Deluxe ({normalDeluxeRooms.length})
                    </button>
                    <button
                      onClick={() => { setNormalSuitesTab('Premium'); setPriceFilter('All'); }}
                      className={`btn ${normalSuitesTab === 'Premium' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      Premium ({normalPremiumRooms.length})
                    </button>
                    <button
                      onClick={() => { setNormalSuitesTab('Executive'); setPriceFilter('All'); }}
                      className={`btn ${normalSuitesTab === 'Executive' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      Executive ({normalExecutiveRooms.length})
                    </button>
                  </div>
                </div>

                {/* Render the 3 Category Section Cards */}
                {displayCategories.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-ivory)', borderRadius: '6px' }}>
                    <i className="fa-solid fa-filter" style={{ fontSize: '28px', color: 'var(--accent-gold)', marginBottom: '10px' }}></i>
                    <h3>No Suites in this Price Range</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try selecting 'All Price Ranges' or view our Top-Tier Suites.</p>
                  </div>
                ) : (
                  displayCategories.map((catObj) => renderNormalCategorySection(catObj))
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* 2. TOP-TIER SUITES (27 LUXURY SUITES)                        */}
            {/* ============================================================ */}
            {activeTab === 'Top Tier' && !searchQuery && (
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <i className="fa-solid fa-crown" style={{ marginRight: '6px' }}></i> Signature Luxury Collection
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--primary-color)', margin: '4px 0 0 0' }}>
                      Top-Tier Luxury Suites ({filteredTopTier.length} Suites • ₹5,200 – ₹10,000)
                    </h2>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Showing <strong>{filteredTopTier.length > 0 ? (topTierPage - 1) * TOP_TIER_PAGE_SIZE + 1 : 0}</strong> to{' '}
                    <strong>{Math.min(topTierPage * TOP_TIER_PAGE_SIZE, filteredTopTier.length)}</strong> of{' '}
                    <strong>{filteredTopTier.length}</strong> suites
                  </div>
                </div>

                {filteredTopTier.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-ivory)', borderRadius: '6px' }}>
                    <i className="fa-solid fa-filter" style={{ fontSize: '28px', color: 'var(--accent-gold)', marginBottom: '10px' }}></i>
                    <h3>No Top-Tier Suites Match This Price Filter</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Top-Tier Suites start from ₹5,200 to ₹10,000.</p>
                  </div>
                ) : (
                  <>
                    <div className="room-grid">
                      {filteredTopTier
                        .slice((topTierPage - 1) * TOP_TIER_PAGE_SIZE, topTierPage * TOP_TIER_PAGE_SIZE)
                        .map((room) => renderTopTierRoomCard(room))}
                    </div>

                    {/* Top Tier Pagination */}
                    {renderPagination(filteredTopTier.length, topTierPage, setTopTierPage, TOP_TIER_PAGE_SIZE)}
                  </>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* 3. SEARCH RESULTS VIEW (WHEN SEARCHING)                     */}
            {/* ============================================================ */}
            {searchQuery && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', color: 'var(--primary-color)', margin: 0 }}>
                    Search Results for "{searchQuery}"
                  </h2>
                  <button className="btn btn-secondary" onClick={() => setSearchQuery('')} style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-xmark"></i> Clear Search
                  </button>
                </div>

                {rooms.filter((r) => {
                  const q = searchQuery.trim().toLowerCase();
                  const num = String(r.roomNumber || r.RoomNumber || '').toLowerCase();
                  const type = String(r.roomType || r.RoomType || '').toLowerCase();
                  const sub = String(r.subType || r.SubType || '').toLowerCase();
                  const desc = String(r.description || r.Description || '').toLowerCase();
                  const pr = String(r.price || r.Price || '');
                  return num.includes(q) || type.includes(q) || sub.includes(q) || desc.includes(q) || pr.includes(q);
                }).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-ivory)', borderRadius: '6px' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '32px', color: 'var(--accent-gold)', marginBottom: '12px' }}></i>
                    <h3>No Matching Rooms Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try searching for a different room number or keyword.</p>
                  </div>
                ) : (
                  <div className="room-grid">
                    {rooms
                      .filter((r) => {
                        const q = searchQuery.trim().toLowerCase();
                        const num = String(r.roomNumber || r.RoomNumber || '').toLowerCase();
                        const type = String(r.roomType || r.RoomType || '').toLowerCase();
                        const sub = String(r.subType || r.SubType || '').toLowerCase();
                        const desc = String(r.description || r.Description || '').toLowerCase();
                        const pr = String(r.price || r.Price || '');
                        return num.includes(q) || type.includes(q) || sub.includes(q) || desc.includes(q) || pr.includes(q);
                      })
                      .sort((a, b) => {
                        if (sortOrder === 'price-asc') return (a.price || a.Price || 0) - (b.price || b.Price || 0);
                        if (sortOrder === 'price-desc') return (b.price || b.Price || 0) - (a.price || a.Price || 0);
                        return String(a.roomNumber || a.RoomNumber).localeCompare(String(b.roomNumber || b.RoomNumber), undefined, { numeric: true });
                      })
                      .map((room) => renderTopTierRoomCard(room))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
