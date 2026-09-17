import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/' || location.pathname === '/index.html' || location.pathname === '/home';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on outside click or Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#navbar-links') && !e.target.closest('#hamburger-btn')) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (isHome) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    await logout();
  };

  return (
    <header className="site-header">
        {/* Line 1: Top Utility & Concierge Bar */}
        <div className="header-topbar">
        <div className="topbar-container">
          <div className="topbar-left">
            <a href="tel:+918124337117" className="topbar-item">
              <i className="fa-solid fa-phone"></i> +91 81243 37117
            </a>
            <a href="mailto:reservations@ansukumarhotels.com" className="topbar-item">
              <i className="fa-solid fa-envelope"></i> reservations@ansukumarhotels.com
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=102+Palace+Orchard+Boulevard,+Avinashi+Road,+Coimbatore,+Tamil+Nadu,+India"
              target="_blank"
              rel="noopener noreferrer"
              className="topbar-item"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <i className="fa-solid fa-location-dot"></i> Coimbatore, Tamil Nadu
            </a>
          </div>

          <div className="topbar-right" id="topbar-auth">
            {/* Theme Toggle */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <i className="fa-solid fa-sun" style={{ color: '#F59E0B' }}></i>
                  <span className="theme-label" style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 700 }}>
                    Light
                  </span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-moon" style={{ color: '#FCD34D' }}></i>
                  <span className="theme-label" style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 700 }}>
                    Dark
                  </span>
                </>
              )}
            </button>

            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="topbar-admin-badge">
                    <i className="fa-solid fa-crown"></i> {user.role === 'Admin' ? 'Admin Portal' : user.role === 'Manager' ? 'Manager Portal' : 'Staff Portal'}
                  </Link>
                )}
                <Link to="/my-bookings">
                  <i className="fa-solid fa-suitcase"></i> My Bookings
                </Link>
                <Link to="/profile" style={{ color: 'var(--accent-gold)' }}>
                  <i className="fa-solid fa-user"></i> {user.name}
                </Link>
                <a href="#logout" onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </a>
              </>
            ) : (
              <>
                <Link to="/login">
                  <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In
                </Link>
                <Link to="/register">
                  <i className="fa-solid fa-user-plus"></i> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Line 2: Main Navigation Bar */}
      <div className="navbar header-mainnav">
        <div className="nav-container">
          <Link to="/" className="logo">
            <i className="fa-solid fa-crown" style={{ color: 'var(--accent-gold)', marginRight: '6px' }}></i> ANSU KUMAR{' '}
            <span>HOTELS</span>
          </Link>

          {/* Mobile-Only Action Cluster (Hidden on Desktop via CSS) */}
          <div className="nav-mobile-actions">
            <button
              type="button"
              className="mobile-theme-btn"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            {user ? (
              <Link to="/profile" className="mobile-user-quickbtn" title={user.name}>
                <i className="fa-solid fa-circle-user"></i>
              </Link>
            ) : (
              <Link to="/login" className="mobile-user-quickbtn" title="Sign In">
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
              </Link>
            )}

            <button
              className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
              id="hamburger-btn"
              aria-label="Toggle Navigation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`} id="navbar-links">
            {/* Mobile Menu User Header (Mobile Only) */}
            {user && (
              <div className="mobile-nav-user-header">
                <div className="mobile-user-avatar">
                  <i className="fa-solid fa-user-check"></i>
                </div>
                <div className="mobile-user-details">
                  <div className="mobile-user-name">{user.name}</div>
                  <div className="mobile-user-role">{user.role === 'Admin' ? 'Administrator' : user.role === 'Manager' ? 'Operations Manager' : user.role === 'Staff' ? 'Front Desk Staff' : 'Guest Member'}</div>
                </div>
              </div>
            )}

            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('about');
              }}
            >
              <i className="fa-solid fa-hotel mobile-link-icon"></i>
              About
            </a>
            <Link to="/rooms" className={location.pathname === '/rooms' ? 'active' : ''}>
              <i className="fa-solid fa-bed mobile-link-icon"></i>
              Rooms & Suites
            </Link>
            <a
              href="#dining"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('dining');
              }}
            >
              <i className="fa-solid fa-utensils mobile-link-icon"></i>
              Dining
            </a>
            <a
              href="#facilities"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('facilities');
              }}
            >
              <i className="fa-solid fa-spa mobile-link-icon"></i>
              Facilities
            </a>
            <a
              href="#events"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('events');
              }}
            >
              <i className="fa-solid fa-champagne-glasses mobile-link-icon"></i>
              Events
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('contact');
              }}
            >
              <i className="fa-solid fa-location-dot mobile-link-icon"></i>
              Contact
            </a>

            {user ? (
              <div className="desktop-user-nav mobile-nav-user-section">
                {isAdmin && (
                  <Link to="/admin" className="mobile-admin-link" style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                    <i className="fa-solid fa-crown" style={{ marginRight: '6px' }}></i> {user.role === 'Admin' ? 'Admin Portal' : user.role === 'Manager' ? 'Manager Portal' : 'Staff Portal'}
                  </Link>
                )}
                <Link to="/my-bookings" className="mobile-nav-sublink">
                  <i className="fa-solid fa-suitcase" style={{ marginRight: '6px' }}></i> My Bookings
                </Link>
                <Link to="/profile" className="mobile-nav-sublink" style={{ fontWeight: 600, color: 'var(--accent-terracotta)' }}>
                  <i className="fa-solid fa-user" style={{ marginRight: '6px' }}></i> {user.name}
                </Link>
                <a
                  href="#logout"
                  onClick={handleLogout}
                  className="btn btn-secondary mobile-logout-btn"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '6px' }}></i> Logout
                </a>
              </div>
            ) : (
              <div className="desktop-guest-nav mobile-nav-auth-buttons">
                <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                  <i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: '4px' }}></i> Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                  <i className="fa-solid fa-user-plus" style={{ marginRight: '4px' }}></i> Register
                </Link>
              </div>
            )}

            {/* Mobile Concierge Contact Info (Mobile Only) */}
            <div className="mobile-nav-footer">
              <a href="tel:+918124337117" className="mobile-nav-footer-item">
                <span className="mobile-footer-icon"><i className="fa-solid fa-phone"></i></span>
                <span className="mobile-footer-text">+91 81243 37117</span>
              </a>
              <a href="mailto:reservations@ansukumarhotels.com" className="mobile-nav-footer-item">
                <span className="mobile-footer-icon"><i className="fa-solid fa-envelope"></i></span>
                <span className="mobile-footer-text">reservations@ansukumarhotels.com</span>
              </a>
            </div>
          </nav>
        </div>
      </div>
      </header>
  );
}
