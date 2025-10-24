import React from 'react';
import { Link, useMatch, useNavigate } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { APP_TITLE } from '../constants';
import { ArrowLeftIcon } from './icons';
import ThemeToggleButton from './ThemeToggleButton';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const headerContent = useUiStore((state) => state.headerContent);

  const exerciseMatch = useMatch('/grade/:gradeId/topic/:topicId');
  const challengeMatch = useMatch('/grade/:gradeId/challenge/:topicId');
  const tutorialMatch = useMatch('/tutorial/:operation/:gameMode?');
  
  const gradeId = exerciseMatch?.params.gradeId || challengeMatch?.params.gradeId;

  const showLinkBackButton = !!gradeId;
  const showHistoryBackButton = !!tutorialMatch;

  return (
    <header className="bg-brand-primary dark:bg-dark-surface shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 h-16 relative flex items-center justify-between">
        {/* Left element */}
        <div className="z-20">
          {showHistoryBackButton ? (
            <button
              onClick={() => navigate(-1)}
              className="text-white p-2 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center w-12 h-12"
              aria-label="Volver"
            >
              <ArrowLeftIcon className="w-8 h-8" />
            </button>
          ) : showLinkBackButton ? (
            <Link 
              to={`/grade/${gradeId}`} 
              className="text-white p-2 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center w-12 h-12"
              aria-label="Volver"
            >
              <ArrowLeftIcon className="w-8 h-8" />
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-3">
              <span className="text-3xl" role="img" aria-label="Logo de MathKids">🎓</span>
              {!headerContent && (
                <span className="text-2xl md:text-3xl font-bold text-white tracking-wider hidden sm:block">
                  {APP_TITLE}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Center: Contextual Content (e.g., Exercise Title) */}
        {headerContent && (
          <div className="absolute inset-0 flex items-center justify-center text-center mx-auto px-16 pointer-events-none z-10">
            {headerContent}
          </div>
        )}

        {/* Right element */}
        <div className="z-20">
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
};

export default Header;