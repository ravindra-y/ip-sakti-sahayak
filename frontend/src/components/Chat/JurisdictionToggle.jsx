import React from 'react';
import { Globe, MapPin } from 'lucide-react';

/**
 * JurisdictionToggle — compact segmented control.
 * Matches the new document/regulatory visual language.
 */
const JurisdictionToggle = ({ jurisdiction, onChange }) => {
  const options = [
    { value: 'india',         label: 'India',         icon: <MapPin size={13} /> },
    { value: 'international', label: 'International', icon: <Globe size={13} /> },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Select jurisdiction"
      style={{
        display: 'inline-flex',
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '2px',
        gap: '2px',
      }}
    >
      {options.map(opt => {
        const isActive = jurisdiction === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              border: '1px solid transparent',
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-xs)',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '0.02em',
              // Active: navy bg with white text; inactive: ghost
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
              color: isActive ? '#fff' : 'var(--color-text-muted)',
              borderColor: isActive ? 'var(--color-primary)' : 'transparent',
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default JurisdictionToggle;
