import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FloatingRoomGallery({ isOpen, onClose, photos = [], roomTitle = '', roomId = null, price = 0, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, photos.length, onClose]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];
  const totalPhotos = photos.length;

  const handleBookClick = () => {
    onClose();
    if (roomId) {
      navigate(`/booking?roomId=${roomId}`);
    } else if (roomTitle) {
      let cat = 'Deluxe Room';
      if (roomTitle.toLowerCase().includes('deluxe')) cat = 'Deluxe Room';
      else if (roomTitle.toLowerCase().includes('premium')) cat = 'Premium Room';
      else if (roomTitle.toLowerCase().includes('executive')) cat = 'Executive Suite';
      navigate(`/booking?roomType=${encodeURIComponent(cat)}`);
    } else {
      navigate('/booking');
    }
  };

  return (
    <div id="floating-room-gallery-modal" className="room-gallery-lightbox" style={{ display: 'flex' }}>
      <div className="gallery-modal-backdrop" onClick={onClose}></div>
      <div className="gallery-modal-wrapper">
        <div className="gallery-modal-header">
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: '#FFF', marginBottom: '2px' }}>
              {roomTitle}
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 500 }}>
              Photo {currentIndex + 1} of {totalPhotos} • {currentPhoto.title}
            </span>
          </div>
          <button className="gallery-close-btn" onClick={onClose} aria-label="Close Gallery">
            &times;
          </button>
        </div>

        <div className="gallery-main-view">
          <button
            className="gallery-nav-btn prev"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos)}
            aria-label="Previous Photo"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <div className="gallery-image-box">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              className="gallery-active-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/deluxe-room.jpg';
              }}
            />
            <div className="gallery-caption-bar">
              <span className="gallery-category-tag">{currentPhoto.title}</span>
              <p className="gallery-caption-text">{currentPhoto.caption}</p>
            </div>
          </div>

          <button
            className="gallery-nav-btn next"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % totalPhotos)}
            aria-label="Next Photo"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <div className="gallery-filmstrip-container">
          <div className="gallery-filmstrip">
            {photos.map((p, idx) => (
              <div
                key={idx}
                className={`gallery-thumb-item ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                <img
                  src={p.url}
                  alt={p.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/deluxe-room.jpg';
                  }}
                />
                <span>{p.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gallery-modal-footer">
          <span style={{ color: '#A3B8CC', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-lightbulb" style={{ color: 'var(--accent-gold)' }}></i> Use keyboard arrow keys or click arrows to browse photos
          </span>
          <button
            className="btn btn-primary"
            onClick={handleBookClick}
            style={{ padding: '10px 24px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="fa-solid fa-calendar-check"></i> Book Accommodation
          </button>
        </div>
      </div>
    </div>
  );
}
