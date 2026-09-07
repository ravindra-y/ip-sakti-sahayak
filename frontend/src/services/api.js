import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : '';

const api = axios.create({
  baseURL: BASE_URL + '/api',
});

export const sendChat = (payload) => api.post('/chat', payload);
export const uploadDocument = (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));
  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const getDocuments = (params) => api.get('/documents', { params });
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const classifyFormulation = (data) => api.post('/formulation/classify', data);
export const checkABS = (data) => api.post('/abs/check', data);
export const getSources = (params) => api.get('/sources', { params });
export const createConversation = (data) => api.post('/conversations', data);
export const getConversations = () => api.get('/conversations');
// Health check is at root, not under /api
export const healthCheck = () => axios.get(BASE_URL + '/health');

export const createEscalation = (data) => api.post('/escalation/', data);
export const getEscalations = () => api.get('/escalation/');
export const getAuditLogs = (params) => api.get('/audit/', { params });

export default api;
