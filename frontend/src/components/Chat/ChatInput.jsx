import React, { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import { Send, Headset, CheckCircle } from 'lucide-react';
import { createEscalation } from '../../services/api';

const ChatInput = ({ onSend, isLoading, jurisdiction, conversationId }) => {
  const [input, setInput] = useState('');
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationSubmitting, setEscalationSubmitting] = useState(false);
  const [escalationSuccess, setEscalationSuccess] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEscalationSubmit = async (e) => {
    e.preventDefault();
    if (!escalationReason.trim()) return;
    setEscalationSubmitting(true);
    try {
      await createEscalation({
        question: input.trim() || '(No question entered — manual escalation request)',
        jurisdiction: jurisdiction || 'india',
        reason: escalationReason.trim(),
        conversation_id: conversationId || null,
      });
      setEscalationSuccess(true);
      setEscalationReason('');
      setTimeout(() => {
        setShowEscalationModal(false);
        setEscalationSuccess(false);
      }, 2500);
    } catch (err) {
      console.error('Escalation failed:', err);
      alert('Failed to submit escalation. Please try again.');
    } finally {
      setEscalationSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!escalationSubmitting) {
      setShowEscalationModal(false);
      setEscalationSuccess(false);
      setEscalationReason('');
    }
  };

  return (
    <div style={{ padding: '0 0 1rem', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--color-surface)',
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
        width: '100%',
        maxWidth: '800px',
        minHeight: '60px'
      }}>
        <button
          className="btn btn-ghost"
          style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--color-text-muted)', flexShrink: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
          onClick={() => setShowEscalationModal(true)}
          title="Escalate for Expert Review"
          aria-label="Escalate for Expert Review"
        >
          <Headset size={20} />
        </button>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
          <textarea
            ref={textareaRef}
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask IP-SHAKTI a question..."
            disabled={isLoading}
            style={{
              resize: 'none',
              overflowY: 'auto',
              minHeight: '24px',
              border: 'none',
              boxShadow: 'none',
              padding: '0',
              paddingRight: '3rem',
              backgroundColor: 'transparent',
              fontSize: '1rem',
              outline: 'none',
              width: '100%'
            }}
            rows={1}
          />
          <div style={{ position: 'absolute', right: '0.5rem', bottom: '0', fontSize: '0.65rem', color: 'var(--color-text-muted)', opacity: 0.6, pointerEvents: 'none' }}>
            {input.length}/1000
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            height: '40px',
            width: '40px',
            padding: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: 'none',
            backgroundColor: (input.trim() && !isLoading) ? 'var(--color-primary)' : 'var(--color-border)',
            color: 'white',
            cursor: (input.trim() && !isLoading) ? 'pointer' : 'default',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? (
            <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Send size={18} style={{ marginLeft: '2px' }} />
          )}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', opacity: 0.8 }}>
        Press <kbd style={{ fontFamily: 'monospace' }}>Enter</kbd> to send · <kbd style={{ fontFamily: 'monospace' }}>Shift+Enter</kbd> for new line
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {/* Escalation Modal */}
      <Modal
        isOpen={showEscalationModal}
        onClose={handleCloseModal}
        title="Escalate for Expert Review"
      >
        {escalationSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-success)' }}>
            <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}>Escalation Recorded</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Your escalation request has been logged in the system. A qualified expert will review this matter.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEscalationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-warning-light)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-warning)', fontSize: '0.875rem', color: '#9C640C' }}>
              This system provides preliminary guidance only. For definitive legal advice, consult a qualified IP attorney or the Ministry of AYUSH. This escalation will be logged for expert review.
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Current Question / Context</label>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem', color: input.trim() ? 'var(--color-text)' : 'var(--color-text-muted)', fontStyle: input.trim() ? 'normal' : 'italic' }}>
                {input.trim() || 'No current question — describe your concern in the reason below'}
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Reason for Escalation <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows={4}
                value={escalationReason}
                onChange={e => setEscalationReason(e.target.value)}
                placeholder="Describe why you need expert review — e.g., 'Complex ABS compliance scenario involving a foreign entity and Indian biodiversity resources'"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={handleCloseModal} disabled={escalationSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!escalationReason.trim() || escalationSubmitting}>
                {escalationSubmitting ? 'Submitting...' : 'Submit Escalation Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ChatInput;
