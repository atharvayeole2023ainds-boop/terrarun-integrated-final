
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface ShellProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  headerRight?: React.ReactNode;
  transparentHeader?: boolean;
}

const Shell: React.FC<ShellProps> = ({ 
  children, 
  title, 
  showBack = false, 
  headerRight,
  transparentHeader = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Dynamic Header */}
      <header className={`sticky top-0 z-50 px-4 py-4 flex items-center justify-between border-b transition-colors ${
        transparentHeader ? 'bg-transparent border-transparent' : 'bg-background-dark/90 backdrop-blur-md border-white/5'
      }`}>
        <div className="flex items-center gap-3">
          {showBack && (
            <button 
              onClick={() => navigate(-1)}
              className="size-10 flex items-center justify-center rounded-full bg-white/5 active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
            </button>
          )}
          {title && (
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-tight tracking-tight uppercase tracking-widest">{title}</h1>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default Shell;
