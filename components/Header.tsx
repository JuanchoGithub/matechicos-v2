import React from 'react';
import { Link, useMatch, useNavigate, useLocation } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { APP_TITLE } from '../constants';
import { ArrowLeftIcon } from './icons';
import ThemeToggleButton from './ThemeToggleButton';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const headerContent = useUiStore((state) => state.headerContent);

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const exerciseMatch = useMatch('/grade/:gradeId/topic/:topicId');
  const challengeMatch = useMatch('/grade/:gradeId/challenge/:topicId');
  const tutorialMatch = useMatch('/tutorial/:operation/:gameMode?');
  
  const gradeId = exerciseMatch?.params.gradeId || challengeMatch?.params.gradeId;

  const showLinkBackButton = !!gradeId;
  const showHistoryBackButton = !!tutorialMatch;

  return (
    <header className="bg-brand-primary dark:bg-dark-surface shadow-md sticky top-0 z-10">
      <div className="px-2 h-16 relative flex items-center justify-between">
        {/* Left element */}
        <div className="z-20 flex items-center gap-2">
          {showHistoryBackButton ? (
            <button
              onClick={() => navigate(-1)}
              className="text-white p-2 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center w-10 h-10"
              aria-label="Volver"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          ) : showLinkBackButton ? (
            <Link 
              to={`/grade/${gradeId}`} 
              className="text-white p-2 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center w-10 h-10"
              aria-label="Volver"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
          ) : null}

          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl" role="img" aria-label="Logo">🎓</span>
              {!headerContent && (
                <span className="text-xl md:text-2xl font-bold text-white tracking-wider">
                  MathKids
                </span>
              )}
            </Link>
            
            <Link 
              to="/parents" 
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all flex items-center gap-2 border border-white/40 shadow-sm group"
              aria-label="Sección para Padres"
            >
              <span className="text-xl group-hover:scale-110 transition-transform" role="img" aria-label="Padres">👨‍👩‍👧‍👦</span>
              <span className="font-bold text-sm text-white">PADRES</span>
            </Link>
          </div>
        </div>

        {/* Center: Contextual Content (e.g., Exercise Title) */}
        {headerContent && (
          <div className="absolute inset-0 flex items-center justify-center text-center mx-auto px-16 pointer-events-none z-10">
            {headerContent}
          </div>
        )}

        {/* Right element */}
        <div className="z-20 flex items-center gap-2">
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
};

export default Header;