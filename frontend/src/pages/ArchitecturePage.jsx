import React, { useState } from 'react';
import { ArrowDown, Server, Database, Brain, CheckCircle2, Filter, Globe, User, Layers, Network } from 'lucide-react';

const PIPELINE_STEPS = [
  {
    id: 'user',
    label: 'User',
    icon: <User size={24} />,
    color: '#2980B9',
    bg: '#D6EAF8',
    description: 'The practitioner, researcher, or student asks a question about Ayurveda IP or regulatory compliance in natural language.',
    tech: 'React Frontend · Jurisdiction selected (India / International / Both)',
  },
  {
    id: 'frontend',
    label: 'React Frontend',
    icon: <Layers size={24} />,
    color: '#0088A9',
    bg: '#E0F7FA',
    description: 'The React SPA captures the question, active jurisdiction toggle, and conversation ID. Sends a POST request to /api/chat with the payload.',
    tech: 'React 18 · Vite · Axios · lucide-react',
  },
  {
    id: 'fastapi',
    label: 'FastAPI',
    icon: <Server size={24} />,
    color: '#0F3057',
    bg: '#D6EAF8',
    description: 'FastAPI receives the request, validates the payload with Pydantic v2 models, and invokes the RAG pipeline. All errors are caught with a global exception handler.',
    tech: 'Python 3.11 · FastAPI · Uvicorn · Pydantic v2',
  },
  {
    id: 'router',
    label: 'Query Router',
    icon: <Network size={24} />,
    color: '#8E44AD',
    bg: '#F5EEF8',
    description: 'A deterministic keyword-based router classifies the query into a category: Patents, GI, ABS, TKDL, Copyright, Trademark, Biological Diversity, or General. Purely rule-based — no LLM needed for routing.',
    tech: 'Python rule-based router · No LLM routing · Deterministic categories',
  },
  {
    id: 'jurisdiction',
    label: 'Jurisdiction Filter',
    icon: <Filter size={24} />,
    color: '#E67E22',
    bg: '#FDEBD0',
    description: 'Strict physical jurisdiction isolation. India queries go ONLY to the india_documents ChromaDB collection. International queries go ONLY to international_documents. The two collections are never mixed unless jurisdiction=both is explicitly selected by the user.',
    tech: 'Physical ChromaDB collection separation · NOT metadata filtering · Zero cross-contamination risk',
  },
  {
    id: 'chromadb',
    label: 'ChromaDB Vector Search',
    icon: <Database size={24} />,
    color: '#27AE60',
    bg: '#E9F7EF',
    description: 'The question is encoded to a 384-dimensional embedding using sentence-transformers. This embedding is compared against stored document chunk embeddings using L2 distance. Top-K most similar chunks are retrieved.',
    tech: 'ChromaDB PersistentClient · sentence-transformers all-MiniLM-L6-v2 · L2 distance · Top-K=5',
  },
  {
    id: 'sources',
    label: 'Retrieved Sources & Confidence',
    icon: <CheckCircle2 size={24} />,
    color: '#27AE60',
    bg: '#E9F7EF',
    description: 'The retrieved chunks are scored for confidence (1 - L2 distance). If confidence falls below 0.35 (configurable), the system abstains rather than risking a hallucinated legal answer. Source citations are extracted deterministically from chunk metadata.',
    tech: 'Confidence = 1.0 − L2_distance · Abstention threshold: 0.35 · Configurable via .env',
  },
  {
    id: 'ollama',
    label: 'Ollama (LLM Generation)',
    icon: <Brain size={24} />,
    color: '#C0392B',
    bg: '#FDEDEC',
    description: 'Retrieved context is formatted with the user question and sent to Ollama. The system prompt strictly instructs the model to answer only from the provided context, never fabricate legal information, and always add a disclaimer. If Ollama is unavailable, the system gracefully abstains.',
    tech: 'Ollama · qwen3:1.7b (default) · Context-only system prompt · Graceful OllamaUnavailableError handling',
  },
  {
    id: 'validator',
    label: 'Citation Validator',
    icon: <CheckCircle2 size={24} />,
    color: '#0F3057',
    bg: '#D6EAF8',
    description: 'Source citations are assembled from ChromaDB chunk metadata — not from the LLM output. Only document IDs, titles, authorities, and URLs that actually exist in the retrieved chunks are included. Zero hallucinated citations possible.',
    tech: 'Citation extractor from ChromaDB metadata · Deterministic · LLM output not parsed for citations',
  },
  {
    id: 'answer',
    label: 'Final Answer',
    icon: <Globe size={24} />,
    color: '#0F3057',
    bg: '#D6EAF8',
    description: 'The final ChatResponse includes: the generated answer, retrieval confidence score, validated source citation cards (title, authority, jurisdiction, version, URL), abstention status, query category, processing time, and a mandatory disclaimer. All stored to SQLite audit trail.',
    tech: 'ChatResponse · SQLite audit log · Mandatory disclaimer · Conversation ID tracking',
  },
];

