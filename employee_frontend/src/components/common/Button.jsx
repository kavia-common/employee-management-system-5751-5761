import React from 'react';

/**
 * Primary button styled using Executive Gray palette.
 * Avoids logging PII and exposes accessible attributes.
 */
export default function Button({ children, type = 'button', variant = 'primary', onClick, disabled = false, ariaLabel }) {
  const base = {
    primary: {
      background: 'var(--color-primary)',
      color: '#fff',
      border: '1px solid var(--color-primary)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--color-primary)',
      border: '1px solid var(--color-primary)',
    },
    danger: {
      background: 'var(--color-error)',
      color: '#fff',
      border: '1px solid var(--color-error)',
    },
  }[variant] || {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        ...base,
        borderRadius: '8px',
        padding: '10px 14px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: 'var(--shadow-sm)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
