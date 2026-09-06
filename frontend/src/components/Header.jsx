import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ currentTab, onTabChange }) {
  const { user, isAuthenticated, isGamer, isDev, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  return (
    <header className="steam-header-wrapper">
      <div className="steam-header-inner">
        {/* Left Side: Logo & Main Navigation */}
        <div className="steam-header-left">
          <a href="#store" onClick={() => onTabChange('store')} className="steam-logo-link">
            <svg className="steam-logo-svg" viewBox="0 0 176 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 18.2 3.8 23 9.1 24.5L16.2 34.8C16.1 35.3 16 35.9 16 36.5C16 40.6 19.4 44 23.5 44C27.6 44 31 40.6 31 36.5C31 32.4 27.6 29 23.5 29C23.2 29 22.9 29 22.6 29.1L14.7 17.6C16.1 16.1 17 14.2 17 12C17 6.5 12.5 2 7 2" fill="#C7D5E0"/>
              <text x="40" y="28" fill="#C7D5E0" fontFamily="'Motiva Sans', sans-serif" fontSize="22" fontWeight="900" letterSpacing="4">STEAM</text>
            </svg>
          </a>

          <nav>
            <ul className="steam-nav-menu">
              <li className="steam-nav-item">
                <a
                  href="#store"
                  className={currentTab === 'store' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); onTabChange('store'); }}
                >
                  STORE
                </a>
              </li>
              <li className="steam-nav-item">
                <a
                  href="#community"
                  className={currentTab === 'community' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); onTabChange('community'); }}
                >
                  COMMUNITY
                </a>
              </li>
              <li className="steam-nav-item">
                <a
                  href="#about"
                  className={currentTab === 'about' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); onTabChange('about'); }}
                >
                  ABOUT
                </a>
              </li>
              <li className="steam-nav-item">
                <a
                  href="#support"
                  className={currentTab === 'support' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); onTabChange('support'); }}
                >
                  SUPPORT
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right Side: Install Steam & User Profile Dropdown */}
        <div className="steam-header-right">
          <div className="steam-install-bar">
            <a href="#install" className="steam-install-btn">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
              </svg>
              Install Steam
            </a>

            {isAuthenticated ? (
              <div className="steam-profile-dropdown-container" ref={dropdownRef}>
                {/* User Trigger Button */}
                <button
                  className={`steam-user-trigger ${dropdownOpen ? 'open' : ''}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <div className="steam-user-avatar-wrap">
                    <div className="steam-user-avatar">
                      {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="steam-online-dot"></span>
                  </div>

                  <div className="steam-user-meta">
                    <span className="steam-user-name">{user?.username}</span>
                    <span className={`steam-user-role role-${user?.role}`}>
                      {user?.role}
                    </span>
                  </div>

                  <span className="steam-dropdown-arrow">▼</span>
                </button>

                {/* Steam Authentic Dropdown Menu */}
                {dropdownOpen && (
                  <div className="steam-dropdown-menu">
                    {/* Header Summary */}
                    <div className="steam-dropdown-header">
                      <div className="steam-user-avatar large">
                        {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="steam-dropdown-user-details">
                        <span className="steam-dropdown-fullname">{user?.username}</span>
                        <span className="steam-dropdown-email">{user?.email}</span>
                        <div className="steam-dropdown-wallet">
                          Wallet: <strong style={{ color: '#a4d007' }}>$0.00 USD</strong>
                        </div>
                      </div>
                    </div>

                    <div className="steam-dropdown-divider"></div>

                    {/* Navigation Items */}
                    <div className="steam-dropdown-links">
                      <a href="#profile" className="steam-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <span className="item-icon">👤</span> View Profile
                      </a>
                      
                      {isGamer && (
                        <a href="#library" className="steam-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <span className="item-icon">🎮</span> My Games Library
                        </a>
                      )}

                      {isDev && (
                        <a href="#dev-portal" className="steam-dropdown-item" onClick={() => setDropdownOpen(false)}>
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
                        <span className="item-icon">💼</span> Account Details & Preferences
                      </a>
                    </div>

                    <div className="steam-dropdown-divider"></div>

                    {/* Sign out */}
                    <button
                      className="steam-dropdown-signout"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Sign out of account...
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="#auth"
                className="steam-login-link"
                onClick={(e) => { e.preventDefault(); onTabChange('auth'); }}
              >
                login &nbsp;|&nbsp; language ▼
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
