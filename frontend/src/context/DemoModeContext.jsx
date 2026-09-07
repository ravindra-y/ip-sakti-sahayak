import React, { createContext, useContext, useState } from 'react';

const DemoModeContext = createContext(null);

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return localStorage.getItem('ip_sakti_demo_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleDemoMode = () => {
    setIsDemoMode(prev => {
      const next = !prev;
      try { localStorage.setItem('ip_sakti_demo_mode', String(next)); } catch {}
      return next;
    });
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider');
  return ctx;
};

export default DemoModeContext;
