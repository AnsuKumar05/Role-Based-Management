import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomMeta } from '../../data/roomMetadata';

export default function RoomDetailsModal({ isOpen, onClose, room, onOpenGallery }) {
  const navigate = useNavigate();

  if (!isOpen || !room) return null;

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
  const displayTitle = rSubType || meta.title || rType;

  const handleBook = () => {
    onClose();
    navigate(`/booking?roomId=${rId}`);
  };

  return (
    <div id="details-modal" className="modal" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ maxWidth: '680px', padding: '30px', borderRadius: '6px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '15px',
            marginBottom: '15px'
          }}
        >
          <div>
            <h3
              id="modal-room-title"
              style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--primary-color)', marginBottom: '4px' }}
            >
              Room {rNumber} — {displayTitle}
            </h3>
            <span
              id="modal-room-badge"
              className={`badge badge-${rStatus === 'Available' ? 'confirmed' : rStatus === 'Occupied' ? 'cancelled' : 'pending'}`}
            >
              {rStatus === 'Available' ? 'Available for Booking' : rStatus}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '26px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              lineHeight: 1
            }}
            aria-label="Close Modal"
          >
            &times;
          </button>
        </div>

        {gallery.length > 0 && (
          <div
            id="modal-photo-strip"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '10px',
              margin: '15px 0 20px 0'
            }}
          >
            {gallery.map((p, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onClose();
                  if (onOpenGallery) onOpenGallery(meta.gallery, `Room ${rNumber} — ${displayTitle}`, rId, rPrice, idx);
                }}
                style={{
                  position: 'relative',
                  height: '85px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)'
                }}
                title={`${p.title} (Click to expand)`}
              >
                <img
                  src={p.url}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/deluxe-room.jpg';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.65)',
                    color: '#FFF',
                    fontSize: '9.5px',
                    padding: '2px 4px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {p.title}
                </span>
              </div>
            ))}
          </div>
        )}

        <div id="modal-room-desc" style={{ marginBottom: '20px' }}>
          <div style={{ fontStyle: 'italic', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
            "{meta.tagline}"
          </div>
          <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-charcoal)' }}>
            {rDesc || meta.tagline}
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item" style={{ background: 'var(--bg-warm-white)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px 14px' }}>
            <div className="detail-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Room Number
            </div>
            <div className="detail-value" id="modal-room-number" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-color)' }}>
              {rNumber}
            </div>
          </div>
          <div className="detail-item" style={{ background: 'var(--bg-warm-white)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px 14px' }}>
            <div className="detail-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Suite Category
            </div>
            <div className="detail-value" id="modal-room-type" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-color)' }}>
              {rType} {rSubType ? `(${rSubType})` : ''}
            </div>
          </div>
          <div className="detail-item" style={{ background: 'var(--bg-warm-white)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px 14px' }}>
            <div className="detail-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Capacity & Size
            </div>
            <div className="detail-value" id="modal-room-capacity" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-color)' }}>
              {rCapacity} Guests ({meta.specs?.size || 'Spacious'})
            </div>
          </div>
          <div className="detail-item" style={{ background: 'var(--bg-warm-white)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px 14px' }}>
            <div className="detail-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Nightly Tariff
            </div>
            <div className="detail-value" id="modal-room-price" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-terracotta)' }}>
              ₹{Number(rPrice).toLocaleString('en-IN')} / night
            </div>
          </div>
        </div>

        <div id="modal-amenities-box" style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>
            Included 5 Key Facilities:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(meta.facilities || []).map((a, idx) => (
              <span key={idx} className="amenity-tag" style={{ background: 'var(--bg-cream)', color: 'var(--primary-color)', fontWeight: 600 }}>
                <i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> {a}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '10px 18px' }}>
            Close
          </button>
          {rStatus === 'Available' && (
            <button className="btn btn-primary" onClick={handleBook} style={{ padding: '10px 22px' }}>
              <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px' }}></i> Proceed to Booking (₹{Number(rPrice).toLocaleString('en-IN')})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
