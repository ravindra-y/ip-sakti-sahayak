import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import SourcesPage from './pages/SourcesPage';
import AboutPage from './pages/AboutPage';
import { ChatProvider } from './hooks/useChat';

function App() {
  return (
    <ChatProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Layout>
      </Router>
    </ChatProvider>
  );
}

export default App;
