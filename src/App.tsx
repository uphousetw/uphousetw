import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import SEO from './components/SEO';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Disclaimer from './pages/Disclaimer';
import { initGA, trackPageView } from './utils/analytics';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return (
    <Routes>
      <Route path="/admin/*" element={<Admin />} />
      <Route path="/" element={<Layout />}>
        <Route index element={
          <>
            <SEO title="首頁" description="專業建設團隊，提供透天、華廈、電梯大樓等多樣化住宅建設服務" />
            <Home />
          </>
        } />
        <Route path="about" element={
          <>
            <SEO title="關於我們" description="了解我們的公司理念、發展歷程與專業團隊" />
            <About />
          </>
        } />
        <Route path="projects" element={
          <>
            <SEO title="專案列表" description="瀏覽我們完成的各類建築專案，包含透天、華廈、電梯大樓等" />
            <Projects />
          </>
        } />
        <Route path="projects/:slug" element={
          <>
            <SEO title="專案詳情" />
            <ProjectDetail />
          </>
        } />
        <Route path="contact" element={
          <>
            <SEO title="聯絡我們" description="聯絡我們的專業團隊，開始您的建設項目" />
            <Contact />
          </>
        } />
        <Route path="privacy" element={
          <>
            <SEO title="隱私權政策" />
            <PrivacyPolicy />
          </>
        } />
        <Route path="disclaimer" element={
          <>
            <SEO title="免責聲明" />
            <Disclaimer />
          </>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;