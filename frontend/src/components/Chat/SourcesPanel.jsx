import React from 'react';
import { FileText, BookOpen, ChevronRight, ChevronLeft, BookMarked } from 'lucide-react';

/**
 * SourcesPanel — docked right-side reference panel.
 * Shows the list of sources for the currently active assistant message.
 * On desktop: supports expand / collapse to a thin vertical strip (~52px).
 * On mobile: becomes a bottom drawer (.is-open toggled by parent).
 */
const SourcesPanel = ({
  sources = [],
  activeSourceIndex = null,
  onSourceClick,
  isPanelOpen = true,          // mobile drawer open state
  onTogglePanel,               // mobile toggle handler
  isCollapsed = false,         // desktop collapse state
  onToggleCollapse,            // desktop collapse toggle handler
}) => {
  const hasSources = sources.length > 0;

  const handleToggle = (e) => {
    e?.stopPropagation();
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      if (onTogglePanel) onTogglePanel();
    } else {
      if (onToggleCollapse) onToggleCollapse();
    }
  };

  return (
    <aside
      className={`sources-panel ${isCollapsed ? 'is-collapsed' : ''} ${isPanelOpen ? 'is-open' : ''}`}
      aria-label="Reference sources panel"
    >
      {/* ── Collapsed Vertical Strip (Desktop) ── */}
      <div
        className="sources-panel-collapsed-strip"
        onClick={handleToggle}
        title="Expand references panel"
      >
        <button
          type="button"
          className="btn-icon"
          onClick={handleToggle}
          aria-label="Expand references panel"
          title="Expand references panel"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          className="sources-collapsed-icon-wrap"
          title={hasSources ? `${sources.length} reference${sources.length === 1 ? '' : 's'} available` : 'References'}
        >
          <BookMarked size={16} color="var(--color-primary)" />
          {hasSources && (
            <span
              className="sources-collapsed-badge"
              aria-label={`${sources.length} sources available`}
            >
              {sources.length}
            </span>
          )}
        </div>

        <span className="sources-collapsed-label">
          REFERENCES
        </span>
      </div>

      {/* ── Expanded Content (Full Panel) ── */}
      <div className="sources-panel-expanded">
        {/* Panel Header */}
        <div className="sources-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookMarked size={14} color="var(--color-primary)" />
            <span className="sources-panel-header__title">
              References
            </span>
            {hasSources && (
              <span
                className="badge badge-neutral"
                style={{ marginLeft: '0.25rem', fontSize: '0.62rem' }}
              >
                {sources.length}
              </span>
            )}
          </div>

          {/* Toggle / collapse chevron button */}
          <button
            type="button"
            className="btn-icon"
            onClick={handleToggle}
            aria-label="Collapse references panel"
            title="Collapse references panel"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Panel Body */}
        <div className="sources-panel-body">
          {!hasSources ? (
            <div className="sources-panel-empty">
              <BookOpen size={32} className="sources-panel-empty__icon" />
              <p className="sources-panel-empty__text">
                References for the active response will appear here.
                <br />
                Click an AI response to load its sources.
              </p>
            </div>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {sources.map((source, index) => {
                const isActive = activeSourceIndex === index;
                const docType = source.document_type || source.type || '';
                const jurisdiction = source.jurisdiction;
                const page = source.page_number;
                const title = source.title || source.document_id || 'Unknown Document';
                const relevance = source.relevance_score ?? source.relevance;
                const category = source.category;

                return (
                  <li key={index}>
                    <div
                      role="button"
                      tabIndex={0}
                      className={`source-item ${isActive ? 'source-item--active' : ''}`}
                      onClick={() => onSourceClick(source, index)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSourceClick(source, index)}
                      aria-pressed={isActive}
                      aria-label={`Open source: ${title}`}
                    >
                      {/* Number chip */}
                      <span className="source-item__number">{index + 1}</span>

                      <div className="source-item__body">
                        {/* Title */}
                        <div className="source-item__title">{title}</div>

                        {/* Meta row */}
                        <div className="source-item__meta">
                          {/* Category / type badge */}
                          {(category || docType) && (
                            <span className="badge badge-category">
                              {category || docType}
                            </span>
                          )}

                          {/* Jurisdiction badge */}
                          {jurisdiction && (
                            <span
                              className={`badge ${jurisdiction === 'india' ? 'badge-india' : 'badge-international'}`}
                            >
                              {jurisdiction === 'india' ? 'India' : 'Intl'}
                            </span>
                          )}

                          {/* Page */}
                          {page && (
                            <span className="source-item__page">
                              p.{page}
                            </span>
                          )}

                          {/* Relevance */}
                          {relevance !== undefined && (
                            <span className="source-item__page" style={{ marginLeft: 'auto' }}>
                              {Math.round(relevance * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <ChevronRight
                        size={14}
                        color="var(--color-text-light)"
                        style={{ flexShrink: 0, marginTop: 2, opacity: isActive ? 1 : 0.4 }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Footer note */}
        {hasSources && (
          <div style={{
            padding: '0.5rem 1.25rem',
            borderTop: '1px solid var(--color-divider)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-light)',
            background: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexShrink: 0,
          }}>
            <FileText size={11} />
            Click a reference to view the source excerpt
          </div>
        )}
      </div>
    </aside>
  );
};

export default SourcesPanel;