const KEY_DECISIONS = [
  { title: 'No LangChain, No Agents', desc: 'The pipeline is deterministic and fully auditable. No autonomous agent loops — every step is explicit, inspectable Python code.' },
  { title: 'Physical Collection Isolation', desc: 'India and International documents live in separate ChromaDB collections. Jurisdiction mixing is physically impossible unless jurisdiction=both is explicitly chosen.' },
  { title: 'Safe Abstention', desc: 'When retrieval confidence < 0.35, the system refuses to answer rather than hallucinating legal content. The LLM never "guesses" IP law.' },
  { title: 'Citation-Only Sources', desc: 'Only document metadata from retrieved chunks is returned as citations. The LLM cannot fabricate source titles, section numbers, or URLs.' },
  { title: 'Disclaimer Enforced', desc: 'Every response includes the mandatory disclaimer: "Information only — not legal advice." This is hardcoded, not LLM-generated.' },
];

const ArchitecturePage = () => {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Network size={28} color="var(--color-primary)" />
          System Architecture
        </h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
          IP-SAKTI Sahayak uses a deterministic, auditable Retrieval-Augmented Generation (RAG) pipeline.
          Click any step to see its design rationale and technology stack.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* Pipeline Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {PIPELINE_STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.85rem 1.25rem',
                  backgroundColor: activeStep === step.id ? step.bg : 'var(--color-surface)',
                  border: `2px solid ${activeStep === step.id ? step.color : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  boxShadow: activeStep === step.id ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                }}
              >
                <div style={{ color: step.color, flexShrink: 0 }}>{step.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, color: activeStep === step.id ? step.color : 'var(--color-primary)', fontSize: '0.9rem' }}>{step.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>{step.tech.split(' · ')[0]}</div>
                </div>
              </button>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 0' }}>
                  <div style={{ width: '2px', height: '12px', backgroundColor: 'var(--color-border)' }} />
                  <ArrowDown size={14} color="var(--color-text-muted)" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Detail Panel */}
        <div style={{ position: 'sticky', top: '90px' }}>
          {activeStep ? (() => {
            const step = PIPELINE_STEPS.find(s => s.id === activeStep);
            return (
              <div className="card" style={{ borderTop: `4px solid ${step.color}`, animation: 'slideIn 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: step.bg, borderRadius: 'var(--radius-md)', color: step.color }}>
                    {step.icon}
                  </div>
                  <h3 style={{ color: step.color, margin: 0 }}>{step.label}</h3>
                </div>
                <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem', color: 'var(--color-text)' }}>{step.description}</p>
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${step.color}` }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>Technology Stack</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {step.tech.split(' · ').map((t, i) => (
                      <span key={i} style={{ padding: '0.25rem 0.6rem', backgroundColor: 'white', border: `1px solid ${step.color}40`, borderRadius: '9999px', fontSize: '0.8rem', color: step.color, fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div>
              <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                <Network size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                <p style={{ margin: 0 }}>Click any pipeline step to see its design rationale and technology details.</p>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} color="var(--color-success)" /> Key Design Decisions
                </h4>
                {KEY_DECISIONS.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: i < KEY_DECISIONS.length - 1 ? '1rem' : 0, paddingBottom: i < KEY_DECISIONS.length - 1 ? '1rem' : 0, borderBottom: i < KEY_DECISIONS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <CheckCircle2 size={18} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    <div>
                      <strong style={{ color: 'var(--color-primary)', fontSize: '0.95rem' }}>{d.title}</strong>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 860px) {
          .arch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ArchitecturePage;
