import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, MessageSquare, BookOpen, Info, Menu, X, AlertTriangle } from 'lucide-react';

/**
 * Layout — redesigned header.
 * - Document-authoritative visual language (navy, serif wordmark, no pill nav)
 * - Persistent legal disclaimer bar below the header
 * - Responsive: hamburger on mobile, inline nav on desktop
 */
const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/',        label: 'Research',      icon: <MessageSquare size={15} /> },
    { path: '/sources', label: 'Knowledge Base', icon: <BookOpen size={15} /> },
    { path: '/about',   label: 'About',         icon: <Info size={15} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--color-bg)', overflow: 'hidden' }}>

      {/* ── Application Header ──────────────────────────────────────────── */}
      <header className="app-header">

        {/* Logo / Wordmark */}
        <div className="app-header__logo">
          <div className="app-header__logo-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="app-header__wordmark">
            <span className="app-header__name">IP-SAKTI Sahayak</span>
            <span className="app-header__sub">Ayurveda Regulatory AI</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="app-header__nav desktop-nav" aria-label="Primary navigation">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="mobile-toggle btn-icon"
          onClick={() => setIsMobileMenuOpen(open => !open)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          style={{ color: 'white' }}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Nav dropdown */}
      {isMobileMenuOpen && (
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--color-primary-light)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            zIndex: 'var(--z-sticky)',
          }}
          aria-label="Mobile navigation"
        >
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              style={{
                borderRadius: 0,
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}

      {/* ── Legal Disclaimer Bar ─────────────────────────────────────────── */}
      <div className="legal-disclaimer-bar" role="note" aria-label="Legal disclaimer">
        <AlertTriangle size={12} style={{ flexShrink: 0 }} />
        <span>
          <strong>Information only — not legal advice.</strong>
          {' '}For definitive IP or regulatory guidance, consult a qualified attorney or the relevant authority.
        </span>
      </div>

      {/* ── Page Content ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav  { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav  { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
