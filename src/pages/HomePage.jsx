// frontend/pages/HomePage.jsx (VERSIÓN TRASPLANTE v26.0)
import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

// Componentes
import UserInfoHeader from '../components/home/UserInfoHeader';
import RealTimeClock from '../components/home/RealTimeClock';
import AnimatedCounter from '../components/home/AnimatedCounter';
import TaskCenter from '../components/home/TaskCenter';
import NotificationFeed from '../components/home/NotificationFeed';
import { useMiningLogic } from '../hooks/useMiningLogic';
import Loader from '../components/common/Loader';
import AuthErrorScreen from '../components/AuthErrorScreen';

const HomePage = () => {
    // --- LÓGICA DE INICIALIZACIÓN TRASPLANTADA ---
    const { user, updateUser, syncUserWithBackend, isLoadingAuth, error } = useUserStore();
    const hasFetched = useRef(false);

    useEffect(() => {
        // Prevenimos doble ejecución en modo estricto de React
        if (hasFetched.current) return;
        hasFetched.current = true;

        const initializeApp = () => {
            console.log("[v26.0 HomePage] Iniciando secuencia de carga...");
            const tg = window.Telegram?.WebApp;

            if (!tg || !tg.initDataUnsafe?.user?.id) {
                console.error("[v26.0 HomePage] Entorno Telegram no válido. Abortando.");
                // Aquí podrías llamar a una función del store que marque un error permanente.
                return; 
            }
            
            tg.ready();
            tg.expand();

            // Leemos el refCode de la URL, que fue construida por el bot.
            const searchParams = new URLSearchParams(window.location.search);
            const refCode = searchParams.get('startapp') || null;

            console.log(`[v26.0 HomePage] RefCode extraído de la URL: ${refCode}`);
            syncUserWithBackend(tg.initDataUnsafe.user, refCode);
        };

        initializeApp();
    }, [syncUserWithBackend]); // Dependencia estable que se ejecuta solo una vez.

    // --- LÓGICA DE MINERÍA ---
    const { accumulatedNtx, countdown, progress, buttonState } = useMiningLogic(
        user?.lastMiningClaim,
        user?.effectiveMiningRate ?? 0,
        user?.miningStatus ?? 'IDLE'
    );

    const handleStartMining = async () => {
        toast.loading('Iniciando ciclo...', { id: 'mining_control' });
        try {
            const response = await api.post('/wallet/start-mining');
            updateUser(response.data.user);
            toast.success('¡Ciclo de minado iniciado!', { id: 'mining_control' });
        } catch (error) { toast.error(error.response?.data?.message || 'Error.', { id: 'mining_control' }); }
    };
    const handleClaim = async () => {
        toast.loading('Reclamando...', { id: 'mining_control' });
        try {
            const response = await api.post('/wallet/claim');
            updateUser(response.data.user);
            toast.success(response.data.message, { id: 'mining_control' });
        } catch (error) { toast.error(error.response?.data?.message || 'Error.', { id: 'mining_control' }); }
    };

    const renderControlButton = () => {
        switch (buttonState) {
            case 'SHOW_START': return <button onClick={handleStartMining} className="w-full py-4 bg-blue-500 text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all">INICIAR</button>;
            case 'SHOW_CLAIM': return <button onClick={handleClaim} className="w-full py-4 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all">RECLAMAR</button>;
            default: return null; 
        }
    };
    const shouldShowButton = buttonState === 'SHOW_START' || buttonState === 'SHOW_CLAIM';

    // --- RENDERIZADO CONDICIONAL BASADO EN EL ESTADO DE CARGA ---
    if (isLoadingAuth) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loader text="Sincronizando..." />
            </div>
        );
    }

    if (error) {
        return <AuthErrorScreen message={error} />;
    }

    if (!user) {
        // Este caso no debería ocurrir si la lógica es correcta, pero es una buena salvaguarda.
        return <AuthErrorScreen message="No se pudieron cargar los datos del usuario. Por favor, reinicia la app." />;
    }

    // --- RENDERIZADO PRINCIPAL (ÉXITO) ---
    return (
        <div className="flex flex-col h-full animate-fade-in gap-4 overflow-y-auto pb-4">
            <div className="px-4 pt-4 space-y-4">
                <UserInfoHeader />
                <RealTimeClock />
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
                <video src="/assets/mining-animation.webm" autoPlay loop muted playsInline className="w-48 h-48 mx-auto" />
                <AnimatedCounter value={parseFloat(accumulatedNtx.toFixed(2))} />
                <div className="w-full max-w-xs mx-auto mt-4 space-y-3">
                    <div className="w-full bg-dark-secondary rounded-full h-6 shadow-inner overflow-hidden">
                        <div className="bg-gradient-to-r from-accent-start to-accent-end h-6 rounded-full transition-all duration-1000" style={{width: `${progress}%`}} />
                    </div>
                    <p className="text-text-secondary text-base font-mono">{countdown}</p>
                </div>
            </div>
            <div className="flex-grow flex flex-col px-4 space-y-4">
                <div className="w-full h-16 flex items-center justify-center">{renderControlButton()}</div>
                <div className={!shouldShowButton ? 'flex-grow' : ''}><TaskCenter /></div>
                <NotificationFeed />
            </div>
        </div>
    );
};

export default HomePage;