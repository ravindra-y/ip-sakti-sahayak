import React, { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import { Send, Headset, CheckCircle, Mic, MicOff, Languages } from 'lucide-react';
import { createEscalation } from '../../services/api';

const ChatInput = ({ onSend, isLoading, jurisdiction, conversationId }) => {
  const [input, setInput] = useState('');
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationSubmitting, setEscalationSubmitting] = useState(false);
  const [escalationSuccess, setEscalationSuccess] = useState(false);
  
  // Voice feature states
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-IN'); // default English (India)
  const recognitionRef = useRef(null);
  
  const textareaRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API for voice support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim());
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Update language dynamically
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = voiceLang;
    }
  }, [voiceLang]);

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

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support the Web Speech API. Try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="chat-input-area">
      <div className="chat-input-wrapper" style={{ borderColor: isListening ? 'var(--color-accent)' : undefined, boxShadow: isListening ? '0 0 0 3px rgba(181, 98, 27, 0.15)' : undefined }}>
        
        {/* Actions Strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '0.4rem', borderRadius: '50%', color: 'var(--color-text-muted)', border: 'none', background: 'transparent' }}
            onClick={() => setShowEscalationModal(true)}
            title="Escalate for Expert Review"
            aria-label="Escalate for Expert Review"
          >
            <Headset size={18} />
          </button>
          
          <button
            className="btn btn-ghost"
            style={{ 
              padding: '0.4rem', 
              borderRadius: '50%', 
              color: isListening ? '#fff' : 'var(--color-text-muted)', 
              border: 'none', 
              background: isListening ? 'var(--color-accent)' : 'transparent',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}
            onClick={toggleListen}
            title={isListening ? "Stop Listening" : "Voice Input"}
            aria-label="Toggle Voice Input"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <textarea
            ref={textareaRef}
            className="chat-input-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask about IP acts, rules, traditional knowledge..."}
            disabled={isLoading}
            rows={1}
            style={{ paddingLeft: '8px' }}
          />
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', opacity: 0.7, pointerEvents: 'none', flexShrink: 0 }}>
            {input.length}/1000
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, justifyContent: 'flex-end', paddingBottom: '2px' }}>
          {/* Language Selector */}
          <select 
            value={voiceLang}
            onChange={e => setVoiceLang(e.target.value)}
            style={{
              fontSize: '0.65rem',
              padding: '2px 4px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              marginBottom: '2px',
              width: '100%'
            }}
            title="Voice Input Language"
          >
            <option value="en-IN">English</option>
            <option value="hi-IN">हिन्दी</option>
            <option value="mr-IN">मराठी</option>
            <option value="ta-IN">தமிழ்</option>
          </select>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{ borderRadius: 'var(--radius-sm)', minWidth: 72 }}
          >
            {isLoading ? (
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <><Send size={14} /> Submit</>
            )}
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', opacity: 0.8 }}>
        Press <kbd style={{ fontFamily: 'monospace' }}>Enter</kbd> to send · <kbd style={{ fontFamily: 'monospace' }}>Shift+Enter</kbd> for new line
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
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
