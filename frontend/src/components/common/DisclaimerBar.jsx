import React from 'react';

const DisclaimerBar = ({ message, type = 'warning' }) => {
  const isWarning = type === 'warning';
  
  return (
    <div style={{
      backgroundColor: isWarning ? '#fff3cd' : '#e2e3e5',
      color: isWarning ? '#856404' : '#383d41',
      padding: '0.75rem 1rem',
      borderRadius: '4px',
      borderLeft: `4px solid ${isWarning ? 'var(--color-warning)' : 'var(--color-text-muted)'}`,
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem'
    }}>
      <span style={{ fontSize: '1.25rem' }}>{isWarning ? '⚠️' : 'ℹ️'}</span>
      <span>{message}</span>
    </div>
  );
};

export default DisclaimerBar;
