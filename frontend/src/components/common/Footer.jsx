import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/index.html' || location.pathname === '/home';

  const handleNavClick = (sectionId) => {
    if (isHome) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>Ansu Kumar Hotels</h4>
          <p style={{ marginBottom: '15px' }}>
            Where traditional Indian hospitality seamlessly blends with modern boutique resort comfort.
          </p>
          <p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=102+Palace+Orchard+Boulevard,+Avinashi+Road,+Coimbatore,+Tamil+Nadu,+India"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-gold)' }}></i> Coimbatore, Tamil Nadu, India
            </a>
          </p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('about');
                }}
              >
                About Our Hotel
              </a>
            </li>
            <li>
              <Link to="/rooms">Rooms & Suites</Link>
            </li>
            <li>
              <a
                href="#dining"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('dining');
                }}
              >
                Fine Dining
              </a>
            </li>
            <li>
              <a
                href="#events"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('events');
                }}
              >
                Royal Banquets
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support & Account</h4>
          <ul className="footer-support-auth">
            <li>
              <Link to="/login">User Login</Link>
            </li>
            <li>
              <Link to="/register">Create Account</Link>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('contact');
                }}
              >
                Guest Concierge & Help
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('contact');
                }}
              >
                Location Guide
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 ANSU KUMAR HOTELS & Spa. All Rights Reserved. Designed for premium comfort.</p>
      </div>
    </footer>
  );
}
