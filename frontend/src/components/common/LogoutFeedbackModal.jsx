import React, { useState } from 'react';

export default function LogoutFeedbackModal({ isOpen, onClose, onSkip, onSubmitFeedback }) {
  if (!isOpen) return null;

  const [ratings, setRatings] = useState({
    room: 0,
    food: 0,
    facilities: 0,
    service: 0,
  });

  const [hoverRatings, setHoverRatings] = useState({
    room: 0,
    food: 0,
    facilities: 0,
    service: 0,
  });

  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { key: 'room', label: 'Room & Suite Comfort', icon: 'fa-bed' },
    { key: 'food', label: 'Food & Gastronomy', icon: 'fa-utensils' },
    { key: 'facilities', label: 'Resort Facilities & Cleanliness', icon: 'fa-water-pool' },
    { key: 'service', label: 'Hospitality & Staff Service', icon: 'fa-handshake-angle' },
  ];

  const ratingLabels = {
    0: 'Select Rating',
    5: 'Excellent',
    4: 'Very Good',
    3: 'Good',
    2: 'Fair',
    1: 'Poor',
  };

  const handleStarClick = (key, starVal) => {
    setRatings((prev) => ({ ...prev, [key]: starVal }));
  };

  const handleStarHover = (key, starVal) => {
    setHoverRatings((prev) => ({ ...prev, [key]: starVal }));
  };

  const handleStarLeave = (key) => {
    setHoverRatings((prev) => ({ ...prev, [key]: 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    const feedbackData = {
      roomRating: ratings.room,
      foodRating: ratings.food,
      facilitiesRating: ratings.facilities,
      serviceRating: ratings.service,
      comments: comments,
      timestamp: new Date().toISOString(),
    };

    // Save to Database via API
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });
    } catch (err) {
      console.warn('Error saving feedback to database:', err);
    }

    // Backup in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('hotel_guest_feedback_history') || '[]');
      existing.unshift(feedbackData);
      localStorage.setItem('hotel_guest_feedback_history', JSON.stringify(existing));
    } catch (err) {
      console.warn('Could not save feedback to localStorage:', err);
    }

    setTimeout(() => {
      onSubmitFeedback(feedbackData);
    }, 700);
  };

  return (
    <div className="feedback-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="feedback-modal-card">
        {/* Header */}
        <div className="feedback-modal-header">
          <div className="feedback-header-title">
            <i className="fa-solid fa-crown" style={{ color: 'var(--accent-gold)', marginRight: '8px' }}></i>
            <h3>Rate Your Experience</h3>
          </div>
          <button type="button" className="feedback-modal-close" onClick={onClose} title="Cancel & Stay Signed In">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p className="feedback-subtitle">
          We hope you enjoyed your stay! Please take a quick moment to rate your experience before logging out.
        </p>

        {isSubmitted ? (
          <div className="feedback-success-box">
            <i className="fa-solid fa-circle-check" style={{ fontSize: '36px', color: '#10B981', marginBottom: '10px' }}></i>
            <h4>Thank You for Your Feedback!</h4>
            <p>Your ratings help us maintain 5-star luxury hospitality.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            {/* Rating Categories */}
            <div className="feedback-categories-list">
              {categories.map((cat) => {
                const currentScore = hoverRatings[cat.key] || ratings[cat.key];
                return (
                  <div key={cat.key} className="feedback-rating-row">
                    <div className="feedback-cat-info">
                      <span className="feedback-cat-label">
                        <i className={`fa-solid ${cat.icon}`} style={{ color: 'var(--accent-gold)', marginRight: '6px' }}></i>
                        {cat.label}
                      </span>
                      <span className="feedback-cat-score-text">
                        {ratingLabels[currentScore]}
                      </span>
                    </div>

                    <div className="feedback-stars-container" onMouseLeave={() => handleStarLeave(cat.key)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="star-btn"
                          onClick={() => handleStarClick(cat.key, star)}
                          onMouseEnter={() => handleStarHover(cat.key, star)}
                          aria-label={`Rate ${star} stars out of 5 for ${cat.label}`}
                        >
                          <i
                            className={`fa-solid fa-star ${star <= currentScore ? 'active' : ''}`}
                          ></i>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Comments Textarea */}
            <div className="feedback-textarea-group">
              <label className="feedback-textarea-label">
                Additional Comments / Suggestions <span style={{ fontWeight: 400, opacity: 0.7 }}>(Optional)</span>
              </label>
              <textarea
                className="form-control feedback-textarea"
                rows="2"
                placeholder="What did you enjoy most, or how can we improve?"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                maxLength={500}
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="feedback-actions">
              <button type="submit" className="btn btn-primary feedback-submit-btn">
                <i className="fa-solid fa-paper-plane" style={{ marginRight: '6px' }}></i>
                Submit & Logout
              </button>
              <button type="button" className="btn btn-secondary feedback-skip-btn" onClick={onSkip}>
                <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '6px' }}></i>
                Skip & Logout
              </button>
              <button type="button" className="feedback-cancel-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
