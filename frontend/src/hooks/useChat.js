import { useState, useCallback } from 'react';
import { sendChat } from '../services/api';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [jurisdiction, setJurisdiction] = useState('india');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  // ── Sources panel state ──────────────────────────────────────────────────
  /** ID of the message whose sources are shown in the right panel */
  const [activeMessageId, setActiveMessageId] = useState(null);
  /** Sources array for the currently active message */
  const [activeSources, setActiveSources] = useState([]);
  /** The single source the user clicked — opens SourceDetailModal */
  const [selectedSource, setSelectedSource] = useState(null);
  /** Index inside activeSources for modal prev/next navigation */
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (question) => {
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChat({ question, jurisdiction, conversation_id: conversationId });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.answer || response.data.content,
        sources: response.data.sources || [],
        retrieval_confidence: response.data.retrieval_confidence ?? 0,
        abstained: response.data.abstained || false,
        query_category: response.data.query_category || null,
        jurisdiction: response.data.jurisdiction || null,
        processing_time_ms: response.data.processing_time_ms || null,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-activate the new assistant message's sources in the panel
      if (assistantMessage.sources.length > 0) {
        setActiveMessageId(assistantMessage.id);
        setActiveSources(assistantMessage.sources);
      }

      if (response.data.conversation_id && !conversationId) {
        setConversationId(response.data.conversation_id);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request.',
        isError: true,
        sources: [],
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [jurisdiction, conversationId]);

  /** Call when user clicks a message row to focus its sources */
  const focusMessage = useCallback((message) => {
    if (!message || message.role !== 'assistant') return;
    setActiveMessageId(message.id);
    setActiveSources(message.sources || []);
    // Clear any open modal when switching messages
    setSelectedSource(null);
    setSelectedSourceIndex(null);
  }, []);

  /** Call when user clicks a source item in the panel */
  const openSourceDetail = useCallback((source, index) => {
    setSelectedSource(source);
    setSelectedSourceIndex(index);
  }, []);

  /** Modal prev / next navigation */
  const navigateSource = useCallback((direction) => {
    setSelectedSourceIndex(prev => {
      const next = prev + direction;
      if (next < 0 || next >= activeSources.length) return prev;
      setSelectedSource(activeSources[next]);
      return next;
    });
  }, [activeSources]);

  const closeSourceDetail = useCallback(() => {
    setSelectedSource(null);
    setSelectedSourceIndex(null);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setActiveMessageId(null);
    setActiveSources([]);
    setSelectedSource(null);
    setSelectedSourceIndex(null);
  }, []);

  return {
    // Chat
    messages,
    jurisdiction,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearConversation,
    setJurisdiction,
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
  };
};
