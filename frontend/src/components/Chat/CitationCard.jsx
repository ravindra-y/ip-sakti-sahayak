import React from 'react';
import { ExternalLink, FileText, Bookmark, Building2, Hash } from 'lucide-react';

const CitationCard = ({ source }) => {
  // Backend sends: document_type, relevance_score, official_url, page_number, filename
  // Handle both old and new field names gracefully
  const docType = source.document_type || source.type || '';
  const relevanceScore = source.relevance_score ?? source.relevance;
  const officialUrl = source.official_url || source.url;
  const pageNumber = source.page_number;
  const filename = source.filename;

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '0.85rem',
      backgroundColor: 'var(--color-surface)',
      fontSize: '0.875rem',
      width: '100%',
      maxWidth: '340px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      {/* Title + Jurisdiction badge */}
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

      {/* Metadata rows */}
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
            <span>{docType}{source.version ? ` (${source.version})` : ''}</span>
          </div>
          {relevanceScore !== undefined && (
            <span style={{ fontWeight: 500 }}>
              {Math.round(relevanceScore * 100)}% match
            </span>
          )}
        </div>

        {/* Page and filename */}
        {(pageNumber || filename) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Hash size={14} />
            <span>
              {filename && <span title={filename}>{filename.length > 30 ? filename.slice(0, 28) + '…' : filename}</span>}
              {pageNumber && <span style={{ marginLeft: filename ? '0.25rem' : 0 }}>p.{pageNumber}</span>}
            </span>
          </div>
        )}
      </div>

      {/* External link */}
      {officialUrl && (
        <a
          href={officialUrl}
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
