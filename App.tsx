import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TopicPage from './pages/TopicPage';
import ExercisePage from './pages/ExercisePage';
import ChallengePage from './pages/ChallengePage';
import TutorialPage from './pages/TutorialPage';
import Header from './components/Header';
import StatusBar from './components/StatusBar';

// We need a wrapper component to use react-router hooks
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // This effect ensures that on any reload, the app starts at the homepage.
    // This is a specific requirement to override the default browser behavior
    // of landing on the last visited page (via URL hash).
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }
    // We only want this to run once on initial mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen font-sans text-brand-text flex flex-col">
      <Header />
      <main className="container mx-auto p-4 pb-20 flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/grade/:gradeId" element={<TopicPage />} />
          <Route path="/grade/:gradeId/topic/:topicId" element={<ExercisePage />} />
          <Route path="/grade/:gradeId/challenge/:topicId" element={<ChallengePage />} />
          <Route path="/tutorial/:operation" element={<TutorialPage />} />
        </Routes>
      </main>
      <StatusBar />
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
