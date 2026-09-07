import React, { useState } from 'react';
import DisclaimerBar from '../components/common/DisclaimerBar';
import { checkABS } from '../services/api';
import { Scale, AlertTriangle, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

const ABSHelperPage = () => {
  const [formData, setFormData] = useState({
    biologicalResource: false,
    origin: '',
    seekingIP: false,
    purpose: 'Research',
    orgType: 'Indian Company',
    context: ''
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await checkABS(formData);
      setResult(res.data);
    } catch (error) {
      console.error(error);
      setResult({
        complianceAreas: ['Error checking ABS compliance.'],
        questions: ['Please try again.'],
        sources: [],
        escalation: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0 0 0.5rem 0' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)', color: 'white' }}>
            <Scale size={24} />
          </div>
          ABS Compliance Helper
        </h2>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Access and Benefit Sharing questionnaire for biological resources and associated IP.
        </p>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
        <div className="card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>Questionnaire</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>Is a biological resource involved?</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label className="form-check" style={{ flex: 1, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', justifyContent: 'center' }}>
                  <input type="radio" checked={formData.biologicalResource} onChange={() => setFormData({...formData, biologicalResource: true})} style={{ display: 'none' }} />
                  <span style={{ fontWeight: formData.biologicalResource ? 600 : 500, color: formData.biologicalResource ? 'var(--color-primary)' : 'var(--color-text)' }}>Yes</span>
                </label>
                <label className="form-check" style={{ flex: 1, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', justifyContent: 'center' }}>
                  <input type="radio" checked={!formData.biologicalResource} onChange={() => setFormData({...formData, biologicalResource: false})} style={{ display: 'none' }} />
                  <span style={{ fontWeight: !formData.biologicalResource ? 600 : 500, color: !formData.biologicalResource ? 'var(--color-primary)' : 'var(--color-text)' }}>No</span>
                </label>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Origin of resource</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.origin}
                onChange={e => setFormData({...formData, origin: e.target.value})}
                placeholder="e.g., Kerala, India"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>Is intellectual property being sought?</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label className="form-check" style={{ flex: 1, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', justifyContent: 'center' }}>
                  <input type="radio" checked={formData.seekingIP} onChange={() => setFormData({...formData, seekingIP: true})} style={{ display: 'none' }} />
                  <span style={{ fontWeight: formData.seekingIP ? 600 : 500, color: formData.seekingIP ? 'var(--color-primary)' : 'var(--color-text)' }}>Yes</span>
                </label>
                <label className="form-check" style={{ flex: 1, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', justifyContent: 'center' }}>
                  <input type="radio" checked={!formData.seekingIP} onChange={() => setFormData({...formData, seekingIP: false})} style={{ display: 'none' }} />
                  <span style={{ fontWeight: !formData.seekingIP ? 600 : 500, color: !formData.seekingIP ? 'var(--color-primary)' : 'var(--color-text)' }}>No</span>
                </label>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Intended purpose</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Research', 'Commercial', 'Educational'].map(purp => (
                  <label key={purp} className="form-check" style={{ padding: '0.5rem 1rem', backgroundColor: formData.purpose === purp ? 'var(--color-primary-light)' : 'var(--color-bg)', color: formData.purpose === purp ? 'white' : 'var(--color-text)', borderRadius: '9999px' }}>
                    <input type="radio" name="purpose" value={purp} checked={formData.purpose === purp} onChange={e => setFormData({...formData, purpose: e.target.value})} style={{ display: 'none' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{purp}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Organization type</label>
              <select className="form-control" value={formData.orgType} onChange={e => setFormData({...formData, orgType: e.target.value})}>
                {['Individual', 'Indian Company', 'Foreign Entity', 'Research Institution', 'MSME'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Additional context (optional)</label>
              <textarea 
                className="form-control" 
                rows={2} 
                value={formData.context}
                onChange={e => setFormData({...formData, context: e.target.value})}
                placeholder="Specific species names or patents..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '0.5rem', width: '100%', padding: '0.85rem' }}>
              {isLoading ? 'Checking Framework...' : 'Check ABS Obligations'}
            </button>
          </form>
        </div>

        <div>
          {!result && !isLoading && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2rem', backgroundColor: 'transparent' }}>
              <Scale size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ textAlign: 'center' }}>Fill out the questionnaire to receive preliminary guidance on Access and Benefit Sharing obligations under the Biological Diversity Act.</p>
            </div>
          )}

          {isLoading && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2rem', backgroundColor: 'var(--color-surface)' }}>
              <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
              <p>Analyzing parameters...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="card" style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '4px solid var(--color-primary)' }}>
              
              {result.escalation && (
                <div style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-error)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Human Escalation Recommended</strong>
                    <span style={{ fontSize: '0.9rem' }}>Formal consultation with the National Biodiversity Authority (NBA) or legal counsel is highly recommended for these parameters.</span>
                  </div>
                </div>
              )}

              {result.complianceAreas && result.complianceAreas.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                    <CheckCircle2 size={18} /> Compliance Areas
                  </h4>
                  <ul style={{ paddingLeft: '0', listStyleType: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.complianceAreas.map((area, idx) => (
                      <li key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary-light)', fontSize: '0.9rem' }}>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.questions && result.questions.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)', marginBottom: '0.75rem' }}>
                    <AlertTriangle size={18} /> Require Verification
                  </h4>
                  <ul style={{ paddingLeft: '1.5rem', margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {result.questions.map((q, idx) => <li key={idx} style={{ marginBottom: '0.35rem' }}>{q}</li>)}
                  </ul>
                </div>
              )}

              {result.sources && result.sources.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                    <FileText size={18} /> Authoritative Sources
                  </h4>
                  <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem' }}>
                    {result.sources.map((src, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>
                        <a href={src.url || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                          {src.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <DisclaimerBar message="Do not rely on this output as definitive legal advice." type="warning" />
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .grid-cols-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ABSHelperPage;
