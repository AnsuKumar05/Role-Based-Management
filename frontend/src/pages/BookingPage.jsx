import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header, Footer, PaymentQRModal } from '../components/common';
import { useAuth } from '../context/AuthContext';

export default function BookingPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [selectedPackage, setSelectedPackage] = useState('Stay');

  const [priceCalculation, setPriceCalculation] = useState(null);
  const [calcError, setCalcError] = useState('');
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Payment QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    setCheckIn(todayStr);
    setCheckOut(tomorrowStr);
  }, []);

  // Pre-fill user name and phone if logged in
  useEffect(() => {
    if (user?.name && !guestName) {
      setGuestName(user.name);
    }
    if (user?.phone && !guestPhone) {
      setGuestPhone(user.phone);
    }
  }, [user]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load available rooms from API
  useEffect(() => {
    async function loadRooms() {
      try {
        const res = await fetch('/api/rooms');
        if (!res.ok) throw new Error('Could not load rooms');
        const data = await res.json();
        const available = data.filter((r) => r.status === 'Available');
        setRooms(available);

        // Check query params
        const params = new URLSearchParams(location.search);
        const qRoomId = params.get('roomId');
        const qRoomType = params.get('roomType');
        const qPkg = params.get('package');
        const qCheckIn = params.get('checkIn');
        const qCheckOut = params.get('checkOut');
        const qGuests = params.get('guests');

        if (qCheckIn) setCheckIn(qCheckIn);
        if (qCheckOut) setCheckOut(qCheckOut);
        if (qGuests) setGuests(qGuests);
        if (qPkg) setSelectedPackage(qPkg);

        let activeCat = 'All';
        if (qRoomType) {
          if (qRoomType.toLowerCase().includes('deluxe')) activeCat = 'Deluxe Room';
          else if (qRoomType.toLowerCase().includes('premium')) activeCat = 'Premium Room';
          else if (qRoomType.toLowerCase().includes('executive')) activeCat = 'Executive Suite';
          else activeCat = qRoomType;
          setSelectedCategory(activeCat);
        }

        let catRooms = available;
        if (activeCat !== 'All') {
          const catKeyword = activeCat.toLowerCase().split(' ')[0];
          catRooms = available.filter((r) =>
            (r.roomType || r.RoomType || '').toLowerCase().includes(catKeyword)
          );
        }

        if (qRoomId && available.some((r) => String(r.roomId || r.RoomId) === String(qRoomId))) {
          const matchedRoom = available.find((r) => String(r.roomId || r.RoomId) === String(qRoomId));
          setSelectedRoomId(String(qRoomId));
          if (matchedRoom && !qRoomType) {
            const rType = matchedRoom.roomType || matchedRoom.RoomType || '';
            if (rType.toLowerCase().includes('deluxe')) setSelectedCategory('Deluxe Room');
            else if (rType.toLowerCase().includes('premium')) setSelectedCategory('Premium Room');
            else if (rType.toLowerCase().includes('executive')) setSelectedCategory('Executive Suite');
          }
        } else if (catRooms.length > 0) {
          setSelectedRoomId(String(catRooms[0].roomId || catRooms[0].RoomId));
        } else if (available.length > 0) {
          setSelectedRoomId(String(available[0].roomId || available[0].RoomId));
        }
      } catch (err) {
        console.error('Error loading rooms:', err);
      }
    }

    loadRooms();
  }, [location.search]);

  // Recalculate live price whenever form values change
  useEffect(() => {
    if (!selectedRoomId || !checkIn || !checkOut) return;

    const calculatePrice = async () => {
      try {
        setCalcError('');
        const res = await fetch('/api/bookings/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: parseInt(selectedRoomId),
            checkIn: checkIn,
            checkOut: checkOut,
            numberOfGuests: parseInt(guests) || 1,
            package: selectedPackage
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          setCalcError(errData.message || 'Price calculation failed.');
          setPriceCalculation(null);
          return;
        }

        const data = await res.json();
        setPriceCalculation(data);
      } catch (err) {
        setCalcError(err.message || 'Error calculating price.');
        setPriceCalculation(null);
      }
    };

    calculatePrice();
  }, [selectedRoomId, checkIn, checkOut, guests, selectedPackage]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo({ show: false, type: '', message: '' });

    if (!user) {
      setAlertInfo({
        show: true,
        type: 'alert-danger',
        message: 'Please sign in or register before confirming your luxury booking.'
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (!selectedRoomId || !checkIn || !checkOut) {
      alert('Please select room, check-in, and check-out dates.');
      return;
    }

    if (!priceCalculation) {
      alert('Please wait for price calculation to complete.');
      return;
    }

    setPendingBookingData({
      roomId: parseInt(selectedRoomId),
      guestName: guestName.trim() || user.name,
      guestPhone: guestPhone.trim() || user.phone || '',
      checkIn: checkIn,
      checkOut: checkOut,
      numberOfGuests: parseInt(guests) || 1,
      package: selectedPackage,
      grandTotal: priceCalculation.grandTotal,
      nights: priceCalculation.nights
    });

    setQrModalOpen(true);
  };

  const handleConfirmPaid = async (method = 'UPI') => {
    if (!pendingBookingData) return;

    setIsProcessingPayment(true);

    try {
      const token = localStorage.getItem('token');
      const authHeaders = {
        'Content-Type': 'application/json'
      };
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      // 1. Create booking in database
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({
          roomId: pendingBookingData.roomId,
          guestName: pendingBookingData.guestName,
          phone: pendingBookingData.guestPhone,
          checkIn: pendingBookingData.checkIn,
          checkOut: pendingBookingData.checkOut,
          numberOfGuests: pendingBookingData.numberOfGuests,
          package: pendingBookingData.package
        })
      });

      let data = {};
      try {
        const text = await res.text();
        if (text) data = JSON.parse(text);
      } catch (parseErr) {
        console.warn('Booking response parse note:', parseErr);
      }

      if (!res.ok) {
        throw new Error(
          data.message || 
          (res.status === 401 
            ? 'Your session has expired. Please sign in again.' 
            : res.status === 403 
              ? 'Access denied. You do not have permission to book this suite.' 
              : 'Booking creation failed.')
        );
      }

      const bookingId = data.bookingId || data.BookingId;

      // 2. Mark new booking for user so review modal will be available upon their next logout
      const uid = user?.userId || user?.UserId;
      if (uid) {
        localStorage.setItem(`has_new_booking_since_review_${uid}`, 'true');
      } else {
        localStorage.setItem('guest_has_new_booking', 'true');
      }

      // 3. Mark booking payment method via payment API
      try {
        await fetch(`/api/bookings/${bookingId}/pay`, {
          method: 'POST',
          headers: authHeaders,
          credentials: 'include',
          body: JSON.stringify({ paymentMethod: method })
        });
      } catch (payErr) {
        console.warn('Payment recording note:', payErr);
      }

      setQrModalOpen(false);

      setAlertInfo({
        show: true,
        type: 'alert-success',
        bookingId: bookingId,
        message: method === 'Cash'
          ? `🎉 Reservation Confirmed! Booking #${bookingId} is confirmed. Official invoice and confirmation email have been sent to ${user?.email || 'your email'}. Please settle ₹${Number(pendingBookingData.grandTotal).toLocaleString('en-IN')} in cash at check-in.`
          : `🎉 Payment Verified! Booking #${bookingId} confirmed successfully via ${method}. Official invoice and confirmation email have been sent to ${user?.email || 'your email'}.`
      });

      setTimeout(() => {
        navigate('/my-bookings');
      }, 3000);
    } catch (err) {
      alert(`Reservation Failed: ${err.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCategoryChange = (newCat) => {
    setSelectedCategory(newCat);
    const catRooms = newCat === 'All'
      ? rooms
      : rooms.filter((r) => (r.roomType || r.RoomType || '').toLowerCase().includes(newCat.toLowerCase().split(' ')[0]));
    if (catRooms.length > 0) {
      if (!catRooms.some((r) => String(r.roomId || r.RoomId) === String(selectedRoomId))) {
        setSelectedRoomId(String(catRooms[0].roomId || catRooms[0].RoomId));
      }
    } else {
      setSelectedRoomId('');
    }
  };

  const displayedRooms = selectedCategory === 'All'
    ? rooms
    : rooms.filter((r) => {
        const type = (r.roomType || r.RoomType || '').toLowerCase();
        const catKey = selectedCategory.toLowerCase().split(' ')[0];
        return type.includes(catKey);
      });

  const selectedRoomObj = rooms.find((r) => String(r.roomId || r.RoomId) === String(selectedRoomId));
  const selectedRoomTitle = selectedRoomObj
    ? `Room ${selectedRoomObj.roomNumber} — ${selectedRoomObj.subType || selectedRoomObj.roomType}`
    : 'Luxury Suite';

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div>
      <Header />

      {/* Payment QR Modal */}
      <PaymentQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        suiteTitle={selectedRoomTitle}
        amount={priceCalculation?.grandTotal || 0}
        onConfirmPaid={handleConfirmPaid}
        isProcessing={isProcessingPayment}
      />

      {/* Subpage Banner */}
      <section
        style={{
          background: "linear-gradient(rgba(26, 37, 48, 0.85), rgba(26, 37, 48, 0.9)), url('/images/hero-exterior.jpg') center/cover",
          padding: '60px 20px',
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
            Direct Reservations
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '38px', marginBottom: '8px', color: '#FFF' }}>
            Confirm Your Luxury Stay
          </h1>
          <p
            style={{
              maxWidth: '550px',
              margin: '0 auto',
              color: 'var(--text-light-cream)',
              fontSize: '14.5px'
            }}
          >
            Customize your dates, select curated dining & wellness packages, and confirm your reservation.
          </p>
        </div>
      </section>

      {/* Main Booking Form & Price Calculator Container */}
      <main className="section container" style={{ paddingTop: '40px', paddingBottom: '70px' }}>
        {alertInfo.show && (
          <div className={`alert ${alertInfo.type}`} style={{ marginBottom: '25px', padding: '16px 20px', borderRadius: '6px' }}>
            <div style={{ fontSize: '14.5px', fontWeight: 600 }}>{alertInfo.message}</div>
            {alertInfo.bookingId && (
              <div style={{ marginTop: '12px' }}>
                <a
                  href={`/api/bookings/${alertInfo.bookingId}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{ backgroundColor: '#D97706', color: '#FFFFFF', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none', padding: '9px 16px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <i className="fa-solid fa-file-invoice"></i> View Official Invoice
                </a>
              </div>
            )}
          </div>
        )}

        <div className="booking-page-layout">
          {/* Reservation Form Card */}
          <div className="booking-form-card">
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '22px',
                color: 'var(--primary-color)',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '10px'
              }}
            >
              <i className="fa-solid fa-calendar-days" style={{ color: 'var(--accent-gold)', marginRight: '8px' }}></i>{' '}
              Reservation Details
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label
                  htmlFor="bookCategorySelect"
                  style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}
                >
                  Room Category Tier
                </label>
                <select
                  id="bookCategorySelect"
                  className="form-control"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={{ height: '44px', fontWeight: 600, marginBottom: '14px' }}
                >
                  <option value="All">All Categories ({rooms.length} Available Rooms)</option>
                  <option value="Deluxe Room">Deluxe Room Tier (₹1,000 – ₹6,400)</option>
                  <option value="Premium Room">Premium Room Tier (₹3,100 – ₹7,800)</option>
                  <option value="Executive Suite">Executive Suite Tier (₹4,100 – ₹10,000)</option>
                </select>
              </div>

              <div className="form-group">
                <label
                  htmlFor="bookRoomSelect"
                  style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}
                >
                  Select Suite / Room ({displayedRooms.length} Available) *
                </label>
                <select
                  id="bookRoomSelect"
                  className="form-control"
                  required
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  style={{ height: '44px', fontWeight: 600 }}
                >
                  {displayedRooms.length === 0 ? (
                    <option value="">No available rooms in this category</option>
                  ) : (
                    displayedRooms.map((r) => {
                      const id = r.roomId || r.RoomId;
                      return (
                        <option key={id} value={id}>
                          Room {r.roomNumber} — {r.subType || r.roomType} (₹{Number(r.price).toLocaleString('en-IN')}/night)
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <div className="form-group">
                <label
                  htmlFor="bookGuestName"
                  style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}
                >
                  Primary Guest Full Name *
                </label>
                <input
                  type="text"
                  id="bookGuestName"
                  className="form-control"
                  placeholder="e.g. Ansu Kumar"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  style={{ height: '44px' }}
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="bookGuestPhone"
                  style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}
                >
                  Primary Guest Mobile Number
                </label>
                <input
                  type="tel"
                  id="bookGuestPhone"
                  className="form-control"
                  placeholder="e.g. +91 81243 37117"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  style={{ height: '44px' }}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                  <i className="fa-solid fa-bell" style={{ color: 'var(--accent-gold)' }}></i> Official confirmation email with itemized invoice will be sent to your registered email address.
                </small>
              </div>

              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label
                    htmlFor="bookCheckIn"
                    style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}
                  >
                    Check-In Date *
                  </label>
                  <input
                    type="date"
                    id="bookCheckIn"
                    className="form-control"
                    min={todayStr}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    style={{ height: '44px' }}
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor="bookCheckOut"
                    style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}
                  >
                    Check-Out Date *
                  </label>
                  <input
                    type="date"
                    id="bookCheckOut"
                    className="form-control"
                    min={checkIn || todayStr}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    style={{ height: '44px' }}
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label
                    htmlFor="bookGuests"
                    style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}
                  >
                    Guests *
                  </label>
                  <select
                    id="bookGuests"
                    className="form-control"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    style={{ height: '44px' }}
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5+ Guests</option>
                  </select>
                </div>
                <div className="form-group">
                  <label
                    htmlFor="bookPackageSelect"
                    style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}
                  >
                    Experience Package
                  </label>
                  <select
                    id="bookPackageSelect"
                    className="form-control"
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    style={{ height: '44px' }}
                  >
                    <option value="Stay">Stay (Room Accommodation Only)</option>
                    <option value="Food">Food (Gourmet Dining Plan — ₹1,000/guest/night)</option>
                    <option value="Stay + Food">Stay + Food (Room + Gourmet Dining — +₹1,000/guest/night)</option>
                    <option value="Stay + Food + Tour & Travel">
                      Stay + Food + Tour & Travel (All-Inclusive Stay + Dining + Tour & Travel — +₹2,500/guest/night)
                    </option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="fa-solid fa-lock" style={{ color: 'var(--accent-gold)' }}></i> Proceed to Instant Payment
              </button>
            </form>
          </div>

          {/* Dynamic Price Summary Box */}
          <div id="priceSummaryBox">
            {calcError && <div className="alert alert-danger" style={{ marginTop: '10px' }}>{calcError}</div>}

            {priceCalculation && (
              <div
                style={{
                  background: 'var(--bg-ivory)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                <h4
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '20px',
                    color: 'var(--primary-color)',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '10px'
                  }}
                >
                  <i className="fa-solid fa-calculator" style={{ color: 'var(--accent-gold)', marginRight: '8px' }}></i>{' '}
                  Tariff & Price Breakdown
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Room Rate ({priceCalculation.nights} night(s) × ₹
                    {Number(priceCalculation.pricePerNight).toLocaleString('en-IN')}):
                  </span>
                  <strong style={{ color: 'var(--primary-color)' }}>
                    ₹{Number(priceCalculation.roomSubtotal).toLocaleString('en-IN')}
                  </strong>
                </div>

                {priceCalculation.packageSubtotal > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      fontSize: '14px',
                      color: 'var(--accent-terracotta)'
                    }}
                  >
                    <span>
                      {priceCalculation.packageName} (₹{priceCalculation.packageRatePerNightPerGuest} ×{' '}
                      {priceCalculation.guests} guest(s) × {priceCalculation.nights} night(s)):
                    </span>
                    <strong>+ ₹{Number(priceCalculation.packageSubtotal).toLocaleString('en-IN')}</strong>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '16px',
                    paddingTop: '14px',
                    borderTop: '2px solid var(--accent-gold)',
                    fontSize: '20px'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Estimated Grand Total:</span>
                  <strong
                    style={{
                      color: 'var(--accent-terracotta)',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '24px'
                    }}
                  >
                    ₹{Number(priceCalculation.grandTotal).toLocaleString('en-IN')}
                  </strong>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'right' }}>
                  * Includes all luxury taxes, complimentary Wi-Fi 6, and 24/7 guest service
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
