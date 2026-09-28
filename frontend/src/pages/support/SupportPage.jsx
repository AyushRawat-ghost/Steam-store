import React, { useState } from 'react';
import './SupportPage.css';

const RECENT_PRODUCTS = [
  { id: 1, title: 'Cyberpunk 2077', icon: '🌆', hours: '42.5 hrs played' },
  { id: 2, title: 'Elden Ring', icon: '💍', hours: '128 hrs played' },
  { id: 3, title: 'Starfield', icon: '🚀', hours: '14.2 hrs played' },
  { id: 4, title: 'Steam Client Beta', icon: '⚙️', hours: 'Last used today' },
];

const HELP_CATEGORIES = [
  { id: 'games', icon: '🎮', title: 'Games, Software, etc.', desc: 'Issues with downloading, running, DLCs, or game keys' },
  { id: 'purchases', icon: '💳', title: 'Purchases & Billing', desc: 'Refund requests, payment errors, wallet funds, or gift codes' },
  { id: 'account', icon: '🛡️', title: 'My Account & Security', desc: 'Password reset, Steam Guard mobile authenticator, or stolen accounts' },
  { id: 'trading', icon: '🔄', title: 'Trading, Gifting & Community Market', desc: 'Trade holds, escrow, market listings, and inventory issues' },
  { id: 'hardware', icon: '🕹️', title: 'Steam Hardware & Steam Deck', desc: 'Repairs, RMA warranty, Steam Deck dock, and VR accessories' },
  { id: 'client', icon: '💻', title: 'Steam Client & Cloud Sync', desc: 'Connection errors, cloud save conflicts, and client crashes' },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(false);

  const handleOpenHelp = (item) => {
    setSelectedIssue(item);
    setTicketSubject(`Issue regarding: ${item.title}`);
    setSubmittedTicket(false);
  };

  const handleSendTicket = (e) => {
    e.preventDefault();
    setSubmittedTicket(true);
  };

  return (
    <div className="steam-support-page">
      <div className="steam-support-container">
        
        {/* Support Header */}
        <div className="support-header-block">
          <div className="support-breadcrumb">
            <span>HOME</span> &gt; <span>STEAM SUPPORT</span>
          </div>
          <h1>What do you need help with?</h1>

          {/* Search Box */}
          <div className="support-search-wrapper">
            <input
              type="text"
              placeholder="Search by game, hardware, or issue description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="support-search-input"
            />
            <button className="support-search-btn">Search Support</button>
          </div>
        </div>

        {/* Recent Products */}
        <section className="support-section">
          <h3 className="support-section-title">RECENT PRODUCTS</h3>
          <div className="recent-products-grid">
            {RECENT_PRODUCTS.map((prod) => (
              <div key={prod.id} className="recent-product-card" onClick={() => handleOpenHelp(prod)}>
                <span className="prod-icon">{prod.icon}</span>
                <div className="prod-meta">
                  <strong>{prod.title}</strong>
                  <small>{prod.hours}</small>
                </div>
                <span className="arrow-glyph">&gt;</span>
              </div>
            ))}
          </div>
        </section>

        {/* Common Help Categories */}
        <section className="support-section">
          <h3 className="support-section-title">COMMON HELP TOPICS</h3>
          <div className="help-categories-list">
            {HELP_CATEGORIES.map((cat) => (
              <div key={cat.id} className="help-cat-row" onClick={() => handleOpenHelp(cat)}>
                <div className="cat-icon-wrap">{cat.icon}</div>
                <div className="cat-text">
                  <strong>{cat.title}</strong>
                  <p>{cat.desc}</p>
                </div>
                <span className="arrow-glyph">&gt;</span>
              </div>
            ))}
          </div>
        </section>

        {/* Self-Help Guides Banner */}
        <div className="support-quick-card">
          <div className="quick-card-content">
            <span className="quick-badge">🔒 STEAM GUARD & ACCOUNT SECURITY</span>
            <h4>Need to recover your account or reset your password?</h4>
            <p>Our automated recovery system can help you reset credentials, re-link Steam Guard, or unlock your profile.</p>
          </div>
          <button className="support-primary-btn" onClick={() => alert('Launching Steam automated account recovery wizard')}>
            Account Recovery Wizard
          </button>
        </div>

      </div>

      {/* Support Ticket Modal */}
      {selectedIssue && (
        <div className="steam-modal-backdrop" onClick={() => setSelectedIssue(null)}>
          <div className="steam-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', padding: '24px' }}>
            <button className="steam-modal-close" onClick={() => setSelectedIssue(null)}>✕</button>

            {submittedTicket ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '14px' }}>✅</span>
                <h3 style={{ color: '#a4d007', marginBottom: '8px' }}>Support Ticket Created!</h3>
                <p style={{ color: '#c7d5e0', fontSize: '14px', lineHeight: '1.6' }}>
                  Your support request reference <strong>#ST-{(Math.random() * 899999 + 100000).toFixed(0)}</strong> has been registered.
                  A Steam Support representative will review your diagnostics and follow up via your registered email.
                </p>
                <button
                  className="steam-hero-action-btn"
                  onClick={() => setSelectedIssue(null)}
                  style={{ marginTop: '16px' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '11px', color: '#66c0f4', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Steam Customer Support
                </span>
                <h2 style={{ color: '#ffffff', margin: '6px 0 16px' }}>Help Request: {selectedIssue.title}</h2>

                <form onSubmit={handleSendTicket}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#8da4b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="support-modal-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ color: '#8da4b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                      Please provide details about the problem you are experiencing
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Include error codes, crash logs, or transaction IDs if applicable..."
                      value={ticketDetails}
                      onChange={(e) => setTicketDetails(e.target.value)}
                      className="support-modal-textarea"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="steam-secondary-btn" onClick={() => setSelectedIssue(null)} style={{ width: 'auto', padding: '10px 18px' }}>
                      Cancel
                    </button>
                    <button type="submit" className="steam-hero-action-btn">
                      Submit Ticket to Steam Support
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
