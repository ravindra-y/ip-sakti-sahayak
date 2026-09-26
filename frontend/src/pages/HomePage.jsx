import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import JurisdictionToggle from '../components/Chat/JurisdictionToggle';
import MessageBubble from '../components/Chat/MessageBubble';
import ChatInput from '../components/Chat/ChatInput';
import SourcesPanel from '../components/Chat/SourcesPanel';
import SourceDetailModal from '../components/Chat/SourceDetailModal';
import { BookMarked, RotateCcw } from 'lucide-react';

const SUGGESTED_QUESTIONS = {
  india: [
    'Can a traditional Ayurvedic formulation be patented in India?',
    'What intellectual property options exist for an Ayurvedic product?',
    'What should I check before commercialising a biological resource?',
    'How does the TKDL protect Indian traditional knowledge from foreign patents?',
    'Can I register a GI tag for my Ayurvedic product?',
  ],
  international: [
    'What international IP mechanisms apply to an Ayurvedic product?',
    'How can traditional knowledge be relevant to patent examination internationally?',
    'What are ABS obligations under the Nagoya Protocol?',
    'Does TRIPS protect traditional knowledge?',
  ],
  both: [
    'Can a traditional Ayurvedic formulation be patented under Indian and international law?',
    'What IP options exist for an Ayurvedic product globally?',
    'What are ABS obligations under both Indian and international frameworks?',
  ],
};

const HomePage = () => {
  const {
    messages,
    jurisdiction,
    isLoading,
    sendMessage,
    setJurisdiction,
    conversationId,
    clearConversation,
    // Sources panel
    activeMessageId,
    activeSources,
    focusMessage,
    // Modal
    selectedSource,
    selectedSourceIndex,
    openSourceDetail,
    closeSourceDetail,
    navigateSource,
  } = useChat();

  const messagesEndRef = useRef(null);
  const chatBodyRef    = useRef(null);

  // Mobile sources drawer state
  const [isMobileSourcesOpen, setIsMobileSourcesOpen] = useState(false);

  // References panel desktop collapse state (persisted in localStorage)
  const [isReferencesPanelCollapsed, setIsReferencesPanelCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('ip_sakti_references_collapsed');
      return saved !== null ? saved === 'true' : false;
    } catch {
      return false;
    }
  });

  const toggleReferencesCollapse = () => {
    setIsReferencesPanelCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('ip_sakti_references_collapsed', String(next));
      } catch (err) {
        console.warn('Could not save references panel collapse state', err);
      }
      return next;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-open mobile drawer when new sources arrive
  useEffect(() => {
    if (activeSources.length > 0 && window.innerWidth <= 768) {
      setIsMobileSourcesOpen(true);
    }
  }, [activeSources]);

  const suggestedQuestions = SUGGESTED_QUESTIONS[jurisdiction] || SUGGESTED_QUESTIONS.india;
  const hasMessages        = messages.length > 0;

  return (
    <>
      {/* ── Split workspace ──────────────────────────────────────────────── */}
      <div className="chat-workspace">

        {/* ── LEFT: Chat Panel ───────────────────────────────────────────── */}
        <section className="chat-panel" aria-label="Chat conversation">

          {/* Toolbar — shown once conversation starts */}
          {hasMessages && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 1.5rem',
              borderBottom: '1px solid var(--color-divider)',
              background: 'var(--color-surface)',
              flexShrink: 0,
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <JurisdictionToggle jurisdiction={jurisdiction} onChange={setJurisdiction} />
                {conversationId && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
                    Session: {conversationId.slice(0, 8)}…
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* Mobile sources toggle */}
                <button
                  className="btn btn-secondary btn-sm mobile-sources-toggle"
                  onClick={() => setIsMobileSourcesOpen(o => !o)}
                  style={{ display: 'none' }}
                  aria-label="Toggle references panel"
                >
                  <BookMarked size={13} />
                  Refs ({activeSources.length})
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={clearConversation}
                  title="Clear conversation"
                >
                  <RotateCcw size={13} />
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Messages scroll area */}
          <div
            ref={chatBodyRef}
            style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
          >
            {/* Landing / empty state */}
            {!hasMessages && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                gap: '2rem',
              }}>
                {/* Wordmark */}
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'var(--text-2xl)',
                    color: 'var(--color-primary)',
                    marginBottom: '0.5rem',
                  }}>
                    IP-SAKTI Sahayak
                  </h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
                    Ayurveda Intellectual Property &amp; Regulatory Research Assistant
                  </p>
                </div>

                {/* Jurisdiction selector */}
                <JurisdictionToggle jurisdiction={jurisdiction} onChange={setJurisdiction} />

                {/* Topic description */}
                <p style={{
                  maxWidth: 420,
                  textAlign: 'center',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.7,
                }}>
                  Research patent protection · traditional knowledge · geographical indications ·
                  ABS compliance · Ayurveda regulatory frameworks
                </p>

                {/* Suggested questions */}
                <div style={{
                  width: '100%',
                  maxWidth: 560,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-muted)',
                    marginBottom: '0.25rem',
                  }}>
                    Suggested queries
                  </div>
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      className="suggested-question"
                      onClick={() => sendMessage(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {hasMessages && (
              <div>
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isActive={msg.id === activeMessageId}
                    onClick={
                      msg.role === 'assistant'
                        ? () => focusMessage(msg)
                        : undefined
                    }
                  />
                ))}

                {/* Thinking indicator */}
                {isLoading && (
                  <div className="message-entry message-entry--assistant" style={{ opacity: 0.7 }}>
                    <div className="message-meta">
                      <span className="message-meta__role-system">IP-SAKTI Sahayak</span>
                      <span style={{ color: 'var(--color-text-light)' }}>Searching sources…</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', paddingTop: '0.25rem' }}>
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          style={{
                            width: 7, height: 7,
                            borderRadius: '50%',
                            background: 'var(--color-accent)',
                            animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            jurisdiction={jurisdiction}
            conversationId={conversationId}
          />
        </section>

        {/* ── RIGHT: Sources Panel ───────────────────────────────────────── */}
        <SourcesPanel
          sources={activeSources}
          activeSourceIndex={selectedSourceIndex}
          onSourceClick={openSourceDetail}
          isPanelOpen={isMobileSourcesOpen}
          onTogglePanel={() => setIsMobileSourcesOpen(false)}
          isCollapsed={isReferencesPanelCollapsed}
          onToggleCollapse={toggleReferencesCollapse}
        />
      </div>

      {/* ── Source Detail Modal ──────────────────────────────────────────── */}
      {selectedSource && (
        <SourceDetailModal
          source={selectedSource}
          sourceIndex={selectedSourceIndex}
          totalSources={activeSources.length}
          onClose={closeSourceDetail}
          onNavigate={navigateSource}
        />
      )}

      <style>{`
        @keyframes typing-dot {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @media (max-width: 768px) {
          .mobile-sources-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default HomePage;
