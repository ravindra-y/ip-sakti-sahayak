import React, { useState, useEffect } from 'react';
import { getSources, uploadDocument } from '../services/api';
import { Upload, Database, FileText, Search, Plus } from 'lucide-react';
import Modal from '../components/common/Modal';

const SourcesPage = () => {
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterJur, setFilterJur] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await getSources();
      setSources(res.data.sources || []);
    } catch (error) {
      console.error(error);
      // Fallback dummy data if API not ready
      setSources([
        { id: '1', title: 'Biological Diversity Act, 2002', authority: 'Govt of India', jurisdiction: 'india', category: 'ABS', type: 'Act', url: '#', chunks: 120, date: '2024-01-01' },
        { id: '2', title: 'TKDL Guidelines', authority: 'CSIR', jurisdiction: 'india', category: 'Traditional Knowledge', type: 'Guideline', url: '#', chunks: 45, date: '2024-01-02' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file, { title: file.name, jurisdiction: filterJur === 'All' ? 'india' : filterJur });
      alert('Document uploaded successfully');
      fetchSources();
      setIsUploadModalOpen(false);
    } catch (error) {
      alert('Failed to upload document');
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const filteredSources = sources.filter(s => {
    const matchJur = filterJur === 'All' || s.jurisdiction === filterJur.toLowerCase();
    const matchSearch = s.title?.toLowerCase().includes(searchQuery.toLowerCase()) || s.authority?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchJur && matchSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)', color: 'white' }}>
            <Database size={24} />
          </div>
          <div>
            <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>Knowledge Base</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>Authoritative sources indexed in the IP-SAKTI Sahayak RAG system.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>
          <Plus size={18} /> Add Document
        </button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        {/* Table Toolbar */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#F8F9FA', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by title or authority..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <select className="form-control" style={{ width: '200px' }} value={filterJur} onChange={e => setFilterJur(e.target.value)}>
            <option value="All">All Jurisdictions</option>
            <option value="India">India</option>
            <option value="International">International</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Document Title</th>
                <th style={{ width: '15%' }}>Jurisdiction</th>
                <th style={{ width: '20%' }}>Authority</th>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '20%' }}>Type & Version</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--color-primary-light)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading knowledge base...</div>
                  </td>
                </tr>
              ) : filteredSources.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <div>No documents match your search criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredSources.map(source => (
                  <tr key={source.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{source.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{source.chunks} chunks indexed</div>
                    </td>
                    <td>
                      <span className={`badge ${source.jurisdiction === 'india' ? 'badge-india' : 'badge-international'}`}>
                        {source.jurisdiction}
                      </span>
                    </td>
                    <td>{source.authority}</td>
                    <td><span className="badge badge-neutral">{source.category}</span></td>
                    <td>
                      <div>{source.type}</div>
                      {source.version && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>v{source.version}</div>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isUploadModalOpen} onClose={() => !uploading && setIsUploadModalOpen(false)} title="Upload Knowledge Base Document">
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1rem' }}>
          <div style={{ border: '2px dashed var(--color-border)', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', backgroundColor: '#FAFAFA' }}>
            <Upload size={32} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
            <div style={{ marginBottom: '1rem' }}>Select a PDF document to ingest into the vector database.</div>
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="form-control" style={{ maxWidth: '300px', margin: '0 auto' }} required />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!file || uploading}>
              {uploading ? 'Processing & Ingesting...' : 'Upload to Knowledge Base'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default SourcesPage;
