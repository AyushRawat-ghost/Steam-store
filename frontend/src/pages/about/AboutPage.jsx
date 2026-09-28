import React from 'react';
import './AboutPage.css';

const PLATFORM_FEATURES = [
  {
    icon: '💬',
    title: 'Steam Chat',
    desc: 'Talk with friends or groups via text or voice without leaving your game. Video, tweets, GIFs and more supported.',
  },
  {
    icon: '🎮',
    title: 'Game Hubs',
    desc: 'Everything about your game, all in one place. Join discussions, upload content, and be the first to know about updates.',
  },
  {
    icon: '📡',
    title: 'Steam Broadcast',
    desc: 'Stream your gameplay live with the click of a button, and share your game with friends or the rest of the community.',
  },
  {
    icon: '🛠️',
    title: 'Steam Workshop',
    desc: 'Discover, download, and play thousands of community-created mods, cosmetics, and skins for nearly 1,000 supported games.',
  },
  {
    icon: '📱',
    title: 'Available on Mobile',
    desc: 'Access Steam anywhere from your iOS or Android device with the Steam Mobile app and Steam Guard 2FA protection.',
  },
  {
    icon: '☁️',
    title: 'Steam Cloud Saves',
    desc: 'Seamlessly pick up where you left off. Game saves and configurations automatically sync across all your PCs and Steam Deck.',
  },
];

export default function AboutPage() {
  return (
    <div className="steam-about-page">
      {/* Hero Section */}
      <section className="about-hero-section">
        <div className="about-hero-container">
          <div className="about-hero-content">
            <span className="about-tagline">THE ULTIMATE GAMING DESTINATION</span>
            <h1>Steam is the ultimate place for playing, connecting, and creating games.</h1>
            <p className="about-hero-sub">
              Join millions of players across the globe. Access thousands of titles from AAA blockbusters to indie gems,
              exclusive deals, automatic game updates, and an incredible community.
            </p>

            {/* Live Stats Row */}
            <div className="about-live-stats">
              <div className="stat-pill">
                <span className="stat-dot online"></span>
                <div>
                  <strong>36,412,890</strong>
                  <small>PLAYERS ONLINE</small>
                </div>
              </div>

              <div className="stat-pill">
                <span className="stat-dot in-game"></span>
                <div>
                  <strong>11,894,210</strong>
                  <small>PLAYING NOW</small>
                </div>
              </div>
            </div>

            {/* Install Button & Supported OS */}
            <div className="about-install-cta">
              <a href="#install" className="about-install-btn">
                <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                <span>Install Steam Now</span>
              </a>
              <div className="supported-os-icons">
                <span title="Windows">🪟 Windows</span>
                <span>•</span>
                <span title="macOS">🍎 macOS</span>
                <span>•</span>
                <span title="Linux">🐧 SteamOS + Linux</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steam Deck Hardware Section */}
      <section className="about-deck-section">
        <div className="about-deck-container">
          <div className="deck-visual-side">
            <img
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
              alt="Steam Deck OLED"
              className="deck-img"
            />
            <div className="deck-badge">STEAM DECK OLED</div>
          </div>

          <div className="deck-info-side">
            <span className="deck-kicker">PORTABLE PC GAMING</span>
            <h2>Take your Steam Library everywhere you go.</h2>
            <p>
              Steam Deck™ brings the Steam games and features you love to a powerful and handheld form factor.
              Featuring a vibrant 7.4" HDR OLED display, custom AMD APU, extended battery life, and high-speed Wi-Fi 6E.
            </p>
            <div className="deck-specs-list">
              <div className="deck-spec-item">
                <strong>7.4" OLED</strong>
                <span>HDR 90Hz Display</span>
              </div>
              <div className="deck-spec-item">
                <strong>50Wh Battery</strong>
                <span>3-12 Hours of Play</span>
              </div>
              <div className="deck-spec-item">
                <strong>Wi-Fi 6E</strong>
                <span>3x Faster Downloads</span>
              </div>
            </div>
            <button className="deck-learn-btn" onClick={() => alert('Steam Deck hardware details')}>
              Learn More About Steam Deck
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="about-features-section">
        <div className="about-features-container">
          <div className="features-header">
            <h2>Features Designed for Gamers</h2>
            <p>We are constantly updating Steam to bring the latest technology and innovations to PC gaming.</p>
          </div>

          <div className="features-grid">
            {PLATFORM_FEATURES.map((feat, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
