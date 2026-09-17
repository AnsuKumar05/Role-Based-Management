import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header, Footer, PaymentQRModal } from '../components/common';
import { useAuth } from '../context/AuthContext';

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payment modal state
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchBookings();
    }
  }, [user, authLoading]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/bookings/my', { headers, credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to load your reservations.');
      }
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading reservations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you wish to cancel Booking #${bookingId}?`)) return;

    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { 
        method: 'PUT',
        headers,
        credentials: 'include'
      });
      let data = {};
      try {
        const text = await res.text();
        if (text) data = JSON.parse(text);
      } catch { }
      if (!res.ok) throw new Error(data.message || 'Cancellation failed.');

      setSuccess(`Booking #${bookingId} cancelled successfully.`);
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Error cancelling booking.');
    }
  };

  const handleConfirmPaid = async (method = 'UPI') => {
    if (!activePaymentBooking) return;

    setIsProcessingPayment(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/bookings/${activePaymentBooking.bookingId}/pay`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ paymentMethod: method })
      });

      let data = {};
      try {
        const text = await res.text();
        if (text) data = JSON.parse(text);
      } catch { }
      if (!res.ok) throw new Error(data.message || 'Payment processing failed.');

      setSuccess(
        method === 'Cash'
          ? `Reservation Confirmed! Booking #${activePaymentBooking.bookingId} will be settled in cash at check-in.`
          : `Payment of ₹${Number(data.totalAmount || activePaymentBooking.totalAmount).toLocaleString('en-IN')} verified successfully via ${method}! Ref: ${data.transactionId || 'PAID'}`
      );
      setActivePaymentBooking(null);
      fetchBookings();
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div>
      <Header />

      {/* Payment QR Modal */}
      <PaymentQRModal
        isOpen={!!activePaymentBooking}
        onClose={() => setActivePaymentBooking(null)}
        suiteTitle={activePaymentBooking?.room ? `${activePaymentBooking.room.roomType} (Room #${activePaymentBooking.room.roomNumber})` : 'Luxury Suite'}
        amount={activePaymentBooking?.totalAmount || 0}
        bookingRef={`Booking #${activePaymentBooking?.bookingId}`}
        onConfirmPaid={handleConfirmPaid}
        isProcessing={isProcessingPayment}
      />

      <main className="container" style={{ minHeight: '75vh', paddingTop: '40px', paddingBottom: '60px' }}>
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '30px' }}>
          <div
            style={{
              color: 'var(--accent-gold)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '6px'
            }}
          >
            Guest Portfolio
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: 'var(--primary-color)' }}>
            My Reservation <span>History</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
            Review your upcoming stays, complete UPI payments, download tax invoices, or manage active bookings.
          </p>
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{success}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
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
            <p>Loading your reservations...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div
            style={{
              background: '#FFF',
              border: '1px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>
              <i className="fa-solid fa-hotel" style={{ color: 'var(--accent-gold)' }}></i>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#1A2530', marginBottom: '8px' }}>
              No Reservations Yet
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>
              You have no active or previous room reservations.
            </p>
            <Link to="/rooms" className="btn btn-primary">
              Reserve a Suite Now
            </Link>
          </div>
        ) : (
          <div className="table-wrapper" style={{ background: 'var(--bg-ivory)', border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: 'var(--shadow-subtle)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-cream)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary-color)' }}>Booking #</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary-color)' }}>Suite Details</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary-color)' }}>Guest & Package</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary-color)' }}>Dates & Nights</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary-color)' }}>Tariff & Payment</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary-color)' }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary-color)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const isPaid = b.paymentStatus === 'Paid';
                  const isCancelled = b.bookingStatus === 'Cancelled';
                  const isCheckedIn = b.bookingStatus === 'CheckedIn';
                  const isCheckedOut = b.bookingStatus === 'CheckedOut';
                  const canCancel = !isCancelled && !isCheckedIn && !isCheckedOut;

                  const checkInDate = new Date(b.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  const checkOutDate = new Date(b.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                  let statusBadgeClass = 'pending';
                  if (b.bookingStatus === 'Confirmed') statusBadgeClass = 'confirmed';
                  if (b.bookingStatus === 'CheckedIn') statusBadgeClass = 'checkedin';
                  if (b.bookingStatus === 'CheckedOut') statusBadgeClass = 'checkedout';
                  if (b.bookingStatus === 'Cancelled') statusBadgeClass = 'cancelled';

                  return (
                    <tr key={b.bookingId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent-terracotta)' }}>
                        #{b.bookingId}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <strong style={{ color: 'var(--primary-color)' }}>
                          {b.room ? b.room.roomType : 'Luxury Room'}
                        </strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Room #{b.room ? b.room.roomNumber : 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div>{b.guestName}</div>
                        <span className="badge badge-package" style={{ fontSize: '11px', marginTop: '4px' }}>
                          <i className="fa-solid fa-star" style={{ color: 'var(--accent-gold)' }}></i> {b.package || 'Stay'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                        <div>{checkInDate} → {checkOutDate}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          <i className="fa-solid fa-user-group"></i> {b.numberOfGuests} Guests
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent-terracotta)', fontSize: '15px' }}>
                          ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                        </div>
                        <span className={`badge ${isPaid ? 'badge-paid' : 'badge-pending'}`} style={{ fontSize: '11px', marginTop: '4px' }}>
                          {b.paymentStatus}
                        </span>
                        {b.transactionId && (
                          <div style={{ fontSize: '10.5px', color: '#27AE60', marginTop: '2px' }}>
                            Ref: {b.transactionId}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge badge-${statusBadgeClass}`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {!isPaid && !isCancelled && (
                            <button
                              onClick={() => setActivePaymentBooking(b)}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              <i className="fa-solid fa-credit-card"></i> Pay
                            </button>
                          )}

                          <a
                            href={`/api/bookings/${b.bookingId}/invoice`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <i className="fa-solid fa-file-invoice"></i> Invoice
                          </a>

                          {canCancel && (
                            <button
                              onClick={() => handleCancelBooking(b.bookingId)}
                              className="btn btn-danger"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
