import React from 'react';
import { Target } from 'lucide-react';

const ConfidenceBadge = ({ confidence }) => {
  let color = 'var(--color-error)';
  let bgColor = 'var(--color-error-light)';
  let borderColor = '#F5B7B1';
  
  if (confidence >= 0.6) {
    color = 'var(--color-success)';
    bgColor = 'var(--color-success-light)';
    borderColor = '#82E0AA';
  } else if (confidence >= 0.35) {
    color = 'var(--color-warning)';
    bgColor = 'var(--color-warning-light)';
    borderColor = '#F8C471';
  }

  const percentage = Math.round(confidence * 100);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-surface)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      <Target size={14} color="var(--color-text-muted)" />
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Retrieval Confidence:</span>
      <span
        title="Indicates how closely the retrieved sources matched your query. Does not represent legal or factual certainty."
        style={{
          backgroundColor: bgColor,
          color: color,
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'help',
          border: `1px solid ${borderColor}`,
          letterSpacing: '0.02em'
        }}
      >
        {percentage}%
      </span>
    </div>
  );
};

export default ConfidenceBadge;
