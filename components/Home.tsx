
import React from 'react';
import { Page } from '../types';

interface HomeProps {
  setCurrentPage: (page: Page) => void;
}

const StudyModeCard: React.FC<{
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
    iconBgColor: string;
    isRecommended?: boolean;
    animationDelay?: string;
}> = ({ icon, title, description, onClick, iconBgColor, isRecommended = false, animationDelay = '0s' }) => (
    <button 
        onClick={onClick}
        className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-slate-950 ${isRecommended ? 'border-2 border-blue-500' : ''} opacity-0 animate-fade-in-up`}
        style={{ animationDelay }}
    >
        {isRecommended && (
            <div className="absolute -top-3 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Recomendado
            </div>
        )}
        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${iconBgColor}`}>
            <i className={`fa-solid ${icon} text-3xl text-white`}></i>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </button>
);

const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  return (
    <div className="space-y-8">
      <div className="text-center p-6 rounded-xl opacity-0 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100">Prepárate para tu Examen</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-md mx-auto">Selecciona un modo de estudio y comienza tu camino hacia la ciudadanía estadounidense.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StudyModeCard 
            icon="fa-book-open-reader"
            title="Modo Práctica"
            description="Responde preguntas oficiales en un formato interactivo."
            onClick={() => setCurrentPage(Page.Practice)}
            iconBgColor="bg-blue-500"
            isRecommended={true}
            animationDelay="0.1s"
        />
        <StudyModeCard 
            icon="fa-layer-group"
            title="Tarjetas de Estudio"
            description="Memoriza con tarjetas visuales bilingües y fáciles de usar."
            onClick={() => setCurrentPage(Page.StudyCards)}
            iconBgColor="bg-brand-red"
            animationDelay="0.2s"
        />
        <StudyModeCard 
            icon="fa-file-circle-question"
            title="Exámenes Rápidos"
            description="Evalúa tu conocimiento con pruebas cortas y cronometradas."
            onClick={() => setCurrentPage(Page.Quiz)}
            iconBgColor="bg-amber-500"
            animationDelay="0.3s"
        />
        <StudyModeCard 
            icon="fa-microphone-lines"
            title="Simulador de Entrevista"
            description="Practica tus respuestas orales con nuestro entrevistador de IA."
            onClick={() => setCurrentPage(Page.Interview)}
            iconBgColor="bg-emerald-500"
            animationDelay="0.4s"
        />
      </div>
    </div>
  );
};

export default Home;