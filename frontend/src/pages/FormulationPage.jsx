import React, { useState } from 'react';
import DisclaimerBar from '../components/common/DisclaimerBar';
import { classifyFormulation } from '../services/api';
import { Check, ChevronRight, ChevronLeft, FlaskConical, AlertTriangle, Book, Settings, Droplet } from 'lucide-react';

const FormulationPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    inClassicalText: false,
    methodInText: false,
    ingredientsModified: false,
    processModified: false,
    intendedUse: 'Medicine',
    notes: ''
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await classifyFormulation(formData);
      setResult(res.data);
      setStep(4);
    } catch (error) {
      console.error(error);
      setResult({
        classification: 'Error',
        explanation: 'Failed to classify formulation. Please try again.',
        nextQuestions: [],
        categories: []
      });
      setStep(4);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { title: 'Classical Base', icon: <Book size={18} /> },
    { title: 'Modifications', icon: <Settings size={18} /> },
    { title: 'Intended Use', icon: <Droplet size={18} /> },
    { title: 'Result', icon: <FlaskConical size={18} /> }
  ];

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <FlaskConical color="var(--color-primary)" />
          Formulation Classification
        </h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Determine regulatory pathways based on Ayurvedic classical texts and modifications.
        </p>
      </div>

      {/* Progress Wizard */}
      <div className="steps-container">
        <div className="steps-line"></div>
        {steps.map((s, idx) => {
          const stepNum = idx + 1;
          let stepClass = 'step';
          if (step > stepNum) stepClass += ' completed';
          else if (step === stepNum) stepClass += ' active';
          
          return (
            <div key={idx} className={stepClass}>
              <div className="step-number">
                {step > stepNum ? <Check size={16} /> : s.icon}
              </div>
              <div className="step-title">{s.title}</div>
            </div>
          );
        })}
      </div>

      <div style={{ backgroundColor: 'var(--color-bg)', padding: '2rem', borderRadius: 'var(--radius-md)', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
        
        {step === 1 && (
          <div style={{ flex: 1, animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>1. Classical Base</h3>
            <div className="form-group">
              <label className="form-check" style={{ backgroundColor: 'white', padding: '1rem', border: '1px solid var(--color-border)' }}>
                <input type="checkbox" checked={formData.inClassicalText} onChange={e => setFormData({...formData, inClassicalText: e.target.checked})} />
                <span style={{ fontSize: '1.05rem', fontWeight: 500 }}>Is the formulation described in an authoritative classical Ayurvedic text? (e.g., Charaka Samhita)</span>
              </label>
            </div>
            <div className="form-group">
              <label className="form-check" style={{ backgroundColor: 'white', padding: '1rem', border: '1px solid var(--color-border)' }}>
                <input type="checkbox" checked={formData.methodInText} onChange={e => setFormData({...formData, methodInText: e.target.checked})} />
                <span style={{ fontSize: '1.05rem', fontWeight: 500 }}>Is the exact method of preparation described in such a text?</span>
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ flex: 1, animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>2. Modifications</h3>
            <div className="form-group">
              <label className="form-check" style={{ backgroundColor: 'white', padding: '1rem', border: '1px solid var(--color-border)' }}>
                <input type="checkbox" checked={formData.ingredientsModified} onChange={e => setFormData({...formData, ingredientsModified: e.target.checked})} />
                <span style={{ fontSize: '1.05rem', fontWeight: 500 }}>Have the ingredients been modified from the classical description?</span>
              </label>
            </div>
            <div className="form-group">
              <label className="form-check" style={{ backgroundColor: 'white', padding: '1rem', border: '1px solid var(--color-border)' }}>
                <input type="checkbox" checked={formData.processModified} onChange={e => setFormData({...formData, processModified: e.target.checked})} />
                <span style={{ fontSize: '1.05rem', fontWeight: 500 }}>Has the preparation process been modernized or modified?</span>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ flex: 1, animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>3. Intended Use</h3>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Primary Application</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {['Medicine', 'Food', 'Nutraceutical', 'Cosmetic', 'Other'].map(use => (
                  <label key={use} className="form-check" style={{ 
                    backgroundColor: formData.intendedUse === use ? 'var(--color-international-light)' : 'white', 
                    border: `1px solid ${formData.intendedUse === use ? 'var(--color-international)' : 'var(--color-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                  }}>
                    <input 
                      type="radio" 
                      name="intendedUse" 
                      value={use} 
                      checked={formData.intendedUse === use}
                      onChange={e => setFormData({...formData, intendedUse: e.target.value})} 
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontWeight: formData.intendedUse === use ? 600 : 500, color: formData.intendedUse === use ? 'var(--color-primary)' : 'var(--color-text)' }}>{use}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Additional notes (optional)</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Any special claims, specific extracts used, etc."
              />
            </div>
          </div>
        )}

        {step === 4 && result && (
          <div style={{ flex: 1, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', padding: '1rem 2rem', backgroundColor: 'var(--color-success-light)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-lg)', color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>
                {result.classification}
              </div>
              <p style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>{result.explanation}</p>
            </div>
            
            <div className="grid grid-cols-2">
              {result.categories && result.categories.length > 0 && (
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Book size={16} /> Regulatory Categories</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    {result.categories.map((cat, idx) => (
                      <span key={idx} className="badge badge-neutral">{cat}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.nextQuestions && result.nextQuestions.length > 0 && (
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16} /> Next Steps</h4>
                  <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                    {result.nextQuestions.map((q, idx) => <li key={idx} style={{ marginBottom: '0.5rem' }}>{q}</li>)}
                  </ul>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <DisclaimerBar message="This classification is preliminary and based on simplified logic. Consult regulatory authorities for formal classification." type="warning" />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '2rem' }}>
          {step > 1 && step < 4 && (
            <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft size={18} /> Back
            </button>
          )}
          {step === 1 && <div></div> /* Spacer */}
          
          {step < 3 && (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              Next <ChevronRight size={18} />
            </button>
          )}
          
          {step === 3 && (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Classify Formulation'}
            </button>
          )}
          
          {step === 4 && (
            <button className="btn btn-outline" onClick={() => { setStep(1); setResult(null); }}>
              Start Over
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FormulationPage;
