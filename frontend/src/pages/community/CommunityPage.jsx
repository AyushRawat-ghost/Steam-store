import React, { useState } from 'react';
import './CommunityPage.css';

const COMMUNITY_HUBS = [
  { id: 1, name: 'Counter-Strike 2', players: '1,420,890 in-game', icon: '🎯', banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Dota 2', players: '640,120 in-game', icon: '⚔️', banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Cyberpunk 2077', players: '89,450 in-game', icon: '🌆', banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Elden Ring', players: '112,300 in-game', icon: '💍', banner: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80' },
];

const INITIAL_ARTWORKS = [
  {
    id: 1,
    title: 'Neon Ronin at Night City Harbor',
    game: 'Cyberpunk 2077',
    author: 'KuroSawa99',
    likes: 1420,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    type: 'Artwork',
  },
  {
    id: 2,
    title: 'Erde Tree Celestial Eclipse',
    game: 'Elden Ring',
    author: 'TarnishedBlade',
    likes: 2840,
    image: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=800&q=80',
    type: 'Screenshot',
  },
  {
    id: 3,
    title: 'Orbit 9 Deep Space Station',
    game: 'Starfield',
    author: 'CosmicExplorer',
    likes: 980,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    type: 'Workshop Mod',
  },
  {
    id: 4,
    title: 'Abyssal Coral Leviathan Encounter',
    game: 'Subnautica',
    author: 'DiverDan',
    likes: 1750,
    image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80',
    type: 'Artwork',
  },
];

const DISCUSSIONS = [
  { id: 1, title: 'Patch 2.15 Breakdown & Weapon Balance Discussion', game: 'Cyberpunk 2077', author: 'ModLeader', replies: 342, time: '12m ago' },
  { id: 2, title: 'Tips for conquering the shadow realm boss solo', game: 'Elden Ring', author: 'SunBro_42', replies: 89, time: '28m ago' },
  { id: 3, title: 'Source 2 Smoke grenade line-ups for Mirage', game: 'Counter-Strike 2', author: 'TacticalNade', replies: 512, time: '1h ago' },
  { id: 4, title: 'Best community mods for ultra-realistic lighting 2026', game: 'Starfield', author: 'RayTracerX', replies: 164, time: '2h ago' },
];

