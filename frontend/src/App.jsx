import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthPage from './pages/auth/AuthPage';
import StorePage from './pages/store/StorePage';
import DeveloperStudio from './pages/developer/DeveloperStudio';
import AdminPortal from './pages/admin/AdminPortal';
import CommunityPage from './pages/community/CommunityPage';
import AboutPage from './pages/about/AboutPage';
import SupportPage from './pages/support/SupportPage';
import LibraryPage from './pages/library/LibraryPage';
import CartModal from './components/CartModal';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('store'); // 'store' | 'auth' | 'admin' | 'developer' | 'community' | 'about' | 'support' | 'library'
  const [isCartOpen, setIsCartOpen] = useState(false);

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
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="steam-main-content">
        {currentTab === 'admin' ? (
          <AdminPortal />
        ) : currentTab === 'developer' ? (
          <DeveloperStudio onNavigateStore={() => setCurrentTab('store')} />
        ) : currentTab === 'library' ? (
          <LibraryPage onNavigateStore={() => setCurrentTab('store')} />
        ) : currentTab === 'community' ? (
          <CommunityPage />
        ) : currentTab === 'about' ? (
          <AboutPage />
        ) : currentTab === 'support' ? (
          <SupportPage />
        ) : currentTab === 'auth' || (!isAuthenticated && currentTab === 'login') ? (
          <AuthPage onSuccess={() => setCurrentTab('store')} />
        ) : (
          <StorePage onOpenCart={() => setIsCartOpen(true)} />
        )}
      </main>

      <Footer />

      {/* Steam Shopping Cart & Checkout Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigateLibrary={() => setCurrentTab('library')}
      />
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
