import React, { useState } from 'react';

export default function PasswordToggleInput({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  minLength,
  className = 'form-control',
  style = {},
  disabled = false,
  autoComplete = 'current-password'
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        value={value}
        onChange={onChange}
        className={className}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        disabled={disabled}
        autoComplete={autoComplete}
        style={{ paddingRight: '44px', ...style }}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '15px',
          zIndex: 5
        }}
        aria-label="Toggle Password Visibility"
      >
        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
      </button>
    </div>
  );
}
