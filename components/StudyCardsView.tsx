
import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface StudyCardsViewProps {
  questions: Question[];
}

const StudyCardsView: React.FC<StudyCardsViewProps> = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [isShuffled, setIsShuffled] = useState(false);
  const [displayQuestions, setDisplayQuestions] = useState([...questions].sort((a, b) => a.id - b.id));


  useEffect(() => {
    const newQuestions = isShuffled ? [...questions].sort(() => Math.random() - 0.5) : [...questions].sort((a, b) => a.id - b.id);
    setDisplayQuestions(newQuestions);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSlideDirection('none');
  }, [isShuffled, questions]);

  const currentQuestion = displayQuestions[currentIndex];

  const handleNext = () => {
    if (currentIndex < displayQuestions.length - 1) {
      setSlideDirection('left');
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setSlideDirection('none');
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSlideDirection('right');
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1); // Corrected bug here
        setSlideDirection('none');
      }, 300);
    }
  };
  
  // Animation classes
  let cardAnimationClass = '';
  if (slideDirection === 'left') {
    cardAnimationClass = 'animate-slide-out-left';
  } else if (slideDirection === 'right') {
    cardAnimationClass = 'animate-slide-out-right';
  } else {
    cardAnimationClass = 'animate-slide-in';
  }

  if (!currentQuestion) {
    return <div className="text-center p-6">Cargando tarjetas...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] sm:h-[calc(100vh-180px)] w-full items-center justify-center animate-fade-in-up px-2">
      <style>{`
        .perspective { perspective: 1200px; }
        .card { transform-style: preserve-3d; transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1); }
        .card-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .card-back { transform: rotateY(180deg); }
        .is-flipped { transform: rotateY(180deg); }
        .writing-vertical { writing-mode: vertical-rl; text-orientation: mixed; }
        
        @keyframes slide-out-left {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes slide-out-right {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes slide-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-slide-out-left { animation: slide-out-left 0.3s forwards; }
        .animate-slide-out-right { animation: slide-out-right 0.3s forwards; }
        .animate-slide-in { animation: slide-in 0.3s forwards; }
      `}</style>
      
      <div className={`perspective w-full max-w-lg h-[22rem] ${cardAnimationClass}`}>
        <div className={`card relative w-full h-full ${isFlipped ? 'is-flipped' : ''}`}>
          {/* Card Front (Question) */}
          <div className="card-face absolute w-full h-full bg-brand-blue rounded-2xl shadow-2xl flex p-1 overflow-hidden">
            <div className="flex-grow flex flex-col p-5 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                  <i className="fa-solid fa-question text-sky-100"></i>
                </div>
                <h3 className="text-xl font-bold">Pregunta {currentQuestion.id}</h3>
              </div>
              <div className="flex-grow flex flex-col justify-center space-y-3">
                <p className="text-xl md:text-2xl font-semibold leading-tight text-blue-200">{currentQuestion.question_en}</p>
                <p className="text-lg md:text-xl font-medium leading-tight text-slate-100">{currentQuestion.question_es}</p>
              </div>
            </div>
            <div className="writing-vertical flex-shrink-0 w-10 flex items-center justify-center bg-blue-900/50">
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider transform rotate-180">{currentQuestion.category}</p>
            </div>
          </div>
          
          {/* Card Back (Answer) */}
          <div className="card-face card-back absolute w-full h-full bg-brand-red rounded-2xl shadow-2xl flex p-1 overflow-hidden">
             <div className="flex-grow flex flex-col p-5 text-white">
              <div className="flex items-center space-x-3 mb-4">
                 <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                  <i className="fa-solid fa-check text-red-100"></i>
                </div>
                <h3 className="text-xl font-bold">Respuesta {currentQuestion.id}</h3>
              </div>
              <div className="flex-grow flex flex-col justify-center space-y-3">
                <p className="text-2xl md:text-3xl font-bold leading-tight text-red-100">▪ {currentQuestion.answer_en[0]}</p>
                <p className="text-xl md:text-2xl font-semibold leading-tight text-red-200">▪ {currentQuestion.answer_es[0]}</p>
              </div>
            </div>
            <div className="writing-vertical flex-shrink-0 w-10 flex items-center justify-center bg-red-900/50">
                <p className="text-xs font-semibold text-red-200 uppercase tracking-wider transform rotate-180">Principios de la Democracia</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg mt-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <p className="text-center text-sm font-semibold text-slate-500">{currentIndex + 1} / {displayQuestions.length}</p>
          <button 
              onClick={() => setIsShuffled(!isShuffled)}
              className={`px-4 py-2 rounded-lg transition-colors text-lg ${isShuffled ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-slate-800'}`}
              aria-label="Barajar tarjetas"
              title={isShuffled ? 'Desactivar modo aleatorio' : 'Activar modo aleatorio'}
          >
              <i className="fa-solid fa-shuffle"></i>
          </button>
        </div>
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 || slideDirection !== 'none'}
            className="flex flex-col items-center justify-center space-y-1 w-24 h-20 bg-white dark:bg-slate-800 rounded-xl shadow-md font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-arrow-left text-xl"></i>
            <span className="text-xs">Anterior</span>
          </button>
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            disabled={slideDirection !== 'none'}
            className="flex flex-col items-center justify-center space-y-1 w-24 h-20 bg-blue-600 text-white rounded-xl shadow-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-rotate text-xl"></i>
            <span className="text-xs">Reverso</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === displayQuestions.length - 1 || slideDirection !== 'none'}
            className="flex flex-col items-center justify-center space-y-1 w-24 h-20 bg-white dark:bg-slate-800 rounded-xl shadow-md font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-arrow-right text-xl"></i>
            <span className="text-xs">Siguiente</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyCardsView;
