import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cartApi, walletApi } from '../services/api';
import './CartModal.css';

export default function CartModal({ isOpen, onClose, onNavigateLibrary }) {
  const { isAuthenticated, walletBalance, updateWalletBalance } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, savings: 0, total: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState(null);

  // Fetch Cart on open
  const loadCart = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.getCart();
      if (res && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.warn('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setOrderResult(null);
      setError(null);
      loadCart();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleRemove = async (gameId) => {
    try {
      const res = await cartApi.removeFromCart(gameId);
      if (res && res.data) {
        setCart(res.data);
      } else {
        loadCart();
      }
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleDeposit = async (amount) => {
    setDepositing(true);
    setError(null);
    try {
      const res = await walletApi.deposit(amount);
      if (res && res.data) {
        updateWalletBalance(res.data.balance);
      }
    } catch (err) {
      setError(err.message || 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.total > walletBalance) {
      setError(`Insufficient funds. Your wallet balance is $${walletBalance.toFixed(2)}, but total is $${cart.total.toFixed(2)}.`);
      return;
    }
    setPurchasing(true);
    setError(null);
    try {
      const res = await cartApi.checkout();
      if (res && res.data) {
        setOrderResult(res.data);
        updateWalletBalance(res.data.remaining_balance);
        setCart({ items: [], subtotal: 0, savings: 0, total: 0, count: 0 });
      }
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setPurchasing(false);
    }
  };

  const formatPrice = (price) => `$${Number(price || 0).toFixed(2)} USD`;

  return (
    <div className="steam-cart-overlay" onClick={onClose}>
      <div className="steam-cart-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="steam-cart-header">
          <div className="header-title-box">
            <span className="cart-badge-icon">🛒</span>
            <h2>YOUR STEAM SHOPPING CART</h2>
          </div>
          <button className="cart-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="cart-alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── SUCCESSFUL RECEIPT VIEW ── */}
        {orderResult ? (
          <div className="cart-receipt-view">
            <div className="receipt-icon">🎉</div>
            <h3>Thank you for your purchase!</h3>
            <p className="receipt-order-num">
              Order Confirmation: <strong>{orderResult.order?.order_number}</strong>
            </p>
            <p className="receipt-desc">
              A digital receipt has been registered. The purchased game licenses have been added directly to your <strong>Steam Library</strong>.
            </p>

            <div className="receipt-balance-strip">
              <span>Remaining Wallet Balance:</span>
              <strong style={{ color: '#a4d007' }}>{formatPrice(orderResult.remaining_balance)}</strong>
            </div>

            <div className="receipt-actions">
              <button
                className="steam-btn-green"
                onClick={() => {
                  onClose();
                  if (onNavigateLibrary) onNavigateLibrary();
                }}
              >
                🎮 Go to My Library
              </button>
              <button className="steam-btn-secondary" onClick={onClose}>
                Continue Browsing Store
              </button>
            </div>
          </div>
        ) : (
          /* ── ACTIVE CART VIEW ── */
          <div className="cart-body-layout">
            
            {/* Left: Cart Items List */}
            <div className="cart-items-column">
              {loading ? (
                <div className="cart-loading-state">
                  <span>Loading cart items...</span>
                </div>
              ) : cart.items.length === 0 ? (
                <div className="cart-empty-state">
                  <span className="empty-cart-icon">🛒</span>
                  <h3>Your shopping cart is empty.</h3>
                  <p>Explore top sellers, specials, and recommendations on the Steam store to add games.</p>
                  <button className="steam-btn-secondary" onClick={onClose}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.items.map((it) => {
                    const g = it.game || {};
                    const hasDiscount = g.discount_percent > 0;
                    const finalPrice = hasDiscount
                      ? g.price * (1 - g.discount_percent / 100)
                      : g.price;

                    return (
                      <div key={it.id} className="cart-item-row">
                        <img
                          src={g.thumbnail_url || g.banner_url || '/steam-promo.jpg'}
                          alt={g.title}
                          className="cart-item-thumb"
                        />

                        <div className="cart-item-meta">
                          <strong className="cart-item-title">{g.title}</strong>
                          <div className="cart-item-tags">
                            <span className="os-icon">🪟 Windows</span>
                            {(g.genres || []).slice(0, 2).map((genre, idx) => (
                              <span key={idx} className="genre-pill">{genre}</span>
                            ))}
                          </div>
                        </div>

                        <div className="cart-item-pricing">
                          {hasDiscount && (
                            <span className="cart-discount-badge">-{g.discount_percent}%</span>
                          )}
                          <div className="price-stack">
                            {hasDiscount && (
                              <span className="cart-old-price">{formatPrice(g.price)}</span>
                            )}
                            <strong className="cart-final-price">{formatPrice(finalPrice)}</strong>
                          </div>
                        </div>

                        <button
                          className="cart-remove-link"
                          onClick={() => handleRemove(it.game_id)}
                          title="Remove item"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}

                  <div className="cart-clear-bar">
                    <button
                      className="cart-clear-btn"
                      onClick={async () => {
                        await cartApi.clearCart();
                        loadCart();
                      }}
                    >
                      Clear all items
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Checkout & Steam Wallet Panel */}
            {cart.items.length > 0 && (
              <div className="cart-summary-column">
                
                {/* Total Summary */}
                <div className="cart-summary-box">
                  <h3>ORDER SUMMARY</h3>
                  
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>

                  {cart.savings > 0 && (
                    <div className="summary-row discount-row">
                      <span>Discount Savings:</span>
                      <span>-{formatPrice(cart.savings)}</span>
                    </div>
                  )}

                  <div className="summary-divider"></div>

                  <div className="summary-row total-row">
                    <strong>Estimated Total:</strong>
                    <strong>{formatPrice(cart.total)}</strong>
                  </div>
                  <small className="tax-notice">Sales tax calculated at checkout where applicable.</small>

                  {/* Steam Wallet Status */}
                  <div className="cart-wallet-box">
                    <div className="wallet-status-row">
                      <span>Steam Wallet:</span>
                      <strong style={{ color: walletBalance >= cart.total ? '#a4d007' : '#ff7675' }}>
                        {formatPrice(walletBalance)}
                      </strong>
                    </div>

                    {walletBalance < cart.total && (
                      <div className="wallet-shortage-alert">
                        <span>Short by {formatPrice(cart.total - walletBalance)}</span>
                      </div>
                    )}

                    {/* Quick Deposit Buttons */}
                    <div className="wallet-quick-deposit">
                      <span className="deposit-label">Quick Top-Up:</span>
                      <div className="deposit-pills">
                        <button
                          disabled={depositing}
                          onClick={() => handleDeposit(25)}
                          className="deposit-pill"
                        >
                          +$25
                        </button>
                        <button
                          disabled={depositing}
                          onClick={() => handleDeposit(50)}
                          className="deposit-pill"
                        >
                          +$50
                        </button>
                        <button
                          disabled={depositing}
                          onClick={() => handleDeposit(100)}
                          className="deposit-pill"
                        >
                          +$100
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Action Button */}
                  <button
                    className="steam-purchase-btn"
                    disabled={purchasing || walletBalance < cart.total}
                    onClick={handleCheckout}
                  >
                    {purchasing
                      ? 'Processing Transaction...'
                      : walletBalance < cart.total
                      ? 'Top Up Wallet to Purchase'
                      : 'Purchase for myself'}
                  </button>

                  <div className="secure-checkout-notice">
                    <span>🔒</span>
                    <span>Encrypted Steam Transaction</span>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
