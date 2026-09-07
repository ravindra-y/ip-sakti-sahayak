import { useState, useCallback } from 'react';
import { sendChat } from '../services/api';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [jurisdiction, setJurisdiction] = useState('india');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const sendMessage = useCallback(async (question) => {
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChat({
        question,
        jurisdiction,
        conversation_id: conversationId
      });
      
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
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
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
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [jurisdiction, conversationId]);


  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    jurisdiction,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearConversation,
    setJurisdiction
  };
};
