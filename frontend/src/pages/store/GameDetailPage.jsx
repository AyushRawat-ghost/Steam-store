import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { gamesApi, cartApi } from '../../services/api';
import './GameDetailPage.css';

export default function GameDetailPage({ game: initialGame, onBack, onOpenCart }) {
  const { isAuthenticated, user } = useAuth();
  const [game, setGame] = useState(initialGame);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [activeReqTab, setActiveReqTab] = useState('win');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [wishlisted, setWishlisted] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewIsPositive, setNewReviewIsPositive] = useState(true);
  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch full game details if needed
  useEffect(() => {
    async function loadFullGame() {
      if (!initialGame) return;
      try {
        const idOrSlug = initialGame.slug || initialGame.id;
        const res = await gamesApi.getGame(idOrSlug);
        if (res && res.data) {
          setGame(res.data);
        }
      } catch (err) {
        // use initialGame if fetch fails
      }
    }
    loadFullGame();
  }, [initialGame]);

  // Fetch reviews dynamically from backend
  useEffect(() => {
    async function loadReviews() {
      if (!game) return;
      setLoadingReviews(true);
      try {
        const idOrSlug = game.slug || game.id;
        const res = await gamesApi.getReviews(idOrSlug, reviewFilter);
        if (res && res.data) {
          setUserReviews(res.data);
        } else {
          setUserReviews([]);
        }
      } catch (err) {
        console.warn('Failed to load reviews:', err.message);
        setUserReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadReviews();
  }, [game?.id, game?.slug, reviewFilter]);

  if (!game) return null;

  const mediaList = [
    game.banner_url,
    ...(game.screenshots || [game.thumbnail_url, game.banner_url]),
  ].filter(Boolean);

  const currentMediaUrl = mediaList[selectedMediaIndex] || game.banner_url;

  const formatPrice = (price, discount) => {
    if (price === 0) return 'Free to Play';
    if (!discount || discount === 0) return `$${price?.toFixed(2)} USD`;
    const discounted = price * (1 - discount / 100);
    return `$${discounted.toFixed(2)} USD`;
  };

  const handleAddToCart = async () => {
    setAddingCart(true);
    try {
      if (isAuthenticated) {
        await cartApi.addToCart(game.id);
      }
    } catch (err) {
      console.warn('Cart notice:', err.message);
    } finally {
      setAddingCart(false);
      if (onOpenCart) onOpenCart();
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const idOrSlug = game.slug || game.id;
      const res = await gamesApi.createReview(idOrSlug, {
        is_recommended: newReviewIsPositive,
        content: newReviewText.trim(),
        playtime_hours: '18.4 hrs on record',
      });
      if (res && res.data) {
        setUserReviews([res.data, ...userReviews]);
        setNewReviewText('');
      }
    } catch (err) {
      alert(err.message || 'Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVote = async (reviewId, type) => {
    try {
      await gamesApi.voteReview(reviewId, type);
      setUserReviews((prev) =>
        prev.map((r) => {
          if (r.id === reviewId) {
            return {
              ...r,
              helpful_count: type === 'helpful' ? r.helpful_count + 1 : r.helpful_count,
              funny_count: type === 'funny' ? r.funny_count + 1 : r.funny_count,
            };
          }
          return r;
        })
      );
    } catch (err) {
      console.warn('Vote failed:', err.message);
    }
  };

  return (
    <div className="steam-product-page">
      {/* ── Breadcrumb Bar ── */}
      <div className="product-breadcrumb-row">
        <button className="breadcrumb-link" onClick={onBack}>
          All Games
        </button>
        <span className="breadcrumb-sep">&gt;</span>
        <span className="breadcrumb-link">{(game.genres && game.genres[0]) || 'Action'}</span>
        <span className="breadcrumb-sep">&gt;</span>
        <span className="breadcrumb-active">{game.title}</span>

        <button className="community-hub-btn">Community Hub</button>
      </div>

      {/* ── Game Title Header ── */}
      <h1 className="product-game-title">{game.title}</h1>

      {/* ── Top 2-Column Showcase (Cinema Player + Details Box) ── */}
      <div className="product-showcase-grid">
        {/* Left: Cinema Media Viewer */}
        <div className="showcase-cinema-col">
          <div className="cinema-stage">
            <img src={currentMediaUrl} alt={game.title} className="cinema-active-img" />
          </div>

          {/* Horizontal Thumbnails Carousel Track */}
          <div className="cinema-thumbs-track">
            {mediaList.slice(0, 6).map((url, idx) => (
              <div
                key={idx}
                className={`cinema-thumb-item ${selectedMediaIndex === idx ? 'active' : ''}`}
                onClick={() => setSelectedMediaIndex(idx)}
              >
                <img src={url} alt={`Media ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Steam Product Summary Box */}
        <div className="showcase-summary-col">
          <img
            src={game.thumbnail_url || game.banner_url}
            alt={game.title}
            className="summary-header-capsule"
          />

          <p className="summary-short-desc">
            {game.short_description || game.description}
          </p>

          <div className="summary-meta-table">
            <div className="meta-row">
              <span className="meta-label">RECENT REVIEWS:</span>
              <span className="meta-val highlight-positive">
                {game.review_status || 'Very Positive'}
              </span>
            </div>

            <div className="meta-row">
              <span className="meta-label">ALL REVIEWS:</span>
              <span className="meta-val highlight-positive">
                {game.review_status || 'Overwhelmingly Positive'} ({game.review_count || 'Community Reviews'})
              </span>
            </div>

            <div className="meta-row">
              <span className="meta-label">RELEASE DATE:</span>
              <span className="meta-val">{game.release_date || 'Dec 10, 2024'}</span>
            </div>

            <div className="meta-row">
              <span className="meta-label">DEVELOPER:</span>
              <span className="meta-val link-style">
                {game.developer_name || 'CD PROJEKT RED'}
              </span>
            </div>

            <div className="meta-row">
              <span className="meta-label">PUBLISHER:</span>
              <span className="meta-val link-style">
                {game.publisher_name || 'CD PROJEKT RED'}
              </span>
            </div>
          </div>

          {/* Tags Cloud */}
          <div className="summary-tags-section">
            <span className="tags-label">Popular user-defined tags for this product:</span>
            <div className="product-tags-cloud">
              {(game.genres || ['Action', 'RPG', 'Open World', 'Cyberpunk']).map((g, idx) => (
                <span key={idx} className="steam-pill-tag">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Ribbon (Wishlist / Follow / Share) ── */}
      <div className="product-action-ribbon">
        <button
          className={`ribbon-action-btn ${wishlisted ? 'active' : ''}`}
          onClick={() => setWishlisted(!wishlisted)}
        >
          <span>{wishlisted ? '★ In Wishlist' : '☆ Add to your wishlist'}</span>
        </button>
        <button className="ribbon-action-btn">
          <span>Follow</span>
        </button>
        <button className="ribbon-action-btn">
          <span>Ignore</span>
        </button>
        <button className="ribbon-action-btn">
          <span>Share</span>
        </button>
      </div>

      {/* ── BUY GAME BANNER BOX ── */}
      <div className="product-buy-banner">
        <div className="buy-banner-left">
          <h2>
            Buy {game.title} {game.edition ? `- ${game.edition}` : ''}
          </h2>
          <div className="supported-platforms">
            <span title="Windows">🪟</span>
            <span title="Steam Deck">🎮 Steam Deck Verified</span>
          </div>
        </div>

        <div className="buy-banner-right">
          <div className="buy-price-block">
            {game.discount_percent > 0 ? (
              <div className="discount-block">
                <span className="discount-pill">-{game.discount_percent}%</span>
                <div className="strikethrough-and-final">
                  <span className="strike-orig">${game.price?.toFixed(2)}</span>
                  <span className="final-price">{formatPrice(game.price, game.discount_percent)}</span>
                </div>
              </div>
            ) : (
              <span className="final-price">{formatPrice(game.price, 0)}</span>
            )}

            <button
              className="steam-buy-cart-btn"
              onClick={handleAddToCart}
              disabled={addingCart}
            >
              {addingCart ? 'Adding...' : '🛒 Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* ── ABOUT THIS GAME SECTION ── */}
      <section className="product-detail-section">
        <h3 className="section-title">ABOUT THIS GAME</h3>
        <div className="about-game-prose">
          <p>{game.description || game.short_description}</p>
        </div>
      </section>

      {/* ── SYSTEM REQUIREMENTS MATRIX ── */}
      <section className="product-detail-section">
        <h3 className="section-title">SYSTEM REQUIREMENTS</h3>

        <div className="sys-req-os-tabs">
          <button
            className={`os-tab-btn ${activeReqTab === 'win' ? 'active' : ''}`}
            onClick={() => setActiveReqTab('win')}
          >
            Windows
          </button>
          <button
            className={`os-tab-btn ${activeReqTab === 'mac' ? 'active' : ''}`}
            onClick={() => setActiveReqTab('mac')}
          >
            macOS
          </button>
          <button
            className={`os-tab-btn ${activeReqTab === 'linux' ? 'active' : ''}`}
            onClick={() => setActiveReqTab('linux')}
          >
            SteamOS + Linux
          </button>
        </div>

        <div className="sys-specs-grid">
          {/* Minimum Specs */}
          <div className="spec-col">
            <strong>MINIMUM:</strong>
            <p><strong>OS:</strong> {game.min_os || 'Windows 10 64-bit'}</p>
            <p><strong>Processor:</strong> {game.min_processor || 'Intel Core i5-8400 / AMD Ryzen 5 1600'}</p>
            <p><strong>Memory:</strong> {game.min_memory || '12 GB RAM'}</p>
            <p><strong>Graphics:</strong> {game.min_graphics || 'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580'}</p>
            <p><strong>DirectX:</strong> Version 12</p>
            <p><strong>Storage:</strong> {game.min_storage || '70 GB available space (SSD required)'}</p>
          </div>

          {/* Recommended Specs */}
          <div className="spec-col">
            <strong>RECOMMENDED:</strong>
            <p><strong>OS:</strong> {game.rec_os || 'Windows 10/11 64-bit'}</p>
            <p><strong>Processor:</strong> {game.rec_processor || 'Intel Core i7-12700 / AMD Ryzen 7 7800X3D'}</p>
            <p><strong>Memory:</strong> {game.rec_memory || '16 GB RAM'}</p>
            <p><strong>Graphics:</strong> {game.rec_graphics || 'NVIDIA GeForce RTX 3080 / AMD Radeon RX 6800 XT'}</p>
            <p><strong>DirectX:</strong> Version 12</p>
            <p><strong>Storage:</strong> {game.rec_storage || '70 GB available space (NVMe SSD)'}</p>
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS SECTION ── */}
      <section className="product-detail-section">
        <div className="reviews-header-block">
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>CUSTOMER REVIEWS</h3>
            <span className="reviews-sub-stats">
              Overall: <strong style={{ color: '#66c0f4' }}>{game.review_status || 'Very Positive'}</strong> ({userReviews.length} community player reviews)
            </span>
          </div>

          <div className="review-filter-buttons">
            <button
              className={`filter-btn ${reviewFilter === 'all' ? 'active' : ''}`}
              onClick={() => setReviewFilter('all')}
            >
              All ({userReviews.length})
            </button>
            <button
              className={`filter-btn ${reviewFilter === 'positive' ? 'active' : ''}`}
              onClick={() => setReviewFilter('positive')}
            >
              Positive
            </button>
            <button
              className={`filter-btn ${reviewFilter === 'negative' ? 'active' : ''}`}
              onClick={() => setReviewFilter('negative')}
            >
              Negative
            </button>
          </div>
        </div>

        {/* Write a Review Box */}
        {isAuthenticated ? (
          <form className="write-review-card" onSubmit={handlePostReview}>
            <h4>Write a review for {game.title}</h4>
            <p>
              Please describe what you liked or disliked about this game and whether you recommend it to others.
            </p>

            <textarea
              rows={4}
              required
              placeholder="Write your review here..."
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              className="write-review-textarea"
            />

            <div className="write-review-controls">
              <div className="thumbs-select">
                <span>Do you recommend this game?</span>
                <button
                  type="button"
                  className={`thumb-choice-btn ${newReviewIsPositive ? 'selected' : ''}`}
                  onClick={() => setNewReviewIsPositive(true)}
                >
                  👍 Yes
                </button>
                <button
                  type="button"
                  className={`thumb-choice-btn ${!newReviewIsPositive ? 'selected' : ''}`}
                  onClick={() => setNewReviewIsPositive(false)}
                >
                  👎 No
                </button>
              </div>

              <button
                type="submit"
                className="steam-post-review-btn"
                disabled={submittingReview}
              >
                {submittingReview ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px', color: '#8f98a0', fontSize: '13px' }}>
            Log in to write a review for this game.
          </div>
        )}

        {/* Reviews Feed */}
        {loadingReviews ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#66c0f4' }}>
            Loading reviews from Steam database...
          </div>
        ) : userReviews.length === 0 ? (
          <div style={{ padding: '24px 0', color: '#8f98a0' }}>
            No reviews matching this filter. Be the first to write a review!
          </div>
        ) : (
          <div className="reviews-feed-list">
            {userReviews.map((rev) => (
              <div key={rev.id} className="player-review-card">
                <div className="review-author-sidebar">
                  <img
                    src={rev.author_avatar || rev.avatar || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'}
                    alt=""
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <strong>{rev.author_name || rev.author || 'Steam Player'}</strong>
                    <small>Verified Steam Owner</small>
                  </div>
                </div>

                <div className="review-content-col">
                  <div className="review-verdict-header">
                    <div className="verdict-pill">
                      <span className="verdict-icon">{rev.is_recommended ? '👍' : '👎'}</span>
                      <span>{rev.is_recommended ? 'Recommended' : 'Not Recommended'}</span>
                    </div>
                    <span className="review-playtime-hours">{rev.playtime_hours || '14.2 hrs on record'}</span>
                  </div>

                  <div className="review-posted-date">
                    POSTED: {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                  </div>

                  <p className="review-text-body">{rev.content}</p>

                  <div className="review-helpful-voting">
                    <span>Was this review helpful?</span>
                    <button
                      className="vote-btn"
                      onClick={() => handleVote(rev.id, 'helpful')}
                    >
                      Yes
                    </button>
                    <button
                      className="vote-btn"
                      onClick={() => handleVote(rev.id, 'funny')}
                    >
                      Funny
                    </button>
                    <span className="vote-count">
                      {rev.helpful_count || 0} people found this review helpful ({rev.funny_count || 0} funny)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
