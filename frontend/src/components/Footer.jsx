import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="steam-footer-wrapper">
      <div className="steam-footer-inner">
        <div className="steam-footer-divider"></div>

        <div className="steam-footer-top">
          <div className="steam-footer-logos">
            <div className="valve-logo">VALVE</div>
          </div>
          
          <div className="steam-footer-text">
            © 2026 Valve Corporation. All rights reserved. All trademarks are property of their respective owners in the US and other countries. VAT included in all prices where applicable.
          </div>
        </div>

        <div className="steam-footer-divider"></div>

        <ul className="steam-footer-links">
          <li><a href="#privacy">Privacy Policy</a></li>
          <li><span>|</span></li>
          <li><a href="#legal">Legal</a></li>
          <li><span>|</span></li>
          <li><a href="#subscriber">Steam Subscriber Agreement</a></li>
          <li><span>|</span></li>
          <li><a href="#refunds">Refunds</a></li>
          <li><span>|</span></li>
          <li><a href="#cookies">Cookies</a></li>
        </ul>
      </div>
    </footer>
  );
}
