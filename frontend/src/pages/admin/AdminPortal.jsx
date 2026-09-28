import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import './AdminPortal.css';

export default function AdminPortal() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('developers'); // 'developers' | 'games'
  const [pendingDevs, setPendingDevs] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id being modified
  const [toast, setToast] = useState(null);

  const fetchPendingDevelopers = async () => {
    setLoading(true);
    try {
      const res = await authApi.getPendingDevelopers();
      if (res && res.data) {
        setPendingDevs(res.data);
      } else {
        setPendingDevs([]);
      }
    } catch (err) {
      console.error('Failed to fetch pending developers:', err.message);
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const res = await gamesApi.adminGetAllGames();
      if (res && res.data) {
        setGames(res.data);
      }
    } catch (err) {
      console.log('Admin games fetch note:', err.message);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPendingDevelopers();
      fetchGames();
    }
  }, [isAdmin]);

  const handleVerify = async (devId, devName) => {
    setActionLoading(devId);
    setToast(null);
    try {
      await authApi.verifyDeveloper(devId);
      setToast({
        type: 'success',
        message: `Partner application for "${devName}" has been approved successfully!`,
      });
      // Remove verified developer from pending list
      setPendingDevs((prev) => prev.filter((d) => d.id !== devId));
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateGameStatus = async (gameId, newStatus, isFeatured) => {
    setActionLoading(gameId);
    try {
      await gamesApi.adminUpdateStatus(gameId, { status: newStatus, is_featured: isFeatured });
      setToast({ type: 'success', message: `Game status updated to ${newStatus}!` });
      fetchGames();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="steam-admin-page">
        <div className="steam-admin-container">
          <div className="steam-admin-card" style={{ padding: '40px', textAlign: 'center' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '14px' }}>🔒</span>
            <h2 style={{ color: '#ff7675', marginBottom: '8px' }}>Access Denied</h2>
            <p style={{ color: '#8f98a0', fontSize: '13px' }}>
              You must have an <strong>Administrator</strong> account to view this command center.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="steam-admin-page">
      <div className="steam-admin-container">
        
        {/* Admin Header */}
        <div className="steam-admin-header">
          <div>
            <span className="steam-admin-badge">👑 Administrator Panel</span>
            <h1>Steamworks Command Center</h1>
            <p>Review partner applications, verify developer accounts, and manage platform permissions.</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`steam-refresh-btn ${activeTab === 'developers' ? 'active' : ''}`}
              onClick={() => setActiveTab('developers')}
              style={{
                backgroundColor: activeTab === 'developers' ? '#1a9fff' : '#111a24',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              Developers ({pendingDevs.length})
            </button>
            <button
              className={`steam-refresh-btn ${activeTab === 'games' ? 'active' : ''}`}
              onClick={() => setActiveTab('games')}
              style={{
                backgroundColor: activeTab === 'games' ? '#1a9fff' : '#111a24',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              Games Catalog ({games.length})
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {toast && (
          <div className={`steam-alert-toast toast-${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="steam-admin-stats">
          <div className="steam-stat-card">
            <div className="steam-stat-icon">⏳</div>
            <div className="steam-stat-info">
              <span>Pending Developers</span>
              <strong>{pendingDevs.length}</strong>
            </div>
          </div>

          <div className="steam-stat-card">
            <div className="steam-stat-icon">🎮</div>
            <div className="steam-stat-info">
              <span>Games in Catalog</span>
              <strong>{games.length}</strong>
            </div>
          </div>

          <div className="steam-stat-card">
            <div className="steam-stat-icon">🛡️</div>
            <div className="steam-stat-info">
              <span>Security Status</span>
              <strong style={{ color: '#a4d007' }}>ACTIVE</strong>
            </div>
          </div>
        </div>

        {/* Tab 1: Pending Developers */}
        {activeTab === 'developers' && (
          <div className="steam-admin-card">
            <div className="steam-admin-card-header">
              <h2>Pending Developer Applications ({pendingDevs.length})</h2>
              <button className="steam-refresh-btn" onClick={fetchPendingDevelopers} disabled={loading}>
                Refresh
              </button>
            </div>

            <div className="steam-table-wrap">
              {loading ? (
                <div className="steam-empty-table">
                  <span>🔄</span>
                  <p>Loading developer applications from database...</p>
                </div>
              ) : pendingDevs.length === 0 ? (
                <div className="steam-empty-table">
                  <span>✨</span>
                  <p>All developer applications have been reviewed. No pending requests!</p>
                </div>
              ) : (
                <table className="steam-admin-table">
                  <thead>
                    <tr>
                      <th>Developer Account</th>
                      <th>Email</th>
                      <th>Registered Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDevs.map((dev) => (
                      <tr key={dev.id}>
                        <td>
                          <div className="dev-user-cell">
                            <div className="dev-avatar">
                              {dev.username ? dev.username.charAt(0).toUpperCase() : 'D'}
                            </div>
                            <div className="dev-details">
                              <strong>{dev.username}</strong>
                              <span>ID: #{dev.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{dev.email}</td>
                        <td>{new Date(dev.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className="status-tag-pending">Pending Review</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="steam-btn-approve"
                            onClick={() => handleVerify(dev.id, dev.username)}
                            disabled={actionLoading === dev.id}
                          >
                            {actionLoading === dev.id ? 'Approving...' : '✓ Approve Partner'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Games Moderation */}
        {activeTab === 'games' && (
          <div className="steam-admin-card">
            <div className="steam-admin-card-header">
              <h2>Platform Games Moderation & Storefront Feature</h2>
              <button className="steam-refresh-btn" onClick={fetchGames}>
                Refresh
              </button>
            </div>

            <div className="steam-table-wrap">
              {games.length === 0 ? (
                <div className="steam-empty-table">
                  <span>🎮</span>
                  <p>No games in database yet. Developers can publish games from the Steamworks Studio.</p>
                </div>
              ) : (
                <table className="steam-admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Hero Featured</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((g) => (
                      <tr key={g.id}>
                        <td>
                          <strong>{g.title}</strong>
                          <div style={{ fontSize: '11px', color: '#8da4b8' }}>ID: #{g.id}</div>
                        </td>
                        <td>${g.price?.toFixed(2)}</td>
                        <td>
                          <span className={`status-tag-${g.status || 'pending'}`}>
                            {g.status ? g.status.toUpperCase() : 'PENDING'}
                          </span>
                        </td>
                        <td>
                          <span>{g.is_featured ? '⭐ Featured' : 'Normal'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="steam-btn-approve"
                            onClick={() => handleUpdateGameStatus(g.id, 'approved', !g.is_featured)}
                            style={{ marginRight: '6px' }}
                          >
                            {g.is_featured ? 'Unfeature' : '⭐ Feature'}
                          </button>
                          {g.status !== 'approved' && (
                            <button
                              className="steam-btn-approve"
                              onClick={() => handleUpdateGameStatus(g.id, 'approved', g.is_featured)}
                            >
                              ✓ Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

