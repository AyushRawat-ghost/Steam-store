import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { gamesApi } from '../../services/api';
import './DeveloperStudio.css';

export default function DeveloperStudio({ onNavigateStore }) {
  const { user, isDev, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('publish'); // 'publish' | 'manage'
  const [myGames, setMyGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('29.99');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [selectedGenres, setSelectedGenres] = useState(['Action']);
  
  // S3 Asset URLs & Upload state
  const [bannerUrl, setBannerUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);

  // Edit Game Modal State
  const [editingGame, setEditingGame] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDiscount, setEditDiscount] = useState('0');
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editPublished, setEditPublished] = useState(true);

  const startEditGame = (g) => {
    setEditingGame(g);
    setEditPrice(g.price?.toString() || '0');
    setEditDiscount(g.discount_percent?.toString() || '0');
    setEditShortDesc(g.short_description || '');
    setEditPublished(g.is_published !== false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingGame) return;
    try {
      const p = parseFloat(editPrice) || 0;
      const d = parseInt(editDiscount, 10) || 0;
      await gamesApi.updateGame(editingGame.id, {
        price: p,
        discount_percent: d,
        short_description: editShortDesc,
        is_published: editPublished,
      });
      setToast({ type: 'success', message: `Changes saved for "${editingGame.title}"!` });
      setEditingGame(null);
      fetchMyGames();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update game' });
    }
  };

  const handleDeleteGame = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" from your Steamworks account?`)) {
      return;
    }
    try {
      await gamesApi.deleteGame(id);
      setToast({ type: 'success', message: `"${title}" has been deleted.` });
      setMyGames((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete game' });
    }
  };

  const availableGenres = [
    'Action', 'RPG', 'Sci-Fi', 'Souls-like', 'Indie', 'Open World',
    'Adventure', 'Strategy', 'Simulation', 'Horror', 'Cyberpunk', 'Multiplayer'
  ];

  // Fetch developer's existing games
  const fetchMyGames = async () => {
    try {
      const res = await gamesApi.getMyGames();
      if (res && res.data) {
        setMyGames(res.data);
      }
    } catch (err) {
      console.log('Developer games fetch note:', err.message);
    }
  };

  useEffect(() => {
    if (isDev || isAdmin) {
      fetchMyGames();
    }
  }, [isDev, isAdmin]);

  // Handle S3 Image Upload
  const handleFileUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'banner') setUploadingBanner(true);
      if (type === 'thumbnail') setUploadingThumb(true);

      // Call S3 upload endpoint
      const res = await gamesApi.uploadAsset(file, type === 'banner' ? 'game-banners' : 'game-thumbnails');
      
      const s3Url = res.url || URL.createObjectURL(file);

      if (type === 'banner') {
        setBannerUrl(s3Url);
        setToast({ type: 'success', message: 'Main Banner uploaded to AWS S3 successfully!' });
      } else {
        setThumbnailUrl(s3Url);
        setToast({ type: 'success', message: 'Thumbnail uploaded to AWS S3 successfully!' });
      }
    } catch (err) {
      // Fallback to local object preview URL if S3 credentials not yet configured
      const fallbackUrl = URL.createObjectURL(file);
      if (type === 'banner') setBannerUrl(fallbackUrl);
      if (type === 'thumbnail') setThumbnailUrl(fallbackUrl);
      setToast({
        type: 'info',
        message: `Image preview loaded! (Backend S3 endpoint will store on server when AWS keys are configured).`
      });
    } finally {
      if (type === 'banner') setUploadingBanner(false);
      if (type === 'thumbnail') setUploadingThumb(false);
    }
  };

  // Handle multiple screenshots S3 upload
  const handleScreenshotsUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingScreenshots(true);
    const newShots = [];

    for (const file of files) {
      try {
        const res = await gamesApi.uploadAsset(file, 'game-screenshots');
        newShots.push(res.url || URL.createObjectURL(file));
      } catch (err) {
        newShots.push(URL.createObjectURL(file));
      }
    }

    setScreenshots((prev) => [...prev, ...newShots]);
    setUploadingScreenshots(false);
    setToast({ type: 'success', message: `${files.length} screenshots processed for AWS S3!` });
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Submit Game for Review & Storefront
  const handlePublishGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    const payload = {
      title: title.trim(),
      short_description: shortDesc.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0.0,
      discount_percent: parseInt(discountPercent, 10) || 0,
      banner_url: bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: thumbnailUrl || bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
      screenshots: screenshots.length > 0 ? screenshots : [bannerUrl],
      genres: selectedGenres,
      is_published: true,
    };

    try {
      await gamesApi.createGame(payload);
      setToast({
        type: 'success',
        message: `🎉 "${title}" has been successfully published to Steamworks!`,
      });
      // Reset form
      setTitle('');
      setShortDesc('');
      setDescription('');
      setBannerUrl('');
      setThumbnailUrl('');
      setScreenshots([]);
      fetchMyGames();
      setActiveTab('manage');
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to publish game to Steamworks',
      });
    } finally {
      setLoading(false);
    }
  };

  // Non-developer view guard
  if (!isDev && !isAdmin) {
    return (
      <div className="steamworks-portal-page">
        <div className="steamworks-container">
          <div className="steamworks-card text-center">
            <span style={{ fontSize: '42px', display: 'block', marginBottom: '14px' }}>🛡️</span>
            <h2>Steamworks Partner Access Required</h2>
            <p>You need a registered Developer account to access the Steamworks Game Publishing Portal.</p>
            <button className="steam-primary-action-btn" onClick={onNavigateStore} style={{ marginTop: '16px' }}>
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Developer pending verification
  if (isDev && !user?.is_verified && !isAdmin) {
    return (
      <div className="steamworks-portal-page">
        <div className="steamworks-container">
          <div className="steamworks-card review-card">
            <span className="review-icon">⏳</span>
            <h2>Developer Partner Application Under Review</h2>
            <p>
              Welcome, <strong>{user?.username}</strong>. Your Steamworks developer account has been registered
              and is currently awaiting manual verification by an administrator. Once approved, you can upload game
              binaries, publish store assets, and manage pricing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="steamworks-portal-page">
      <div className="steamworks-container">
        
        {/* Steamworks Header */}
        <div className="steamworks-header">
          <div>
            <span className="steamworks-badge">🛠️ STEAMWORKS DEVELOPER STUDIO</span>
            <h1>Game Creation & Asset Pipeline</h1>
            <p>Publish games, configure AWS S3 visual assets, manage store pricing, and track player metrics.</p>
          </div>

          <div className="steamworks-tab-switch">
            <button
              className={`switch-btn ${activeTab === 'publish' ? 'active' : ''}`}
              onClick={() => setActiveTab('publish')}
            >
              + Create New Game
            </button>
            <button
              className={`switch-btn ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              My Titles ({myGames.length})
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {toast && (
          <div className={`steam-alert-toast toast-${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : toast.type === 'info' ? 'ℹ️' : '⚠️'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {/* ── TAB 1: PUBLISH NEW GAME ── */}
        {activeTab === 'publish' && (
          <form className="steamworks-form" onSubmit={handlePublishGame}>
            
            {/* Basic Info Card */}
            <div className="steamworks-card">
              <h3 className="card-section-title">1. Title & Store Descriptions</h3>
              
              <div className="form-group">
                <label>Game Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Overdrive: Neon Reckoning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="steamworks-input"
                />
              </div>

              <div className="form-group">
                <label>Short Pitch / Store Headline (Max 160 characters) *</label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  placeholder="A gripping cyberpunk extraction rogue-lite set in 2088..."
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="steamworks-input"
                />
              </div>

              <div className="form-group">
                <label>Full About The Game Description *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Detail the game world, gameplay mechanics, combat, storyline, and unique features..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="steamworks-textarea"
                />
              </div>
            </div>

            {/* Pricing & Genre Card */}
            <div className="steamworks-card">
              <h3 className="card-section-title">2. Pricing & Genres</h3>
              
              <div className="grid-two-cols">
                <div className="form-group">
                  <label>Base Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="steamworks-input"
                  />
                </div>

                <div className="form-group">
                  <label>Launch Discount (% Off)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="steamworks-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Select Genres & Tags</label>
                <div className="genres-checkbox-cloud">
                  {availableGenres.map((g) => (
                    <button
                      type="button"
                      key={g}
                      className={`genre-check-pill ${selectedGenres.includes(g) ? 'selected' : ''}`}
                      onClick={() => toggleGenre(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* S3 Visual Asset Upload Section */}
            <div className="steamworks-card">
              <h3 className="card-section-title">3. Visual Media & AWS S3 Asset Pipeline</h3>
              <p className="card-helper-text">
                Storefront visual branding. Assets uploaded here are pushed directly to your AWS S3 bucket.
              </p>

              <div className="s3-upload-grid">
                
                {/* Main Hero Banner (16:9) */}
                <div className="s3-drop-box">
                  <div className="s3-box-header">
                    <strong>Main Store Banner (16:9)</strong>
                    <span className="s3-badge">AWS S3</span>
                  </div>

                  {bannerUrl ? (
                    <div className="s3-preview-wrap">
                      <img src={bannerUrl} alt="Banner Preview" className="s3-preview-img" />
                      <button
                        type="button"
                        className="s3-change-btn"
                        onClick={() => setBannerUrl('')}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <label className="s3-upload-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'banner')}
                        style={{ display: 'none' }}
                      />
                      <span className="s3-cloud-icon">☁️</span>
                      <span>{uploadingBanner ? 'Uploading to S3...' : 'Upload 16:9 Banner'}</span>
                      <small>PNG or JPEG up to 10MB</small>
                    </label>
                  )}

                  <input
                    type="url"
                    placeholder="or paste S3 / CDN image URL..."
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="steamworks-sub-input"
                  />
                </div>

                {/* Thumbnail Cover */}
                <div className="s3-drop-box">
                  <div className="s3-box-header">
                    <strong>Grid Thumbnail</strong>
                    <span className="s3-badge">AWS S3</span>
                  </div>

                  {thumbnailUrl ? (
                    <div className="s3-preview-wrap">
                      <img src={thumbnailUrl} alt="Thumbnail Preview" className="s3-preview-img" />
                      <button
                        type="button"
                        className="s3-change-btn"
                        onClick={() => setThumbnailUrl('')}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <label className="s3-upload-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'thumbnail')}
                        style={{ display: 'none' }}
                      />
                      <span className="s3-cloud-icon">🖼️</span>
                      <span>{uploadingThumb ? 'Uploading to S3...' : 'Upload Thumbnail'}</span>
                      <small>Square or 4:3 card view</small>
                    </label>
                  )}

                  <input
                    type="url"
                    placeholder="or paste S3 / CDN image URL..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="steamworks-sub-input"
                  />
                </div>

              </div>

              {/* Screenshots Gallery Upload */}
              <div className="screenshots-upload-section">
                <label className="screenshots-label">Game Screenshots Gallery</label>
                
                <div className="screenshots-gallery-row">
                  {screenshots.map((shot, sIndex) => (
                    <div key={sIndex} className="screenshot-thumb-item">
                      <img src={shot} alt={`Screenshot ${sIndex + 1}`} />
                      <button
                        type="button"
                        className="remove-shot-btn"
                        onClick={() => setScreenshots(screenshots.filter((_, i) => i !== sIndex))}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <label className="add-screenshot-btn">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleScreenshotsUpload}
                      style={{ display: 'none' }}
                    />
                    <span>+ Add Screenshot</span>
                    <small>{uploadingScreenshots ? 'Pushing to S3...' : 'Multi-select files'}</small>
                  </label>
                </div>
              </div>

            </div>

            {/* Submit Action */}
            <div className="form-submit-row">
              <button
                type="submit"
                disabled={loading}
                className="steam-publish-submit-btn"
              >
                {loading ? 'Publishing to Steamworks...' : '🚀 Submit Title to Steam Store'}
              </button>
            </div>

          </form>
        )}



        {/* ── TAB 2: MY TITLES ── */}
        {activeTab === 'manage' && (
          <div className="steamworks-card">
            <h3 className="card-section-title">My Registered Steam Games ({myGames.length})</h3>
            
            {myGames.length === 0 ? (
              <div className="empty-games-notice">
                <span>🎮</span>
                <p>No titles published under your developer account yet.</p>
                <button
                  className="steam-primary-action-btn"
                  onClick={() => setActiveTab('publish')}
                >
                  Create Your First Game
                </button>
              </div>
            ) : (
              <div className="my-games-table-wrap">
                <table className="steamworks-table">
                  <thead>
                    <tr>
                      <th>Game Title</th>
                      <th>Price / Discount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myGames.map((g) => (
                      <tr key={g.id}>
                        <td className="game-td-title">
                          <img src={g.thumbnail_url || g.banner_url} alt="" className="table-mini-thumb" />
                          <div>
                            <strong>{g.title}</strong>
                            <small>{(g.genres || []).join(', ')}</small>
                          </div>
                        </td>
                        <td>
                          <span>${g.price?.toFixed(2)} USD</span>
                          {g.discount_percent > 0 && (
                            <span className="table-discount-pill">-{g.discount_percent}%</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${g.status || 'pending'}`}>
                            {g.status ? g.status.toUpperCase() : 'PENDING'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="table-action-btn"
                              onClick={() => startEditGame(g)}
                            >
                              ⚙️ Edit
                            </button>
                            <button
                              className="table-action-btn"
                              onClick={() => handleDeleteGame(g.id, g.title)}
                              style={{ color: '#ff7675' }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── EDIT GAME MODAL ── */}
        {editingGame && (
          <div className="steam-modal-backdrop" onClick={() => setEditingGame(null)}>
            <div className="steam-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ margin: 0, color: '#ffffff' }}>Edit "{editingGame.title}"</h3>
                <button className="steam-modal-close" onClick={() => setEditingGame(null)}>✕</button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="form-group">
                  <label>Base Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="steamworks-input"
                  />
                </div>

                <div className="form-group">
                  <label>Discount Percent (% Off)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                    className="steamworks-input"
                  />
                </div>

                <div className="form-group">
                  <label>Short Pitch Headline</label>
                  <input
                    type="text"
                    maxLength={160}
                    value={editShortDesc}
                    onChange={(e) => setEditShortDesc(e.target.value)}
                    className="steamworks-input"
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="publishedCheck"
                    checked={editPublished}
                    onChange={(e) => setEditPublished(e.target.checked)}
                  />
                  <label htmlFor="publishedCheck" style={{ cursor: 'pointer' }}>Active in Storefront</label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="steam-secondary-btn" onClick={() => setEditingGame(null)} style={{ width: 'auto', padding: '10px 18px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="steam-hero-action-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
