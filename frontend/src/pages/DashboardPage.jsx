import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FileCheck2, Leaf, MessageSquare, Scale, Sprout } from 'lucide-react';

const tools = [
  { icon: FileCheck2, title: 'Product Assessment', text: 'Classify an Ayurvedic formulation and identify its preliminary pathway.', to: '/assess' },
  { icon: MessageSquare, title: 'AI Research Assistant', text: 'Ask source-cited questions across IP, traditional knowledge, ABS and regulation.', to: '/assistant' },
  { icon: BookOpen, title: 'Knowledge Base', text: 'Explore indexed acts, guidance and primary reference material.', to: '/sources' },
  { icon: Scale, title: 'ABS Review', text: 'Check preliminary access and benefit-sharing considerations.', to: '/abs-helper' },
];

export default function DashboardPage() {
  return <div className="dashboard-page botanical-canvas">
    <section className="dashboard-hero">
      <div className="hero-copy">
        <p className="eyebrow">Evidence-led Ayurveda IP &amp; regulatory guidance</p>
        <h1>Navigate Ayurveda IP &amp; Regulation <em>with Evidence.</em></h1>
        <p className="hero-lede">Get source-cited guidance across intellectual property, traditional knowledge, biodiversity and regulatory pathways.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to="/assess">Start Product Assessment <ArrowRight size={17} /></Link>
          <Link className="btn btn-secondary btn-lg" to="/assistant">Ask the AI Assistant</Link>
        </div>
        <div className="trust-row"><span>Source-cited</span><span>Evidence-grounded</span><span>Jurisdiction-aware</span></div>
      </div>
      <div className="hero-botanical" aria-hidden="true">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <div className="herb-vessel"><Sprout size={72} strokeWidth={1.2} /><span>AYURVEDA<br />RESEARCH</span></div>
        <Leaf className="floating-leaf leaf-one" size={72} strokeWidth={1} /><Leaf className="floating-leaf leaf-two" size={44} strokeWidth={1} />
      </div>
    </section>
    <section className="dashboard-tools" aria-labelledby="workspace-heading">
      <div className="section-intro"><p className="eyebrow">Research workspace</p><h2 id="workspace-heading">A clear path through complex requirements.</h2></div>
      <div className="tool-grid">{tools.map(({ icon: Icon, title, text, to }) => <Link className="tool-card" to={to} key={title}><span className="tool-icon"><Icon size={22} /></span><h3>{title}</h3><p>{text}</p><ArrowRight className="tool-arrow" size={18} /></Link>)}</div>
    </section>
  </div>;
}
