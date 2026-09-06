import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

export default function AuthPage({ onSuccess }) {
  const { login, register, error: authError } = useAuth();
  
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('gamer'); // 'gamer' | 'developer' | 'admin'
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setLocalError(res.error || 'Failed to sign in');
      }
    } else {
      if (!username || username.length < 3) {
        setLocalError('Steam account name must be at least 3 characters');
        setLoading(false);
        return;
      }
      const res = await register({ email, username, password, role });
      setLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setLocalError(res.error || 'Registration failed');
      }
    }
  };

  const errorMessage = localError || authError;

  return (
    <div className="steam-auth-page">
      <div className="steam-auth-container">
        <h1 className="steam-auth-title">
          {mode === 'login' ? 'Sign In' : 'Create Your Account'}
        </h1>

        <div className="steam-login-box">
          {/* Left Column: Form */}
          <div className="steam-login-left">
            <h2 className="steam-form-title">
              {mode === 'login' ? 'Sign in with account name' : 'Enter your details'}
            </h2>

            {errorMessage && (
              <div className="steam-error-alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="steam-form-group">
                <label className="steam-form-label">Email Address</label>
                <input
                  type="email"
                  className="steam-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {mode === 'register' && (
                <div className="steam-form-group">
                  <label className="steam-form-label">Steam Account Name (Username)</label>
                  <input
                    type="text"
                    className="steam-input"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="steam-form-group">
                <label className="steam-form-label">Password</label>
                <input
                  type="password"
                  className="steam-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {mode === 'register' && (
                <div className="steam-form-group">
                  <label className="steam-form-label">Account Type</label>
                  <div className="steam-role-cards" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <div
                      className={`steam-role-card ${role === 'gamer' ? 'active' : ''}`}
                      onClick={() => setRole('gamer')}
                    >
                      <div className="steam-role-icon">🎮</div>
                      <div className="steam-role-name">Gamer</div>
                    </div>

                    <div
                      className={`steam-role-card ${role === 'developer' ? 'active' : ''}`}
                      onClick={() => setRole('developer')}
                    >
                      <div className="steam-role-icon">🛠️</div>
                      <div className="steam-role-name">Developer</div>
                    </div>
                  </div>

                  {role === 'developer' && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(102, 192, 244, 0.1)',
                      borderLeft: '3px solid var(--steam-blue)',
                      fontSize: '11px',
                      color: '#c7d5e0',
                      lineHeight: '1.4'
                    }}>
                      ℹ️ <strong>Developer Account:</strong> Requires administrator approval before you can publish games to the store.
                    </div>
                  )}
                </div>
              )}

              <label className="steam-checkbox-group">
                <input
                  type="checkbox"
                  className="steam-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me on this computer</span>
              </label>

              <button
                type="submit"
                className="steam-btn-primary"
                disabled={loading}
              >
                {loading
                  ? 'Processing...'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Complete Registration'}
              </button>
            </form>

            <a href="#help" className="steam-help-link">
              Help, I can't sign in
            </a>
          </div>

          {/* Right Column: QR Code (Steam Feature) */}
          <div className="steam-login-right">
            <h2 className="steam-form-title">Or sign in with QR code</h2>
            
            <div className="steam-qr-box">
              <div className="steam-qr-pattern">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    className={`steam-qr-cell ${
                      [0, 1, 2, 6, 7, 8, 14, 20, 28, 34, 40, 41, 42, 46, 47, 48].includes(i)
                        ? 'steam-qr-corner'
                        : i % 2 === 0
                        ? 'active'
                        : ''
                    }`}
                    style={{
                      backgroundColor:
                        [0, 1, 2, 6, 7, 8, 14, 20, 28, 34, 40, 41, 42, 46, 47, 48].includes(i) ||
                        (i * 7) % 3 === 0
                          ? '#10141d'
                          : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="steam-qr-text">
              Use the <a href="#mobile">Steam Mobile App</a> to sign in via QR code
            </p>
          </div>
        </div>

        {/* Bottom Switcher Card */}
        <div className="steam-join-box">
          <div className="steam-join-text">
            <h3>
              {mode === 'login'
                ? "Don't have a Steam account?"
                : 'Already have a Steam account?'}
            </h3>
            <p>
              {mode === 'login'
                ? "It's free and easy to use. Explore games, connect with players, and build your library."
                : 'Sign in to access your existing games, library, and community.'}
            </p>
          </div>

          <button
            className="steam-join-btn"
            onClick={() => {
              setLocalError('');
              setMode(mode === 'login' ? 'register' : 'login');
            }}
          >
            {mode === 'login' ? 'Join Steam' : 'Sign In Instead'}
          </button>
        </div>
      </div>
    </div>
  );
}
