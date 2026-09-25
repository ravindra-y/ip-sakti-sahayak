import React from 'react';
import CitationCard from './CitationCard';
import ConfidenceBadge from './ConfidenceBadge';
import { User, ShieldCheck, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
      gap: '0.75rem'
    }}>
      {/* Avatar */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-secondary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {isUser ? <User size={20} /> : <ShieldCheck size={20} />}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%'
      }}>
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isUser ? 'var(--color-surface)' : 'transparent',
          color: 'var(--color-text)',
          border: isUser ? '1px solid var(--color-border)' : 'none',
          borderTopRightRadius: isUser ? '0' : 'var(--radius-md)',
          borderTopLeftRadius: !isUser ? '0' : 'var(--radius-md)',
          boxShadow: isUser ? 'var(--shadow-sm)' : 'none',
          width: '100%'
        }}>
          {message.abstained && (
            <div style={{ 
              backgroundColor: 'var(--color-warning-light)', 
              color: '#9C640C', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-sm)', 
              marginBottom: '1rem', 
              fontSize: '0.875rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start',
              border: '1px solid #F8C471'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div><strong>Notice:</strong> I cannot provide a definitive answer as it may require legal counsel or I do not have enough confidence based on the sources.</div>
            </div>
          )}
          
          <div style={{ marginBottom: '0.5rem', lineHeight: '1.6', overflowWrap: 'anywhere' }} className="markdown-body">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {!isUser && message.retrieval_confidence !== undefined && (
            <div style={{ marginTop: '1rem' }}>
              <ConfidenceBadge confidence={message.retrieval_confidence} />
            </div>
          )}

          {!isUser && message.sources && message.sources.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>Sources</div>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', width: '3rem', marginBottom: '0.5rem' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {message.sources.map((source, idx) => {
                   const title = source.title || source.document_id || 'Document';
                   const page = source.page_number ? ` · Page ${source.page_number}` : '';
                   return (
                     <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                       📄 {title}{page}
                     </div>
                   );
                })}
              </div>
            </div>
          )}

        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.4rem', padding: '0 0.5rem', opacity: 0.6 }}>
          {isUser ? 'You' : 'IP-SHAKTI Sahayak'}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
