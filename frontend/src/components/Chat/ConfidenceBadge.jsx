import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

/**
 * ConfidenceBadge — redesigned as a meter component.
 * Renders a small label + bar + percentage, not a plain pill.
 */
const ConfidenceBadge = ({ confidence }) => {
  const pct = Math.round(confidence * 100);

  let fillClass = 'confidence-meter__fill--low';
  let label     = 'Low';
  if (confidence >= 0.6)  { fillClass = 'confidence-meter__fill--high';   label = 'High'; }
  else if (confidence >= 0.35) { fillClass = 'confidence-meter__fill--medium'; label = 'Moderate'; }

  return (
    <div
      className="confidence-meter"
      title="Retrieval confidence indicates how closely the retrieved sources matched your query. It does not represent legal or factual certainty."
    >
      <Target size={12} color="var(--color-text-light)" />
      <span>Retrieval confidence</span>
      <div className="confidence-meter__bar">
        <div
          className={`confidence-meter__fill ${fillClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span style={{ fontWeight: 600, color: fillClass.includes('high') ? 'var(--color-success)' : fillClass.includes('medium') ? 'var(--color-warning)' : 'var(--color-error)' }}>
        {pct}% · {label}
      </span>
    </div>
  );
};

export default ConfidenceBadge;
