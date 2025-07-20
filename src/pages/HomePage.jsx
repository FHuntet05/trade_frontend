// frontend/pages/HomePage.jsx (VERSIÓN FINAL v28.1 - TIERRA QUEMADA COMPLETA)
import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

// Componentes
import Layout from '../components/layout/Layout';
import UserInfoHeader from '../components/home/UserInfoHeader';
import RealTimeClock from '../components/home/RealTimeClock';
import AnimatedCounter from '../components/home/AnimatedCounter';
import TaskCenter from '../components/home/TaskCenter';
import NotificationFeed from '../components/home/NotificationFeed';
import { useMiningLogic } from '../hooks/useMiningLogic';
import Loader from '../components/common/Loader';
import AuthErrorScreen from '../components/AuthErrorScreen';

// Componente interno para el contenido de la UI
const HomePageContent = () => {
    const { user, updateUser } = useUserStore();
    const { accumulatedNtx, countdown, progress, buttonState } = useMiningLogic(
        user?.lastMiningClaim,
        user?.effectiveMiningRate ?? 0,
        user?.miningStatus ?? 'IDLE'
    );

    // --- MANEJADORES DE ACCIONES (SIN OMISIONES) ---
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
    
    // --- JSX DE LA UI (SIN OMISIONES) ---
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


// Componente principal que envuelve la lógica
const HomePage = () => {
    const { user, syncUserWithBackend, isLoadingAuth, error } = useUserStore();
    const hasInitialized = useRef(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const initializeApp = () => {
            console.log("[v28.1 HomePage] Iniciando secuencia de TIERRA QUEMADA.");
            const tg = window.Telegram?.WebApp;
            if (!tg || !tg.initDataUnsafe?.user?.id) {
                console.error("[v28.1 HomePage] Entorno Telegram no válido.");
                return;
            }

            // --- EL HACK DE FUERZA BRUTA ---
            const currentUrl = window.location.href;
            const match = currentUrl.match(/[?&]startapp=([^&]+)/);
            const refCode = match ? match[1] : null;
            console.log(`[v28.1 HomePage] RefCode extraído por fuerza bruta: ${refCode}`);
            
            tg.ready();
            tg.expand();

            syncUserWithBackend(tg.initDataUnsafe.user, refCode);

            // --- LIMPIEZA DE URL ---
            if (location.pathname === '/' || location.search.includes('startapp')) {
                console.log("[v28.1 HomePage] Limpiando URL y normalizando a /home.");
                // Usamos navigate para mantenernos dentro del ecosistema de React Router
                navigate('/home', { replace: true });
            }
        };

        initializeApp();
    }, [syncUserWithBackend, location, navigate]);

    // --- RENDERIZADO CONDICIONAL ---
    if (isLoadingAuth) {
        return <div className="w-full h-screen flex items-center justify-center bg-dark-primary"><Loader text="Sincronizando..." /></div>;
    }

    if (error) {
        return <AuthErrorScreen message={error} />;
    }

    if (!user) {
        return <AuthErrorScreen message="No se pudieron cargar los datos del usuario. Por favor, reinicia la app." />;
    }
    
    // Si todo está bien, renderizamos el Layout con el contenido de la página.
    // Esto asegura que la navegación (BottomNav, etc.) se muestre correctamente.
    return (
        <Layout>
            <HomePageContent />
        </Layout>
    );
};

export default HomePage;