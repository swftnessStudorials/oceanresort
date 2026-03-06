import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!onClose || !duration) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '!'}
        {type === 'info' && 'ℹ'}
      </span>
      <span className="toast-message">{message}</span>
      {onClose && (
        <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
