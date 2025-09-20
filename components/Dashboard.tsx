import React, { useState } from 'react';
import { User, Referral } from '../types';

interface DashboardProps {
  user: User | null;
  referrals: Referral[];
  onLogout: () => void;
}

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-md flex items-center space-x-4">
        <div className={`rounded-full p-3 ${color}`}>
            <i className={`fa-solid ${icon} text-xl text-white`}></i>
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const ReferralWidget: React.FC<{ referralCode: string }> = ({ referralCode }) => {
    const [copied, setCopied] = useState(false);
    const referralLink = `${window.location.origin}${window.location.pathname}#?ref=${referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700/50 text-center">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">¡Comparte y Gana Recompensas!</h3>
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-300">Comparte tu enlace con amigos. Cuando se unan, obtendrás 7 días sin anuncios y ellos recibirán un bono de bienvenida.</p>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <input 
                    type="text" 
                    readOnly 
                    value={referralLink} 
                    className="w-full sm:w-auto flex-grow px-3 py-2 bg-white dark:bg-slate-700 border border-blue-200 dark:border-blue-600 rounded-md text-center sm:text-left"
                />
                <button 
                    onClick={copyToClipboard} 
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                    <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
                </button>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ user, referrals, onLogout }) => {
    if (!user) return null;
    
    const adFreeDays = user.adFreeUntil ? Math.ceil((new Date(user.adFreeUntil).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Tu Panel</h2>
                <button 
                    onClick={onLogout}
                    className="px-4 py-2 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm flex items-center space-x-2"
                    aria-label="Cerrar sesión"
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon="fa-star" label="Puntos Totales" value={user.points} color="bg-amber-500" />
                <StatCard icon="fa-fire" label="Racha Diaria" value={user.streak} color="bg-orange-500" />
                <StatCard icon="fa-shield-halved" label="Días sin Anuncios" value={adFreeDays > 0 ? adFreeDays : 0} color="bg-emerald-500" />
            </div>
            
            <ReferralWidget referralCode={user.referralCode} />

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold">Tus Referidos ({referrals.length})</h3>
                {referrals.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                        {referrals.map(ref => (
                             <li key={ref.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                 <span className="text-sm font-medium">Usuario Referido: ...{ref.referredUserId.slice(-6)}</span>
                                 <span className="text-xs text-slate-500">{new Date(ref.timestamp).toLocaleDateString()}</span>
                             </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Aún no has referido a nadie. ¡Comparte tu enlace para comenzar!</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;