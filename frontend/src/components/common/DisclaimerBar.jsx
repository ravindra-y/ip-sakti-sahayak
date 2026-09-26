import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

/**
 * DisclaimerBar — redesigned as a proper status-alert component.
 * Replaces the plain text disclaimer line with a structured alert.
 *
 * type: 'warning' | 'info' | 'error' | 'success'
 * variant: 'banner' (full-width, compact) | 'block' (padded card-style)
 */
const DisclaimerBar = ({
  message,
  title,
  type = 'warning',
  variant = 'banner',
}) => {
  const Icon = type === 'info' ? Info : AlertTriangle;

  return (
    <div className={`status-alert status-alert--${type}`} style={variant === 'banner' ? { borderRadius: 0, border: 'none', borderBottom: '1px solid' } : {}}>
      <Icon size={15} className="status-alert__icon" />
      <div className="status-alert__content">
        {title && <span className="status-alert__title">{title}</span>}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default DisclaimerBar;
