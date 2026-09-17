import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Header, Footer, PasswordToggleInput } from '../components/common';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const isRegistered = params.get('registered');

    if (emailParam) setEmail(emailParam);
    if (isRegistered) {
      setSuccess('🎉 Welcome to Ansu Kumar Hotels! Your account is active. A welcome email detailing our 5-star resort facilities has been dispatched. Please sign in below.');
    }
  }, [location.search]);

  const isStaffRole = (role) => {
    if (!role) return false;
    const r = role.toLowerCase();
    return r === 'admin' || r === 'manager' || r === 'staff';
  };

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (isStaffRole(user.role)) {
        navigate('/admin');
      } else {
        navigate('/rooms');
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await login(email.trim(), password);
      setSuccess(`Welcome back, ${data.user?.name || 'Guest'}! Redirecting...`);
      setTimeout(() => {
        if (isStaffRole(data.user?.role)) {
          navigate('/admin');
        } else {
          navigate('/rooms');
        }
      }, 900);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <main
        className="container"
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '40px',
          paddingBottom: '50px'
        }}
      >
        <div
          className="auth-card"
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: 'var(--bg-ivory)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            boxShadow: 'var(--shadow-medium)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
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
              Guest Portal
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--primary-color)', marginBottom: '6px' }}>
              Sign In
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
              Welcome back to Ansu Kumar Hotels & Suites.
            </p>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: '18px' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: '18px' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label htmlFor="login-email" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Email Address
              </label>
              <input
                type="email"
                id="login-email"
                className="form-control"
                placeholder="guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ height: '44px' }}
                autoComplete="email"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 0 }}>
                  Password
                </label>
                <Link to="/forgot" style={{ fontSize: '12px', color: 'var(--accent-terracotta)', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot Password?
                </Link>
              </div>
              <PasswordToggleInput
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ height: '44px' }}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '14px',
                fontWeight: 700,
                marginTop: '15px',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Signing in...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In
                </>
              )}
            </button>
          </form>

          <div
            className="auth-footer"
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
              fontSize: '13.5px',
              color: 'var(--text-charcoal)'
            }}
          >
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textDecoration: 'none' }}>
              Register here →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
