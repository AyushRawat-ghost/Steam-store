import React, { useState, useEffect } from 'react';
import { gamesApi } from '../../services/api';
import './StorePage.css';

const DEMO_GAMES = [
  {
    id: 1,
    title: 'Battlefield™ 6',
    slug: 'battlefield-6',
    edition: 'TIDAL STRIKE SEASON 04',
    short_description: 'An all-out warfare multiplayer FPS featuring high-intensity combined arms combat, dynamic weather, and tactical squad mechanics.',
    description: 'Battlefield™ 6 delivers the next generation of warfare. Squad up in massive 128-player battles across dynamic global environments with destructible terrain.',
    price: 3999,
    currency: '₹',
    discount_percent: 0,
    banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    action_text: 'PLAY NOW',
    review_status: 'Mixed',
    review_count: '155,315 Reviews',
    review_type: 'mixed',
    recommended_reason: 'because you played games tagged with',
    genres: ['Modern', 'Military', 'FPS', 'Violent'],
    screenshots: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    ],
    is_featured: true,
  },
  {
    id: 2,
    title: 'Cyberpunk 2077: Phantom Liberty',
    slug: 'cyberpunk-2077',
    edition: 'PHANTOM LIBERTY EXPANSION',
    short_description: 'An open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary.',
    description: 'Cyberpunk 2077 is an open-world, action-adventure story set in Night City. Phantom Liberty is a spy-thriller adventure introducing Dogtown.',
    price: 2999,
    currency: '₹',
    discount_percent: 50,
    banner_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
    action_text: 'NOW AVAILABLE',
    review_status: 'Very Positive',
    review_count: '680,412 Reviews',
    review_type: 'positive',
    recommended_reason: 'popular with players in your region',
    genres: ['Cyberpunk', 'Open World', 'RPG', 'Sci-Fi'],
    screenshots: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    ],
    is_featured: true,
  },
  {
    id: 3,
    title: 'Elden Ring: Shadow of the Erdtree',
    slug: 'elden-ring',
    edition: 'DEFINITIVE EDITION',
    short_description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    description: 'A vast world where open fields with a variety of situations and huge dungeons with complex designs are seamlessly connected.',
    price: 3599,
    currency: '₹',
    discount_percent: 34,
    banner_url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80',
    action_text: 'TOP SELLER',
    review_status: 'Overwhelmingly Positive',
    review_count: '820,950 Reviews',
    review_type: 'positive',
    recommended_reason: 'because you played Souls-like games',
    genres: ['Souls-like', 'Dark Fantasy', 'Action', 'RPG'],
    screenshots: [
      'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    ],
    is_featured: true,
  }
];

