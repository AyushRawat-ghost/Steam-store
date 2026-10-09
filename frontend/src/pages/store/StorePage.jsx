import React, { useState, useEffect } from 'react';
import { gamesApi, cartApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import GameDetailPage from './GameDetailPage';
import './StorePage.css';

export default function StorePage({ onOpenCart }) {
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hoveredThumbIndex, setHoveredThumbIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedGameForDetail, setSelectedGameForDetail] = useState(null);

  // Sync real cart count from backend on load
  useEffect(() => {
    async function loadCartCount() {
      if (!isAuthenticated) return;
      try {
        const res = await cartApi.getCart();
        if (res && res.data) {
          setCartCount(res.data.count || 0);
        }
      } catch (err) {
        // silent
      }
    }
    loadCartCount();
  }, [isAuthenticated]);

  // Fetch games dynamically from backend API
  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      try {
        const res = await gamesApi.getGames();
        if (res && res.data && res.data.length > 0) {
          const dynamicGames = res.data.map((g) => ({
            ...g,
            edition: g.edition || 'STANDARD EDITION',
            review_status: g.review_status || 'Very Positive',
            review_count: g.review_count || 'Community Reviews',
            review_type: (g.review_status && g.review_status.toLowerCase().includes('positive')) ? 'positive' : 'mixed',
            action_text: g.price === 0 ? 'FREE TO PLAY' : 'NOW AVAILABLE',
            recommended_reason: 'popular with Steam players worldwide',
            screenshots: (g.screenshots && g.screenshots.length > 0)
              ? g.screenshots
              : [g.banner_url, g.thumbnail_url],
          }));
          setGames(dynamicGames);
          const feat = dynamicGames.filter((g) => g.is_featured);
          setFeaturedGames(feat.length > 0 ? feat : dynamicGames.slice(0, 5));
        } else {
          setGames([]);
          setFeaturedGames([]);
        }
      } catch (err) {
        console.error('Failed to load games from backend:', err);
        setGames([]);
        setFeaturedGames([]);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  const currentHero = featuredGames[currentSlideIndex] || featuredGames[0] || null;

  const handlePrevSlide = () => {
    if (featuredGames.length <= 1) return;
    setHoveredThumbIndex(null);
    setCurrentSlideIndex((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (featuredGames.length <= 1) return;
    setHoveredThumbIndex(null);
    setCurrentSlideIndex((prev) => (prev + 1) % featuredGames.length);
  };

  const heroDisplayImage = currentHero ? (
    (hoveredThumbIndex !== null && currentHero.screenshots && currentHero.screenshots[hoveredThumbIndex])
      ? currentHero.screenshots[hoveredThumbIndex]
      : (currentHero.banner_url || currentHero.thumbnail_url)
  ) : '';

  const formatPrice = (price, discount) => {
    if (price === 0) return 'Free to Play';
    if (!discount || discount === 0) return `$${price.toFixed(2)}`;
    const discounted = price * (1 - discount / 100);
    return `$${discounted.toFixed(2)}`;
  };

  const filteredGames = games.filter((g) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      g.title.toLowerCase().includes(query) ||
      (g.genres && g.genres.some((genre) => genre.toLowerCase().includes(query)))
    );
  });

  return (
    <div className="steam-authentic-store">
      {/* ── Sub Navigation Bar ── */}
      <div className="steam-store-subnav">
        <div className="subnav-container">
          <div className="subnav-menu-links">
            <span className="subnav-chip" onClick={() => setSelectedGameForDetail(null)}>
              Your Store <span className="arrow-down">▼</span>
            </span>
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
            <button
              className="subnav-cart-btn"
              onClick={() => (onOpenCart ? onOpenCart() : null)}
            >
              🛒 Cart <span className="cart-badge">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      {selectedGameForDetail ? (
        <GameDetailPage
          game={selectedGameForDetail}
          onBack={() => setSelectedGameForDetail(null)}
          onOpenCart={onOpenCart}
        />
      ) : (
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

          {loading ? (
            /* Steam Loading State */
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#66c0f4' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔄</div>
              <div>Connecting to Steam Store database...</div>
            </div>
          ) : currentHero ? (
            /* ── FEATURED & RECOMMENDED SECTION ── */
            <>
              <section className="steam-hero-carousel-wrapper">
                {/* Left Arrow Control */}
                <button className="carousel-arrow-btn left" onClick={handlePrevSlide} aria-label="Previous">
                  &#10094;
                </button>

                {/* Main Hero Card (2-Column) */}
                <div className="steam-hero-split-card">
                  {/* Left Big Stage */}
                  <div className="hero-stage-left" onClick={() => setSelectedGameForDetail(currentHero)}>
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
                      <span>{currentHero.action_text || 'NOW AVAILABLE'}</span>
                    </div>
                  </div>

                  {/* Right Information Column */}
                  <div className="hero-info-right">
                    <div>
                      <h3 className="hero-title-text" onClick={() => setSelectedGameForDetail(currentHero)}>
                        {currentHero.title}
                      </h3>

                      {/* Review status */}
                      <div className="hero-reviews-line">
                        <span className={`review-badge-text ${currentHero.review_type}`}>
                          {currentHero.review_status || 'Very Positive'}
                        </span>
                        <span className="review-count-text">({currentHero.review_count})</span>
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
                        <span className="rec-accent">Recommended</span> {currentHero.recommended_reason}
                      </div>

                      {/* Tag Pills */}
                      <div className="hero-tag-pills">
                        {(currentHero.genres || []).slice(0, 4).map((genre, gIndex) => (
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
                            <span className="strike-old">${currentHero.price.toFixed(2)}</span>
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
            </>
          ) : (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#8f98a0' }}>
              No games currently available in store.
            </div>
          )}

          {/* ── Special Offers & Store Catalog ── */}
          <section className="steam-store-catalog">
            <div className="catalog-header-bar">
              <h3>SPECIAL OFFERS & CATALOG</h3>
              <span className="catalog-see-more">{filteredGames.length} titles in catalog</span>
            </div>

            <div className="steam-specials-grid">
              {filteredGames.map((g) => (
                <div key={g.id} className="special-offer-card" onClick={() => setSelectedGameForDetail(g)}>
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
                        <span className="special-old-price">${g.price.toFixed(2)}</span>
                      )}
                      <span className="special-final-price">{formatPrice(g.price, g.discount_percent)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
