import React from 'react';
import { Globe, MapPin } from 'lucide-react';

const JurisdictionToggle = ({ jurisdiction, onChange }) => {
  return (
    <div role="radiogroup" style={{ 
      display: 'inline-flex', 
      backgroundColor: 'var(--color-surface)', 
      borderRadius: '9999px', 
      padding: '4px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--color-border)'
    }}>
      <button
        role="radio"
        aria-checked={jurisdiction === 'india'}
        onClick={() => onChange('india')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1.25rem',
          border: 'none',
          borderRadius: '9999px',
          cursor: 'pointer',
          backgroundColor: jurisdiction === 'india' ? 'var(--color-primary)' : 'transparent',
          color: jurisdiction === 'india' ? 'white' : 'var(--color-text-muted)',
          fontWeight: jurisdiction === 'india' ? 600 : 500,
          transition: 'all 0.2s',
          fontSize: '0.875rem'
        }}
      >
        <MapPin size={16} /> India
      </button>
      <button
        role="radio"
        aria-checked={jurisdiction === 'international'}
        onClick={() => onChange('international')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1.25rem',
          border: 'none',
          borderRadius: '9999px',
          cursor: 'pointer',
          backgroundColor: jurisdiction === 'international' ? 'var(--color-international)' : 'transparent',
          color: jurisdiction === 'international' ? 'white' : 'var(--color-text-muted)',
          fontWeight: jurisdiction === 'international' ? 600 : 500,
          transition: 'all 0.2s',
          fontSize: '0.875rem'
        }}
      >
        <Globe size={16} /> International
      </button>
    </div>
  );
};

export default JurisdictionToggle;
