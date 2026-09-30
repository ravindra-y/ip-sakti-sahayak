import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, MessageSquare, BookOpen, Menu, X, Activity, ClipboardCheck, Globe2 } from 'lucide-react';

/**
 * Layout — redesigned header.
 * - Document-authoritative visual language (navy, serif wordmark, no pill nav)
 * - Responsive: hamburger on mobile, inline nav on desktop
 */
const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/',        label: 'Home',      icon: <ShieldCheck size={15} /> },
    { path: '/assess', label: 'Assess Product', icon: <ClipboardCheck size={15} /> },
    { path: '/assistant', label: 'AI Assistant', icon: <MessageSquare size={15} /> },
    { path: '/sources', label: 'Knowledge Base', icon: <BookOpen size={15} /> },
    { path: '/admin',   label: 'Analytics',     icon: <Activity size={15} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>

      {/* ── Application Header ──────────────────────────────────────────── */}
      <header className="app-header">

        {/* Logo / Wordmark */}
        <div className="app-header__logo">
          <div className="app-header__logo-icon">
            <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
          </div>
          <div className="app-header__wordmark">
            <span className="app-header__name">IP-VEDA</span>
            <span className="app-header__sub">Ayurveda IP &amp; Regulatory Navigator</span>
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


      {/* ── Page Content ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
