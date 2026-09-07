import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, MessageSquare, FlaskConical, Scale, BookOpen, Info, Menu, X, Network, Monitor } from 'lucide-react';
import { useDemoMode } from '../../context/DemoModeContext';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  const navItems = [
    { path: '/', label: 'Chat', icon: <MessageSquare size={18} /> },
    { path: '/formulation', label: 'Formulation', icon: <FlaskConical size={18} /> },
    { path: '/abs-helper', label: 'ABS Helper', icon: <Scale size={18} /> },
    { path: '/sources', label: 'Knowledge Base', icon: <BookOpen size={18} /> },
    { path: '/architecture', label: 'Architecture', icon: <Network size={18} /> },
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

            {/* Demo Mode Toggle */}
            <button
              onClick={toggleDemoMode}
              title={isDemoMode ? 'Disable Demo Mode' : 'Enable Demo Mode for SIH Presentation'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: isDemoMode ? 'rgba(255,200,0,0.2)' : 'rgba(255,255,255,0.08)',
                border: isDemoMode ? '1px solid rgba(255,200,0,0.5)' : '1px solid rgba(255,255,255,0.2)',
                color: isDemoMode ? '#FFD700' : 'rgba(255,255,255,0.75)',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginLeft: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Monitor size={16} />
              {isDemoMode ? 'Demo ON' : 'Demo'}
            </button>
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
            <button
              onClick={toggleDemoMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: isDemoMode ? '#FFD700' : 'rgba(255,255,255,0.8)',
                background: 'none',
                border: 'none',
                padding: '1rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Monitor size={20} />
              Demo Mode: {isDemoMode ? 'ON' : 'OFF'}
            </button>
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
          {isDemoMode && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 200, 0, 0.08)',
              border: '1px solid rgba(255, 200, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: '#856C00',
              fontWeight: 500
            }}>
              <Monitor size={16} />
              <strong>Demo Mode Active</strong> — Technical execution metadata is visible on all AI responses. Disable via the Demo button in the navigation.
            </div>
          )}
          {children}
        </div>
      </main>

      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid var(--color-border)',
        padding: '2rem 0',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.875rem'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            <ShieldCheck size={18} />
            IP-SAKTI Sahayak — SIH 2024 Project
          </div>
          <p style={{ margin: 0, maxWidth: '600px' }}>
            A demonstration RAG system for Ayurveda Intellectual Property and regulatory guidance.
            <strong> Information provided is not legal advice.</strong>
          </p>
          <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>
            React · FastAPI · Ollama · ChromaDB · sentence-transformers
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
