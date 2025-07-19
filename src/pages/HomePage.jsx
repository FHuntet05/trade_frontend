// frontend/pages/HomePage.jsx (VERSIÓN FUSIÓN FINAL v25.1)
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

// Componentes de su aplicación (los imports ahora son correctos)
import UserInfoHeader from '../components/home/UserInfoHeader';
import RealTimeClock from '../components/home/RealTimeClock';
import AnimatedCounter from '../components/home/AnimatedCounter';
import TaskCenter from '../components/home/TaskCenter';
import NotificationFeed from '../components/home/NotificationFeed';
import { useMiningLogic } from '../hooks/useMiningLogic';
import Loader from '../components/common/Loader';
import AuthErrorScreen from '../components/AuthErrorScreen';

const HomePage = () => {
    // ======================= INICIO DE LA FUSIÓN DE LÓGICA =======================
    // Obtenemos TODO del store global, ya no hay estado local para el usuario.
    const { 
        user, 
        isAuthenticated, 
        isLoadingAuth, 
        updateUser,
        syncUserWithBackend, 
        logout 
    } = useUserStore();

    const location = useLocation();
    const hasSynced = useRef(false);

    // Lógica de autenticación del trasplante. Se ejecuta UNA SOLA VEZ.
    useEffect(() => {
        if (hasSynced.current || isLoadingAuth) return;
        hasSynced.current = true;

        const tg = window.Telegram?.WebApp;
        if (tg && tg.initData) {
            tg.ready();
            tg.expand();
            const searchParams = new URLSearchParams(location.search);
            const refCode = searchParams.get('refCode');
            console.log(`[HomePage Fusión] Iniciando sincronización. RefCode: ${refCode}`);
            syncUserWithBackend(tg.initDataUnsafe.user, refCode);
        } else {
            console.error("Entorno de Telegram no detectado en HomePage.");
            logout();
        }
    }, [location.search, syncUserWithBackend, logout, isLoadingAuth]);

    // Lógica de minado de su componente, ahora usando el 'user' del store.
    const { accumulatedNtx, countdown, progress, buttonState } = useMiningLogic(
        user?.lastMiningClaim,
        user?.effectiveMiningRate ?? 0,
        user?.miningStatus ?? 'IDLE'
    );
    // ======================== FIN DE LA FUSIÓN DE LÓGICA =========================

    const handleStartMining = async () => {
        toast.loading('Iniciando ciclo...', { id: 'mining_control' });
        try {
            const response = await api.post('/wallet/start-mining');
            updateUser(response.data.user);
            toast.success('¡Ciclo de minado iniciado!', { id: 'mining_control' });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al iniciar el ciclo.';
            toast.error(errorMessage, { id: 'mining_control' });
        }
    };

    const handleClaim = async () => {
        toast.loading('Reclamando...', { id: 'mining_control' });
        try {
            const response = await api.post('/wallet/claim');
            updateUser(response.data.user);
            toast.success(response.data.message, { id: 'mining_control' });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al reclamar.';
            toast.error(errorMessage, { id: 'mining_control' });
        }
    };

    const renderControlButton = () => {
        switch (buttonState) {
            case 'SHOW_START':
                return <button onClick={handleStartMining} className="w-full py-4 bg-blue-500 text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all">INICIAR</button>;
            case 'SHOW_CLAIM':
                return <button onClick={handleClaim} className="w-full py-4 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all">RECLAMAR GANANCIAS</button>;
            default:
                return null; 
        }
    };
  
    const shouldShowButton = buttonState === 'SHOW_START' || buttonState === 'SHOW_CLAIM';

    // --- GUARD clauses para los estados de carga y error ---
    if (isLoadingAuth) {
        return <div className="flex items-center justify-center h-full"><Loader text="Conectando..." /></div>;
    }

    if (!isAuthenticated || !user) {
        return <AuthErrorScreen message="Error de autenticación. Por favor, reinicia la Mini App." />;
    }
    
    // --- Renderizado principal de SU componente, ahora funcional ---
    return (
        <div className="flex flex-col h-full animate-fade-in gap-4 overflow-y-auto pb-4">
            <div className="px-4 pt-4 space-y-4">
                <UserInfoHeader />
                <RealTimeClock />
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
                <video src="/assets/mining-animation.webm" autoPlay loop muted playsInline className="w-48 h-48 sm:w-52 sm:h-52 mx-auto" />
                <AnimatedCounter value={parseFloat(accumulatedNtx.toFixed(2))} />
                <div className="w-full max-w-xs mx-auto mt-4 space-y-3">
                    <div className="w-full bg-dark-secondary rounded-full h-6 shadow-inner overflow-hidden">
                        <div className="bg-gradient-to-r from-accent-start to-accent-end h-6 rounded-full transition-all duration-1000" style={{width: `${progress}%`}} />
                    </div>
                    <p className="text-text-secondary text-base font-mono">{countdown}</p>
                </div>
            </div>
            <div className="flex-grow flex flex-col px-4 space-y-4">
                <div className="w-full h-16 flex items-center justify-center">
                    {renderControlButton()}
                </div>
                <div className={!shouldShowButton ? 'flex-grow' : ''}>
                    <TaskCenter />
                </div>
                <NotificationFeed />
            </div>
        </div>
    );
};

export default HomePage;