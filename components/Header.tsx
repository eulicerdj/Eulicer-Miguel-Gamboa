import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavCard: React.FC<{
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  icon: string;
  label: string;
  className?: string;
  ariaLabel?: string;
}> = ({ page, currentPage, setCurrentPage, icon, label, className = '', ariaLabel }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`
        flex flex-col items-center justify-center space-y-1 w-20 h-14 
        bg-white dark:bg-slate-900 
        rounded-xl shadow-md 
        transition-all duration-300 transform 
        hover:-translate-y-1 hover:shadow-lg
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-slate-950
        ${isActive 
          ? 'text-blue-600 dark:text-blue-400 ring-2 ring-blue-500 shadow-lg' 
          : 'text-slate-600 dark:text-slate-400'
        }
        ${className}
      `}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel || label}
    >
      <i className={`fa-solid ${icon} text-xl`}></i>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-10">
      <div className="max-w-2xl mx-auto px-2 py-2 flex justify-around items-center gap-2">
          <NavCard
            page={Page.Home}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon="fa-home"
            label="Inicio"
          />
          
          <NavCard
            page={Page.Donation}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon="fa-mug-hot"
            label="Apóyanos"
            className="!w-24 bg-emerald-50 dark:bg-emerald-900/50 !text-emerald-600 dark:!text-emerald-400 ring-1 ring-emerald-500/30 !shadow-lg"
            ariaLabel="Apóyanos con una donación"
          />

          <NavCard
            page={Page.Dashboard}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon="fa-chart-pie"
            label="Panel"
          />
      </div>
    </nav>
  );
};

export default Header;