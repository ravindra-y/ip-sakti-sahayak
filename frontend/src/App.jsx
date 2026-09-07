import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DemoModeProvider } from './context/DemoModeContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import FormulationPage from './pages/FormulationPage';
import ABSHelperPage from './pages/ABSHelperPage';
import SourcesPage from './pages/SourcesPage';
import AboutPage from './pages/AboutPage';
import ArchitecturePage from './pages/ArchitecturePage';

function App() {
  return (
    <DemoModeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/formulation" element={<FormulationPage />} />
            <Route path="/abs-helper" element={<ABSHelperPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
          </Routes>
        </Layout>
      </Router>
    </DemoModeProvider>
  );
}

export default App;
