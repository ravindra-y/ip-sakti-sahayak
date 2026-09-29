import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { X, Network } from 'lucide-react';

const GraphVisualizer = ({ data, onClose }) => {
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, []);

  // Simple palette
  const getColor = (type) => {
    switch (type) {
      case 'Query': return '#B5621B'; // Accent Saffron
      case 'Source': return '#0E6B8E'; // Link Teal
      case 'Concept': return '#1E7A4A'; // Success Green
      default: return '#0D2B45'; // Primary Navy
    }
  };

  return (
    <div className="source-modal-overlay" style={{ zIndex: 9999 }}>
      <div className="source-modal source-modal--split" style={{ width: '90vw', maxWidth: '1200px', height: '80vh', flexDirection: 'column' }}>
        <div className="source-modal__header" style={{ borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Network size={20} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-primary)' }}>Traditional Knowledge Graph</h3>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close Graph">
            <X size={20} />
          </button>
        </div>
        <div ref={containerRef} style={{ flex: 1, position: 'relative', background: '#fdfaf6' }}>
          {dimensions.width > 0 && (
            <ForceGraph2D
              width={dimensions.width}
              height={dimensions.height}
              graphData={data}
              nodeLabel="label"
              nodeColor={node => getColor(node.type)}
              nodeRelSize={8}
              linkColor={() => 'rgba(13, 43, 69, 0.2)'}
              linkDirectionalArrowLength={3.5}
              linkDirectionalArrowRelPos={1}
              onNodeClick={node => {
                // Focus camera on node (if 3D) or simply zoom (2D can't easily auto zoom without ref, so we just log or do a small effect)
                console.log("Clicked:", node);
              }}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.label;
                const fontSize = 12/globalScale;
                ctx.font = `${fontSize}px Inter, Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 

                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = getColor(node.type);
                ctx.fillText(label, node.x, node.y);

                node.__bckgDimensions = bckgDimensions; 
              }}
              nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color;
                const bckgDimensions = node.__bckgDimensions;
                bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
              }}
            />
          )}
          
          <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width: 12, height: 12, background: '#B5621B', borderRadius: '50%'}}></div> Query Context</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width: 12, height: 12, background: '#1E7A4A', borderRadius: '50%'}}></div> Key Concepts</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width: 12, height: 12, background: '#0E6B8E', borderRadius: '50%'}}></div> Prior Art / Legal Sources</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;
