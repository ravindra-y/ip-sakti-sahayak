import React, { useState, useRef, useEffect } from 'react';

import { Send, Mic, MicOff } from 'lucide-react';

const ChatInput = ({ onSend, isLoading, jurisdiction, conversationId }) => {
  const [input, setInput] = useState('');
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, justifyContent: 'flex-end' }}>
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

    </div>
  );
};

export default ChatInput;
