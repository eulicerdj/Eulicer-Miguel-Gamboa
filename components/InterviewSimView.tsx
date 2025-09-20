import React, { useState, useEffect } from 'react';
import { Question, User } from '../types';
import { evaluateAnswer } from '../services/geminiService';
import { speak, cancel } from '../services/ttsService';

interface InterviewSimViewProps {
  questions: Question[];
  user: User | null;
  updateUser: (data: Partial<User>) => void;
}

const InterviewSimView: React.FC<InterviewSimViewProps> = ({ questions, user, updateUser }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Cleanup function to stop speech when the component unmounts
    return () => cancel();
  }, []);
  
  const currentQuestion = questions[currentIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isLoading) return;

    cancel();
    setIsLoading(true);
    setFeedback(null);
    const aiFeedback = await evaluateAnswer(currentQuestion, userAnswer);
    setFeedback(aiFeedback);
    setIsLoading(false);

    // Give points for trying
    updateUser({ points: (user?.points || 0) + 5 });
  };
  
  const handleNextQuestion = () => {
    cancel();
    setCurrentIndex(prev => (prev + 1) % questions.length);
    setUserAnswer('');
    setFeedback(null);
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg space-y-6 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-center">Simulador de Entrevista con IA</h2>
        
        <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">El entrevistador pregunta:</p>
            <div className="flex items-center gap-4 mt-2">
                <p className="flex-grow text-xl font-semibold">{currentQuestion.question_en}</p>
                <button 
                    onClick={() => speak(currentQuestion.question_en, 'en-US', setIsSpeaking)}
                    className={`text-2xl transition-colors ${isSpeaking ? 'text-blue-500 animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                    aria-label="Leer la pregunta en voz alta"
                >
                    <i className="fa-solid fa-volume-high"></i>
                </button>
            </div>
        </div>

        <form onSubmit={handleSubmit}>
            <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Escribe tu respuesta oral aquí..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Tu respuesta"
            />
            <button 
                type="submit" 
                disabled={isLoading}
                className="mt-4 w-full flex justify-center items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-wait"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Evaluando...
                    </>
                ) : 'Enviar Respuesta'}
            </button>
        </form>

        {feedback && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg animate-fade-in">
                <p className="font-semibold text-blue-800 dark:text-blue-200">Comentarios de la IA:</p>
                <p className="mt-1 text-slate-700 dark:text-slate-300">{feedback}</p>
            </div>
        )}

        <button 
            onClick={handleNextQuestion}
            className="w-full bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
        >
            Siguiente Pregunta
        </button>
    </div>
  );
};

export default InterviewSimView;