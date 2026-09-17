import React, { useState } from 'react';

export default function PaymentQRModal({
  isOpen,
  onClose,
  suiteTitle = 'Luxury Suite',
  amount = 0,
  bookingRef = '',
  onConfirmPaid,
  isProcessing = false
}) {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Card' | 'Cash'
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const handleConfirm = () => {
    if (paymentMethod === 'Card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        alert('Please fill in card details.');
        return;
      }
    }
    onConfirmPaid(paymentMethod);
  };

  return (
    <div id="bookingPaymentModal" className="qr-modal" style={{ display: 'flex' }}>
      <div className="qr-modal-card" style={{ maxWidth: '480px' }}>
        <div className="qr-modal-header">
          <h3 className="qr-modal-title">
            <i className="fa-solid fa-lock" style={{ color: 'var(--accent-gold)' }}></i> Complete Luxury Reservation
          </h3>
          <button type="button" onClick={onClose} className="qr-modal-close-btn" aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="qr-modal-suite-box">
          <div className="qr-modal-suite-name" id="scanSuiteName">
            {suiteTitle}
          </div>
          <div className="qr-modal-amount" id="scanAmountDisplay">
            ₹{Number(amount).toLocaleString('en-IN')}
          </div>
          <div className="qr-modal-badge">
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-gold)' }}></i> 256-Bit Encrypted Secure Gateway
          </div>
        </div>

        {/* Payment Method Selector */}
        <div style={{ padding: '0 20px', marginTop: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Choose Payment Method:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 4px', fontSize: '11px', flexDirection: 'column', gap: '4px' }}
              onClick={() => setPaymentMethod('UPI')}
            >
              <i className="fa-solid fa-qrcode" style={{ fontSize: '16px' }}></i>
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              className={`btn ${paymentMethod === 'Card' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 4px', fontSize: '11px', flexDirection: 'column', gap: '4px' }}
              onClick={() => setPaymentMethod('Card')}
            >
              <i className="fa-solid fa-credit-card" style={{ fontSize: '16px' }}></i>
              <span>Card (Debit/Credit)</span>
            </button>
            <button
              type="button"
              className={`btn ${paymentMethod === 'Cash' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 4px', fontSize: '11px', flexDirection: 'column', gap: '4px' }}
              onClick={() => setPaymentMethod('Cash')}
            >
              <i className="fa-solid fa-money-bill-wave" style={{ fontSize: '16px' }}></i>
              <span>Pay at Hotel</span>
            </button>
          </div>
        </div>

        {/* Method 1: UPI */}
        {paymentMethod === 'UPI' && (
          <div>
            <div className="qr-modal-img-frame" style={{ margin: '15px auto 10px auto' }}>
              <img
                src="/images/gpay-qr.jpg"
                alt="Google Pay QR Code for Ansu Kumar Hotels"
                className="qr-modal-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/scanner.jpg';
                }}
              />
            </div>
            <div className="qr-modal-help">
              <p>
                <i className="fa-solid fa-mobile-screen-button" style={{ color: 'var(--accent-gold)', marginRight: '6px' }}></i>
                Scan with <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, or any UPI App.
              </p>
            </div>
          </div>
        )}

        {/* Method 2: Card (Debit/Credit) */}
        {paymentMethod === 'Card' && (
          <div style={{ padding: '16px 20px 0 20px' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px' }}>Card Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="4111 2222 3333 4444"
                maxLength="19"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '11px' }}>Expiry (MM/YY)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="12/28"
                  maxLength="5"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '11px' }}>CVV</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="•••"
                  maxLength="4"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '11px' }}>Cardholder Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Name on card"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Method 3: Cash */}
        {paymentMethod === 'Cash' && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '50%', background: 'rgba(39, 174, 96, 0.15)', color: '#27AE60', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '24px' }}>
              <i className="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>Pay at Check-In (Cash)</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Your luxury suite reservation will be confirmed instantly. You can settle the bill of <strong>₹{Number(amount).toLocaleString('en-IN')}</strong> in cash at the hotel front desk upon arrival.
            </p>
          </div>
        )}

        <div className="qr-modal-actions" style={{ padding: '16px 20px 20px 20px' }}>
          <button
            type="button"
            className="btn btn-primary qr-modal-btn-confirm"
            id="btnIHavePaid"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Processing Reservation...
              </>
            ) : paymentMethod === 'Cash' ? (
              <>
                <i className="fa-solid fa-circle-check"></i> Confirm Reservation (Pay at Hotel)
              </>
            ) : paymentMethod === 'Card' ? (
              <>
                <i className="fa-solid fa-credit-card"></i> Pay ₹{Number(amount).toLocaleString('en-IN')} via Card
              </>
            ) : (
              <>
                <i className="fa-solid fa-circle-check"></i> I Have Paid via UPI
              </>
            )}
          </button>
          <button type="button" className="btn btn-secondary qr-modal-btn-cancel" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
