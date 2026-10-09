import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ currentTab, onTabChange, onOpenCart, cartCount = 0 }) {
  const { user, isAuthenticated, isGamer, isDev, isAdmin, logout, walletBalance } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clientMenuOpen, setClientMenuOpen] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const username = user?.username || 'Gamer';

  return (
    <header className="steam-client-header">
      {/* ── Level 1: Desktop Window Titlebar ── */}
      <div className="steam-window-bar">
        <div className="steam-window-left">
          <svg className="steam-window-logo" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.82 8.24 11.43l3.52-5.11a3.67 3.67 0 0 1-.76-2.32c0-2.03 1.64-3.67 3.67-3.67.31 0 .61.04.9.11l2.45-3.56A6.97 6.97 0 0 0 12 5.03c-3.87 0-7 3.13-7 7 0 1.25.33 2.42.91 3.44L2.09 13.9C2.03 13.28 2 12.65 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10c-1.57 0-3.04-.37-4.35-1.01l4.47-3.08c.55.27 1.18.42 1.88.42 2.39 0 4.33-1.94 4.33-4.33s-1.94-4.33-4.33-4.33-4.33 1.94-4.33 4.33c0 .24.02.47.06.7l-4.22 2.91C5.07 15.69 4.67 13.91 4.67 12c0-4.05 3.28-7.33 7.33-7.33s7.33 3.28 7.33 7.33-3.28 7.33-7.33 7.33c-.76 0-1.49-.12-2.17-.34l-3.32 4.82C8.01 23.93 9.96 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
          </svg>

          <div className="steam-menu-items">
            <span className="client-menu-link">Steam</span>
            <span className="client-menu-link">View</span>
            <span className="client-menu-link">Friends</span>
            <span className="client-menu-link">Games</span>
            <span className="client-menu-link">Help</span>
          </div>
        </div>

        <div className="steam-window-right">
          {/* Announcements Megaphone */}
          <button className="window-icon-btn megaphone" title="News & Updates">
            📢
          </button>

          {/* Notifications Bell */}
          <button className="window-icon-btn bell" title="Notifications">
            🔔
          </button>

          {/* User Account Trigger */}
          {isAuthenticated ? (
            <div className="steam-user-pill-container" ref={dropdownRef}>
              <button
                className={`steam-account-pill ${dropdownOpen ? 'open' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="account-avatar-mini">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" />
                  ) : (
                    <span>?</span>
                  )}
                </div>
                <span className="account-pill-name">{username}</span>
                <span className="account-pill-arrow">▼</span>
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="steam-dropdown-menu">
                  <div className="steam-dropdown-header">
                    <div className="steam-user-avatar large">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="steam-dropdown-user-details">
                      <span className="steam-dropdown-fullname">{username}</span>
                      <span className="steam-dropdown-email">{user?.email}</span>
                      <div className="steam-dropdown-wallet">
                        Wallet: <strong style={{ color: '#a4d007' }}>${Number(walletBalance || 0).toFixed(2)} USD</strong>
                      </div>
                    </div>
                  </div>

                  <div className="steam-dropdown-divider"></div>

                  <div className="steam-dropdown-links">
                    <a href="#profile" className="steam-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span className="item-icon">👤</span> View Profile
                    </a>
                    
                    <a href="#library" className="steam-dropdown-item" onClick={() => { setDropdownOpen(false); onTabChange('library'); }}>
                      <span className="item-icon">🎮</span> My Games Library
                    </a>

                    {(isDev || isAdmin) && (
                      <a
                        href="#dev-portal"
                        className="steam-dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setDropdownOpen(false);
                          onTabChange('developer');
                        }}
                      >
                        <span className="item-icon">🛠️</span> Steamworks Dev Portal
                      </a>
                    )}

                    {isAdmin && (
                      <a
                        href="#admin-portal"
                        className="steam-dropdown-item highlight-admin"
                        onClick={(e) => {
                          e.preventDefault();
                          setDropdownOpen(false);
                          onTabChange('admin');
                        }}
                      >
                        <span className="item-icon">👑</span> Admin Command Center
                      </a>
                    )}

                    <a href="#account" className="steam-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span className="item-icon">💼</span> Account Details
                    </a>
                  </div>

                  <div className="steam-dropdown-divider"></div>

                  <button
                    className="steam-dropdown-signout"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                  >
                    Sign out of account...
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="steam-login-btn-top"
              onClick={() => onTabChange('auth')}
            >
              Sign In
            </button>
          )}

          {/* Window Control Buttons */}
          <div className="window-controls">
            <span className="win-btn">—</span>
            <span className="win-btn">□</span>
            <span className="win-btn close">✕</span>
          </div>
        </div>
      </div>

      {/* ── Level 2: Browser Bar & Primary Navigation ── */}
      <div className="steam-nav-bar">
        <div className="steam-nav-bar-inner">
          
          {/* Browser Navigation Arrow Controls */}
          <div className="steam-browser-controls">
            <button className="nav-arrow-btn" title="Back" onClick={() => onTabChange('store')}>←</button>
            <button className="nav-arrow-btn" title="Forward">→</button>
            <button className="nav-arrow-btn reload" title="Reload" onClick={() => window.location.reload()}>↻</button>
          </div>

          {/* Primary Tabs */}
          <nav className="steam-primary-tabs">
            <button
              className={`main-tab-link ${currentTab === 'store' ? 'active' : ''}`}
              onClick={() => onTabChange('store')}
            >
              STORE
            </button>
            <button
              className={`main-tab-link ${currentTab === 'library' ? 'active' : ''}`}
              onClick={() => onTabChange('library')}
            >
              LIBRARY
            </button>
            <button
              className={`main-tab-link ${currentTab === 'community' ? 'active' : ''}`}
              onClick={() => onTabChange('community')}
            >
              COMMUNITY
            </button>
            <button
              className={`main-tab-link ${currentTab === 'profile' || currentTab === 'user' ? 'active' : ''}`}
              onClick={() => {
                if (isAuthenticated) {
                  onTabChange('store');
                } else {
                  onTabChange('auth');
                }
              }}
            >
              {isAuthenticated ? username.toUpperCase() : 'LOGIN'}
            </button>
          </nav>
        </div>

        {/* Browser URL Bar Ribbon */}
        <div className="steam-url-ribbon">
          <span className="url-lock">🔒</span>
          <span className="url-text">https://store.steampowered.com/</span>
        </div>
      </div>
    </header>
  );
}