export default function StorePage() {
  const [games, setGames] = useState(DEMO_GAMES);
  const [featuredGames, setFeaturedGames] = useState(DEMO_GAMES.filter(g => g.is_featured));
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hoveredThumbIndex, setHoveredThumbIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(1);
  const [wishlistCount, setWishlistCount] = useState(2);
  const [activeModalGame, setActiveModalGame] = useState(null);

  // Fetch from backend
  useEffect(() => {
    async function loadGames() {
      try {
        const res = await gamesApi.getGames();
        if (res && res.data && res.data.length > 0) {
          const backendGames = res.data.map(g => ({
            ...g,
            currency: '₹',
            review_status: 'Very Positive',
            review_count: '24,190 Reviews',
            review_type: 'positive',
            recommended_reason: 'because you recently browsed',
            action_text: 'NOW AVAILABLE',
            screenshots: (g.screenshots && g.screenshots.length > 0)
              ? g.screenshots
              : [g.banner_url, g.thumbnail_url, g.banner_url, g.thumbnail_url],
          }));
          setGames(backendGames);
          const feat = backendGames.filter(g => g.is_featured);
          if (feat.length > 0) setFeaturedGames(feat);
        }
      } catch (err) {
        console.log('Using authentic sample games:', err.message);
      }
    }
    loadGames();
  }, []);

  const currentHero = featuredGames[currentSlideIndex] || DEMO_GAMES[0];

  const handlePrevSlide = () => {
    setHoveredThumbIndex(null);
    setCurrentSlideIndex((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setHoveredThumbIndex(null);
    setCurrentSlideIndex((prev) => (prev + 1) % featuredGames.length);
  };

  // Main visual display logic: if hovering a 2x2 thumbnail, show that screenshot!
  const heroDisplayImage = (hoveredThumbIndex !== null && currentHero.screenshots && currentHero.screenshots[hoveredThumbIndex])
    ? currentHero.screenshots[hoveredThumbIndex]
    : currentHero.banner_url;

  const formatPrice = (price, discount) => {
    if (price === 0) return 'Free to Play';
    if (!discount || discount === 0) return `₹ ${price.toLocaleString()}`;
    const discounted = Math.round(price * (1 - discount / 100));
    return `₹ ${discounted.toLocaleString()}`;
  };

  return (
    <div className="steam-authentic-store">
      
      {/* ── Sub Navigation Bar ── */}
      <div className="steam-store-subnav">
        <div className="subnav-container">
          <div className="subnav-menu-links">
            <span className="subnav-chip">Your Store <span className="arrow-down">▼</span></span>
            <span className="subnav-chip">Browse <span className="arrow-down">▼</span></span>
            <span className="subnav-chip">Recommendations <span className="arrow-down">▼</span></span>
            <span className="subnav-chip">Categories <span className="arrow-down">▼</span></span>
            <span className="subnav-chip">Ways to Play <span className="arrow-down">▼</span></span>
            <span className="subnav-chip">Special Sections <span className="arrow-down">▼</span></span>
          </div>

          <div className="subnav-right-actions">
            {/* Search Input Box */}
            <div className="steam-search-bar">
              <input
                type="text"
                placeholder="Search the store"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="steam-search-field"
              />
              <button className="steam-search-submit" title="Search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>

            {/* Wishlist Link */}
            <button className="subnav-wishlist-btn">
              ★ Wishlist <span className="wishlist-badge">{wishlistCount}</span>
            </button>

            {/* Cart Button */}
            <button className="subnav-cart-btn" onClick={() => alert('Opening Steam Cart')}>
              🛒 Cart <span className="cart-badge">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="steam-store-body">
        
        {/* Top Header Row with Gift Card Banner */}
        <div className="store-hero-header-row">
          <h2 className="steam-hero-heading">Featured & Recommended</h2>

          <div className="gift-card-banner">
            <div className="gift-card-mini-graphic">
              <span>💳</span>
              <span>💳</span>
            </div>
            <span className="gift-card-text">Send a Gift Card</span>
          </div>
        </div>

        {/* ── FEATURED & RECOMMENDED SECTION ── */}
        <section className="steam-hero-carousel-wrapper">
          
          {/* Left Arrow Control */}
          <button className="carousel-arrow-btn left" onClick={handlePrevSlide} aria-label="Previous">
            &#10094;
          </button>

          {/* Main Hero Card (2-Column) */}
          <div className="steam-hero-split-card">
            
            {/* Left Big Stage */}
            <div className="hero-stage-left" onClick={() => setActiveModalGame(currentHero)}>
              <img
                src={heroDisplayImage}
                alt={currentHero.title}
                className="hero-stage-img"
              />

              {/* Title / Season overlay on image */}
              <div className="hero-image-titles">
                <span className="hero-game-logo-text">{currentHero.title.toUpperCase()}</span>
                {currentHero.edition && (
                  <span className="hero-edition-tag">{currentHero.edition}</span>
                )}
              </div>

              {/* Bottom Blue Action Strip */}
              <div className="hero-blue-strip">
                <span>{currentHero.action_text || 'PLAY NOW'}</span>
              </div>
            </div>

            {/* Right Information Column (Authentic Steam) */}
            <div className="hero-info-right">
              <div>
                <h3 className="hero-title-text" onClick={() => setActiveModalGame(currentHero)}>
                  {currentHero.title}
                </h3>

                {/* Review status */}
                <div className="hero-reviews-line">
                  <span className={`review-badge-text ${currentHero.review_type}`}>
                    {currentHero.review_status || 'Very Positive'}
                  </span>
                  <span className="review-count-text">({currentHero.review_count || '155,315 Reviews'})</span>
                </div>

                {/* 2x2 Mini Screenshots Preview Grid */}
                <div className="hero-2x2-grid">
                  {(currentHero.screenshots || []).slice(0, 4).map((shot, sIndex) => (
                    <div
                      key={sIndex}
                      className={`grid-thumb-cell ${hoveredThumbIndex === sIndex ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredThumbIndex(sIndex)}
                      onMouseLeave={() => setHoveredThumbIndex(null)}
                    >
                      <img src={shot} alt={`Thumbnail ${sIndex + 1}`} />
                    </div>
                  ))}
                </div>

                {/* Recommendation Reason */}
                <div className="hero-recommendation-note">
                  <span className="rec-accent">Recommended</span> {currentHero.recommended_reason || 'because you played games tagged with'}
                </div>

                {/* Tag Pills */}
                <div className="hero-tag-pills">
                  {(currentHero.genres || ['Action', 'Multiplayer']).slice(0, 4).map((genre, gIndex) => (
                    <span key={gIndex} className="steam-tag-pill">{genre}</span>
                  ))}
                </div>
              </div>

              {/* Bottom Price Bar */}
              <div className="hero-pricing-footer">
                {currentHero.discount_percent > 0 ? (
                  <div className="hero-sale-block">
                    <span className="steam-discount-box">-{currentHero.discount_percent}%</span>
                    <div className="strike-and-new">
                      <span className="strike-old">₹ {currentHero.price.toLocaleString()}</span>
                      <span className="price-tag-badge">{formatPrice(currentHero.price, currentHero.discount_percent)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="price-tag-badge">
                    {formatPrice(currentHero.price, 0)}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Arrow Control */}
          <button className="carousel-arrow-btn right" onClick={handleNextSlide} aria-label="Next">
            &#10095;
          </button>

        </section>

        {/* ── Slide Indicator Dots ── */}
        <div className="carousel-indicator-bar">
          {featuredGames.map((_, dotIdx) => (
            <span
              key={dotIdx}
              className={`indicator-segment ${dotIdx === currentSlideIndex ? 'active' : ''}`}
              onClick={() => {
                setHoveredThumbIndex(null);
                setCurrentSlideIndex(dotIdx);
              }}
            />
          ))}
        </div>

        {/* ── Special Offers & Store Catalog ── */}
        <section className="steam-store-catalog">
          <div className="catalog-header-bar">
            <h3>SPECIAL OFFERS</h3>
            <span className="catalog-see-more">Browse all &gt;</span>
          </div>

          <div className="steam-specials-grid">
            {games.map((g) => (
              <div key={g.id} className="special-offer-card" onClick={() => setActiveModalGame(g)}>
                <div className="special-card-img-wrap">
                  <img src={g.thumbnail_url || g.banner_url} alt={g.title} />
                  {g.discount_percent > 0 && (
                    <span className="special-discount-tag">-{g.discount_percent}%</span>
                  )}
                </div>
                <div className="special-card-footer">
                  <span className="special-game-title">{g.title}</span>
                  <div className="special-pricing">
                    {g.discount_percent > 0 && (
                      <span className="special-old-price">₹ {g.price}</span>
                    )}
                    <span className="special-final-price">{formatPrice(g.price, g.discount_percent)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Game Details Modal */}
      {activeModalGame && (
        <div className="steam-modal-backdrop" onClick={() => setActiveModalGame(null)}>
          <div className="steam-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="steam-modal-close" onClick={() => setActiveModalGame(null)}>✕</button>

            <div className="modal-header-hero">
              <img src={activeModalGame.banner_url} alt={activeModalGame.title} className="modal-hero-bg" />
              <div className="modal-hero-content">
                <h2>{activeModalGame.title}</h2>
              </div>
            </div>

            <div className="modal-body-grid">
              <div className="modal-left-col">
                <div className="modal-description-box">
                  <h3>About This Game</h3>
                  <p>{activeModalGame.description || activeModalGame.short_description}</p>
                </div>
              </div>

              <div className="modal-right-col">
                <div className="modal-buy-box">
                  <div className="buy-box-badge">BUY {activeModalGame.title.toUpperCase()}</div>
                  <div className="price-tag-badge" style={{ fontSize: '18px', margin: '10px 0' }}>
                    {formatPrice(activeModalGame.price, activeModalGame.discount_percent)}
                  </div>
                  <button
                    className="steam-green-btn-lg"
                    onClick={() => {
                      setCartCount(prev => prev + 1);
                      alert(`Added "${activeModalGame.title}" to Cart!`);
                      setActiveModalGame(null);
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    className="steam-secondary-btn"
                    onClick={() => {
                      setWishlistCount(prev => prev + 1);
                      alert(`Added "${activeModalGame.title}" to Wishlist!`);
                    }}
                  >
                    ★ Add to Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
