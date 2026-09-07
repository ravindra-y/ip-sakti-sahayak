import React from 'react';

const ConfidenceIndicator = ({ value }) => {
  let color = 'var(--color-error)';
  
  if (value >= 0.6) {
    color = 'var(--color-success)';
  } else if (value >= 0.35) {
    color = 'var(--color-warning)';
  }

  const percentage = Math.round(value * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, transition: 'width 0.3s ease' }} />
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', minWidth: '40px' }}>
        {percentage}%
      </span>
    </div>
  );
};

export default ConfidenceIndicator;
