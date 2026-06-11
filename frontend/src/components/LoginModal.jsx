import React, { useState, useContext } from 'react';
import { X, Lock, User, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function LoginModal({ onClose }) {
  const { login } = useContext(AuthContext);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!passwordInput.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(usernameInput.trim(), passwordInput);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error, failed to reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Admin Login</h2>
          <button className="close-btn" onClick={onClose} disabled={loading} aria-label="Close login dialog">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 83, 80, 0.1)',
                border: '1px solid #ef5350',
                color: '#ef5350',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} style={{ color: 'var(--tuneflow-gray)' }} />
              <span>Username</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. hareeshvar"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} style={{ color: 'var(--tuneflow-gray)' }} />
              <span>Password</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid black', borderTopColor: 'transparent', borderRadius: '50%' }}></span>
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
