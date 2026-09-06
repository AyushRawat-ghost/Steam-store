import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import './AdminPortal.css';

export default function AdminPortal() {
  const { user, isAdmin } = useAuth();
  const [pendingDevs, setPendingDevs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of developer being verified
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

  useEffect(() => {
    if (isAdmin) {
      fetchPendingDevelopers();
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
              <span>Pending Approvals</span>
              <strong>{pendingDevs.length}</strong>
            </div>
          </div>

          <div className="steam-stat-card">
            <div className="steam-stat-icon">🎮</div>
            <div className="steam-stat-info">
              <span>Platform Role</span>
              <strong style={{ color: '#ff7675' }}>{user?.role.toUpperCase()}</strong>
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

        {/* Pending Developer Applications Table */}
        <div className="steam-admin-card">
          <div className="steam-admin-card-header">
            <h2>Pending Developer Applications ({pendingDevs.length})</h2>
            <button className="steam-refresh-btn" onClick={fetchPendingDevelopers} disabled={loading}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
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

      </div>
    </div>
  );
}
