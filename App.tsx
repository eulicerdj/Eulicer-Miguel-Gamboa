
import React, { useState, useEffect, useCallback } from 'react';
import { User, Page, Referral } from './types';
import PracticeView from './components/PracticeView';
import Home from './components/Home';
import Header from './components/Header';
import StudyCardsView from './components/StudyCardsView';
import QuizView from './components/QuizView';
import InterviewSimView from './components/InterviewSimView';
import Dashboard from './components/Dashboard';
import DonationPage from './components/DonationPage';
import { OFFICIAL_QUESTIONS } from './constants';

const Logo: React.FC = () => (
  <div className="flex items-center justify-center gap-3 my-6">
    <div className="relative text-3xl text-brand-blue">
      <i className="fa-solid fa-book-open"></i>
    </div>
    <h1 className="text-xl font-bold tracking-tight">
      <span className="text-brand-blue">Ciudadanía</span> <span className="text-brand-red">USA</span>
    </h1>
  </div>
);


const App: React.FC = () => {
  const mockUser: User = {
    id: 'guest-user',
    email: 'guest@example.com',
    referralCode: 'GUEST123',
    referredBy: null,
    adFreeUntil: null,
    points: 0,
    streak: 0,
    lastStudied: null,
    wildcards: 0,
  };

  const [user, setUser] = useState<User>(mockUser);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = useCallback(() => {
    console.log('Cierre de sesión activado');
    setUser(mockUser);
    setCurrentPage(Page.Home);
  }, []);
  
  const updateUser = useCallback((updatedData: Partial<User>) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedData,
    }));
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <Home setCurrentPage={setCurrentPage} />;
      case Page.Practice:
        return <PracticeView 
          questions={OFFICIAL_QUESTIONS} 
          user={user} 
          updateUser={updateUser} 
          setCurrentPage={setCurrentPage}
          theme={theme}
          toggleTheme={toggleTheme}
        />;
      case Page.StudyCards:
        return <StudyCardsView questions={OFFICIAL_QUESTIONS} />;
      case Page.Quiz:
        return <QuizView questions={OFFICIAL_QUESTIONS} user={user} updateUser={updateUser} />;
      case Page.Interview:
        return <InterviewSimView questions={OFFICIAL_QUESTIONS} user={user} updateUser={updateUser} />;
      case Page.Dashboard:
        return <Dashboard user={user} referrals={[]} onLogout={handleLogout} />;
      case Page.Donation:
        return <DonationPage setCurrentPage={setCurrentPage} />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  }
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24">
      <Header 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <main className="p-4 md:p-6 max-w-2xl mx-auto">
        <Logo />
        {renderPage()}
      </main>
      {currentPage === Page.Home && (
        <footer className="text-center p-4 mt-8 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-900">
          <p>Aviso: Esta aplicación no está afiliada con USCIS o DHS. Utiliza materiales oficiales disponibles públicamente para fines educativos.</p>
          <p className="mt-2">&copy; 2025 Preparación Ciudadanía. Todos los Derechos Reservados.</p>
        </footer>
      )}
    </div>
  );
};

export default App;