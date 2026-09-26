import React from 'react';
import { AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ConfidenceBadge from './ConfidenceBadge';

/**
 * MessageBubble → now "MessageEntry".
 * Document-entry style — no rounded chat bubbles.
 * User messages: left-bordered navy block.
 * AI messages: left-bordered saffron block, clickable to focus sources.
 */
const MessageBubble = ({ message, isActive, onClick }) => {
  const isUser      = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Choose entry class
  let entryClass = 'message-entry ';
  if (isUser)      entryClass += 'message-entry--user';
  else if (message.isError) entryClass += 'message-entry--error';
  else             entryClass += `message-entry--assistant${isActive ? ' message-entry--active' : ''}`;

  const hasSources = isAssistant && message.sources && message.sources.length > 0;

  return (
    <div
      className={entryClass}
      onClick={isAssistant && onClick ? onClick : undefined}
      style={{ cursor: isAssistant && onClick ? 'pointer' : 'default' }}
      role={isAssistant ? 'button' : undefined}
      tabIndex={isAssistant ? 0 : undefined}
      onKeyDown={isAssistant && onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-pressed={isActive}
      aria-label={isAssistant ? 'Click to view sources for this response' : undefined}
    >
      {/* Role label */}
      <div className="message-meta">
        <span className={isUser ? 'message-meta__role-user' : 'message-meta__role-system'}>
          {isUser ? 'You' : 'IP-SAKTI Sahayak'}
        </span>
        {message.timestamp && (
          <span style={{ color: 'var(--color-text-light)', fontWeight: 400 }}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {/* Active indicator */}
        {isActive && !isUser && (
          <span className="badge badge-category" style={{ marginLeft: 'auto' }}>
            Viewing sources
          </span>
        )}
      </div>

      {/* Abstention notice */}
      {message.abstained && (
        <div className="status-alert status-alert--warning" style={{ marginBottom: 'var(--space-4)' }}>
          <AlertTriangle size={15} className="status-alert__icon" />
          <div className="status-alert__content">
            <span className="status-alert__title">Insufficient Retrieval Confidence</span>
            This response may not be based on authoritative sources. Please consult a qualified IP attorney
            or the relevant regulatory authority for definitive guidance.
          </div>
        </div>
      )}

      {/* Message content */}
      <div className="message-body markdown-body">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>

      {/* Footer: confidence + source count hint */}
      {isAssistant && !message.isError && (
        <div style={{
          marginTop: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}>
          {message.retrieval_confidence !== undefined && (
            <ConfidenceBadge confidence={message.retrieval_confidence} />
          )}
          {hasSources && (
            <span style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}>
              {/* Inline reference markers */}
              {message.sources.slice(0, 5).map((_, i) => (
                <span key={i} className="cite-ref">
                  {i + 1}
                </span>
              ))}
              {message.sources.length > 5 && (
                <span className="cite-ref" style={{ background: 'var(--color-text-muted)' }}>
                  +{message.sources.length - 5}
                </span>
              )}
              <span style={{ marginLeft: 2 }}>
                {message.sources.length} reference{message.sources.length !== 1 ? 's' : ''}
                {' · click to view'}
              </span>
            </span>
          )}
          {message.processing_time_ms && (
            <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
              {(message.processing_time_ms / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
