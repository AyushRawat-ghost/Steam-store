import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { libraryApi } from '../../services/api';
import './LibraryPage.css';

export default function LibraryPage({ onNavigateStore }) {
  const { isAuthenticated } = useAuth();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('Up to date');

  useEffect(() => {
    async function fetchLibrary() {
      if (!isAuthenticated) {
        setLibrary([]);
        setLoading(false);
        return;
      }

      try {
        const res = await libraryApi.getLibrary();
        if (res && res.data && res.data.length > 0) {
          setLibrary(res.data);
          setSelectedGameId(res.data[0].game?.id);
        } else {
          setLibrary([]);
          setSelectedGameId(null);
        }
      } catch (err) {
        console.warn('Failed to load library:', err.message);
        setLibrary([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLibrary();
  }, [isAuthenticated]);

  const filteredGames = library.filter((item) =>
    (item.game?.title || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  const selectedItem = library.find((it) => it.game?.id === selectedGameId) || library[0] || {};
  const activeGame = selectedItem.game || null;

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCloudStatus('Syncing...');
      setTimeout(() => setCloudStatus('Up to date'), 2000);
    } else {
      setIsPlaying(true);
    }
  };

  const formatPlaytime = (mins = 0) => {
    if (!mins || mins === 0) return '0 hours';
    const hrs = (mins / 60).toFixed(1);
    return `${hrs} hours`;
  };

  if (!isAuthenticated) {
    return (
      <div className="steam-library-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px 20px', color: '#c7d5e0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
          <h2 style={{ color: '#ffffff', marginBottom: '8px' }}>Your Steam Library</h2>
          <p style={{ color: '#8f98a0', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Sign in to access your purchased games, track playtime hours, view cloud saves, and launch your Steam collection.
          </p>
          <button
            className="steam-buy-cart-btn"
            style={{ padding: '10px 28px', fontSize: '14px' }}
            onClick={() => onNavigateStore && onNavigateStore()}
          >
            Browse Steam Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="steam-library-container">
      {/* ── Left Sidebar (Game List) ── */}
      <aside className="library-sidebar">
        {/* Search & Collection Filters */}
        <div className="sidebar-search-box">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="sidebar-search-input"
          />
        </div>

        {/* Collection Section Header */}
        <div className="sidebar-collection-header">
          <span>ALL GAMES ({filteredGames.length})</span>
          <span className="collection-collapse-icon">▾</span>
        </div>

        {/* Vertical Game Title List */}
        <div className="sidebar-game-list">
          {loading ? (
            <div style={{ padding: '16px', color: '#66c0f4', fontSize: '12px' }}>
              Loading Steam Library...
            </div>
          ) : filteredGames.length === 0 ? (
            <div style={{ padding: '16px', color: '#8f98a0', fontSize: '12px' }}>
              No games in library
            </div>
          ) : (
            filteredGames.map((item) => {
              const g = item.game || {};
              const isSelected = g.id === selectedGameId;
              return (
                <button
                  key={item.id || g.id}
                  className={`library-game-row ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedGameId(g.id);
                    setIsPlaying(false);
                  }}
                >
                  <img
                    src={g.thumbnail_url || g.banner_url || '/steam-promo.jpg'}
                    alt=""
                    className="game-row-icon"
                  />
                  <span className="game-row-title">{g.title}</span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Main Library Stage ── */}
      <main className="library-stage">
        {activeGame ? (
          <div className="stage-content-wrap">
            {/* Big Hero Visual Banner */}
            <div
              className="stage-hero-banner"
              style={{
                backgroundImage: `linear-gradient(to top, #101822 5%, rgba(16, 24, 34, 0.4) 60%), url(${activeGame.banner_url})`,
              }}
            >
              <div className="stage-hero-info">
                <span className="hero-studio-tag">STEAMWORKS LICENSE ACTIVE</span>
                <h1 className="hero-game-title">{activeGame.title}</h1>

                {/* Launch / Play Bar */}
                <div className="stage-actions-bar">
                  <button
                    className={`steam-play-button ${isPlaying ? 'running' : ''}`}
                    onClick={handleTogglePlay}
                  >
                    {isPlaying ? (
                      <>
                        <span className="play-spinner">⏳</span>
                        <span>STOP (Running)</span>
                      </>
                    ) : (
                      <>
                        <span className="play-triangle">▶</span>
                        <span>PLAY</span>
                      </>
                    )}
                  </button>

                  <div className="stage-metrics">
                    <div className="metric-cell">
                      <span className="metric-label">LAST PLAYED</span>
                      <strong className="metric-val">Today</strong>
                    </div>

                    <div className="metric-cell">
                      <span className="metric-label">PLAY TIME</span>
                      <strong className="metric-val">
                        {formatPlaytime(selectedItem.playtime_minutes)}
                      </strong>
                    </div>

                    <div className="metric-cell">
                      <span className="metric-label">CLOUD STATUS</span>
                      <strong className="metric-val highlight-cloud">
                        ☁ {cloudStatus}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Panels (Activity, Achievements, Friends) */}
            <div className="stage-lower-grid">
              {/* Activity Feed */}
              <div className="stage-card activity-feed-card">
                <h3>COMMUNITY & RECENT UPDATES</h3>
                <div className="activity-news-item">
                  <span className="news-badge">PATCH NOTES</span>
                  <h4>Patch 2.13 Live - DLSS Ray Reconstruction & Audio Optimization</h4>
                  <p>
                    A new hotfix and optimization patch is now live on Steam with major fidelity and frame pacing improvements.
                  </p>
                  <small>Posted by Developer • 2 days ago</small>
                </div>
              </div>

              {/* Achievements Column */}
              <div className="stage-card achievements-card">
                <h3>ACHIEVEMENTS</h3>
                <div className="achievements-progress-row">
                  <span>14 of 42 Unlocked (33%)</span>
                  <div className="achieve-bar-track">
                    <div className="achieve-bar-fill" style={{ width: '33%' }}></div>
                  </div>
                </div>
                <div className="achieve-icons-row">
                  <span className="achieve-badge" title="Prologue Complete">🏆</span>
                  <span className="achieve-badge" title="Master of Arms">⚡</span>
                  <span className="achieve-badge" title="High Roller">💎</span>
                  <span className="achieve-badge" title="Night City Legend">🌟</span>
                  <span className="achieve-badge locked" title="Locked">🔒</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8f98a0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ color: '#c7d5e0', marginBottom: '8px' }}>Your Library is Empty</h3>
            <p style={{ maxWidth: '400px', textAlign: 'center', marginBottom: '20px' }}>
              You don't own any games yet. Browse the Steam Store to purchase games or claim free titles.
            </p>
            <button
              className="steam-buy-cart-btn"
              onClick={() => onNavigateStore && onNavigateStore()}
            >
              Browse Steam Store
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
