import React from 'react';
import DisclaimerBar from '../components/common/DisclaimerBar';

const AboutPage = () => {
  const categories = [
    "Patents (Formulations & Processes)",
    "Traditional Knowledge (TKDL)",
    "Access and Benefit Sharing (ABS)",
    "Geographical Indications (GI)",
    "Trademarks",
    "Copyrights",
    "Trade Secrets",
    "Plant Varieties Protection",
    "Ayurveda Regulatory Framework",
    "International IP Treaties"
  ];

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>IP-SAKTI Sahayak</h2>
        <span className="badge" style={{ backgroundColor: 'var(--color-border)' }}>Version 1.0.0</span>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--color-primary)' }}>Mission</h3>
        <p>
          To empower practitioners, researchers, and enterprises in the Ayurveda and traditional medicine sectors with accessible, preliminary guidance on Intellectual Property rights and regulatory compliance.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--color-primary)' }}>How it Works</h3>
        <div style={{ display: 'flex', gap: '1rem', textAlign: 'center', marginTop: '1rem' }}>
          <div style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>1️⃣</div>
            <strong>Ask</strong>
            <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)' }}>Submit your query in English or regional languages.</p>
          </div>
          <div style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>2️⃣</div>
            <strong>Retrieve</strong>
            <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)' }}>System searches authoritative indexed documents via ChromaDB.</p>
          </div>
          <div style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>3️⃣</div>
            <strong>Answer</strong>
            <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)' }}>Ollama LLM synthesizes an answer with citations.</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--color-primary)' }}>Supported IP Categories</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {categories.map((cat, idx) => (
            <span key={idx} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '20px', fontSize: '0.875rem' }}>
              {cat}
            </span>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--color-error)' }}>Important Limitations</h3>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-muted)' }}>
          <li><strong>Not Legal Advice:</strong> Outputs are for informational purposes only.</li>
          <li><strong>Dependent on Ingestion:</strong> The system only knows what is in its knowledge base.</li>
          <li><strong>AI Limitations:</strong> Large Language Models can hallucinate or misinterpret legal text.</li>
          <li><strong>Confidence ≠ Certainty:</strong> A high retrieval confidence score means the text matched well, not that the legal conclusion is definitively correct.</li>
        </ul>
      </section>

      <DisclaimerBar message="For definitive legal advice, always consult a qualified IP attorney or official regulatory bodies." type="warning" />

    </div>
  );
};

export default AboutPage;
