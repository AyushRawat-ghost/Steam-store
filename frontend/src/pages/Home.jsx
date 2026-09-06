import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home({ onNavigateAuth }) {
  const { user, isAuthenticated, isDev } = useAuth();

  return (
    <div className="steam-home-page">
      <div className="steam-promo-container">
        
        {/* Developer pending verification notice */}
        {isAuthenticated && isDev && !user?.is_verified && (
          <div style={{
            backgroundColor: 'rgba(255, 170, 0, 0.1)',
            border: '1px solid rgba(255, 170, 0, 0.4)',
            padding: '14px 20px',
            borderRadius: '4px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#ffbe76'
          }}>
            <span style={{ fontSize: '22px' }}>⏳</span>
            <div>
              <strong style={{ display: 'block', fontSize: '13px', color: '#ffffff', marginBottom: '2px' }}>
                Developer Application Under Review
              </strong>
              <span style={{ fontSize: '12px' }}>
                Your Steamworks partner application is pending verification by an administrator.
              </span>
            </div>
          </div>
        )}

        {/* Clean Steam Access Card */}
        <div className="steam-promo-card">
          <div className="steam-promo-img-wrap">
            <img
              src="/steam-promo.jpg"
              alt="Steam Gaming Platform Promo"
              className="steam-promo-img"
            />
          </div>

          <div className="steam-promo-content">
            <div className="steam-promo-text">
              <h2>
                {isAuthenticated
                  ? `Welcome, ${user?.username} (${user?.role.toUpperCase()})`
                  : 'Sign in to Steam'}
              </h2>
              <p>
                {isAuthenticated
                  ? 'You have successfully signed in. Your session is active with verified access permissions.'
                  : 'Sign in with your Steam account to access the store, your game library, community hubs, and developer features.'}
              </p>
            </div>

            {!isAuthenticated && (
              <button className="steam-btn-access" onClick={onNavigateAuth}>
                Sign In to Steam
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
