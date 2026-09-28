import React from 'react';

export default function LoadingSpinner({ message = 'Loading records...' }) {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{message}</span>
    </div>
  );
}
