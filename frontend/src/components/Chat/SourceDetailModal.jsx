import React, { useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, ExternalLink,
  FileText, Building2, Bookmark, Hash, Globe, MapPin, Quote
} from 'lucide-react';

/**
 * SourceDetailModal — popup showing full source content / citation detail.
 * Supports prev/next navigation between sources without closing.
 */
const SourceDetailModal = ({
  source,
  sourceIndex,
  totalSources,
  onClose,
  onNavigate,           // (direction: -1 | 1) => void
}) => {
  // ── Keyboard handling ────────────────────────────────────────────────────
  useEffect(() => {
    if (!source) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  onNavigate(-1);
      if (e.key === 'ArrowRight') onNavigate(1);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [source, onClose, onNavigate]);

  if (!source) return null;

  // ── Normalise field names from backend ───────────────────────────────────
  const title        = source.title || source.document_id || 'Untitled Document';
  const docType      = source.document_type || source.type || '';
  const authority    = source.authority || '';
  const jurisdiction = source.jurisdiction || '';
  const pageNumber   = source.page_number;
  const filename     = source.filename;
  const officialUrl  = source.official_url || source.url;
  const category     = source.category || '';
  const excerpt      = source.text || source.content || source.chunk || null;
  const relevance    = source.relevance_score ?? source.relevance;
  const version      = source.version || '';
  const pubDate      = source.publication_date || '';

  const hasPrev = sourceIndex > 0;
  const hasNext = sourceIndex < totalSources - 1;

  return (
    <div
      className="source-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Source detail: ${title}`}
    >
      <div
        className="source-modal"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Modal Header ──────────────────────────────────────────────── */}
        <div className="source-modal__header">
          <div className="source-modal__title-block">
            <div className="source-modal__label">
              <FileText size={11} style={{ display: 'inline', marginRight: 4 }} />
              Referenced Document
            </div>
            <div className="source-modal__title">{title}</div>
          </div>

          {/* Navigation + close */}
          <div className="source-modal__nav">
            {totalSources > 1 && (
              <>
                <button
                  className="btn-icon"
                  onClick={() => onNavigate(-1)}
                  disabled={!hasPrev}
                  aria-label="Previous source"
                  title="Previous (←)"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="source-modal__nav-counter">
                  {sourceIndex + 1} / {totalSources}
                </span>
                <button
                  className="btn-icon"
                  onClick={() => onNavigate(1)}
                  disabled={!hasNext}
                  aria-label="Next source"
                  title="Next (→)"
                >
                  <ChevronRight size={16} />
                </button>
                <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 0.25rem' }} />
              </>
            )}
            <button
              className="btn-icon"
              onClick={onClose}
              aria-label="Close source detail"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Modal Body ───────────────────────────────────────────────── */}
        <div className="source-modal__body">

          {/* Metadata row */}
          <div className="source-modal__meta-row">

            {/* Jurisdiction */}
            {jurisdiction && (
              <span className={`badge ${jurisdiction === 'india' ? 'badge-india' : 'badge-international'}`}>
                {jurisdiction === 'india'
                  ? <><MapPin size={10} style={{ marginRight: 3 }} />India</>
                  : <><Globe size={10} style={{ marginRight: 3 }} />International</>
                }
              </span>
            )}

            {/* Category */}
            {category && (
              <span className="badge badge-category">{category}</span>
            )}

            {/* Doc type */}
            {docType && (
              <div className="source-modal__meta-item">
                <Bookmark size={12} />
                <span>{docType}{version ? ` · ${version}` : ''}</span>
              </div>
            )}

            {/* Authority */}
            {authority && (
              <div className="source-modal__meta-item">
                <Building2 size={12} />
                <span>{authority}</span>
              </div>
            )}

            {/* Page */}
            {pageNumber && (
              <div className="source-modal__meta-item">
                <Hash size={12} />
                <span>Page {pageNumber}</span>
              </div>
            )}

            {/* Relevance */}
            {relevance !== undefined && (
              <span
                className={`badge ${
                  relevance >= 0.6
                    ? 'badge-success'
                    : relevance >= 0.35
                    ? 'badge-warning'
                    : 'badge-error'
                }`}
                style={{ marginLeft: 'auto' }}
                title="Cosine-similarity retrieval score"
              >
                {Math.round(relevance * 100)}% match
              </span>
            )}
          </div>

          {/* Excerpt / chunk text */}
          {excerpt ? (
            <div>
              <div className="source-modal__excerpt-label">
                <Quote size={12} />
                Retrieved Excerpt
              </div>
              <blockquote className="source-modal__excerpt">{excerpt}</blockquote>
            </div>
          ) : (
            <div style={{
              padding: 'var(--space-5)',
              background: 'var(--color-panel)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              textAlign: 'center',
              marginBottom: 'var(--space-5)',
            }}>
              <FileText size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>
                Full text excerpt is not available for this source.<br />
                Use the official document link below.
              </p>
            </div>
          )}

          {/* Filename */}
          {filename && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--color-panel)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-divider)',
            }}>
              <FileText size={12} style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: 'Consolas, Monaco, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {filename}
              </span>
              {pubDate && <span style={{ marginLeft: 'auto', flexShrink: 0 }}>{pubDate}</span>}
            </div>
          )}
        </div>

        {/* ── Modal Footer ─────────────────────────────────────────────── */}
        <div className="source-modal__footer">
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', lineHeight: 1.5 }}>
            Retrieval confidence scores indicate source relevance, not legal authority.
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
            {officialUrl && (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent btn-sm"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={13} />
                Official Document
              </a>
            )}
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceDetailModal;
