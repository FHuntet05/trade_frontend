// frontend/pages/HomePage.jsx (VERSIÓN REFERIDO INSTANTÁNEO v30.0)

import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

// --- IMPORTS DE COMPONENTES DE UI ---
import UserInfoHeader from '../components/home/UserInfoHeader';
import RealTimeClock from '../components/home/RealTimeClock';
import AnimatedCounter from '../components/home/AnimatedCounter';
import TaskCenter from '../components/home/TaskCenter';
import NotificationFeed from '../components/home/NotificationFeed';
import { useMiningLogic } from '../hooks/useMiningLogic';
import Loader from '../components/common/Loader';
import AuthErrorScreen from '../components/AuthErrorScreen';

const HomePage = () => {
    // --- ESTADOS Y FUNCIONES DEL STORE ---
    // Obtenemos todo lo que necesitamos del userStore.
    const { user, updateUser, syncUserWithBackend, isLoadingAuth } = useUserStore();
    
    // Usamos `useRef` para asegurarnos de que la inicialización se ejecute solo una vez,
    // previniendo problemas con React.StrictMode que renderiza dos veces en desarrollo.
    const hasInitialized = useRef(false);

    // --- EFECTO DE INICIALIZACIÓN ---
    // Este efecto se ejecuta una sola vez cuando el componente se monta.
    useEffect(() => {
        // Si la bandera `hasInitialized` es true, salimos para evitar re-ejecución.
        if (hasInitialized.current) return;
        hasInitialized.current = true; // Levantamos la bandera.

        const initializeApp = () => {
            console.log('[HomePage] Iniciando la aplicación...');
            const tg = window.Telegram?.WebApp;
            
            // Verificamos si estamos en un entorno de Telegram válido.
            if (!tg?.initDataUnsafe?.user?.id) {
                console.error("[HomePage] Entorno de Telegram no detectado. No se puede inicializar.");
                return;
            }
            
            // Informamos a Telegram que la app está lista y la expandimos.
            tg.ready();
            tg.expand();
            
            // Llamamos a la función del store para sincronizar al usuario.
            // Ya no es necesario leer ni pasar ningún `refCode`.
            console.log('[HomePage] Llamando a syncUserWithBackend...');
            syncUserWithBackend(tg.initDataUnsafe.user);
        };

        initializeApp();
    }, [syncUserWithBackend]); // La dependencia es estable, por lo que el efecto se ejecuta una vez.

    
    // --- LÓGICA DE MINERÍA Y UI (SIN CAMBIOS) ---
    // Esta lógica ahora es segura porque se renderizará solo cuando `user` tenga datos.
    const { accumulatedNtx, countdown, progress, buttonState } = useMiningLogic(
        user?.lastMiningClaim,
        user?.effectiveMiningRate ?? 0,
        user?.miningStatus ?? 'IDLE'
    );

    const handleStartMining = async () => { /* ...código sin cambios... */ };
    const handleClaim = async () => { /* ...código sin cambios... */ };
    const renderControlButton = () => { /* ...código sin cambios... */ };
    const shouldShowButton = buttonState === 'SHOW_START' || buttonState === 'SHOW_CLAIM';

    // --- RENDERIZADO CONDICIONAL ---
    
    // 1. Mientras `isLoadingAuth` sea true, mostramos un loader.
    //    Esto cubre el tiempo desde que la app se monta hasta que el backend responde.
    if (isLoadingAuth) {
        return <div className="w-full h-full flex items-center justify-center"><Loader text="Sincronizando..." /></div>;
    }

    // 2. Si no hay usuario después de la carga, significa que hubo un error.
    if (!user) {
        return <div className="w-full h-full flex items-center justify-center p-4"><AuthErrorScreen message="No se pudo cargar la información. Por favor, reinicia la aplicación desde Telegram." /></div>;
    }
    
    // 3. Si todo está correcto, renderizamos la página principal.
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