import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, MessageSquare, BookOpen, Info, Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Chat', icon: <MessageSquare size={18} /> },
    { path: '/sources', label: 'Knowledge Base', icon: <BookOpen size={18} /> },
    { path: '/about', label: 'About', icon: <Info size={18} /> }
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <header style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        boxShadow: 'var(--shadow-md)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <ShieldCheck size={24} color="var(--color-primary)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'white', letterSpacing: '0.02em' }}>IP-SAKTI Sahayak</h1>
              <div style={{ fontSize: '0.7rem', color: '#BDC3C7', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Ayurveda Regulatory AI</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav style={{ display: 'none', gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'white',
                  textDecoration: 'none',
                  opacity: isActive ? 1 : 0.75,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                })}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.5rem'
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-primary-light)',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }} className="mobile-nav">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={closeMobileMenu}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                })}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <style>{`
        @media (min-width: 992px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
          .mobile-nav { display: none !important; }
        }
      `}</style>

      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
