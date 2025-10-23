import React from 'react';
import { Link } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { APP_TITLE } from '../constants';

const Header: React.FC = () => {
  const headerContent = useUiStore((state) => state.headerContent);

  return (
    <header className="bg-brand-primary shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 h-16 relative flex items-center">
        {/* Left: Logo and App Title. Acts as Home link. */}
        <Link to="/" className="flex items-center gap-3 z-20">
          <span className="text-3xl" role="img" aria-label="Logo de MathKids">🎓</span>
          {!headerContent && (
            <span className="text-2xl md:text-3xl font-bold text-white tracking-wider hidden sm:block">
              {APP_TITLE}
            </span>
          )}
        </Link>

        {/* Center: Contextual Content (e.g., Exercise Title) */}
        {headerContent && (
          <div className="absolute inset-0 flex items-center justify-center text-center mx-auto px-16 pointer-events-none z-10">
            {headerContent}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
