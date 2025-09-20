import React, { useState, useEffect, useMemo } from 'react';
import { Question, User, QuizMode } from '../types';
import { speak, cancel } from '../services/ttsService';

interface QuizViewProps {
  questions: Question[];
  user: User | null;
  updateUser: (data: Partial<User>) => void;
}

const AdSlot: React.FC = () => (
    <div className="mt-6 p-4 bg-slate-200 dark:bg-slate-800 rounded-lg text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">Anuncio Publicitario</p>
        <p className="text-xs text-slate-500">Publicidad ligera y no invasiva.</p>
    </div>
);

const QuizView: React.FC<QuizViewProps> = ({ questions, user, updateUser }) => {
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Cleanup function to stop speech when the component unmounts
    return () => cancel();
  }, []);

  const shuffleAndPick = (arr: Question[], num: number) => {
    return [...arr].sort(() => 0.5 - Math.random()).slice(0, num);
  };
  
  const startQuiz = (mode: QuizMode) => {
    cancel();
    const numQuestions = mode === QuizMode.Micro ? 5 : 20;
    setCurrentQuestions(shuffleAndPick(questions, numQuestions));
    setQuizMode(mode);
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setQuizFinished(false);
  };
  
  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    
    cancel();
    const currentQuestion = currentQuestions[currentIndex];
    const isCorrect = currentQuestion.answer_en.some(ans => ans.toLowerCase().includes(userAnswer.toLowerCase().trim()));

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback({ correct: true, message: "¡Correcto! +10 puntos" });
    } else {
      setFeedback({ correct: false, message: `La respuesta correcta es: ${currentQuestion.answer_en[0]}` });
    }

    setTimeout(() => {
      if (currentIndex < currentQuestions.length - 1) {
        setCurrentIndex(i => i + 1);
        setUserAnswer('');
        setFeedback(null);
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const finishQuiz = () => {
    const pointsEarned = score * 10;
    const isPass = quizMode === QuizMode.Full && score >= 12;

    updateUser({
        points: (user?.points || 0) + pointsEarned,
        streak: (user?.streak || 0) + 1, // simplified streak logic
        lastStudied: new Date().toISOString()
    });
    
    setQuizFinished(true);
  };
  
  const currentQuestion = currentQuestions[currentIndex];

  useEffect(() => {
    if (currentQuestion) {
        speak(currentQuestion.question_en, 'en-US', setIsSpeaking);
    }
  }, [currentQuestion]);


  if (!quizMode) {
    return (
      <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg animate-fade-in-up space-y-4">
        <h2 className="text-2xl font-bold">Elige un Examen</h2>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={() => startQuiz(QuizMode.Micro)} className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Micro Examen (5 Preguntas)
            </button>
            <button onClick={() => startQuiz(QuizMode.Full)} className="w-full md:w-auto bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                Examen Completo (20 Preguntas)
            </button>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    const passMessage = quizMode === QuizMode.Full ? (score >= 12 ? "¡Aprobaste!" : "Necesitas Más Práctica") : "¡Examen Terminado!";
    return (
      <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg animate-fade-in-up space-y-4">
        <h2 className="text-3xl font-bold text-blue-500">{passMessage}</h2>
        <p className="text-xl">Tu Puntuación: <span className="font-bold">{score} / {currentQuestions.length}</span></p>
        <p className="text-lg">Puntos Ganados: <span className="font-bold text-amber-500">{score * 10}</span></p>
        <button onClick={() => setQuizMode(null)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-4">
          Hacer Otro Examen
        </button>
        <AdSlot />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold capitalize">{quizMode} Examen</h2>
            <p className="font-semibold">{currentIndex + 1} / {currentQuestions.length}</p>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-6">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }}></div>
        </div>
        <div className="mb-4">
            <div className="flex justify-center items-center gap-4 min-h-[3rem]">
                <p className="text-center text-lg md:text-xl font-semibold">{currentQuestion.question_en}</p>
                {isSpeaking && (
                    <i className="fa-solid fa-volume-high text-2xl text-blue-500 animate-pulse" aria-hidden="true"></i>
                )}
            </div>
        </div>
        <form onSubmit={handleAnswerSubmit}>
            <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={!!feedback}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button type="submit" disabled={!!feedback} className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                Enviar
            </button>
        </form>
        {feedback && (
            <div className={`mt-4 p-4 rounded-lg text-center ${feedback.correct ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200' : 'bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200'}`}>
                {feedback.message}
            </div>
        )}
    </div>
  );
};

export default QuizView;