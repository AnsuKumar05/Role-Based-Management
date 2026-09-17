import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components/common';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading || !user) {
    return (
      <div>
        <Header />
        <main className="container" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
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
            <p>Loading Profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Active Member';

  return (
    <div>
      <Header />

      <main
        className="container"
        style={{
          minHeight: '75vh',
          paddingTop: '40px',
          paddingBottom: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div
            style={{
              color: 'var(--accent-gold)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '6px'
            }}
          >
            Account Details
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: 'var(--primary-color)' }}>
            Guest <span>Profile</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Review your credentials and membership status at Ansu Kumar Hotels.
          </p>
        </div>

        <div className="auth-wrapper" style={{ width: '100%', maxWidth: '500px' }}>
          <div
            className="auth-card"
            style={{
              padding: '35px 30px',
              backgroundColor: 'var(--bg-ivory)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              boxShadow: 'var(--shadow-medium)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px', color: 'var(--accent-gold)' }}>
                <i className="fa-solid fa-circle-user"></i>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--primary-color)', marginBottom: '4px' }}>
                {user.name}
              </h3>
              <span 
                className={`badge ${
                  user.role === 'Admin' ? 'badge-confirmed' :
                  user.role === 'Manager' ? 'badge-paid' :
                  user.role === 'Staff' ? 'badge-pending' :
                  'badge-package'
                }`} 
                style={{ fontSize: '12px' }}
              >
                {
                  user.role === 'Admin' ? 'System Administrator' :
                  user.role === 'Manager' ? 'Operations Manager' :
                  user.role === 'Staff' ? 'Front Desk Staff' :
                  'Guest Account'
                }
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Email Address
              </label>
              <input
                type="text"
                className="form-control"
                readOnly
                value={user.email}
                style={{ backgroundColor: 'var(--bg-cream)', cursor: 'not-allowed', height: '42px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Phone Number
              </label>
              <input
                type="text"
                className="form-control"
                readOnly
                value={user.phone || '+91 81243 37117'}
                style={{ backgroundColor: 'var(--bg-cream)', cursor: 'not-allowed', height: '42px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Account Created On
              </label>
              <input
                type="text"
                className="form-control"
                readOnly
                value={createdDate}
                style={{ backgroundColor: 'var(--bg-cream)', cursor: 'not-allowed', height: '42px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                to="/my-bookings"
                className="btn btn-primary"
                style={{ flex: 1, textAlign: 'center', padding: '12px', fontSize: '13px', textDecoration: 'none' }}
              >
                View Reservations
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '12px 18px', fontSize: '13px' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
