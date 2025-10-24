import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TopicPage from './pages/TopicPage';
import ExercisePage from './pages/ExercisePage';
import ChallengePage from './pages/ChallengePage';
import TutorialPage from './pages/TutorialPage';
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import { useUiStore } from './store/uiStore';
import MedalAnimationOverlay from './components/MedalAnimationOverlay';

// We need a wrapper component to use react-router hooks
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTestMode, toggleTestMode, theme } = useUiStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');


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

  useEffect(() => {
    let sequence: string[] = [];
    const targetSequence = ['3', '1', '2', '7'];

    const keydownHandler = (e: KeyboardEvent) => {
      sequence.push(e.key);
      sequence = sequence.slice(-targetSequence.length);

      if (sequence.join('') === targetSequence.join('')) {
        toggleTestMode();
        const message = !isTestMode ? "Modo Prueba Activado" : "Modo Prueba Desactivado";
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        sequence = [];
      }
    };

    window.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, [toggleTestMode, isTestMode]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);


  return (
    <div className="min-h-screen font-sans text-brand-text dark:text-dark-text flex flex-col">
      <Header />
      <main className="w-full max-w-7xl mx-auto p-4 pb-20 flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/grade/:gradeId" element={<TopicPage />} />
          <Route path="/grade/:gradeId/topic/:topicId" element={<ExercisePage />} />
          <Route path="/grade/:gradeId/challenge/:topicId" element={<ChallengePage />} />
          <Route path="/tutorial/:operation/:gameMode?" element={<TutorialPage />} />
        </Routes>
      </main>
      <StatusBar />
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-90">
          {toastMessage}
        </div>
      )}
      <MedalAnimationOverlay />
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