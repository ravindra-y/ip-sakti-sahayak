import React from 'react';
import { ExternalLink, FileText, Bookmark, Building2 } from 'lucide-react';

const CitationCard = ({ source }) => {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '0.85rem',
      backgroundColor: 'var(--color-surface)',
      fontSize: '0.875rem',
      width: '100%',
      maxWidth: '320px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', gap: '0.4rem', alignItems: 'flex-start', lineHeight: 1.3 }}>
          <FileText size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <span>{source.title || 'Unknown Document'}</span>
        </div>
        {source.jurisdiction && (
          <span className={`badge ${source.jurisdiction === 'india' ? 'badge-india' : 'badge-international'}`} style={{ flexShrink: 0 }}>
            {source.jurisdiction}
          </span>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        {source.authority && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Building2 size={14} />
            <span>{source.authority}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Bookmark size={14} />
            <span>{source.type} {source.version && `(v${source.version})`}</span>
          </div>
          {source.relevance !== undefined && (
            <span style={{ fontWeight: 500 }}>
              Relevance: {Math.round(source.relevance * 100)}%
            </span>
          )}
        </div>
      </div>

      {source.url && (
        <a 
          href={source.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            marginTop: '0.25rem', 
            fontSize: '0.8rem', 
            color: 'var(--color-primary-light)', 
            textDecoration: 'none',
            fontWeight: 500
          }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          View Official Document <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
};

export default CitationCard;