export default function CommunityPage() {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'screenshots' | 'artwork' | 'workshop' | 'discussions'
  const [artworks, setArtworks] = useState(INITIAL_ARTWORKS);
  const [likedIds, setLikedIds] = useState([]);
  const [activePreview, setActivePreview] = useState(null);

  const toggleLike = (id) => {
    if (likedIds.includes(id)) {
      setLikedIds(likedIds.filter((item) => item !== id));
      setArtworks((prev) => prev.map((item) => item.id === id ? { ...item, likes: item.likes - 1 } : item));
    } else {
      setLikedIds([...likedIds, id]);
      setArtworks((prev) => prev.map((item) => item.id === id ? { ...item, likes: item.likes + 1 } : item));
    }
  };

  const filteredArtworks = artworks.filter((item) => {
    if (activeSubTab === 'all') return true;
    if (activeSubTab === 'screenshots') return item.type === 'Screenshot';
    if (activeSubTab === 'artwork') return item.type === 'Artwork';
    if (activeSubTab === 'workshop') return item.type === 'Workshop Mod';
    return true;
  });

  return (
    <div className="steam-community-page">
      {/* Community Subnav Bar */}
      <div className="steam-community-subnav">
        <div className="community-subnav-inner">
          <div className="community-subnav-title">
            <span className="community-steam-logo">STEAM</span>
            <h1>COMMUNITY</h1>
          </div>

          <div className="community-tabs-row">
            {['all', 'screenshots', 'artwork', 'workshop', 'discussions'].map((tab) => (
              <button
                key={tab}
                className={`community-tab-btn ${activeSubTab === tab ? 'active' : ''}`}
                onClick={() => setActiveSubTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="steam-community-container">
        
        {/* Popular Game Hubs Header Strip */}
        <section className="community-hubs-strip">
          <div className="strip-heading">
            <span>POPULAR COMMUNITY HUBS</span>
            <span className="strip-sub">Join game discussions, share media & download community mods</span>
          </div>

          <div className="hubs-grid">
            {COMMUNITY_HUBS.map((hub) => (
              <div key={hub.id} className="hub-card" style={{ backgroundImage: `linear-gradient(to top, rgba(16, 24, 34, 0.95), rgba(16, 24, 34, 0.4)), url(${hub.banner})` }}>
                <div className="hub-icon">{hub.icon}</div>
                <div className="hub-info">
                  <strong>{hub.name}</strong>
                  <small>{hub.players}</small>
                </div>
                <button className="hub-join-btn">Visit Hub</button>
              </div>
            ))}
          </div>
        </section>

        <div className="community-main-layout">
          {/* Left Column: Community Media Feed */}
          <div className="community-feed-col">
            <div className="feed-header-row">
              <h3>Community Showcase & Trending Creations</h3>
              <span className="feed-filter-count">{filteredArtworks.length} items</span>
            </div>

            <div className="community-artworks-grid">
              {filteredArtworks.map((item) => (
                <div key={item.id} className="community-art-card">
                  <div className="art-card-img-wrap" onClick={() => setActivePreview(item)}>
                    <img src={item.image} alt={item.title} />
                    <span className="art-type-badge">{item.type}</span>
                  </div>

                  <div className="art-card-footer">
                    <div className="art-meta">
                      <strong className="art-title" onClick={() => setActivePreview(item)}>{item.title}</strong>
                      <span className="art-author">by {item.author} • {item.game}</span>
                    </div>

                    <button
                      className={`art-like-btn ${likedIds.includes(item.id) ? 'liked' : ''}`}
                      onClick={() => toggleLike(item.id)}
                    >
                      <span>{likedIds.includes(item.id) ? '❤️' : '🤍'}</span>
                      <span>{item.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Trending Discussions & Activity */}
          <div className="community-sidebar-col">
            <div className="sidebar-box">
              <h4 className="sidebar-box-title">🔥 TRENDING DISCUSSIONS</h4>
              <div className="discussions-list">
                {DISCUSSIONS.map((d) => (
                  <div key={d.id} className="discussion-item">
                    <span className="disc-game-tag">{d.game}</span>
                    <strong className="disc-title">{d.title}</strong>
                    <div className="disc-meta">
                      <span>by {d.author}</span>
                      <span>💬 {d.replies} replies</span>
                      <span>{d.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="sidebar-action-btn">Browse All Discussions</button>
            </div>

            <div className="sidebar-box broadcast-box">
              <h4 className="sidebar-box-title">🔴 LIVE BROADCASTS</h4>
              <div className="broadcast-preview">
                <img
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80"
                  alt="Live streamer"
                  className="broadcast-img"
                />
                <div className="broadcast-info">
                  <span className="live-pill">LIVE • 4.2k viewers</span>
                  <strong>Championship Grand Finals Stage</strong>
                  <small>Playing Counter-Strike 2</small>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Fullscreen Preview Modal */}
      {activePreview && (
        <div className="steam-modal-backdrop" onClick={() => setActivePreview(null)}>
          <div className="steam-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <button className="steam-modal-close" onClick={() => setActivePreview(null)}>✕</button>
            <div style={{ padding: '20px' }}>
              <img
                src={activePreview.image}
                alt={activePreview.title}
                style={{ width: '100%', maxHeight: '550px', objectFit: 'contain', borderRadius: '4px', background: '#0b1016' }}
              />
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '20px' }}>{activePreview.title}</h3>
                  <p style={{ margin: '4px 0 0', color: '#8da4b8', fontSize: '13px' }}>
                    Uploaded for <strong>{activePreview.game}</strong> by <strong>{activePreview.author}</strong>
                  </p>
                </div>
                <button
                  className={`art-like-btn ${likedIds.includes(activePreview.id) ? 'liked' : ''}`}
                  onClick={() => toggleLike(activePreview.id)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  <span>{likedIds.includes(activePreview.id) ? '❤️' : '🤍'}</span>
                  <span>{activePreview.likes} Likes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
