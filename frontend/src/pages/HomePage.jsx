import React, { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import JurisdictionToggle from '../components/Chat/JurisdictionToggle';
import DisclaimerBar from '../components/common/DisclaimerBar';
import MessageBubble from '../components/Chat/MessageBubble';
import ChatInput from '../components/Chat/ChatInput';
import { Info, Sparkles } from 'lucide-react';

const SUGGESTED_QUESTIONS = {
  india: [
    'Can a traditional Ayurvedic formulation be patented in India?',
    'What intellectual property options exist for an Ayurvedic product?',
    'What should I check before commercialising a biological resource?',
    'How does the TKDL protect Indian traditional knowledge from foreign patents?',
    'Can I register a GI tag for my Ayurvedic product?',
  ],
  international: [
    'What international IP mechanisms may be relevant for an Ayurvedic product?',
    'How can traditional knowledge be relevant to patent examination internationally?',
    'What are the ABS obligations under the Nagoya Protocol for biological resources?',
    'Does TRIPS protect traditional knowledge?',
  ],
  both: [
    'Can a traditional Ayurvedic formulation be patented under Indian and international law?',
    'What IP options exist for an Ayurvedic product globally?',
    'What are ABS obligations under both Indian and international frameworks?',
  ]
};

const HomePage = () => {
  const { messages, jurisdiction, isLoading, sendMessage, setJurisdiction, conversationId } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const suggestedQuestions = SUGGESTED_QUESTIONS[jurisdiction] || SUGGESTED_QUESTIONS.india;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '900px', margin: '0 auto', position: 'relative' }}>

      {/* Header Area */}
      {messages.length === 0 && (
        <div style={{ marginBottom: '1.5rem', marginTop: '10vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Sparkles size={24} color="var(--color-secondary)" />
              IP-SHAKTI Sahayak
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Ayurveda Regulatory AI Assistant
            </p>
          </div>
          <JurisdictionToggle jurisdiction={jurisdiction} onChange={setJurisdiction} />
        </div>
      )}

      {/* Chat Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 1rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100%', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
            <p style={{ maxWidth: '450px', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Ask questions about:
              <br />
              Patent protection · Traditional knowledge · Geographical indications · Biological resources · Ayurveda-related IP regulations
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', width: '100%', maxWidth: '600px' }}>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="btn btn-ghost"
                  style={{
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '9999px',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-bg)'}
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', animation: `bubble 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.875rem' }}>IP-SAKTI Sahayak is searching sources...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        jurisdiction={jurisdiction}
        conversationId={conversationId}
      />

      <style>{`
        @keyframes bubble {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
