import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header, Footer, PasswordToggleInput } from '../components/common';
import { useAuth } from '../context/AuthContext';

export default function ForgotPage() {
  const { forgotPassword, verifyResetCode, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 | 2 | 3
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // STEP 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forgotPassword(email.trim());
      setSuccess(`A 6-digit verification code was sent to ${email.trim()}.`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      await verifyResetCode(email.trim(), otp.trim());
      setSuccess('OTP verified successfully! Please choose your new password.');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim(), otp.trim(), newPassword);
      setSuccess('Password updated successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(email.trim())}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <main className="container" style={{ marginTop: '50px' }}>
        <div className="auth-wrapper" style={{ maxWidth: '480px', margin: '0 auto 60px auto' }}>
          <div
            className="auth-card"
            style={{
              backgroundColor: 'var(--bg-ivory)',
              borderColor: 'var(--border-color)',
              padding: '35px 30px',
              borderRadius: '4px',
              boxShadow: 'var(--shadow-medium)',
              borderTop: '4px solid var(--accent-gold)'
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                textAlign: 'center',
                color: 'var(--primary-color)',
                marginBottom: '8px'
              }}
            >
              Reset Password
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '25px', fontSize: '14.5px' }}>
              Recover your account via Email OTP verification.
            </p>

            {/* Steps Indicator (3 Distinct Stages) */}
            <div className="reset-steps" style={{ marginBottom: '25px' }}>
              <div className={`reset-step-item ${step === 1 ? 'active' : ''}`} id="step-indicator-1">
                <span className="reset-step-number">1</span>
                <span>Email</span>
              </div>
              <div className="reset-step-divider"></div>
              <div className={`reset-step-item ${step === 2 ? 'active' : ''}`} id="step-indicator-2">
                <span className="reset-step-number">2</span>
                <span>Verify OTP</span>
              </div>
              <div className="reset-step-divider"></div>
              <div className={`reset-step-item ${step === 3 ? 'active' : ''}`} id="step-indicator-3">
                <span className="reset-step-number">3</span>
                <span>New Password</span>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* STEP 1: Enter Registered Email */}
            {step === 1 && (
              <div id="step-1-container">
                <form onSubmit={handleRequestOtp}>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label htmlFor="reset-email" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      id="reset-email"
                      className="form-control"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                    <span className="password-hint">Enter the email address registered with your hotel account.</span>
                  </div>

                  <button
                    type="submit"
                    id="request-otp-btn"
                    className="btn btn-primary auth-submit-btn"
                    disabled={loading}
                    style={{ borderRadius: '2px', fontSize: '14px', width: '100%' }}
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Sending OTP...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-envelope" style={{ color: 'var(--accent-gold)' }}></i> Send OTP to Email
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Enter & Verify OTP */}
            {step === 2 && (
              <div id="step-2-container">
                <div
                  style={{
                    backgroundColor: 'var(--bg-cream)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--accent-gold)',
                    padding: '14px 16px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    fontSize: '13.5px'
                  }}
                >
                  <i className="fa-solid fa-envelope-open-text" style={{ color: 'var(--accent-gold)' }}></i>{' '}
                  <strong>OTP Dispatched!</strong> A 6-digit verification code was sent to{' '}
                  <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{email}</span>.
                </div>

                <form onSubmit={handleVerifyOtp}>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label htmlFor="verification-code" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
                      6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      id="verification-code"
                      className="form-control"
                      placeholder="••••••"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      style={{ letterSpacing: '5px', fontWeight: 700, fontFamily: 'monospace', fontSize: '20px', textAlign: 'center' }}
                    />
                    <span className="password-hint">OTP is valid for 15 minutes</span>
                  </div>

                  <button
                    type="submit"
                    id="verify-otp-btn"
                    className="btn btn-primary auth-submit-btn"
                    disabled={loading}
                    style={{ borderRadius: '2px', fontSize: '14px', width: '100%' }}
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Verifying...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Verify OTP
                      </>
                    )}
                  </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', fontSize: '13px' }}>
                  <a
                    href="#back"
                    onClick={(e) => {
                      e.preventDefault();
                      setStep(1);
                    }}
                    style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                  >
                    ← Change Email
                  </a>
                  <a
                    href="#resend"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRequestOtp(e);
                    }}
                    style={{ color: 'var(--accent-gold)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Resend OTP
                  </a>
                </div>
              </div>
            )}

            {/* STEP 3: Set New Password */}
            {step === 3 && (
              <div id="step-3-container">
                <div
                  style={{
                    backgroundColor: 'var(--bg-cream)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--success)',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    fontSize: '13.5px',
                    color: 'var(--success)',
                    fontWeight: 600
                  }}
                >
                  <i className="fa-solid fa-check" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> OTP Verified! Please enter your new password below.
                </div>

                <form onSubmit={handleResetPassword}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label htmlFor="new-password" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
                      New Password *
                    </label>
                    <PasswordToggleInput
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label htmlFor="confirm-new-password" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
                      Confirm New Password *
                    </label>
                    <PasswordToggleInput
                      id="confirm-new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    id="reset-password-btn"
                    className="btn btn-primary auth-submit-btn"
                    disabled={loading}
                    style={{ borderRadius: '2px', fontSize: '14px', width: '100%' }}
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Resetting Password...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-gold)', marginRight: '4px' }}></i> Save New Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

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
              Remember your password?{' '}
              <Link to="/login" style={{ color: 'var(--accent-terracotta)', fontWeight: 700, textDecoration: 'none' }}>
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
