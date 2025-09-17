// RUTA: frontend/src/pages/HomePage.jsx (v4.5 - ACTIVITY TICKER ELIMINADO)

import React from 'react';
import { useTranslation } from 'react-i18next';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// La importación de 'PurchasedFactoryItem' se mantiene comentada como en la versión anterior.
// import PurchasedFactoryItem from '../components/factories/PurchasedFactoryItem';

import TaskCenter from '../components/home/TaskCenter';
import Loader from '../components/common/Loader';

// --- INICIO DE LA REFACTORIZACIÓN ---
// 1. Se elimina la importación del componente 'ActivityTicker' ya que no se usará.
// import ActivityTicker from '../components/home/ActivityTicker';
// --- FIN DE LA REFACTORIZACIÓN ---


const UserHeader = ({ user }) => {
    const balance = user?.balance?.usdt || 0;
    
    return (
        <div className="flex items-center gap-4 p-4 bg-card/70 backdrop-blur-md rounded-2xl border border-border shadow-medium">
            <img 
                src={user?.photoUrl || '/assets/images/user-avatar-placeholder.png'} 
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-accent-primary/50"
            />
            <div className="flex-1">
                <p className="text-lg font-bold text-text-primary">{user?.username || 'Usuario'}</p>
                <p className="text-xs text-text-secondary font-mono">ID: {user?.telegramId}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-accent-primary text-xl">{balance.toFixed(2)}</p>
                <p className="text-xs text-text-secondary">USDT</p>
            </div>
        </div>
    );
};


const FactoryAnimation = () => {
    const { t } = useTranslation();
    const [isVideoLoading, setVideoLoading] = React.useState(true);
    return (
        <div className="relative w-full max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden bg-black/5 border border-white/10 shadow-medium">
            {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader text={t('homePage.loadingAnimation', 'Cargando animación...')} />
                </div>
            )}
            <video
                src="/animations/factory-animation.mp4"
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={() => setVideoLoading(false)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isVideoLoading ? 'opacity-0' : 'opacity-100'}`}
            />
        </div>
    );
};

const HomePage = () => {
    const { t } = useTranslation();
    const { user } = useUserStore(); // Se elimina 'setUser' ya que no hay funciones que lo usen ahora.

    if (!user) {
        return <div className="flex items-center justify-center h-full"><Loader text={t('common.loadingUser')} /></div>;
    }
    
    return (
        <motion.div 
            className="flex flex-col gap-6 p-4 pt-6 pb-28" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <UserHeader user={user} />
            
            {/* --- INICIO DE LA REFACTORIZACIÓN --- */}
            {/* 2. Se elimina el componente Ticker del renderizado. */}
            {/* <ActivityTicker /> */}
            {/* --- FIN DE LA REFACTORIZACIÓN --- */}
            
            <FactoryAnimation />

            {/* El bloque de "Mis Fábricas" se mantiene eliminado como se solicitó anteriormente. */}
            
            <div>
                <h2 className="text-xl font-bold text-text-primary mb-3">{t('homePage.tasks')}</h2>
                <TaskCenter />
            </div>
        </motion.div>
    );
};

export default HomePage;