import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthPage from './pages/auth/AuthPage';
import Home from './pages/Home';
import AdminPortal from './pages/admin/AdminPortal';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('store'); // 'store' | 'auth' | 'admin' | 'community' | 'about' | 'support'

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10141d',
        color: '#66c0f4',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>STEAM</div>
          <div style={{ color: '#8f98a0', fontSize: '13px' }}>Loading account session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="steam-app-layout">
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />

      <main className="steam-main-content">
        {currentTab === 'admin' ? (
          <AdminPortal />
        ) : currentTab === 'auth' || (!isAuthenticated && currentTab === 'login') ? (
          <AuthPage onSuccess={() => setCurrentTab('store')} />
        ) : (
          <Home onNavigateAuth={() => setCurrentTab('auth')} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
