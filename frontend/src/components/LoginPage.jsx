import React, { useState, useContext } from 'react';
import { Headphones, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
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
        // Redirect back to main dashboard
        window.location.hash = '#/';
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

  const handleCancel = () => {
    window.location.hash = '#/';
  };

  return (
    <div className="login-page-container">
      {/* Dynamic ambient floating orbs */}
      <div className="login-ambient-orb login-ambient-orb-1"></div>
      <div className="login-ambient-orb login-ambient-orb-2"></div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-logo-container">
            <div className="login-logo-icon">
              <Headphones size={36} />
            </div>
            <h1 className="login-title">TuneFlow</h1>
            <p className="login-subtitle">Admin Portal Dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="login-error-alert" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="login-input-wrapper">
              <input
                type="text"
                id="login-username"
                className="login-field-input"
                placeholder="Username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
              <User size={18} className="login-field-icon" />
            </div>

            <div className="login-input-wrapper">
              <input
                type="password"
                id="login-password"
                className="login-field-input"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <Lock size={18} className="login-field-icon" />
            </div>

            <div className="login-actions-vertical">
              <button type="submit" className="login-btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Login to Dashboard'
                )}
              </button>

              <button
                type="button"
                className="login-btn-back"
                onClick={handleCancel}
                disabled={loading}
              >
                <ArrowLeft size={16} />
                <span>Back to Player</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
