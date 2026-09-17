import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header, Footer, PasswordToggleInput } from '../components/common';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const registeredPhone = phone.trim() || '8124337117';
      const data = await register(name.trim(), email.trim(), registeredPhone, password);

      setSuccess(`🎉 Registration Successful! Welcome, ${name.trim()}! Signing you in...`);
      setTimeout(() => {
        const r = (data?.user?.role || '').toLowerCase();
        if (r === 'admin' || r === 'manager' || r === 'staff') {
          navigate('/admin');
        } else {
          navigate('/rooms');
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
            maxWidth: '520px',
            background: 'var(--bg-ivory)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            boxShadow: 'var(--shadow-medium)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
              Guest Privileges
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--primary-color)', marginBottom: '6px' }}>
              Join Ansu Kumar Hotels
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
              Create your complimentary guest account to book suites and manage reservations.
            </p>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{error}</div>}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              <div>{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reg-name" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Full Name *
              </label>
              <input
                type="text"
                id="reg-name"
                className="form-control"
                placeholder="e.g. Ansu Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Email Address *
              </label>
              <input
                type="email"
                id="reg-email"
                className="form-control"
                placeholder="e.g. guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Mobile Number
              </label>
              <input
                type="tel"
                id="reg-phone"
                className="form-control"
                placeholder="e.g. +91 81243 37117"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Password *
              </label>
              <PasswordToggleInput
                id="reg-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password (min 6 chars)"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm-password" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Confirm Password *
              </label>
              <PasswordToggleInput
                id="reg-confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={6}
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
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Creating Account...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus"></i> Create Account
                </>
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
              fontSize: '13.5px',
              color: 'var(--text-charcoal)'
            }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In Here →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
