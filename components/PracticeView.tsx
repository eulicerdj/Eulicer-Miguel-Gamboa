import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Question, User, Page } from '../types';
import { speak, cancel } from '../services/ttsService';

interface PracticeViewProps {
  questions: Question[];
  user: User | null;
  updateUser: (data: Partial<User>) => void;
  setCurrentPage: (page: Page) => void;
  theme: string;
  toggleTheme: () => void;
}

const Confetti: React.FC<{ count: number }> = ({ count }) => {
  const particles = useMemo(() => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      animationDelay: `${Math.random() * 2}s`,
    }));
  }, [count]);

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-4 animate-fall"
          style={{
            backgroundColor: p.color,
            left: p.left,
            top: '-10%',
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex justify-center text-5xl text-yellow-400 drop-shadow-lg">
    {[...Array(3)].map((_, i) => (
      <i key={i} className={`fa-solid fa-star transition-all duration-300 ${i < rating ? 'scale-110 opacity-100' : 'opacity-30'}`} style={{transitionDelay: `${i*100}ms`}} />
    ))}
  </div>
);

const PracticeView: React.FC<PracticeViewProps> = ({ questions, user, updateUser, setCurrentPage, theme, toggleTheme }) => {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [show6520Only, setShow6520Only] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Cleanup function to stop speech when the component unmounts
    return () => cancel();
  }, []);
  
  const startPractice = useCallback(() => {
    cancel(); // Stop any active speech
    const questionsToShuffle = show6520Only ? questions.filter(q => q.is_6520) : questions;
    setShuffledQuestions([...questionsToShuffle].sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsFinished(false);
  }, [questions, show6520Only]);

  useEffect(() => {
    startPractice();
  }, [startPractice]);

  const currentQuestion = shuffledQuestions[currentIndex];

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    const correctAnswer = currentQuestion.answer_es[0];
    const distractors = currentQuestion.distractors_es || [];
    return [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
  }, [currentQuestion]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const isCorrect = currentQuestion.answer_es.includes(answer);
    if (isCorrect) {
      setScore(prev => prev + 1);
      updateUser({ points: (user?.points || 0) + 5 });
    }
  };

  const handleNext = () => {
    cancel(); // Stop any active speech
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };
  
  const getButtonClass = (option: string) => {
    const baseClass = 'w-full text-left p-4 rounded-lg shadow-md transition-all duration-300 disabled:cursor-not-allowed font-semibold text-base';
    if (!selectedAnswer) {
      return `${baseClass} bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 focus:ring-2 focus:ring-blue-500`;
    }
    const isCorrect = currentQuestion.answer_es.includes(option);
    const isSelected = selectedAnswer === option;
    if (isCorrect) return `${baseClass} bg-emerald-500 text-white ring-2 ring-emerald-300 animate-pulse`;
    if (isSelected && !isCorrect) return `${baseClass} bg-red-500 text-white ring-2 ring-red-300`;
    return `${baseClass} bg-slate-200 dark:bg-slate-800/50 text-slate-500 opacity-60`;
  };

  if (shuffledQuestions.length === 0) {
    return <div className="text-center p-6">Cargando preguntas...</div>;
  }

  if (isFinished) {
    const percentage = shuffledQuestions.length > 0 ? (score / shuffledQuestions.length) * 100 : 0;
    let stars = 0;
    if (percentage >= 90) stars = 3;
    else if (percentage >= 60) stars = 2;
    else if (score > 0) stars = 1;
    const confettiCount = Math.floor((percentage / 100) * 150);

    return (
      <>
        <style>{`@keyframes fall{0%{transform:translateY(-10vh) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}.animate-fall{animation-name:fall;animation-timing-function:linear;}`}</style>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 text-center w-full max-w-md m-4 transform transition-all scale-100 opacity-100">
            <Confetti count={confettiCount} />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">¡Práctica Completada!</h2>
            <div className="my-6">
              <StarRating rating={stars} />
            </div>
            <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">
              Tu puntuación: <span className="text-blue-500 font-bold text-2xl">{score}</span> de <span className="font-bold text-2xl">{shuffledQuestions.length}</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">Ganaste {score * 5} puntos.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button onClick={startPractice} className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Volver a Intentar</button>
              <button onClick={() => setCurrentPage(Page.Dashboard)} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Ir al Panel</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <style>{`@keyframes fall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}.animate-fall{animation-name:fall;animation-timing-function:linear;}`}</style>
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-bold">Modo Práctica</h2>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <label htmlFor="6520-toggle" className="text-sm font-medium text-slate-600 dark:text-slate-300">Solo 65/20</label>
                    <button id="6520-toggle" role="switch" aria-checked={show6520Only} onClick={() => setShow6520Only(!show6520Only)}
                        className={`${show6520Only ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
                        <span className={`${show6520Only ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </button>
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
                  title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
                >
                  <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
            </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg space-y-6">
            <div className="text-center">
                <p className="text-sm font-semibold text-slate-500">{currentIndex + 1} / {shuffledQuestions.length}</p>
                <div className="flex justify-center items-center gap-4 mt-2">
                    <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">{currentQuestion.question_es}</p>
                    <button 
                        onClick={() => speak(currentQuestion.question_es, 'es-ES', setIsSpeaking)}
                        className={`text-2xl transition-colors ${isSpeaking ? 'text-blue-500 animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                        aria-label="Leer la pregunta en voz alta"
                    >
                        <i className="fa-solid fa-volume-high"></i>
                    </button>
                </div>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">({currentQuestion.question_en})</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option, index) => (
                    <button key={index} onClick={() => handleAnswerSelect(option)} disabled={!!selectedAnswer} className={getButtonClass(option)} aria-pressed={selectedAnswer === option}>
                        {option}
                    </button>
                ))}
            </div>

            {selectedAnswer && (
                 <div className={`mt-4 p-4 rounded-lg text-left ${currentQuestion.answer_es.includes(selectedAnswer) ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200' : 'bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200'}`}>
                    {!currentQuestion.answer_es.includes(selectedAnswer) && (
                        <div>
                            <p className="font-bold">Incorrecto.</p>
                            <p className="mt-2">La respuesta correcta es: <span className="font-semibold">"{currentQuestion.answer_es[0]}"</span>.</p>
                            <div className="mt-3 pt-2 border-t border-red-200 dark:border-red-700/50">
                                <p className="text-sm"><strong className="text-base font-semibold">Argumento:</strong> {currentQuestion.explanation_es}</p>
                            </div>
                        </div>
                    )}
                    {currentQuestion.answer_es.includes(selectedAnswer) && <p className="font-medium text-center">¡Correcto!</p>}
                </div>
            )}
        </div>
      
        <div className="flex items-center justify-center">
            <button onClick={handleNext} disabled={!selectedAnswer}
                className="w-full md:w-1/2 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                <span>Siguiente</span>
                <i className="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    </div>
  );
};

export default PracticeView;