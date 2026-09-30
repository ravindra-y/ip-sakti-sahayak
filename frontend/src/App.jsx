import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import SourcesPage from './pages/SourcesPage';
import AboutPage from './pages/AboutPage';
import AdminDashboard from './pages/AdminDashboard';
import DashboardPage from './pages/DashboardPage';
import FormulationPage from './pages/FormulationPage';
import ABSHelperPage from './pages/ABSHelperPage';
import { ChatProvider } from './hooks/useChat';

function App() {
  return (
    <ChatProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/assistant" element={<HomePage />} />
            <Route path="/assess" element={<FormulationPage />} />
            <Route path="/abs-helper" element={<ABSHelperPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </ChatProvider>
  );
}

export default App;
